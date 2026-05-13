# Scenario Packet Renderer Fields Checker Brief

## Goal

Extend the existing local checker so it validates Scenario Packet v0
renderer-supporting fields before any renderer implementation is attempted.

The goal is to keep deterministic Proof Gap scenario packets complete enough
for future report rendering without introducing renderer, parser, benchmark,
AI runtime, GitHub Action, web UI, backend/API, or product integration work in
the same slice.

## Why this comes before renderer

A future renderer should not infer scope, evidence, risk, or next-proof details
from markdown prose.

Scenario Packet v0 now carries renderer-supporting fields:

- `scope_delta`
- `evidence_map`
- `proof_gap_report.next_required_proofs`
- `delta_axes.<axis>.rationale`
- `risk_notes.reason`
- `risk_notes.mitigation`
- `residual_risks.owner_hint`
- `residual_risks.mitigation`

The checker should enforce those fields before renderer work begins. That keeps
scenario artifacts deterministic, prevents weak packet shape from becoming a
renderer contract, and preserves markdown as human-readable reference rather
than the source of structured report data.

## Scope

Future implementation should validate the fields below using conservative local
checks.

### `scope_delta`

Required keys:

- `aligned_changes`
- `unexplained_changes`
- `possible_scope_drift`
- `missing_expected_changes`

Each key should contain at least one list item unless a future scenario uses an
explicit, documented empty-list marker. The first implementation can start with
key presence plus simple item-presence checks.

### `evidence_map`

Required keys:

- `present_evidence`
- `missing_evidence`
- `weak_evidence`
- `manual_review_evidence`

Each key should contain at least one list item unless a future scenario uses an
explicit, documented empty-list marker. The checker should not evaluate whether
the evidence is true; it should only enforce that the structured report section
is present.

### `proof_gap_report.next_required_proofs`

- `proof_gap_report` must contain `next_required_proofs`.
- `next_required_proofs` should contain at least one item or an explicit
  empty-list marker only if the scenario justifies it.
- The checker may keep this as text-key structural validation and should not
  attempt full YAML object validation.

### `delta_axes` rationale

Every required axis must include a `rationale`:

- `acceptance`
- `scope_adherence`
- `proof_coverage`
- `regression_safety`
- `change_minimality`
- `review_burden`
- `evidence_quality`
- `out_of_scope_changes`
- `time_to_confidence`

The checker should verify that each axis section contains `rationale:`. It does
not need to judge rationale quality.

### `risk_notes`

Each risk note should include:

- `id`
- `description`
- `reason`
- `mitigation`

The checker should detect missing `reason` or `mitigation` in the `risk_notes`
section. Full semantic validation is out of scope.

### `residual_risks`

Each residual risk should include:

- `id`
- `description`
- `owner_hint`
- `mitigation`

The checker should detect missing `owner_hint` or `mitigation` in the
`residual_risks` section. Full semantic validation is out of scope.

## Conservative validation approach

Use dependency-free text-key structural validation for v0.

- No YAML dependency.
- No `package-lock.json` change.
- Keep Ruby YAML parse as an external validation command.
- The checker may use simple top-level section extraction and nested key
  presence checks.
- The checker should not become a full YAML parser.
- The checker should fail clearly when a required renderer-supporting section
  or field is missing.

This keeps the checker aligned with the current implementation style while the
Scenario Packet v0 shape is still stabilizing.

## Selftest extension

Future implementation should add negative cases for:

- missing `scope_delta`
- missing `evidence_map`
- missing `proof_gap_report.next_required_proofs`
- missing `delta_axes.<axis>.rationale`
- missing `risk_notes.reason`
- missing `risk_notes.mitigation`
- missing `residual_risks.owner_hint`
- missing `residual_risks.mitigation`

Selftest fixtures should continue to be generated under an OS temp directory.
They must not mutate real scenario artifacts.

## Affected paths for future implementation

Expected future paths:

- `scripts/check-proof-gap-scenarios.mjs`
- `scripts/check-proof-gap-scenarios-selftest.mjs`
- `evals/scenarios/README.md` only if a tiny note is needed
- `STATUS.md` only if a tiny status note is needed

No `package.json` change should be required unless a new script is added, which
is not expected.

Future implementation should not touch:

- `apps/api/`
- `apps/web/`
- `packages/`
- `data/runtime/`
- `package-lock.json`
- app/backend/frontend/runtime behavior

## Non-goals

- no code in this brief task
- no checker implementation
- no renderer
- no parser
- no benchmark runner
- no AI runtime
- no GitHub Action
- no web UI
- no backend/API endpoint
- no app/backend/frontend/runtime behavior
- no dependencies
- no package-lock changes
- no product integration
- no statistical scoring

## Validation plan for future implementation

Future checker extension must run:

- `git diff --check`
- `npm run evals:check`
- `npm run evals:check:selftest`
- Ruby YAML parse for `scenario.yaml`
- Ruby YAML parse for `rubric.yaml`
- trailing whitespace check
- forbidden runtime path check

Suggested commands:

```bash
git diff --check
npm run evals:check
npm run evals:check:selftest
ruby -ryaml -e 'Dir["evals/scenarios/*/scenario.yaml"].each { |f| YAML.load_file(f); puts f }'
ruby -ryaml -e 'Dir["evals/scenarios/*/rubric.yaml"].each { |f| YAML.load_file(f); puts f }'
rg -n "[[:blank:]]$" STATUS.md docs/evals evals/scenarios scripts package.json
git status --short apps/api apps/web packages data/runtime package-lock.json
```

## Done criteria

- Existing three scenario packets pass.
- Selftest covers invalid renderer-supporting field cases.
- No dependencies are added.
- `package-lock.json` is unchanged.
- No app/backend/frontend/runtime behavior changes.
- Renderer remains unimplemented.
