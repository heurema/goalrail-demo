# CSV Export - GoalRail Contract

## Working contract

Add CSV export for trial requests with explicit permission, data minimization,
and filter-preservation proof.

## In scope

- Export the currently filtered trial request rows as CSV.
- Permit export only for `admin` and `reviewer` roles.
- Block unauthorized export attempts.
- Include only approved CSV fields.
- Exclude sensitive notes and internal audit fields.
- Provide evidence for allowed export, blocked unauthorized export, field
  allowlist, and filter preservation.

## Non-goals

- external storage
- email delivery
- background jobs
- live auth provider integration
- production reporting
- database schema changes
- export of sensitive notes
- export of internal audit fields

## Bounded task packet

1. Define the permitted export roles: `admin`, `reviewer`.
2. Define the allowed CSV fields.
3. Preserve the current filter set when generating CSV rows.
4. Block export for unauthorized roles.
5. Produce proof for authorized export, unauthorized block, field allowlist, and
   filter preservation.

## Expected proof

- Authorized `admin` or `reviewer` export succeeds.
- Unauthorized export is blocked.
- CSV header contains only allowed fields.
- CSV rows do not include sensitive notes or internal audit fields.
- Exported rows match the active filters.
- No external storage, email, or background job behavior is introduced.

## Soft verdict vocabulary

Expected GoalRail verdict for the scenario:

- `aligned_but_proof_incomplete` if visible export exists but proof is partial
- `evidence_too_weak` if unauthorized export or field minimization is unproven
- `scope_drift_detected` if export adds external delivery or broad reporting
