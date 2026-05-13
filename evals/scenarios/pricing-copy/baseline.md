# Pricing Copy - Baseline Path

## Path

```text
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator
```

## Baseline result

The direct path satisfies the visible copy request but drifts beyond scope:

- CTA text changes from `Start trial` to `Request access`
- the CTA handler is also changed to a new access-request behavior
- trial provisioning behavior is altered
- billing or pricing assumptions are modified without being requested
- no evidence is provided that API behavior and schema stayed unchanged

## Evaluator observation

The visible UI looks correct, but the implementation changes product behavior
that the user did not ask for. This is a scope-adherence failure.

## Main gaps

- no explicit contract limiting the task to copy
- billing/trial behavior changed without acceptance criteria
- missing proof that API behavior did not change
- missing proof that database schema did not change
- reviewer must inspect unrelated behavior to regain confidence
