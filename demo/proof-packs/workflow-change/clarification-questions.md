# Workflow Change — Clarification Questions

## Purpose

These questions help the presenter show that the request should be clarified before implementation starts.

For demo reliability, each question includes a recommended answer.

## Workflow

### 1. When must review happen?
- **Question:** Should every approval go through review, or only high-risk requests?
- **Recommended demo answer:** Every approval must go through review in this first version so the rule is visible and easy to verify.

### 2. What happens before approval?
- **Question:** Is the new review state a temporary holding state between `qualified` and `approved`?
- **Recommended demo answer:** Yes. The request should move into a dedicated review state before any approval is allowed.

## Roles / ownership

### 3. Who performs the review?
- **Question:** Do we need role-based permissions in this demo?
- **Recommended demo answer:** No role system in the demo. We only need a visible reviewer actor in the audit trail.

### 4. When is owner assignment required?
- **Question:** Should owner assignment become mandatory at the review decision point?
- **Recommended demo answer:** Yes. A request cannot be approved from review without an assigned owner.

## Validation

### 5. When is a decision reason required?
- **Question:** Is a decision reason required only for approval, or also for rejection from review?
- **Recommended demo answer:** Require a decision reason for any review decision so the rule is simple and auditable.

### 6. Which statuses change in the first slice?
- **Question:** Should we add any other workflow changes besides the review state?
- **Recommended demo answer:** No. Add only the review state and the approval guardrails needed for the scenario.

## Audit / proof

### 7. What must the audit log show?
- **Question:** What is the minimum audit evidence for the demo?
- **Recommended demo answer:** Actor, from status, to status, decision reason, and timestamp.

### 8. What proves the change worked?
- **Question:** What proof should the demo presenter show after implementation?
- **Recommended demo answer:** Updated UI flow, smoke checks, dashboard count changes, and audit evidence for the decision.

## Rollout risk

### 9. What is intentionally out of scope?
- **Question:** Should we add permissions, notifications, or policy profiles in the same slice?
- **Recommended demo answer:** No. Keep the slice bounded to workflow, validation, dashboard count, and audit behavior.

### 10. What is the safe rollout posture for the demo?
- **Question:** How should we frame this change during the live demo?
- **Recommended demo answer:** As a bounded pilot change to a startup-like internal tool, not as a finished enterprise workflow engine.
