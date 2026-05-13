import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultScenariosDir = path.join(rootDir, "evals", "scenarios");

const allowedVerdicts = [
  "aligned_but_proof_incomplete",
  "scope_drift_detected",
  "evidence_too_weak",
  "high_risk_needs_review",
  "insufficient_input"
];

const deltaAxes = [
  "acceptance",
  "scope_adherence",
  "proof_coverage",
  "regression_safety",
  "change_minimality",
  "review_burden",
  "evidence_quality",
  "out_of_scope_changes",
  "time_to_confidence"
];

const referenceOrder = [
  "task",
  "hidden_acceptance",
  "baseline",
  "goalrail_contract",
  "goalrail",
  "rubric",
  "delta_report",
  "proof_gap_report"
];

const scopeDeltaOrder = [
  ["aligned_changes", "Aligned changes"],
  ["unexplained_changes", "Unexplained changes"],
  ["possible_scope_drift", "Possible scope drift"],
  ["missing_expected_changes", "Missing expected changes"]
];

const evidenceMapOrder = [
  ["present_evidence", "Present evidence"],
  ["missing_evidence", "Missing evidence"],
  ["weak_evidence", "Weak evidence"],
  ["manual_review_evidence", "Manual review evidence"]
];

const usage = `Usage:
  node scripts/render-proof-gap-report.mjs --scenario <id> [--out <path>]
  node scripts/render-proof-gap-report.mjs --scenario-dir <path> [--out <path>]
  node scripts/render-proof-gap-report.mjs --root <scenario-root> --scenario <id> [--out <path>]`;

const parseArgs = (args) => {
  const parsed = {
    scenario: null,
    scenarioDir: null,
    scenarioRoot: defaultScenariosDir,
    out: null
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--scenario") {
      if (!next) {
        throw new Error("--scenario requires a value.");
      }
      parsed.scenario = next;
      index += 1;
      continue;
    }

    if (arg === "--scenario-dir") {
      if (!next) {
        throw new Error("--scenario-dir requires a value.");
      }
      parsed.scenarioDir = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    if (arg === "--root") {
      if (!next) {
        throw new Error("--root requires a value.");
      }
      parsed.scenarioRoot = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    if (arg === "--out") {
      if (!next) {
        throw new Error("--out requires a value.");
      }
      parsed.out = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (parsed.help) {
    return parsed;
  }

  if (parsed.scenario && parsed.scenarioDir) {
    throw new Error("Use either --scenario or --scenario-dir, not both.");
  }

  if (!parsed.scenario && !parsed.scenarioDir) {
    throw new Error("Missing --scenario or --scenario-dir.");
  }

  return parsed;
};

const countIndent = (line) => {
  const match = line.match(/^ */);
  return match ? match[0].length : 0;
};

const stripYamlQuotes = (value) =>
  value.replace(/^['"]|['"]$/g, "").trim();

const splitKeyValue = (text, lineNumber) => {
  const separator = text.indexOf(":");
  if (separator === -1) {
    throw new Error(`Unsupported Scenario Packet v0 line ${lineNumber}: ${text}`);
  }

  return {
    key: text.slice(0, separator).trim(),
    value: stripYamlQuotes(text.slice(separator + 1).trim())
  };
};

const nextContentLine = (lines, startIndex) => {
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const raw = lines[index];
    const trimmed = raw.trim();
    if (trimmed.length > 0 && !trimmed.startsWith("#")) {
      return { indent: countIndent(raw), trimmed };
    }
  }

  return null;
};

// This is a small Scenario Packet v0 reader, not a general YAML parser. It
// supports the packet's current maps, scalar values, scalar arrays, and arrays
// of flat maps. Ruby YAML parsing remains the external syntax validation path.
const parseScenarioPacketV0 = (text) => {
  const root = {};
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const stack = [{ indent: -1, value: root }];

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const trimmed = raw.trim();

    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }

    if (raw.includes("\t")) {
      throw new Error(`Unsupported tab indentation on line ${index + 1}.`);
    }

    const indent = countIndent(raw);
    while (stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].value;

    if (trimmed.startsWith("- ")) {
      if (!Array.isArray(parent)) {
        throw new Error(`Unexpected list item on line ${index + 1}.`);
      }

      const itemText = trimmed.slice(2).trim();
      if (/^[A-Za-z0-9_]+:\s*/.test(itemText)) {
        const { key, value } = splitKeyValue(itemText, index + 1);
        const item = { [key]: value };
        parent.push(item);
        stack.push({ indent, value: item });
      } else {
        parent.push(stripYamlQuotes(itemText));
      }
      continue;
    }

    if (Array.isArray(parent)) {
      throw new Error(`Unexpected map entry under list on line ${index + 1}.`);
    }

    const { key, value } = splitKeyValue(trimmed, index + 1);
    if (value.length > 0) {
      parent[key] = value;
      continue;
    }

    const next = nextContentLine(lines, index);
    const container = next && next.indent > indent && next.trimmed.startsWith("- ")
      ? []
      : {};
    parent[key] = container;
    stack.push({ indent, value: container });
  }

  return root;
};

const requireValue = (packet, pathParts) => {
  let current = packet;
  for (const part of pathParts) {
    if (
      current === null ||
      typeof current !== "object" ||
      Array.isArray(current) ||
      !(part in current)
    ) {
      throw new Error(`Missing required packet field ${pathParts.join(".")}.`);
    }
    current = current[part];
  }

  if (typeof current === "string" && current.trim().length === 0) {
    throw new Error(`Required packet field ${pathParts.join(".")} is empty.`);
  }

  return current;
};

const requireArray = (packet, pathParts) => {
  const value = requireValue(packet, pathParts);
  if (!Array.isArray(value)) {
    throw new Error(`Packet field ${pathParts.join(".")} must be a list.`);
  }
  return value;
};

const formatList = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "- none\n";
  }

  return `${items.map((item) => `- ${String(item)}`).join("\n")}\n`;
};

