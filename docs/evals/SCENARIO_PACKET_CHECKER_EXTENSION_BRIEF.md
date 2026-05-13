# Scenario Packet Checker Extension Brief

## Goal

Extend the existing local checker to validate Scenario Packet v0 files.

The extension should keep `scenario.yaml` complete, internally linked, and
claim-safe before any renderer, report generation, benchmark runner, AI runtime,
GitHub Action, or product integration is considered.

## Scope

Future implementation should validate:

- `scenario.yaml` exists in every scenario directory
- YAML packet is non-empty
- required top-level fields exist:
  - `id`
  - `title`
  - `status`
  - `intent`
  - `hidden_acceptance`
  - `baseline_path`
  - `goalrail_path`
  - `proof_gap_report`
  - `delta_axes`
  - `risk_notes`
  - `residual_risks`
  - `references`
- `id` matches scenario directory name
- `status` is `active`
- `proof_gap_report.soft_verdict` uses allowed vocabulary:
  - `aligned_but_proof_incomplete`
  - `scope_drift_detected`
  - `evidence_too_weak`
  - `high_risk_needs_review`
  - `insufficient_input`
- `references` point to existing local files
- `references.proof_gap_report` is `proof-gap-report.md`
- `references.delta_report` is `delta-report.md`
- `delta_axes` includes:
  - `acceptance`
  - `scope_adherence`
  - `proof_coverage`
  - `regression_safety`
  - `change_minimality`
  - `review_burden`
  - `evidence_quality`
  - `out_of_scope_changes`
  - `time_to_confidence`

## YAML parsing approach

Because no dependencies are allowed, the checker extension should not add a
general YAML library.

Option A:

- use a small dependency-free YAML subset parser only for the Scenario Packet v0
  shape
- support indentation, strings, arrays, and maps only as needed
- keep it local to the checker
- fail clearly on unsupported patterns

Option B:

- do not parse YAML in Node yet
- only check file presence plus required text keys
- keep full YAML parsing in the Ruby validation command

Recommended approach: start with Option B.

The first extension should keep Node validation conservative and structural:
file presence, non-empty content, required key presence, simple `id` / `status`
/ `soft_verdict` text checks, delta-axis key checks, and reference existence.
Full YAML syntax validation should remain in the existing Ruby validation
command until there is a clear need for a dependency-free subset parser.

Do not add dependencies.

## Selftest extension

Future implementation should add selftest cases:

- missing `scenario.yaml` fails
- missing required top-level field fails
- `id` not matching directory fails
- invalid soft verdict fails
- missing delta axis fails
- missing reference fails

Selftest fixtures should stay temporary and must not mutate real scenario
artifacts.

## Non-goals

- no renderer
- no report generation
- no CI parser
- no benchmark runner
- no AI runtime
- no web UI
- no app/backend/frontend/runtime behavior
- no dependencies
- no package-lock changes
- no product integration

## Affected paths

Expected future paths:

- `scripts/check-proof-gap-scenarios.mjs`
- `scripts/check-proof-gap-scenarios-selftest.mjs`
- `package.json` only if scripts change, but likely no package script change
  needed
- `evals/scenarios/README.md` only if tiny docs note is needed
- `STATUS.md` only if tiny status note is needed

Future implementation should not touch:

- `apps/api/`
- `apps/web/`
- `packages/`
- `data/runtime/`
- runtime behavior
- backend endpoints
- frontend UI

## Validation plan

Future implementation must run:

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

- existing 3 scenario packets pass
- selftest covers invalid `scenario.yaml` cases
- no dependencies
- no package-lock changes
- no runtime/app behavior changes
