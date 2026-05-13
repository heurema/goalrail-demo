# CSV Export - Task

## Raw task

Add CSV export for trial requests.

## Shared input

This raw task is used for both evaluation paths:

```text
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

## Scenario context

This is a deterministic reference scenario for an admin-style export feature in
the fake TrialOps sandbox. It is not production proof and does not require a new
runtime implementation in this task.

## Intended change

- Export trial request rows as CSV.
- Preserve existing filters.
- Limit export to admin/reviewer users.
- Exclude sensitive notes and internal audit fields from the CSV.

## Out of scope

- external storage
- email delivery
- background jobs
- real customer data
- live auth integration
- production reporting
