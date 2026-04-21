import type {
  AuditLogResponse,
  TrialRequestDetailResponse,
  TrialRequestStatus,
  TrialRequestsResponse
} from "./types.js";

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const readJson = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);
  const payload = await response.json();

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? "API request failed",
      response.status
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
  reason: string;
}): Promise<TrialRequestDetailResponse> =>
  readJson<TrialRequestDetailResponse>(`/api/trial-requests/${input.id}/status`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      status: input.status,
      actor: "demo.presenter",
      reason: input.reason.trim() || undefined
    })
  });

export const fetchAuditLog = (): Promise<AuditLogResponse> =>
  readJson<AuditLogResponse>("/api/audit-log");
