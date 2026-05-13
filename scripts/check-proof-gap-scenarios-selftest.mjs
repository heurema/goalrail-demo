import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkerPath = path.join(rootDir, "scripts", "check-proof-gap-scenarios.mjs");
const sourceScenarioPath = path.join(rootDir, "evals", "scenarios", "workflow-change");

const runChecker = async (scenarioRoot) => {
  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [checkerPath, "--root", scenarioRoot],
      { cwd: rootDir }
    );
    return { code: 0, output: `${stdout}${stderr}` };
  } catch (error) {
    return {
      code: typeof error.code === "number" ? error.code : 1,
      output: `${error.stdout ?? ""}${error.stderr ?? ""}`
    };
  }
};

const replaceInFile = async (filePath, searchValue, replacement) => {
  const original = await readFile(filePath, "utf8");
  const updated =
    typeof searchValue === "string"
      ? original.split(searchValue).join(replacement)
      : original.replace(searchValue, replacement);

  if (updated === original) {
    throw new Error(`Self-test fixture mutation did not change ${filePath}.`);
  }

  await writeFile(filePath, updated);
};

const appendToFile = async (filePath, content) => {
  const original = await readFile(filePath, "utf8");
  await writeFile(filePath, `${original}\n${content}`);
};

const scenarioReportPath = (scenarioPath) => path.join(scenarioPath, "proof-gap-report.md");
const scenarioRubricPath = (scenarioPath) => path.join(scenarioPath, "rubric.yaml");
const scenarioPacketPath = (scenarioPath) => path.join(scenarioPath, "scenario.yaml");

