# CSV Export - GoalRail Path

## Path

```text
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

## GoalRail result

The GoalRail-guided path treats CSV export as a bounded data-access change:

- export is limited to `admin` and `reviewer` roles
- unauthorized export is blocked
- CSV fields are allowlisted
- sensitive notes and internal audit fields are excluded
- existing filters are preserved
- proof expectations are known before evaluation

## Evidence available

This scenario expects deterministic reference evidence, not a live benchmark:

- authorized export evidence
- unauthorized export blocked evidence
- CSV header or field allowlist evidence
- field minimization evidence
- filter-preservation evidence

## Remaining proof gap

Without an automated harness, this remains an inspectable scenario artifact. It
can show why GoalRail improves proof coverage and risk visibility without
claiming production-grade export security.
