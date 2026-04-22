# Workflow Change — Proof Sample

> Demo artifact for the deterministic TrialOps sandbox.
> This is not production evidence for a customer system.
> It exists to support the Goalrail demo narrative from bounded change request to inspectable proof.

## Contract reference

- Scenario: `workflow-change`
- Contract draft path: `demo/proof-packs/workflow-change/contract-draft.md`
- Task plan path: `demo/proof-packs/workflow-change/task-plan.md`

## What changed

- Added a switchable demo workflow mode: `baseline` or `goalrail`
- Added runtime status `manual_review`
- Preserved the before-state so direct approval is still visible in `baseline`
- Blocked direct approval from intake states in `goalrail`
- Required visible reviewer actor, assigned owner, and decision reason for review approval/rejection
- Extended audit evidence and dashboard counts so the workflow change is visible in the UI and smoke checks

## Checks run

- `npm run reset`
- `npm run typecheck`
- `npm run api:build`
- `npm run web:build`
- `npm run smoke`
- Manual browser check: switch from baseline to Goalrail mode, send a qualified request to manual review, approve after review

## Acceptance criteria results

| Criterion | Result | Evidence |
| --- | --- | --- |
| Direct approval blocked in Goalrail mode | pass | `PATCH /api/trial-requests/:id/status` returns `review_required` for `qualified -> approved` in Goalrail mode; covered by smoke |
| Manual review state exists | pass | Shared types, API validation, dashboard counts, filter tab, and status chips include `manual_review` |
| Owner required before review approval | pass | `manual_review -> approved` without owner returns `owner_required`; covered by smoke |
| Decision reason required | pass | `manual_review -> approved` without reason returns `reason_required`; covered by smoke |
| Dashboard reflects manual review state | pass | UI metrics and filter include `Manual review`; smoke checks count changes during `qualified -> manual_review` |
| Audit log captures actor/reason/owner | pass | Audit events store `actor`, `fromStatus`, `toStatus`, `assignedOwner`, `reason`, `createdAt`; visible in UI and verified in smoke |
| Reset + smoke remain deterministic | pass | `npm run reset` restores `workflowMode: baseline`; smoke self-resets before and after API mutations |

## Before / after behavior

### Before
- baseline mode allows direct approval from `qualified`
- the UI warns: `Direct approval enabled. Approve provisions the trial immediately — no second reviewer required.`
- presenter can show the weakness without checking out an older commit

### After
- Goalrail mode adds a visible `manual_review` step
- direct approval from `new` or `qualified` is blocked
- review approval/rejection requires a reviewer actor, assigned owner, and decision reason
- the dashboard, filter tabs, status chips, and audit log expose the change visibly

## Audit evidence

- request id: `tr_005`
- reviewer actor: `demo.presenter`
- from status: `manual_review`
- to status: `approved`
- assigned owner: `R. Singh`
- reason: `Manual review completed. Owner assigned and decision reason captured before approval.`
- timestamp: visible in runtime audit log and TrialOps audit panel

## Open risks

- This remains a local sandbox with fake data, so the proof demonstrates the flow shape rather than production governance.
- No permissions model exists yet; the demo only makes the reviewer actor visible, it does not enforce role-based review authority.
- The slice is intentionally narrow and does not attempt notifications, policy profiles, or a generic workflow engine.

## Final verdict

`accept`

### Verdict summary

This slice is acceptable as a demo-ready workflow-change proof for the sandbox because it keeps the before-state visible, adds a bounded review-gated after-state, and verifies the behavior with deterministic smoke plus inspectable audit evidence.