const cases = [
  {
    name: "valid copied scenario passes",
    expectedExit: 0,
    expectedOutput: ["Proof Gap scenario pack check passed."]
  },
  {
    name: "missing required file fails",
    expectedExit: 1,
    expectedOutput: ["[required-file]", "baseline.md"],
    mutate: async (scenarioPath) => {
      await unlink(path.join(scenarioPath, "baseline.md"));
    }
  },
  {
    name: "missing scenario packet fails",
    expectedExit: 1,
    expectedOutput: ["[required-file]", "scenario.yaml"],
    mutate: async (scenarioPath) => {
      await unlink(scenarioPacketPath(scenarioPath));
    }
  },
  {
    name: "missing scenario packet top-level field fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "risk_notes"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioPacketPath(scenarioPath), "risk_notes:", "risk_note_missing:");
    }
  },
  {
    name: "scenario packet id mismatch fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "id must match scenario directory"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioPacketPath(scenarioPath), "id: workflow-change", "id: workflow-mismatch");
    }
  },
  {
    name: "scenario packet inactive status fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "status must be active"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioPacketPath(scenarioPath), "status: active", "status: draft");
    }
  },
  {
    name: "scenario packet invalid soft verdict fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "Unsupported proof_gap_report.soft_verdict"],
    mutate: async (scenarioPath) => {
      await replaceInFile(
        scenarioPacketPath(scenarioPath),
        "soft_verdict: aligned_but_proof_incomplete",
        "soft_verdict: merge_ready"
      );
    }
  },
  {
    name: "scenario packet missing delta axis fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "delta_axes.time_to_confidence"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioPacketPath(scenarioPath), "  time_to_confidence:", "  time_to_certainty:");
    }
  },
  {
    name: "scenario packet missing reference fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "references.baseline"],
    mutate: async (scenarioPath) => {
      await replaceInFile(
        scenarioPacketPath(scenarioPath),
        "  baseline: baseline.md",
        "  baseline: baseline-omitted.md"
      );
    }
  },
  {
    name: "scenario packet missing scope delta fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "scope_delta"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioPacketPath(scenarioPath), "scope_delta:", "scope_delta_missing:");
    }
  },
  {
    name: "scenario packet missing evidence map fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "evidence_map"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioPacketPath(scenarioPath), "evidence_map:", "evidence_map_missing:");
    }
  },
  {
    name: "scenario packet missing next required proofs fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "proof_gap_report.next_required_proofs"],
    mutate: async (scenarioPath) => {
      await replaceInFile(
        scenarioPacketPath(scenarioPath),
        "  next_required_proofs:",
        "  next_required_proofs_missing:"
      );
    }
  },
  {
    name: "scenario packet missing delta rationale fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "delta_axes.acceptance.rationale"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioPacketPath(scenarioPath), "    rationale:", "    rationale_missing:");
    }
  },
  {
    name: "scenario packet missing risk reason fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "risk_notes.reason"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioPacketPath(scenarioPath), "    reason:", "    reason_missing:");
    }
  },
  {
    name: "scenario packet missing risk mitigation fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "risk_notes.mitigation"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioPacketPath(scenarioPath), "    mitigation:", "    mitigation_missing:");
    }
  },
  {
    name: "scenario packet missing residual owner hint fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "residual_risks.owner_hint"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioPacketPath(scenarioPath), "    owner_hint:", "    owner_hint_missing:");
    }
  },
  {
    name: "scenario packet missing residual mitigation fails",
    expectedExit: 1,
    expectedOutput: ["[scenario-packet]", "residual_risks.mitigation"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioPacketPath(scenarioPath), "    mitigation:", "    mitigation_missing:");
    }
  },
  {
    name: "missing canonical report heading fails",
    expectedExit: 1,
    expectedOutput: ["[report-section]", "Evidence map"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioReportPath(scenarioPath), "## Evidence map", "## Evidence notes");
    }
  },
  {
    name: "forbidden unsafe verdict and phrase fail",
    expectedExit: 1,
    expectedOutput: ["[forbidden-terms]", "merge_ready", "production proof"],
    mutate: async (scenarioPath) => {
      await appendToFile(
        scenarioReportPath(scenarioPath),
        "Status: `merge_ready`.\nThis report claims production proof."
      );
    }
  },
  {
    name: "missing allowed soft verdict fails",
    expectedExit: 1,
    expectedOutput: ["[verdict-vocabulary]", "Missing allowed soft verdict term"],
    mutate: async (scenarioPath) => {
      await replaceInFile(
        scenarioReportPath(scenarioPath),
        "aligned_but_proof_incomplete",
        "needs_review"
      );
    }
  },
  {
    name: "missing rubric axis fails",
    expectedExit: 1,
    expectedOutput: ["[rubric-shape]", "time_to_confidence"],
    mutate: async (scenarioPath) => {
      await replaceInFile(scenarioRubricPath(scenarioPath), "  time_to_confidence:", "  time_to_certainty:");
    }
  },
  {
    name: "missing local reference mention fails",
    expectedExit: 1,
    expectedOutput: ["[local-reference]", "baseline.md"],
    mutate: async (scenarioPath) => {
      await replaceInFile(
        scenarioReportPath(scenarioPath),
        "baseline.md",
        "baseline-omitted.md"
      );
    }
  }
];

const prepareCaseRoot = async (tempRoot, caseName) => {
  const slug = caseName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  const caseRoot = path.join(tempRoot, slug);
  const scenarioPath = path.join(caseRoot, "workflow-change");

  await mkdir(caseRoot, { recursive: true });
  await cp(sourceScenarioPath, scenarioPath, { recursive: true });

  return { caseRoot, scenarioPath };
};

const main = async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "goalrail-proof-gap-selftest-"));
  const failures = [];

  try {
    for (const testCase of cases) {
      const { caseRoot, scenarioPath } = await prepareCaseRoot(tempRoot, testCase.name);

      if (testCase.mutate) {
        await testCase.mutate(scenarioPath);
      }

      const result = await runChecker(caseRoot);
      const exitMatches =
        testCase.expectedExit === 0 ? result.code === 0 : result.code !== 0;
      const outputMatches = testCase.expectedOutput.every((value) =>
        result.output.includes(value)
      );

      if (exitMatches && outputMatches) {
        console.log(`PASS ${testCase.name}`);
        continue;
      }

      failures.push({
        name: testCase.name,
        code: result.code,
        output: result.output.trim()
      });
      console.error(`FAIL ${testCase.name}`);
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }

  if (failures.length > 0) {
    console.error("\nProof Gap scenario checker self-test failed.");
    for (const failure of failures) {
      console.error(`\n${failure.name}`);
      console.error(`exit code: ${failure.code}`);
      console.error(failure.output);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Proof Gap scenario checker self-test passed.");
};

await main();
