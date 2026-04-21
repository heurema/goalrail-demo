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
  trialRequestId: string;
  action: string;
  actor: string;
  createdAt: string;
  details?: string;
}

export type ScenarioId =
  | "workflow-change"
  | "field-change"
  | "bugfix"
  | "policy-review";
