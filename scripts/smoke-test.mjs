import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(rootDir, "data", "seed.json");
const trialRequestsRuntimePath = path.join(rootDir, "data", "runtime", "trial-requests.json");
const auditLogRuntimePath = path.join(rootDir, "data", "runtime", "audit-log.json");
const typesPath = path.join(rootDir, "packages", "shared", "src", "types.ts");
const requiredStatuses = ["new", "qualified", "approved", "rejected"];
const scenarioFiles = [
  "workflow-change.yaml",
  "field-change.yaml",
  "bugfix.yaml",
  "policy-review.yaml"
];
const envFiles = [".env", ".env.local", ".env.development", ".env.production"];

const failures = [];

const exists = async (filePath) => {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

if (!(await exists(seedPath))) {
  failures.push("Missing data/seed.json.");
}

let seed = null;
if (await exists(seedPath)) {
  try {
    seed = JSON.parse(await readFile(seedPath, "utf8"));
  } catch (error) {
    failures.push(`data/seed.json is not valid JSON: ${error.message}`);
  }
}

if (!seed || !Array.isArray(seed.trialRequests)) {
  failures.push("Seed data must expose a trialRequests array.");
} else {
  if (seed.trialRequests.length < 8) {
    failures.push(`Expected at least 8 trial requests, found ${seed.trialRequests.length}.`);
  }

  const seenStatuses = new Set(seed.trialRequests.map((request) => request?.status));
  for (const status of requiredStatuses) {
    if (!seenStatuses.has(status)) {
      failures.push(`Missing required seed status: ${status}.`);
    }
  }
}

for (const scenarioFile of scenarioFiles) {
  const scenarioPath = path.join(rootDir, "demo", "scenarios", scenarioFile);
  if (!(await exists(scenarioPath))) {
    failures.push(`Missing scenario file: demo/scenarios/${scenarioFile}.`);
    continue;
  }

  const contents = await readFile(scenarioPath, "utf8");
  const requiredFields = [
    "id:",
    "title:",
    "stage:",
    "primary:",
    "business_request:",
    "why_it_matters:",
    "expected_touched_areas:",
    "proof_expectations:",
    "demo_risk:",
    "implementation_status:"
  ];

  for (const field of requiredFields) {
    if (!contents.includes(field)) {
      failures.push(`Scenario file demo/scenarios/${scenarioFile} is missing field ${field}`);
    }
  }
}

if (!(await exists(path.join(rootDir, "demo", "scenarios", "workflow-change.yaml")))) {
  failures.push("Missing primary scenario file: demo/scenarios/workflow-change.yaml.");
}

if (!(await exists(typesPath))) {
  failures.push("Missing shared types file: packages/shared/src/types.ts.");
}

if (!(await exists(trialRequestsRuntimePath)) || !(await exists(auditLogRuntimePath))) {
  failures.push("Run npm run reset first.");
}

for (const envFile of envFiles) {
  if (await exists(path.join(rootDir, envFile))) {
    failures.push(`Unexpected env file present: ${envFile}.`);
  }
}

if (failures.length > 0) {
  console.error("Smoke test failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Smoke test passed.");
console.log(`Seed file: data/seed.json`);
console.log(`Trial requests: ${seed.trialRequests.length}`);
console.log(`Scenarios checked: ${scenarioFiles.length}`);
console.log(`Runtime files: data/runtime/trial-requests.json, data/runtime/audit-log.json`);
