---
title: "Domain Model"
tags: ["domain", "types", "data-model", "trialops"]
summary: "Two core entities: TrialRequest (the mutable subject) and AuditEvent (the immutable log)"
---

## Overview

The TrialOps domain is intentionally small. It has exactly two entities.

## TrialRequest

The primary subject. Represents a company's request for a product trial.

```typescript
interface TrialRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  segment: "smb" | "mid_market" | "enterprise";
  status: TrialRequestStatus;
  owner: string | null;
  notes: string[];
  createdAt: string;  // ISO 8601
}
```

### Status Lifecycle

```
new → qualified → approved
           └────→ rejected
```

Allowed statuses: `"new" | "qualified" | "approved" | "rejected"`

Current baseline allows **direct transition to any status** (no validation on state machine order). The `workflow-change` demo scenario proposes adding a `manual_review` step before `approved` — this is **not yet implemented**.

### Owner

`owner` is a nullable string (actor name). In the current baseline, it is not required for status changes. The proposed `workflow-change` adds mandatory owner assignment before approval.

## AuditEvent

Immutable event record. Appended to `audit-log.json` on every status change.

```typescript
interface AuditEvent {
  id: string;          // "evt_{timestamp}_{sequence}"
  requestId: string;   // FK → TrialRequest.id
  actor: string;       // who performed the action
  action: "status_changed";
  fromStatus: TrialRequestStatus;
  toStatus: TrialRequestStatus;
  reason?: string;     // optional, required in proposed manual_review flow
  createdAt: string;   // ISO 8601
}
```

`action` currently only supports `"status_changed"`. The type is a string literal union to allow expansion later.

## Planned Extension (Not Implemented)

The `workflow-change` scenario would add:

- `"manual_review"` as a new `TrialRequestStatus` value
- Required `owner` assignment when moving to `manual_review`
- Required `reason` string when transitioning from `manual_review` → `approved` or `rejected`
- Dashboard counter for the new status

These changes span: shared types, API validation, frontend status controls, and dashboard counts.