const formatObjectList = (items, renderItem) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "- none\n";
  }

  return `${items.map(renderItem).join("\n\n")}\n`;
};

const sentence = (value) => {
  const text = String(value).trim();
  return /[.!?]$/.test(text) ? text : `${text}.`;
};

const displayAxis = (axis) => axis.replaceAll("_", " ");

const renderReferences = (references) => {
  const lines = [];
  for (const key of referenceOrder) {
    if (references[key]) {
      lines.push(`- [${references[key]}](${references[key]})`);
    }
  }

  return `${lines.join("\n")}\n`;
};

const validatePacket = (packet) => {
  for (const field of ["id", "title"]) {
    requireValue(packet, [field]);
  }

  const verdict = requireValue(packet, ["proof_gap_report", "soft_verdict"]);
  if (!allowedVerdicts.includes(verdict)) {
    throw new Error(
      `Unsupported proof_gap_report.soft_verdict "${verdict}". ` +
        `Allowed: ${allowedVerdicts.join(", ")}.`
    );
  }

  requireValue(packet, ["intent", "task_summary"]);
  requireValue(packet, ["intent", "user_visible_goal"]);
  requireValue(packet, ["baseline_path", "summary"]);

  for (const key of ["scope_in", "scope_out", "non_goals", "expected_proofs"]) {
    requireArray(packet, ["goalrail_path", "contract_boundary", key]);
  }

  for (const [key] of scopeDeltaOrder) {
    requireArray(packet, ["scope_delta", key]);
  }

  for (const [key] of evidenceMapOrder) {
    requireArray(packet, ["evidence_map", key]);
  }

  requireArray(packet, ["proof_gap_report", "proof_gaps"]);
  requireArray(packet, ["proof_gap_report", "next_required_proofs"]);
  requireArray(packet, ["risk_notes"]);
  requireArray(packet, ["residual_risks"]);

  for (const axis of deltaAxes) {
    requireValue(packet, ["delta_axes", axis, "baseline"]);
    requireValue(packet, ["delta_axes", axis, "goalrail"]);
    requireValue(packet, ["delta_axes", axis, "rationale"]);
  }

  for (const key of referenceOrder) {
    requireValue(packet, ["references", key]);
  }
};

