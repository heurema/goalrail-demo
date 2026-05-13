# CSV Export - Hidden Acceptance

These expectations are evaluator-facing. They make the security and data
minimization risk visible in a deterministic scenario.

## Acceptance expectations

- Only users with `admin` or `reviewer` role may export CSV.
- Unauthorized users are blocked from export.
- CSV excludes sensitive notes.
- CSV excludes internal audit fields.
- CSV preserves the currently selected filters.
- Proof shows an authorized export case.
- Proof shows an unauthorized export is blocked.
- Proof names the allowed CSV fields.

## Allowed CSV fields

- request id
- company name
- requester name
- current status
- assigned owner
- submitted date

## Disallowed CSV fields

- sensitive notes
- internal audit events
- reviewer-only decision notes
- hidden scoring or risk metadata
- secrets, credentials, tokens, or private customer data

## Baseline failure mode

The baseline path adds a visible export affordance but does not prove permission
enforcement, data minimization, or filter preservation.

## GoalRail expectation

The GoalRail path should capture the permission constraint, allowed fields,
non-goals, and expected proof before implementation.
