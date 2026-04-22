import { execFile, spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const execFileAsync = promisify(execFile);

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(rootDir, "data", "seed.json");
const runtimeDir = path.join(rootDir, "data", "runtime");
const trialRequestsRuntimePath = path.join(runtimeDir, "trial-requests.json");
const auditLogRuntimePath = path.join(runtimeDir, "audit-log.json");
const demoModeRuntimePath = path.join(runtimeDir, "demo-mode.json");
const typesPath = path.join(rootDir, "packages", "shared", "src", "types.ts");
const appPath = path.join(rootDir, "apps", "web", "src", "App.tsx");
const localePath = path.join(rootDir, "apps", "web", "src", "locale.ts");
const apiEntryPath = path.join(rootDir, "apps", "api", "dist", "main.js");
const webDistHtmlPath = path.join(rootDir, "apps", "web", "dist", "index.html");
const demoArtifactsPath = path.join(rootDir, "apps", "web", "src", "demoArtifacts.ts");
const requiredStatusKeys = [
  "new",
  "qualified",
  "manual_review",
  "approved",
  "rejected"
];
const seedRequiredStatuses = ["new", "qualified", "approved", "rejected"];
const scenarioFiles = [
  "workflow-change.yaml",
  "field-change.yaml",
  "bugfix.yaml",
  "policy-review.yaml"
];
const requiredFiles = [
  "demo/proof-packs/workflow-change/proof-sample.md",
  "demo/proof-packs/workflow-change/readout-sample.md",
  "docs/demo/DEMO_FAST_PATH_7MIN.md",
  "apps/web/src/demoArtifacts.ts",
  "apps/web/src/locale.ts"
];
const requiredArtifactIds = [
  "business_request",
  "clarification",
  "contract",
  "task_plan",
  "proof",
  "readout"
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

const runReset = async () => {
  await execFileAsync("node", ["scripts/reset-demo.mjs"], {
    cwd: rootDir
  });
};

const readJsonFile = async (filePath) =>
  JSON.parse(await readFile(filePath, "utf8"));

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
  for (const status of seedRequiredStatuses) {
    if (!seenStatuses.has(status)) {
      failures.push(`Missing required seed status: ${status}.`);
    }
  }
}

for (const requiredFile of requiredFiles) {
  if (!(await exists(path.join(rootDir, requiredFile)))) {
    failures.push(`Missing required file: ${requiredFile}.`);
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

if (!(await exists(typesPath))) {
  failures.push("Missing shared types file: packages/shared/src/types.ts.");
}

if (!(await exists(appPath))) {
  failures.push("Missing frontend app file: apps/web/src/App.tsx.");
}

if (!(await exists(localePath))) {
  failures.push("Missing locale file: apps/web/src/locale.ts.");
}

if (!(await exists(apiEntryPath))) {
  failures.push("Missing built API entry: apps/api/dist/main.js. Run npm run api:build first.");
}

if (!(await exists(webDistHtmlPath))) {
  failures.push("Missing frontend build artifact: apps/web/dist/index.html. Run npm run web:build first.");
}

for (const envFile of envFiles) {
  if (await exists(path.join(rootDir, envFile))) {
    failures.push(`Unexpected env file present: ${envFile}.`);
  }
}

if (await exists(demoArtifactsPath)) {
  const demoArtifactsSource = await readFile(demoArtifactsPath, "utf8");

  for (const artifactId of requiredArtifactIds) {
    if (!demoArtifactsSource.includes(`id: "${artifactId}"`)) {
      failures.push(`apps/web/src/demoArtifacts.ts is missing artifact id ${artifactId}.`);
    }
  }
}

if (await exists(localePath)) {
  const localeSource = await readFile(localePath, "utf8");

  if (!localeSource.includes('export type AppLocale = "en" | "ru"')) {
    failures.push("apps/web/src/locale.ts does not declare en/ru locales.");
  }

  if (!localeSource.includes('pathname === "/ru"') && !localeSource.includes('startsWith("/ru/")')) {
    failures.push("apps/web/src/locale.ts does not resolve the /ru path.");
  }
}

if (await exists(appPath)) {
  const appSource = await readFile(appPath, "utf8");

  if (!appSource.includes('from "./demoArtifacts.js"')) {
    failures.push("apps/web/src/App.tsx does not import demoArtifacts.");
  }

  if (!appSource.includes('from "./locale.js"')) {
    failures.push("apps/web/src/App.tsx does not import locale helpers.");
  }

  if (!appSource.includes("LanguageToggle")) {
    failures.push("apps/web/src/App.tsx does not expose the locale switcher.");
  }

  if (!appSource.includes("getPathForLocale")) {
    failures.push("apps/web/src/App.tsx does not route locale changes to /ru.");
  }
}

await runReset();

if (
  !(await exists(trialRequestsRuntimePath)) ||
  !(await exists(auditLogRuntimePath)) ||
  !(await exists(demoModeRuntimePath))
) {
  failures.push("Runtime files were not recreated by npm run reset.");
}

const demoModeRuntime = await readJsonFile(demoModeRuntimePath);
if (demoModeRuntime.workflowMode !== "baseline") {
  failures.push("Reset did not restore baseline workflow mode.");
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
    healthPayload.dataStore !== "file-backed-json"
  ) {
    failures.push("GET /health returned an unexpected payload.");
  }

  const { payload: demoModePayload } = await readJsonResponse("/api/demo-mode");
  if (demoModePayload.workflowMode !== "baseline") {
    failures.push("GET /api/demo-mode did not return baseline after reset.");
  }

  const { payload: listPayload } = await readJsonResponse("/api/trial-requests");
  if (!Array.isArray(listPayload.items) || listPayload.items.length !== 10) {
    failures.push("GET /api/trial-requests did not return 10 items.");
  }

  const expectedBaselineCounts = {
    new: 3,
    qualified: 3,
    manual_review: 0,
    approved: 2,
    rejected: 2
  };

  for (const status of requiredStatusKeys) {
    if (!(status in (listPayload.meta?.statusCounts ?? {}))) {
      failures.push(`Missing statusCounts key for ${status}.`);
      continue;
    }

    if (listPayload.meta?.statusCounts?.[status] !== expectedBaselineCounts[status]) {
      failures.push(`Unexpected baseline status count for ${status}.`);
    }
  }

  const { response: detailResponse, payload: detailPayload } = await readJsonResponse(
    "/api/trial-requests/tr_002"
  );
  if (detailResponse.status !== 200 || detailPayload.item?.id !== "tr_002") {
    failures.push("GET /api/trial-requests/tr_002 did not return the seeded qualified request.");
  }

  const baselineApproveReason = "Baseline smoke: direct approval is still allowed.";
  const { response: baselineApproveResponse, payload: baselineApprovePayload } = await readJsonResponse(
    "/api/trial-requests/tr_002/status",
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "approved",
        actor: "demo.presenter",
        reason: baselineApproveReason
      })
    }
  );

  if (
    baselineApproveResponse.status !== 200 ||
    baselineApprovePayload.item?.status !== "approved"
  ) {
    failures.push("Baseline direct approval did not succeed for a qualified request.");
  }

  const { payload: baselineAuditPayload } = await readJsonResponse(
    "/api/audit-log?requestId=tr_002"
  );
  if (
    !Array.isArray(baselineAuditPayload.items) ||
    !baselineAuditPayload.items.some(
      (item) =>
        item.requestId === "tr_002" &&
        item.fromStatus === "qualified" &&
        item.toStatus === "approved" &&
        item.reason === baselineApproveReason
    )
  ) {
    failures.push("Baseline audit log did not capture direct approval evidence.");
  }

  const { response: goalrailModeResponse, payload: goalrailModePayload } =
    await readJsonResponse("/api/demo-mode", {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ workflowMode: "goalrail" })
    });

  if (
    goalrailModeResponse.status !== 200 ||
    goalrailModePayload.workflowMode !== "goalrail"
  ) {
    failures.push("PATCH /api/demo-mode did not switch to goalrail.");
  }

  const { response: blockedApproveResponse, payload: blockedApprovePayload } =
    await readJsonResponse("/api/trial-requests/tr_005/status", {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "approved",
        actor: "demo.presenter"
      })
    });

  if (
    blockedApproveResponse.status !== 400 ||
    blockedApprovePayload.error !== "review_required"
  ) {
    failures.push("Goalrail mode did not block direct approval from qualified with review_required.");
  }

  const reviewReason = "Ready for review before provisioning.";
  const { response: sendToReviewResponse, payload: sendToReviewPayload } =
    await readJsonResponse("/api/trial-requests/tr_005/status", {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "manual_review",
        actor: "demo.presenter",
        reason: reviewReason
      })
    });

  if (
    sendToReviewResponse.status !== 200 ||
    sendToReviewPayload.item?.status !== "manual_review"
  ) {
    failures.push("Qualified request did not move into manual_review in goalrail mode.");
  }

  const { payload: reviewListPayload } = await readJsonResponse("/api/trial-requests");
  if (reviewListPayload.meta?.statusCounts?.manual_review !== 1) {
    failures.push("Status counts did not reflect the manual_review request.");
  }

  const { response: missingOwnerResponse, payload: missingOwnerPayload } =
    await readJsonResponse("/api/trial-requests/tr_005/status", {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "approved",
        actor: "demo.presenter",
        reason: "Review complete without owner should fail."
      })
    });

  if (
    missingOwnerResponse.status !== 400 ||
    missingOwnerPayload.error !== "owner_required"
  ) {
    failures.push("Approving from manual_review without owner did not return owner_required.");
  }

  const { response: missingReasonResponse, payload: missingReasonPayload } =
    await readJsonResponse("/api/trial-requests/tr_005/status", {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "approved",
        actor: "demo.presenter",
        owner: "R. Singh"
      })
    });

  if (
    missingReasonResponse.status !== 400 ||
    missingReasonPayload.error !== "reason_required"
  ) {
    failures.push("Approving from manual_review without reason did not return reason_required.");
  }

  const reviewApprovalReason =
    "Manual review completed. Owner assigned and decision reason captured before approval.";
  const { response: reviewedApproveResponse, payload: reviewedApprovePayload } =
    await readJsonResponse("/api/trial-requests/tr_005/status", {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "approved",
        actor: "demo.presenter",
        owner: "R. Singh",
        reason: reviewApprovalReason
      })
    });

  if (
    reviewedApproveResponse.status !== 200 ||
    reviewedApprovePayload.item?.status !== "approved" ||
    reviewedApprovePayload.item?.owner !== "R. Singh"
  ) {
    failures.push("Approving from manual_review with owner and reason did not succeed.");
  }

  const { payload: reviewedAuditPayload } = await readJsonResponse(
    "/api/audit-log?requestId=tr_005"
  );
  if (
    !Array.isArray(reviewedAuditPayload.items) ||
    !reviewedAuditPayload.items.some(
      (item) =>
        item.requestId === "tr_005" &&
        item.action === "status_changed" &&
        item.fromStatus === "manual_review" &&
        item.toStatus === "approved" &&
        item.actor === "demo.presenter" &&
        item.assignedOwner === "R. Singh" &&
        item.reason === reviewApprovalReason
    )
  ) {
    failures.push("Audit log did not include actor, owner, and reason for the review approval.");
  }

  const { payload: finalListPayload } = await readJsonResponse("/api/trial-requests");
  const expectedFinalCounts = {
    new: 3,
    qualified: 1,
    manual_review: 0,
    approved: 4,
    rejected: 2
  };

  for (const status of requiredStatusKeys) {
    if (finalListPayload.meta?.statusCounts?.[status] !== expectedFinalCounts[status]) {
      failures.push(`Unexpected final status count for ${status}.`);
    }
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

  await runReset();
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
console.log(`Runtime files: data/runtime/trial-requests.json, data/runtime/audit-log.json, data/runtime/demo-mode.json`);
console.log(`Required artifacts: ${requiredFiles.length}`);
console.log(`API checks: /health, /api/demo-mode, list, detail, baseline approval, goalrail review gate, review approval validation, audit log, invalid status, missing request`);
