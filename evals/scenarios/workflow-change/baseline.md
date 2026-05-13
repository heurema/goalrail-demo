# Workflow Change - Baseline Path

## Path

```text
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator
```

## Baseline result

The direct path preserves the before-state weakness:

- a `qualified` request can be approved directly
- no `manual_review` transition is required
- no second reviewer is required
- approval can happen without a review owner and decision reason
- audit evidence is not strong enough to explain a review-gated decision

## Evaluator observation

The visible workflow may look fast, but the reviewer cannot prove that a
qualified request received a separate review before approval.

## Evidence available

- Baseline mode in the deterministic demo keeps direct approval visible.
- Existing proof/readout artifacts describe the before/after behavior:
  - `../../../demo/proof-packs/workflow-change/proof-sample.md`
  - `../../../demo/proof-packs/workflow-change/readout-sample.md`

## Main gaps

- scope of the workflow change is not made explicit before implementation
- acceptance evidence does not prove review gating
- audit evidence does not carry the required review decision context
- time-to-confidence is weak because the reviewer must infer intent from UI
  behavior instead of inspecting a contract and proof expectations
