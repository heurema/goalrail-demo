# Workflow Change - Delta Report

## Summary

The baseline path makes the existing weakness visible: direct approval from
`qualified` remains possible. The GoalRail path improves confidence by making
the manual review boundary explicit and tying it to inspectable proof evidence.

## Baseline

```text
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator
```

Result:

- direct approval is still possible
- no second reviewer is required
- owner, reason, and reviewer actor are not required before approval
- audit evidence does not prove a review decision happened

## GoalRail

```text
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

Result:

- `manual_review` is required before approval
- reviewer actor, owner, and decision reason are visible
- audit evidence captures the review decision
- proof/readout references make the claim inspectable

## Measurement delta

| Axis | Baseline | GoalRail | Delta |
| --- | --- | --- | --- |
| acceptance | partial | pass | GoalRail satisfies the hidden manual review requirement. |
| scope adherence | partial | pass | GoalRail constrains the change to one workflow boundary. |
| proof coverage | fail | pass | GoalRail points to concrete proof/readout evidence. |
| regression safety | partial | pass | GoalRail keeps deterministic reset/smoke evidence in scope. |
| change minimality | partial | pass | GoalRail limits the change and names non-goals. |
| review burden | fail | pass | GoalRail reduces inference by giving the reviewer a contract and proof map. |
| evidence quality | partial | pass | GoalRail evidence names checks and audit fields. |
| out-of-scope changes | partial | pass | GoalRail excludes auth, notifications, and generic workflow work. |
| time-to-confidence | fail | pass | GoalRail makes the expected proof visible before review. |

## Proof gap

The baseline path is useful as a before-state but does not prove that approval is
review-gated. The GoalRail path narrows the proof gap to the remaining sandbox
limits: no real auth, no production data, and no production proof.
