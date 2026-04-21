export type TrialRequestStatus = "new" | "qualified" | "approved" | "rejected";

export interface TrialRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  segment: "smb" | "mid_market" | "enterprise";
  status: TrialRequestStatus;
  owner: string | null;
  notes: string[];
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  requestId: string;
  actor: string;
  action: "status_changed";
  fromStatus: TrialRequestStatus;
  toStatus: TrialRequestStatus;
  reason?: string;
  createdAt: string;
}

export interface TrialRequestsResponse {
  items: TrialRequest[];
  meta: {
    total: number;
    statusCounts: Record<TrialRequestStatus, number>;
  };
}

export interface TrialRequestDetailResponse {
  item: TrialRequest;
}

export interface AuditLogResponse {
  items: AuditEvent[];
}