const renderReport = (packet) => {
  validatePacket(packet);

  const contract = packet.goalrail_path.contract_boundary;
  const proofGaps = packet.proof_gap_report.proof_gaps;
  const nextProofs = packet.proof_gap_report.next_required_proofs;
  const verdict = packet.proof_gap_report.soft_verdict;

  const deltaRows = deltaAxes
    .map((axis) => {
      const entry = packet.delta_axes[axis];
      return `| ${displayAxis(axis)} | ${entry.baseline} | ${entry.goalrail} | ${entry.rationale} |`;
    })
    .join("\n");

  const scopeDelta = scopeDeltaOrder
    .map(([key, title]) => `${title}:\n${formatList(packet.scope_delta[key])}`)
    .join("\n");

  const evidenceMap = evidenceMapOrder
    .map(([key, title]) => `${title}:\n${formatList(packet.evidence_map[key])}`)
    .join("\n");

  return `# ${packet.title} — Proof Gap Report

## Diagnostic status

This is a deterministic demo/eval artifact for \`heurema/goalrail-demo\`.

It is not production proof, not server-owned \`Proof\`, not PR verification, and
not merge approval. It is a generated draft based only on \`scenario.yaml\`.

## Executive summary

Task: ${packet.intent.task_summary}

User-visible goal: ${packet.intent.user_visible_goal}

Baseline summary: ${packet.baseline_path.summary}

Soft verdict: \`${verdict}\`.

## Source inputs

${renderReferences(packet.references)}
## Reconstructed working contract

Goal: ${packet.intent.task_summary}

Scope in:
${formatList(contract.scope_in)}
Scope out:
${formatList(contract.scope_out)}
Non-goals:
${formatList(contract.non_goals)}
Expected proofs:
${formatList(contract.expected_proofs)}
## Scope boundary

The scenario boundary is defined by the GoalRail contract scope and non-goals.
The report evaluates the task against that boundary and remains a diagnostic
demo/eval artifact.

## Scope delta

${scopeDelta}
## Evidence map

${evidenceMap}
## Proof gaps

${formatObjectList(
  proofGaps,
  (gap) =>
    `- Gap: ${sentence(gap.description)}\n` +
    `  Severity: ${sentence(gap.severity)}\n` +
    `  Recommended next proof: ${sentence(gap.next_required_proof)}`
)}
## Risk notes

${formatObjectList(
  packet.risk_notes,
  (risk) =>
    `- Risk: ${sentence(risk.description)}\n` +
    `  Reason: ${sentence(risk.reason)}\n` +
    `  Mitigation: ${sentence(risk.mitigation)}`
)}
## Soft verdict

Status: \`${verdict}\`.

Rationale: this generated draft uses the scenario packet's structured scope,
evidence, proof gaps, and risk fields. It does not decide acceptance.

## Next required proofs

${formatObjectList(nextProofs, (proof) => `- ${proof.description}`)}
## Residual risks

${formatObjectList(
  packet.residual_risks,
  (risk) =>
    `- Risk: ${sentence(risk.description)}\n` +
    `  Owner hint: ${sentence(risk.owner_hint)}\n` +
    `  Mitigation: ${sentence(risk.mitigation)}`
)}
## Baseline-vs-GoalRail delta

| Axis | Baseline | GoalRail | Diagnostic delta |
| --- | --- | --- | --- |
${deltaRows}

This delta is a deterministic reference comparison, not a statistical benchmark.
`;
};

const main = async () => {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error(usage);
    process.exitCode = 1;
    return;
  }

  if (args.help) {
    console.log(usage);
    return;
  }

  const scenarioDir = args.scenarioDir ??
    path.join(args.scenarioRoot, args.scenario);
  const packetPath = path.join(scenarioDir, "scenario.yaml");

  let packetText;
  try {
    packetText = await readFile(packetPath, "utf8");
  } catch (error) {
    console.error(`Could not read scenario packet ${packetPath}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  let report;
  try {
    const packet = parseScenarioPacketV0(packetText);
    report = renderReport(packet);
  } catch (error) {
    console.error(`Could not render Proof Gap Report from ${packetPath}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  if (!args.out) {
    process.stdout.write(report);
    return;
  }

  await mkdir(path.dirname(args.out), { recursive: true });
  await writeFile(args.out, report, "utf8");
};

await main();
