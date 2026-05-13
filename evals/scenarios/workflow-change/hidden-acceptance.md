# Workflow Change - Hidden Acceptance

These expectations are evaluator-facing. They describe what the deterministic
scenario should expose, not production customer proof.

## Acceptance expectations

- A `qualified` request must not move directly to `approved` in the GoalRail
  path.
- The GoalRail path must introduce `manual_review` before approval.
- Review approval must require a visible reviewer actor.
- Review approval must require an assigned owner.
- Review approval must require a decision reason.
- Audit evidence must capture at least actor, previous status, next status,
  owner, reason, and timestamp.
- Dashboard/readout evidence should make the manual review state inspectable.

## Baseline expectation

The baseline path should preserve the known weakness:

- direct approval from `qualified` is possible
- no second reviewer is required
- owner/reason/audit evidence are not sufficient to explain a review decision

## GoalRail expectation

The GoalRail path should make the risk visible and bounded:

- direct approval is blocked
- `manual_review` is required
- reviewer actor, owner, and reason are visible
- audit evidence supports the proof/readout narrative

## Reference artifacts

Use these source/reference artifacts instead of duplicating full proof content:

- `../../../demo/proof-packs/workflow-change/proof-sample.md`
- `../../../demo/proof-packs/workflow-change/readout-sample.md`
