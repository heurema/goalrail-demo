# CSV Export — Proof Gap Report

## Diagnostic status

This is a deterministic demo/eval artifact for `heurema/goalrail-demo`.

It is not production proof, not server-owned `Proof`, not PR verification, and
not merge approval. It is a manual diagnostic report shaped from the canonical
Goalrail `ProofGapReport` spec and the local scenario artifacts.

## Executive summary

The raw task asks to add CSV export for trial requests.

The baseline path may satisfy the visible feature by producing CSV, but it does
not provide enough permission, data-minimization, or filter-preservation
evidence. That makes the feature hard to trust even when the export appears to
work.

The GoalRail path reconstructs the hidden contract: export is limited to
`admin` and `reviewer` roles, includes only allowed fields, excludes sensitive
notes/internal audit fields, preserves active filters, and requires proof for
authorized and unauthorized paths.

Soft verdict: `evidence_too_weak`.

## Source inputs

- [task.md](task.md)
- [hidden-acceptance.md](hidden-acceptance.md)
- [baseline.md](baseline.md)
- [goalrail-contract.md](goalrail-contract.md)
- [goalrail.md](goalrail.md)
- [rubric.yaml](rubric.yaml)
- [delta-report.md](delta-report.md)

## Reconstructed working contract

Goal: add CSV export for trial requests with explicit permission, data
minimization, and filter-preservation proof.

Scope in:
- export currently filtered trial request rows as CSV
- permit export only for `admin` and `reviewer` roles
- block unauthorized export attempts
- include only approved CSV fields
- exclude sensitive notes and internal audit fields
- prove allowed export, blocked unauthorized export, field allowlist, and
  filter preservation

Scope out:
- external storage
- email delivery
- background jobs
- live auth provider integration
- production reporting
- database schema changes
- sensitive-field export
- internal audit-field export

Expected proofs:
- authorized `admin` or `reviewer` export succeeds
- unauthorized export is blocked
- CSV header contains only allowed fields
- CSV rows exclude sensitive notes and internal audit fields
- exported rows match active filters
- no external delivery or broad reporting behavior is introduced

## Scope boundary

The scenario boundary is a bounded data export with permission and field
minimization expectations.

The report should evaluate proof coverage and risk visibility. It should not
claim production export security, live auth, or production reporting behavior.

## Scope delta

Aligned changes:
- visible CSV export exists in the baseline scenario.
- GoalRail contract names roles, allowed fields, blocked unauthorized export,
  and filter preservation.

Unexplained changes:
- baseline does not show whether unauthorized export is blocked.
- baseline does not document allowed fields.
- baseline does not prove sensitive/internal fields are excluded.
- baseline does not prove active filters are preserved.

Possible scope drift:
- exporting sensitive notes
- exporting internal audit fields
- ignoring current filters
- adding external storage, email delivery, or broad reporting behavior

Missing expected changes:
- unauthorized export proof
- allowed-field proof
- data-minimization proof
- filter-preservation proof

## Evidence map

Present evidence:
- task file defines CSV export request
- hidden acceptance captures role, field, and filter constraints
- baseline file describes the visible feature with missing proof
- GoalRail contract lists allowed roles, allowed fields, non-goals, and
  expected proofs
- delta report compares visible feature completion against proof coverage

Missing evidence:
- authorized export artifact
- unauthorized export blocked artifact
- CSV header / field allowlist artifact
- field minimization artifact
- filter-preservation artifact

Weak evidence:
- visible CSV output alone is weak because it does not prove permission or data
  minimization

Manual review evidence:
- reviewer should inspect role boundary, field list, sensitive-field exclusion,
  and filter matching before trusting the export

## Proof gaps

- Gap: unauthorized export behavior is not proven.
  Severity: high.
  Evidence basis: `hidden-acceptance.md`, `baseline.md`, `delta-report.md`.
  Recommended next proof: show unauthorized export blocked.

- Gap: exported fields are not proven minimal.
  Severity: high.
  Evidence basis: allowed/disallowed fields in `hidden-acceptance.md`.
  Recommended next proof: show CSV header and sample rows excluding sensitive
  notes and internal audit fields.

- Gap: filter preservation is not proven.
  Severity: medium.
  Evidence basis: `hidden-acceptance.md`, `goalrail-contract.md`.
  Recommended next proof: show exported rows match active filters.

- Gap: scenario is artifact-only.
  Severity: low.
  Evidence basis: eval plan and scenario quality review.
  Recommended next proof: add manual evidence examples before any renderer or
  parser work.

## Risk notes

- Risk: visible export success can hide authorization failure.
  Reason: a CSV can be produced without proving who is allowed to produce it.
  Mitigation: require blocked unauthorized export evidence.

- Risk: CSV can leak sensitive notes or internal audit fields.
  Reason: broad export implementations often serialize too much data.
  Mitigation: require an explicit field allowlist and sample output evidence.

- Risk: export can ignore filters and expose more rows than intended.
  Reason: feature-level proof may focus only on file generation.
  Mitigation: require filter-preservation evidence.

## Soft verdict

Status: `evidence_too_weak`.

Rationale: the visible export may exist, but the supplied baseline evidence is
too weak for a data-access change. The GoalRail contract improves risk
visibility by naming permission, minimization, and filter proofs before trust.

## Next required proofs

- Show authorized export succeeds for `admin` or `reviewer`.
- Show unauthorized export is blocked.
- Show CSV fields are allowlisted.
- Show sensitive notes and internal audit fields are excluded.
- Show exported rows preserve active filters.
- Show no external storage, email delivery, or broad reporting behavior was
  introduced.

## Residual risks

- No live auth integration exists in this scenario.
- No production data is used.
- The scenario does not prove production export security.
- Without concrete output artifacts, the report remains a manual diagnostic
  reference.

## Baseline-vs-GoalRail delta

| Axis | Baseline | GoalRail | Diagnostic delta |
| --- | --- | --- | --- |
| acceptance | partial | pass | GoalRail captures hidden permission and minimization requirements. |
| scope adherence | partial | pass | GoalRail bounds export to allowed roles, fields, and filters. |
| proof coverage | fail | pass | GoalRail names proof for a data-access feature. |
| regression safety | fail | partial | GoalRail exposes risk checks, but no automation exists here. |
| change minimality | partial | pass | GoalRail avoids broad reporting, delivery, or schema work. |
| review burden | fail | pass | GoalRail gives reviewers a concrete checklist. |
| evidence quality | fail | pass | GoalRail separates visible feature evidence from security/data evidence. |
| out-of-scope changes | partial | pass | GoalRail excludes sensitive-field export and broad reporting drift. |
| time-to-confidence | fail | pass | GoalRail names hidden acceptance upfront. |

This delta is a deterministic reference comparison, not a statistical benchmark.
