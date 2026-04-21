import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(rootDir, "data", "seed.json");
const trialRequestsRuntimePath = path.join(rootDir, "data", "runtime", "trial-requests.json");
const auditLogRuntimePath = path.join(rootDir, "data", "runtime", "audit-log.json");
const typesPath = path.join(rootDir, "packages", "shared", "src", "types.ts");
const apiEntryPath = path.join(rootDir, "apps", "api", "dist", "main.js");
const webDistHtmlPath = path.join(rootDir, "apps", "web", "dist", "index.html");
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

if (!(await exists(apiEntryPath))) {
  failures.push("Missing built API entry: apps/api/dist/main.js. Run npm run api:build first.");
}

if (!(await exists(webDistHtmlPath))) {
  failures.push("Missing frontend build artifact: apps/web/dist/index.html. Run npm run web:build first.");
}

if (!(await exists(trialRequestsRuntimePath)) || !(await exists(auditLogRuntimePath))) {
  failures.push("Run npm run reset first.");
}

for (const envFile of envFiles) {
  if (await exists(path.join(rootDir, envFile))) {
    failures.push(`Unexpected env file present: ${envFile}.`);
  }
}

const port = process.env.SMOKE_PORT ?? "4312";
const baseUrl = `http://127.0.0.1:${port}`;

const serverProcess = spawn("node", ["apps/api/dist/main.js"], {
  cwd: rootDir,
  env: {
    ...process.env,
    PORT: port
  },
  stdio: ["ignore", "pipe", "pipe"]
});

let serverStdout = "";
let serverStderr = "";

serverProcess.stdout.on("data", (chunk) => {
  serverStdout += chunk.toString();
});

serverProcess.stderr.on("data", (chunk) => {
  serverStderr += chunk.toString();
});

const waitForHealth = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (serverProcess.exitCode !== null) {
      throw new Error(
        `API process exited before health check. stdout=${serverStdout} stderr=${serverStderr}`
      );
    }

    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await sleep(100);
  }

  throw new Error(
    `Timed out waiting for API health. stdout=${serverStdout} stderr=${serverStderr}`
  );
};

const readJsonResponse = async (resourcePath, options = undefined) => {
  const response = await fetch(`${baseUrl}${resourcePath}`, options);
  const payload = await response.json();
  return { response, payload };
};

try {
  await waitForHealth();

  const { payload: healthPayload } = await readJsonResponse("/health");
  if (
    healthPayload.status !== "ok" ||
    healthPayload.service !== "trialops-api" ||
    healthPayload.phase !== "2" ||
    healthPayload.dataStore !== "file-backed-json"
  ) {
    failures.push("GET /health returned an unexpected payload.");
  }

  const { payload: listPayload } = await readJsonResponse("/api/trial-requests");
  if (!Array.isArray(listPayload.items) || listPayload.items.length !== 10) {
    failures.push("GET /api/trial-requests did not return 10 items.");
  }

  const expectedStatusCounts = {
    new: 3,
    qualified: 3,
    approved: 2,
    rejected: 2
  };

  for (const status of requiredStatuses) {
    if (listPayload.meta?.statusCounts?.[status] !== expectedStatusCounts[status]) {
      failures.push(`Unexpected status count for ${status}.`);
    }
  }

  const { response: detailResponse, payload: detailPayload } = await readJsonResponse(
    "/api/trial-requests/tr_001"
  );
  if (detailResponse.status !== 200 || detailPayload.item?.id !== "tr_001") {
    failures.push("GET /api/trial-requests/tr_001 did not return the seeded request.");
  }

  const { response: patchResponse, payload: patchPayload } = await readJsonResponse(
    "/api/trial-requests/tr_001/status",
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "qualified",
        actor: "demo.presenter",
        reason: "Smoke test status update"
      })
    }
  );

  if (patchResponse.status !== 200 || patchPayload.item?.status !== "qualified") {
    failures.push("PATCH /api/trial-requests/tr_001/status did not update the status.");
  }

  const { payload: auditPayload } = await readJsonResponse("/api/audit-log?requestId=tr_001");
  if (
    !Array.isArray(auditPayload.items) ||
    !auditPayload.items.some(
      (item) =>
        item.requestId === "tr_001" &&
        item.action === "status_changed" &&
        item.fromStatus === "new" &&
        item.toStatus === "qualified"
    )
  ) {
    failures.push("GET /api/audit-log did not include the expected status_changed event.");
  }

  const { response: invalidStatusResponse, payload: invalidStatusPayload } =
    await readJsonResponse("/api/trial-requests/tr_001/status", {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "paused",
        actor: "demo.presenter"
      })
    });

  if (
    invalidStatusResponse.status !== 400 ||
    invalidStatusPayload.error !== "invalid_status"
  ) {
    failures.push("Invalid status did not return HTTP 400 with invalid_status.");
  }

  const { response: missingResponse, payload: missingPayload } = await readJsonResponse(
    "/api/trial-requests/tr_missing"
  );
  if (missingResponse.status !== 404 || missingPayload.error !== "not_found") {
    failures.push("Missing request did not return HTTP 404.");
  }
} finally {
  if (serverProcess.exitCode === null) {
    serverProcess.kill("SIGTERM");
    await sleep(100);
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
console.log(`Frontend build artifact: apps/web/dist/index.html`);
console.log(`API checks: /health, list, detail, patch status, audit log, invalid status, missing request`);
