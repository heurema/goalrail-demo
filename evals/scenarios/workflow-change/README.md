# Workflow Change Eval Scenario

`workflow-change` is the first candidate paired scenario for deterministic
baseline-vs-GoalRail evaluation.

It maps the existing TrialOps demo story into an eval shape without duplicating
large proof/readout content.

## Existing source artifacts

- Proof sample: `../../../demo/proof-packs/workflow-change/proof-sample.md`
- Readout sample:
  `../../../demo/proof-packs/workflow-change/readout-sample.md`
- Scenario card: `../../../demo/scenarios/workflow-change.yaml`

## Baseline path

Baseline shows the before-state:
- direct approval remains possible from a qualified request
- no second reviewer is required
- the weakness is visible in the running demo without checking out old code

## GoalRail path

GoalRail shows the guided after-state:
- `manual_review` is required before approval
- reviewer actor is visible
- assigned owner is required
- decision reason is required
- audit evidence captures the review decision
- proof/readout artifacts make the change inspectable

## Paired artifacts

This scenario is materialized under `evals/scenarios/workflow-change/` using
the standard layout:

```text
task.md
hidden-acceptance.md
baseline.md
goalrail-contract.md
goalrail.md
rubric.yaml
delta-report.md
```

Do not add app behavior, scripts, backend endpoints, frontend UI, or live AI
runtime for this scenario without a separate implementation task.
