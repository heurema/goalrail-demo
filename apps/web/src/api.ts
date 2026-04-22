import type {
  AuditLogResponse,
  DemoModeResponse,
  TrialRequestDetailResponse,
  TrialRequestStatus,
  TrialRequestsResponse
} from "./types.js";

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const readJson = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);
  const payload = (await response.json()) as
    | {
        error?: string;
        message?: string;
      }
    | undefined;

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? "API request failed",
      response.status,
      payload?.error
    );
  }

  return payload as T;
};

export const fetchTrialRequests = (): Promise<TrialRequestsResponse> =>
  readJson<TrialRequestsResponse>("/api/trial-requests");

export const fetchTrialRequest = (
  id: string
): Promise<TrialRequestDetailResponse> =>
  readJson<TrialRequestDetailResponse>(`/api/trial-requests/${id}`);

export const updateTrialRequestStatus = (input: {
  id: string;
  status: TrialRequestStatus;
  actor: string;
  owner?: string;
  reason?: string;
}): Promise<TrialRequestDetailResponse> =>
  readJson<TrialRequestDetailResponse>(`/api/trial-requests/${input.id}/status`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      status: input.status,
      actor: input.actor.trim(),
      owner: input.owner?.trim() || undefined,
      reason: input.reason?.trim() || undefined
    })
  });

export const fetchAuditLog = (): Promise<AuditLogResponse> =>
  readJson<AuditLogResponse>("/api/audit-log");

export const fetchDemoMode = (): Promise<DemoModeResponse> =>
  readJson<DemoModeResponse>("/api/demo-mode");

export const updateDemoMode = (
  workflowMode: DemoModeResponse["workflowMode"]
): Promise<DemoModeResponse> =>
  readJson<DemoModeResponse>("/api/demo-mode", {
    method: "PATCH",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ workflowMode })
  });

export { ApiError };
