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
