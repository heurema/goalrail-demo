import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { RuntimeDataError } from "./errors.js";
import type {
  AuditEvent,
  DemoModeState,
  DemoWorkflowMode,
  TrialRequest,
  TrialRequestStatus
} from "./types.js";

const runtimeRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "data",
  "runtime"
);

const trialRequestsPath = path.join(runtimeRoot, "trial-requests.json");
const auditLogPath = path.join(runtimeRoot, "audit-log.json");
const demoModePath = path.join(runtimeRoot, "demo-mode.json");

export const allowedStatuses: TrialRequestStatus[] = [
  "new",
  "qualified",
  "manual_review",
  "approved",
  "rejected"
];

export const allowedWorkflowModes: DemoWorkflowMode[] = [
  "baseline",
  "goalrail"
];

const ensureRuntimeFile = async (filePath: string): Promise<void> => {
  try {
    await access(filePath, constants.F_OK);
  } catch {
    throw new RuntimeDataError();
  }
};

const readJsonFile = async <T>(filePath: string): Promise<T> => {
  await ensureRuntimeFile(filePath);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
};

const writeJsonFile = async <T>(filePath: string, value: T): Promise<void> => {
  await writeFile(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
};

export const readTrialRequests = async (): Promise<TrialRequest[]> =>
  readJsonFile<TrialRequest[]>(trialRequestsPath);

export const readAuditLog = async (): Promise<AuditEvent[]> =>
  readJsonFile<AuditEvent[]>(auditLogPath);

export const readDemoMode = async (): Promise<DemoModeState> =>
  readJsonFile<DemoModeState>(demoModePath);

export const updateDemoMode = async (
  workflowMode: DemoWorkflowMode
): Promise<DemoModeState> => {
  const nextState: DemoModeState = { workflowMode };
  await writeJsonFile(demoModePath, nextState);
  return nextState;
};

export const getStatusCounts = (
  requests: TrialRequest[]
): Record<TrialRequestStatus, number> => {
  const counts = Object.fromEntries(
    allowedStatuses.map((status) => [status, 0])
  ) as Record<TrialRequestStatus, number>;

  for (const request of requests) {
    if (allowedStatuses.includes(request.status)) {
      counts[request.status] += 1;
    }
  }

  return counts;
};

export const findTrialRequestById = async (
  id: string
): Promise<TrialRequest | null> => {
  const requests = await readTrialRequests();
  return requests.find((request) => request.id === id) ?? null;
};

export const updateTrialRequestStatus = async (input: {
  id: string;
  status: TrialRequestStatus;
  actor: string;
  owner?: string;
  reason?: string;
}): Promise<{ item: TrialRequest; auditEvent: AuditEvent } | null> => {
  const requests = await readTrialRequests();
  const index = requests.findIndex((request) => request.id === input.id);

  if (index === -1) {
    return null;
  }

  const current = requests[index];
  const updated: TrialRequest = {
    ...current,
    status: input.status,
    owner: input.owner ?? current.owner
  };

  requests[index] = updated;
  await writeJsonFile(trialRequestsPath, requests);

  const auditLog = await readAuditLog();
  const auditEvent: AuditEvent = {
    id: `evt_${Date.now()}_${auditLog.length + 1}`,
    requestId: input.id,
    actor: input.actor,
    action: "status_changed",
    fromStatus: current.status,
    toStatus: input.status,
    assignedOwner: input.owner,
    reason: input.reason,
    createdAt: new Date().toISOString()
  };

  auditLog.push(auditEvent);
  await writeJsonFile(auditLogPath, auditLog);

  return {
    item: updated,
    auditEvent
  };
};
