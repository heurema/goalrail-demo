import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(rootDir, "data", "seed.json");
const runtimeDir = path.join(rootDir, "data", "runtime");
const trialRequestsPath = path.join(runtimeDir, "trial-requests.json");
const auditLogPath = path.join(runtimeDir, "audit-log.json");
const demoModePath = path.join(runtimeDir, "demo-mode.json");
const orderedStatuses = [
  "new",
  "qualified",
  "manual_review",
  "approved",
  "rejected"
];

const seedRaw = await readFile(seedPath, "utf8");
const seed = JSON.parse(seedRaw);

if (!seed || !Array.isArray(seed.trialRequests)) {
  throw new Error("Seed file must contain a trialRequests array.");
}

await mkdir(runtimeDir, { recursive: true });
await writeFile(trialRequestsPath, JSON.stringify(seed.trialRequests, null, 2) + "\n", "utf8");
await writeFile(auditLogPath, JSON.stringify([], null, 2) + "\n", "utf8");
await writeFile(
  demoModePath,
  JSON.stringify({ workflowMode: "baseline" }, null, 2) + "\n",
  "utf8"
);

const statusCounts = Object.fromEntries(orderedStatuses.map((status) => [status, 0]));
for (const request of seed.trialRequests) {
  if (request?.status in statusCounts) {
    statusCounts[request.status] += 1;
  }
}

const summary = orderedStatuses
  .map((status) => `${status}=${statusCounts[status]}`)
  .join(", ");

console.log("Reset complete.");
console.log(`Requests: ${seed.trialRequests.length}`);
console.log(`Status counts: ${summary}`);
console.log(`Wrote: data/runtime/trial-requests.json`);
console.log(`Wrote: data/runtime/audit-log.json`);
console.log(`Wrote: data/runtime/demo-mode.json`);
