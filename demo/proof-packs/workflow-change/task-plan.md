# Workflow Change — Task Plan

## Goal

Implement the bounded workflow-change slice without expanding TrialOps into a broader platform.

## Tasks

### WF-01 — Update status model and fixture baseline
- **Scope:** Add the new review state to the demo model and update any seed or fixture expectations needed for the scenario.
- **Files likely touched:** `packages/shared/src/types.ts`, `apps/api/src/types.ts`, `data/seed.json`, scenario/proof docs
- **Acceptance criteria:** The runtime model can represent the review state and demo fixtures still reset deterministically.
- **Dependencies:** None
- **Demo risk:** Medium — status changes affect every visible surface.

### WF-02 — Update API validation and transition logic
- **Scope:** Enforce the review step before approval and require owner plus decision reason for review decisions.
- **Files likely touched:** `apps/api/src/data-store.ts`, `apps/api/src/routes.ts`, `apps/api/src/server.ts`
- **Acceptance criteria:** Direct approval is blocked where required, review decisions are validated, and audit events capture the decision details.
- **Dependencies:** WF-01
- **Demo risk:** High — broken transitions would undermine the whole scenario.

### WF-03 — Update frontend dashboard, detail, and status controls
- **Scope:** Make the new review state visible in counts, detail view, and status-change controls without redesigning the app.
- **Files likely touched:** `apps/web/src/App.tsx`, `apps/web/src/api.ts`, `apps/web/src/styles.css`
- **Acceptance criteria:** The UI shows the new state clearly and the baseline weakness is replaced by the intended reviewed flow.
- **Dependencies:** WF-01, WF-02
- **Demo risk:** Medium — UI clarity matters more than polish.

### WF-04 — Update smoke, proof, and presenter docs
- **Scope:** Extend smoke checks, proof expectations, and demo instructions to match the implemented workflow change.
- **Files likely touched:** `scripts/smoke-test.mjs`, `README.md`, `demo/proof-packs/workflow-change/*`, `docs/demo/*`
- **Acceptance criteria:** Reset plus smoke remains deterministic and the presenter can show proof without inventing steps.
- **Dependencies:** WF-02, WF-03
- **Demo risk:** Medium — weak proof would make the feature look unverified.

## Boundedness note

This plan is intentionally limited to the visible workflow change requested in the demo scenario.
It does not authorize broader process redesign.
