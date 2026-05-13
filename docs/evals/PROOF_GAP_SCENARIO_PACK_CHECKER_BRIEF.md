# Proof Gap Scenario Pack Checker Implementation Brief

## Planning status

No dedicated Signum directory, template, or naming convention is present in this
repo.

This is a docs-only implementation brief under the existing `docs/evals/`
planning surface. It prepares a future bounded implementation slice but does not
implement the checker.

## Goal

Add a minimal local checker that validates deterministic Proof Gap scenario
packs under `evals/scenarios/*/`.

The checker should keep scenario artifacts complete, internally linked, and
claim-safe before any renderer, parser, GitHub Action, AI runtime, benchmark
runner, or product integration is considered.

## Scope

- Add a local checker only.
- Validate existing scenario pack structure and report safety.
- Keep the implementation small and deterministic.
- Prefer built-in Node.js or existing repo tooling.
- Avoid new package dependencies unless strictly necessary and explicitly
  justified in the future implementation slice.
- If adding a script later, it must be small, local-only, and deterministic.

## Non-goals

- no renderer
- no parser for CI logs
- no benchmark runner
- no AI runtime
- no GitHub Action
- no web UI
- no backend endpoint
- no product integration
- no statistical scoring
- no production proof claim

## Inputs

Primary input root:

- `evals/scenarios/*/`

Each scenario folder is expected to contain:

- `task.md`
- `hidden-acceptance.md`
- `baseline.md`
- `goalrail-contract.md`
- `goalrail.md`
- `rubric.yaml`
- `delta-report.md`
- `proof-gap-report.md`

Reference docs for checker behavior:

- `docs/evals/BASELINE_VS_GOALRAIL_EVAL_PLAN.md`
- `docs/evals/SCENARIO_QUALITY_REVIEW.md`
- `evals/scenarios/README.md`

## Outputs

Future checker output should be terminal-readable and deterministic.

Expected successful output:

- list of checked scenario IDs
- count of checked scenario packs
- clear success line
- exit code `0`

Expected failure output:

- scenario ID
- failed check name
- path to failing file
- concise reason
- exit code non-zero

No generated reports are required for the first slice.

## Required checks

The checker should verify:

1. Required files exist in every scenario folder:
   - `task.md`
   - `hidden-acceptance.md`
   - `baseline.md`
   - `goalrail-contract.md`
   - `goalrail.md`
   - `rubric.yaml`
   - `delta-report.md`
   - `proof-gap-report.md`
2. `rubric.yaml` is parseable or validated against the current deterministic
   rubric shape.
3. `proof-gap-report.md` includes required canonical sections:
   - `Diagnostic status`
   - `Executive summary`
   - `Source inputs`
   - `Reconstructed working contract`
   - `Scope boundary`
   - `Scope delta`
   - `Evidence map`
   - `Proof gaps`
   - `Risk notes`
   - `Soft verdict`
   - `Next required proofs`
   - `Residual risks`
   - `Baseline-vs-GoalRail delta`
4. `proof-gap-report.md` uses only allowed v0 soft verdict statuses:
   - `aligned_but_proof_incomplete`
   - `scope_drift_detected`
   - `evidence_too_weak`
   - `high_risk_needs_review`
   - `insufficient_input`
5. Forbidden terms are absent from scenario reports:
   - `merge_ready`
   - `verified`
   - `accepted`
   - `safe_to_deploy`
   - `production proof`
   - `PR verification before merge`
6. Local markdown links in `proof-gap-report.md` resolve relative to the report
   file.
7. The checker does not inspect or mutate app/backend/frontend/runtime data.

## Forbidden behavior

The future checker must not:

- call AI services
- call external APIs
- access the network
- run application builds
- run the backend
- run the frontend
- mutate scenario files
- mutate runtime data
- create generated reports by default
- claim production proof
- claim merge readiness
- evaluate real repositories
- parse CI logs beyond local artifact presence checks

## Affected paths

Planning artifact:

- `docs/evals/PROOF_GAP_SCENARIO_PACK_CHECKER_BRIEF.md`

Future implementation candidate paths:

- `scripts/check-proof-gap-scenarios.mjs`
- `evals/scenarios/**`
- `STATUS.md` only if implementation status needs a short note
- `README.md` only if a user-facing command becomes stable enough to document

Future implementation should not touch:

- `apps/api/`
- `apps/web/`
- `packages/`
- `data/runtime/`
- runtime behavior
- backend endpoints
- frontend UI

## Validation plan

Future implementation should be validated by:

1. Run the checker successfully against the existing scenario packs.
2. Deliberately detect a missing required file using a temporary fixture or
   unit test if feasible.
3. Deliberately detect a forbidden verdict / claim term.
4. Deliberately detect a broken or malformed `rubric.yaml`.
5. Deliberately detect a broken local markdown link in `proof-gap-report.md`.
6. Confirm existing three scenarios pass.
7. Confirm `npm run typecheck`, `npm run api:build`, and `npm run web:build`
   are unaffected if they are run.
8. Run `git diff --check`.

If the checker uses Node.js and no YAML parser dependency is added, the
implementation must clearly document whether rubric validation is a bounded
rubric-shape check or a full YAML parse.

## Done criteria

- One local command can validate all scenario packs.
- The checker exits `0` on valid packs.
- The checker exits non-zero on invalid packs.
- Existing three scenarios pass.
- Missing required files fail.
- Forbidden report terms fail.
- Invalid rubric content fails.
- Broken local report references fail.
- No app/backend/frontend/runtime behavior changes.
- No AI calls, network calls, package dependency changes, or generated
  automation are introduced without explicit future approval.
- `STATUS.md` and `README.md` are updated only if needed.

## Rollback / safety notes

- The implementation should be easy to remove by deleting the checker file and
  any optional command documentation.
- The checker must be read-only over scenario artifacts.
- Do not add CI or GitHub Action wiring in the first implementation slice.
- Do not add a renderer, parser, benchmark runner, or product integration in
  the same slice.
- Keep the checker local to the demo/eval sandbox and avoid implying GoalRail
  product runtime behavior.
