# Pricing Copy - Delta Report

## Summary

The baseline path gets the visible copy right but changes behavior outside the
task. The GoalRail path improves scope adherence by turning a one-line copy
request into an explicit bounded contract with named non-goals and proof
expectations.

## Baseline

```text
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator
```

Result:

- CTA text changes to `Request access`
- billing or trial provisioning behavior also changes
- no evidence proves API/schema behavior stayed unchanged
- reviewer must investigate unrelated behavior

## GoalRail

```text
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

Result:

- CTA copy changes only
- CTA behavior is preserved
- billing, pricing rules, trial provisioning, API behavior, and schema are
  explicit non-goals
- proof gap is clear: show the copy change and show no behavior/API/schema
  drift

## Measurement delta

| Axis | Baseline | GoalRail | Delta |
| --- | --- | --- | --- |
| acceptance | partial | pass | Baseline changes the label but fails hidden preservation requirements. |
| scope adherence | fail | pass | GoalRail blocks billing/provisioning drift through explicit non-goals. |
| proof coverage | fail | partial | GoalRail names required proof even without adding an automated harness. |
| regression safety | fail | partial | GoalRail narrows the regression surface to copy preservation. |
| change minimality | fail | pass | GoalRail keeps the task to one visible label. |
| review burden | fail | pass | GoalRail tells reviewers what should and should not have changed. |
| evidence quality | fail | partial | GoalRail requires copy and no-drift evidence. |
| out-of-scope changes | fail | pass | Baseline illustrates scope drift; GoalRail prevents it in the contract. |
| time-to-confidence | fail | pass | GoalRail makes the proof gap small enough to inspect quickly. |

## Proof gap

The baseline proof gap is broad because unrelated billing/provisioning behavior
may have changed. The GoalRail proof gap is narrower: the evaluator only needs
evidence that visible copy changed and adjacent behavior did not.
