# CSV Export - Baseline Path

## Path

```text
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator
```

## Baseline result

The direct path satisfies the visible feature but leaves important proof gaps:

- an export button or CSV result exists
- export authorization is not proven
- unauthorized export behavior is not shown
- CSV may include sensitive notes or internal audit fields
- export may ignore current filters
- allowed fields are not documented

## Evaluator observation

The feature may appear complete because a CSV can be produced. The evaluator
cannot trust it without permission, minimization, and filter-preservation
evidence.

## Main gaps

- no explicit role boundary
- no unauthorized export proof
- no field allowlist
- no data-minimization evidence
- no filter-preservation evidence
- reviewer must inspect the export surface manually to understand risk
