export type TrialRequestStatus =
  | "new"
  | "qualified"
  | "manual_review"
  | "approved"
  | "rejected";

export type DemoWorkflowMode = "baseline" | "goalrail";

export interface DemoModeState {
  workflowMode: DemoWorkflowMode;
}

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
  assignedOwner?: string;
  reason?: string;
  createdAt: string;
}
