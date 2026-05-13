# CSV Export - Delta Report

## Summary

The baseline path may satisfy the visible request by producing CSV, but it lacks
proof for permission, data minimization, and filter preservation. The GoalRail
path improves proof coverage and risk visibility by turning those hidden
requirements into an explicit contract and evidence checklist.

## Baseline

```text
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator
```

Result:

- CSV output exists
- permission boundary is unproven
- unauthorized export behavior is unknown
- sensitive/internal fields may leak into the export
- active filters may not be preserved

## GoalRail

```text
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

Result:

- export is limited to `admin` and `reviewer`
- unauthorized export is blocked
- CSV fields are allowlisted
- sensitive notes and internal audit fields are excluded
- active filters are part of expected proof

## Measurement delta

| Axis | Baseline | GoalRail | Delta |
| --- | --- | --- | --- |
| acceptance | partial | pass | GoalRail captures hidden permission and minimization requirements. |
| scope adherence | partial | pass | GoalRail bounds the export to allowed roles, fields, and filters. |
| proof coverage | fail | pass | GoalRail names the proof needed for a data-access feature. |
| regression safety | fail | partial | GoalRail exposes regression risks even without adding automation here. |
| change minimality | partial | pass | GoalRail avoids expanding into reporting, delivery, or schema work. |
| review burden | fail | pass | GoalRail gives reviewers a concrete checklist. |
| evidence quality | fail | pass | GoalRail separates visible feature evidence from security/data evidence. |
| out-of-scope changes | partial | pass | GoalRail excludes sensitive-field export and broad reporting drift. |
| time-to-confidence | fail | pass | GoalRail reduces post-hoc investigation by naming hidden acceptance upfront. |

## Proof gap

The baseline proof gap is risky because the feature can look complete while
permission and minimization remain unknown. The GoalRail proof gap is explicit:
show allowed export, blocked unauthorized export, allowed fields, and preserved
filters.
