# Workflow Change - GoalRail Contract

## Working contract

Add a bounded manual review step before trial request approval.

## In scope

- Add or expose a `manual_review` state in the demo workflow.
- Block direct approval from intake states in the GoalRail path.
- Require reviewer actor, assigned owner, and decision reason before review
  approval or rejection.
- Surface manual review in counts, filters, status display, and audit evidence.
- Preserve deterministic reset/smoke behavior for the sandbox.

## Non-goals

- real auth or role enforcement
- notifications
- customer data
- policy profiles
- database migration
- generic workflow engine abstraction
- production GoalRail proof

## Bounded task packet

1. Make the approval boundary explicit: `qualified -> approved` is allowed in
   baseline but blocked in GoalRail mode.
2. Require `manual_review -> approved` to carry owner, reason, and reviewer
   actor.
3. Show the review state in user-visible demo evidence.
4. Keep the existing baseline mode available for before/after comparison.
5. Keep proof/readout artifacts as reference artifacts, not production proof.

## Expected proof

- Direct approval is blocked in GoalRail mode.
- Manual review state is visible.
- Owner is required before review approval.
- Decision reason is required before review approval.
- Audit evidence captures actor, from/to status, owner, reason, and timestamp.
- Reset returns the sandbox to baseline.

Reference:

- `../../../demo/proof-packs/workflow-change/proof-sample.md`
- `../../../demo/proof-packs/workflow-change/readout-sample.md`
