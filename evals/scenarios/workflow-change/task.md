# Workflow Change - Task

## Raw task

Add a manual review step before a qualified trial request can be approved.

The reviewer should assign an owner, provide a decision reason, and leave enough
audit evidence for another operator to understand who made the decision and why.

## Shared input

This raw task is used for both evaluation paths:

```text
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

## Scenario context

- Sandbox: fake TrialOps demo data only.
- Existing source artifacts:
  - `../../../demo/proof-packs/workflow-change/proof-sample.md`
  - `../../../demo/proof-packs/workflow-change/readout-sample.md`
- Baseline weakness: direct approval from `qualified` remains possible.
- GoalRail target: approval requires `manual_review`, reviewer actor, owner,
  decision reason, and audit evidence.

## Out of scope

- real permissions or auth
- notifications
- policy profiles
- generic workflow engine
- production proof
