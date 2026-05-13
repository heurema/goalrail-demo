# Workflow Change - GoalRail Path

## Path

```text
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

## GoalRail result

The GoalRail-guided path makes the workflow boundary explicit:

- direct approval from intake states is blocked
- `manual_review` is required before approval
- reviewer actor is visible
- assigned owner is required
- decision reason is required
- audit evidence captures the review decision context

## Evidence available

Use the existing source/reference artifacts:

- `../../../demo/proof-packs/workflow-change/proof-sample.md`
- `../../../demo/proof-packs/workflow-change/readout-sample.md`

Relevant proof evidence in the source artifacts:

- `qualified -> approved` is blocked in GoalRail mode
- `manual_review` appears in workflow evidence
- owner and reason requirements are checked
- audit evidence includes actor, status transition, owner, reason, and timestamp

## Remaining limits

- This is deterministic sandbox evidence, not production proof.
- Reviewer actor visibility is not the same as real role-based authorization.
- The scenario proves a bounded workflow-change story, not a generic workflow
  engine.
