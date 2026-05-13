import { constants } from "node:fs";
import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultScenariosDir = path.join(rootDir, "evals", "scenarios");

const requiredFiles = [
  "scenario.yaml",
  "task.md",
  "hidden-acceptance.md",
  "baseline.md",
  "goalrail-contract.md",
  "goalrail.md",
  "rubric.yaml",
  "delta-report.md",
  "proof-gap-report.md"
];

const requiredReportReferences = [
  "task.md",
  "hidden-acceptance.md",
  "baseline.md",
  "goalrail-contract.md",
  "goalrail.md",
  "rubric.yaml",
  "delta-report.md"
];

const rubricAxes = [
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

const scenarioPacketTopLevelKeys = [
  "id",
  "title",
  "status",
  "intent",
  "hidden_acceptance",
  "baseline_path",
  "goalrail_path",
  "proof_gap_report",
  "delta_axes",
  "risk_notes",
  "residual_risks",
  "references"
];

const scenarioPacketReferences = {
  task: "task.md",
  hidden_acceptance: "hidden-acceptance.md",
  baseline: "baseline.md",
  goalrail_contract: "goalrail-contract.md",
  goalrail: "goalrail.md",
  rubric: "rubric.yaml",
  delta_report: "delta-report.md",
  proof_gap_report: "proof-gap-report.md"
};

const requiredReportSections = [
  "Diagnostic status",
  "Executive summary",
  "Source inputs",
  "Reconstructed working contract",
  "Scope boundary",
  "Scope delta",
  "Evidence map",
  "Proof gaps",
  "Risk notes",
  "Soft verdict",
  "Next required proofs",
  "Residual risks",
  "Baseline-vs-GoalRail delta"
];

const allowedVerdicts = [
  "aligned_but_proof_incomplete",
  "scope_drift_detected",
  "evidence_too_weak",
  "high_risk_needs_review",
  "insufficient_input"
];

const alwaysForbiddenTerms = ["merge_ready", "safe_to_deploy"];
const unsafeClaimPhrases = [
  "server-owned proof",
  "pr verification before merge",
  "production proof"
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const displayPath = (filePath) => {
  const fromRepoRoot = path.relative(rootDir, filePath);
  if (!fromRepoRoot.startsWith("..") && !path.isAbsolute(fromRepoRoot)) {
    return fromRepoRoot;
  }
  return filePath;
};

const parseScenarioRoot = (args) => {
  if (args.length === 0) {
    return defaultScenariosDir;
  }

  if (args.length === 2 && args[0] === "--root") {
    return path.resolve(process.cwd(), args[1]);
  }

  throw new Error(
    "Usage: node scripts/check-proof-gap-scenarios.mjs [--root <scenario-root>]"
  );
};

const exists = async (filePath) => {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const readTextIfPresent = async (filePath, errors, checkName) => {
  if (!(await exists(filePath))) {
    return null;
  }

  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    errors.push({
      check: checkName,
      file: filePath,
      reason: `Could not read file: ${error.message}`
    });
    return null;
  }
};

const addError = (errors, check, filePath, reason) => {
  errors.push({ check, file: filePath, reason });
};

const hasHeading = (text, heading) => {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "im");
  return pattern.test(text);
};

const hasRubricAxis = (text, axis) => {
  const pattern = new RegExp(`(^|\\n)\\s*${escapeRegExp(axis)}:\\s*(\\n|$)`, "m");
  return pattern.test(text);
};

const hasTopLevelKey = (text, key) => {
  const pattern = new RegExp(`^${escapeRegExp(key)}:\\s*(?:.*)?$`, "m");
  return pattern.test(text);
};

const getTopLevelScalar = (text, key) => {
  const pattern = new RegExp(`^${escapeRegExp(key)}:\\s*(.+?)\\s*$`, "m");
  const match = text.match(pattern);
  return match ? normalizeYamlScalar(match[1]) : null;
};

const getTopLevelSection = (text, key) => {
  const pattern = new RegExp(`^${escapeRegExp(key)}:\\s*$`, "m");
  const match = pattern.exec(text);

  if (!match) {
    return "";
  }

  const start = match.index + match[0].length;
  const rest = text.slice(start);
  const nextTopLevel = rest.search(/\n[A-Za-z0-9_]+:\s*(?:.*)?$/m);
  return nextTopLevel === -1 ? rest : rest.slice(0, nextTopLevel);
};

const normalizeYamlScalar = (value) =>
  value
    .trim()
    .replace(/\s+#.*$/, "")
    .replace(/^['"]|['"]$/g, "")
    .trim();

const hasAllowedVerdict = (text) =>
  allowedVerdicts.some((verdict) =>
    new RegExp(`\\b${escapeRegExp(verdict)}\\b`).test(text)
  );

const getScenarioPacketSoftVerdict = (text) => {
  const proofGapReport = getTopLevelSection(text, "proof_gap_report");
  const match = proofGapReport.match(/^\s{2}soft_verdict:\s*(.+?)\s*$/m);
  return match ? normalizeYamlScalar(match[1]) : null;
};

const hasScenarioPacketDeltaAxis = (text, axis) => {
  const deltaAxes = getTopLevelSection(text, "delta_axes");
  const pattern = new RegExp(`^\\s{2}${escapeRegExp(axis)}:\\s*$`, "m");
  return pattern.test(deltaAxes);
};

const hasScenarioPacketReference = (text, key, fileName) => {
  const references = getTopLevelSection(text, "references");
  const pattern = new RegExp(
    `^\\s{2}${escapeRegExp(key)}:\\s*${escapeRegExp(fileName)}\\s*$`,
    "m"
  );
  return pattern.test(references);
};

const findUnsupportedVerdictForms = (text) => {
  const unsupported = [];
  const verdictForm = /^\s*(?:Status|Soft verdict|Verdict):\s*`?([a-z][a-z0-9_]*)`?[.:]?\s*$/gim;
  let match = verdictForm.exec(text);

  while (match !== null) {
    const value = match[1];
    if (!allowedVerdicts.includes(value)) {
      unsupported.push(value);
    }
    match = verdictForm.exec(text);
  }

  return unsupported;
};

const findForbiddenTerms = (text) => {
  const failures = [];

  for (const term of alwaysForbiddenTerms) {
    const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");
    if (pattern.test(text)) {
      failures.push(term);
    }
  }

  const blockedVerdictForms = [
    /`(?:verified|accepted)`/i,
    /\b(?:status|verdict|soft verdict)\s*:\s*`?(?:verified|accepted)`?\b/i
  ];

  for (const pattern of blockedVerdictForms) {
    const match = text.match(pattern);
    if (match) {
      failures.push(match[0]);
    }
  }

  // Unsafe phrases are allowed only in explicit negative/disclaimer contexts,
  // such as "not production proof" or "no PR verification before merge".
  // This keeps required safety disclaimers from failing the checker.
  const normalizedLines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/[`*_]/g, "").toLowerCase());

  for (const line of normalizedLines) {
    for (const phrase of unsafeClaimPhrases) {
      let index = line.indexOf(phrase);

      while (index !== -1) {
        const prefix = line.slice(0, index);
        const isDisclaimed = /\b(?:not|no|without)\b[^.?!;:]*$/.test(prefix);

        if (!isDisclaimed) {
          failures.push(phrase);
        }

        index = line.indexOf(phrase, index + phrase.length);
      }
    }
  }

  return [...new Set(failures)];
};

const validateScenario = async (scenarioId, scenarioPath) => {
  const errors = [];

  for (const fileName of requiredFiles) {
    const filePath = path.join(scenarioPath, fileName);
    if (!(await exists(filePath))) {
      addError(errors, "required-file", filePath, `Missing required file ${fileName}.`);
    }
  }

  const scenarioPacketPath = path.join(scenarioPath, "scenario.yaml");
  const scenarioPacket = await readTextIfPresent(
    scenarioPacketPath,
    errors,
    "scenario-packet"
  );

  if (scenarioPacket !== null) {
    if (scenarioPacket.trim().length === 0) {
      addError(errors, "scenario-packet", scenarioPacketPath, "scenario.yaml must not be empty.");
    }

    for (const key of scenarioPacketTopLevelKeys) {
      if (!hasTopLevelKey(scenarioPacket, key)) {
        addError(
          errors,
          "scenario-packet",
          scenarioPacketPath,
          `Missing required top-level field ${key}.`
        );
      }
    }

    const packetId = getTopLevelScalar(scenarioPacket, "id");
    if (packetId !== null && packetId !== scenarioId) {
      addError(
        errors,
        "scenario-packet",
        scenarioPacketPath,
        `id must match scenario directory "${scenarioId}", found "${packetId}".`
      );
    }

    const packetStatus = getTopLevelScalar(scenarioPacket, "status");
    if (packetStatus !== null && packetStatus !== "active") {
      addError(
        errors,
        "scenario-packet",
        scenarioPacketPath,
        `status must be active, found "${packetStatus}".`
      );
    }

    const softVerdict = getScenarioPacketSoftVerdict(scenarioPacket);
    if (softVerdict === null) {
      addError(
        errors,
        "scenario-packet",
        scenarioPacketPath,
        "Missing proof_gap_report.soft_verdict."
      );
    } else if (!allowedVerdicts.includes(softVerdict)) {
      addError(
        errors,
        "scenario-packet",
        scenarioPacketPath,
        `Unsupported proof_gap_report.soft_verdict "${softVerdict}".`
      );
    }

    for (const axis of rubricAxes) {
      if (!hasScenarioPacketDeltaAxis(scenarioPacket, axis)) {
        addError(errors, "scenario-packet", scenarioPacketPath, `Missing delta_axes.${axis}.`);
      }
    }

    for (const [key, fileName] of Object.entries(scenarioPacketReferences)) {
      if (!hasScenarioPacketReference(scenarioPacket, key, fileName)) {
        addError(
          errors,
          "scenario-packet",
          scenarioPacketPath,
          `Missing references.${key}: ${fileName}.`
        );
      }

      const referencePath = path.join(scenarioPath, fileName);
      if (!(await exists(referencePath))) {
        addError(
          errors,
          "scenario-packet",
          referencePath,
          `Scenario packet reference does not exist: ${fileName}.`
        );
      }
    }
  }

  const rubricPath = path.join(scenarioPath, "rubric.yaml");
  const rubric = await readTextIfPresent(rubricPath, errors, "rubric-shape");

  if (rubric !== null) {
    if (rubric.trim().length === 0) {
      addError(errors, "rubric-shape", rubricPath, "rubric.yaml must not be empty.");
    }

    for (const axis of rubricAxes) {
      if (!hasRubricAxis(rubric, axis)) {
        addError(errors, "rubric-shape", rubricPath, `Missing rubric axis ${axis}.`);
      }
    }
  }

  const reportPath = path.join(scenarioPath, "proof-gap-report.md");
  const report = await readTextIfPresent(reportPath, errors, "proof-gap-report");

  if (report !== null) {
    for (const section of requiredReportSections) {
      if (!hasHeading(report, section)) {
        addError(
          errors,
          "report-section",
          reportPath,
          `Missing required report heading "## ${section}".`
        );
      }
    }

    if (!hasAllowedVerdict(report)) {
      addError(
        errors,
        "verdict-vocabulary",
        reportPath,
        `Missing allowed soft verdict term. Allowed: ${allowedVerdicts.join(", ")}.`
      );
    }

    for (const value of findUnsupportedVerdictForms(report)) {
      addError(
        errors,
        "verdict-vocabulary",
        reportPath,
        `Unsupported code-like verdict/status value "${value}".`
      );
    }

    for (const term of findForbiddenTerms(report)) {
      addError(errors, "forbidden-terms", reportPath, `Forbidden unsafe term found: ${term}.`);
    }

    for (const fileName of requiredReportReferences) {
      const referencePath = path.join(scenarioPath, fileName);
      if (!report.includes(fileName)) {
        addError(
          errors,
          "local-reference",
          reportPath,
          `Missing local scenario reference to ${fileName}.`
        );
      }

      if (!(await exists(referencePath))) {
        addError(
          errors,
          "local-reference",
          referencePath,
          `Referenced scenario file does not exist: ${fileName}.`
        );
      }
    }
  }

  return { scenarioId, errors };
};

const listScenarioDirectories = async (scenarioRoot) => {
  const entries = await readdir(scenarioRoot, { withFileTypes: true });
  const directories = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const scenarioPath = path.join(scenarioRoot, entry.name);
    const info = await stat(scenarioPath);
    if (info.isDirectory()) {
      directories.push({ scenarioId: entry.name, scenarioPath });
    }
  }

  return directories.sort((a, b) => a.scenarioId.localeCompare(b.scenarioId));
};

const main = async (args) => {
  let scenarioRoot = defaultScenariosDir;

  try {
    scenarioRoot = parseScenarioRoot(args);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  let scenarioDirectories = [];

  try {
    scenarioDirectories = await listScenarioDirectories(scenarioRoot);
  } catch (error) {
    console.error("Proof Gap scenario pack check failed.");
    console.error(`Could not read scenario root ${displayPath(scenarioRoot)}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  if (scenarioDirectories.length === 0) {
    console.error("Proof Gap scenario pack check failed.");
    console.error(`No scenario directories found under ${displayPath(scenarioRoot)}.`);
    process.exitCode = 1;
    return;
  }

  const results = [];
  for (const { scenarioId, scenarioPath } of scenarioDirectories) {
    results.push(await validateScenario(scenarioId, scenarioPath));
  }

  const failingResults = results.filter((result) => result.errors.length > 0);

  if (failingResults.length > 0) {
    console.error("Proof Gap scenario pack check failed.");
    for (const result of failingResults) {
      console.error(`\n${result.scenarioId}:`);
      for (const error of result.errors) {
        console.error(
          `  - [${error.check}] ${displayPath(error.file)}: ${error.reason}`
        );
      }
    }
    process.exitCode = 1;
    return;
  }

  console.log("Proof Gap scenario pack check passed.");
  console.log("Checked scenarios:");
  for (const result of results) {
    console.log(`- ${result.scenarioId}`);
  }
  console.log(`Checked ${results.length} scenario pack(s).`);
};

await main(process.argv.slice(2));
