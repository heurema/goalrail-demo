# Proof Gap Report Renderer Brief

## Goal

Plan a local deterministic renderer that can generate a draft
`proof-gap-report.md` from `scenario.yaml`.

The renderer should turn a validated Scenario Packet v0 into a Markdown Proof
Gap Report draft for deterministic eval/demo scenarios. It must remain local,
repeatable, and separate from product runtime behavior.

## Why now

Manual Proof Gap Reports already exist for the first three paired scenarios.

Scenario Packet v0 now contains renderer-supporting fields for scope delta,
evidence map, proof gaps, next required proofs, delta rationale, risks, and
residual risks. The local checker now validates those fields and its self-test
covers broken packet cases.

Renderer work should come after packet validation, not before. That prevents a
renderer from scraping missing details out of prose or hardcoding weak packet
assumptions.

## Scope for future implementation

Future implementation should:

- read one scenario directory
- read `scenario.yaml`
- generate a Markdown Proof Gap Report draft
- write the generated report to stdout by default
- optionally write to a caller-specified output file
- support all current scenarios
- remain local and deterministic

The implementation should not mutate scenario artifacts unless an explicit
`--out` path is provided.

## Proposed command

Recommended v0 command:

```bash
node scripts/render-proof-gap-report.mjs --scenario workflow-change
```

Optional explicit output:

```bash
node scripts/render-proof-gap-report.mjs --scenario workflow-change --out /tmp/workflow-change-proof-gap-report.md
```

Default output should be stdout. This avoids changing `package.json` in the
first implementation unless an npm alias is explicitly approved.

A later stable alias may be:

```bash
npm run evals:render -- --scenario workflow-change
```

## Input contract

Future renderer input:

- `evals/scenarios/<id>/scenario.yaml`
- local file names from `references`
- no network
- no AI
- no external services

The renderer should use `scenario.yaml` as the structured source. It may render
links to referenced markdown files, but it should not scrape report content
from those markdown files in v0.

## Output contract

Future renderer output:

- Markdown only
- draft report only
- includes a diagnostic disclaimer
- uses allowed soft verdict vocabulary
- does not claim production proof
- does not claim server-owned `Proof`
- does not claim PR verification
- does not claim merge approval
- does not claim deployment safety

Generated output should be deterministic for the same packet input.

## Sections to generate

Future renderer should generate:

- Diagnostic status
- Executive summary
- Source inputs
- Reconstructed working contract
- Scope boundary
- Scope delta
- Evidence map
- Proof gaps
- Risk notes
- Soft verdict
- Next required proofs
- Residual risks
- Baseline-vs-GoalRail delta

The generated section names should match the current manual report headings so
the existing checker can validate generated drafts later if that path is
approved.

## Manual vs generated content

Generated from `scenario.yaml`:

- scenario title
- diagnostic disclaimer
- intent summary
- source input references
- reconstructed contract boundary
- scope delta
- evidence map
- proof gaps
- risk notes
- soft verdict
- next required proofs
- residual risks
- baseline-vs-GoalRail delta table

Remain manual/reference in v0:

- current hand-written `proof-gap-report.md`
- rich explanatory prose beyond the packet fields
- scenario-specific narrative polish
- external proof/readout references beyond local packet references
- golden snapshot expectations, unless a future implementation explicitly adds
  them

Recommendation: do not overwrite manual `proof-gap-report.md` by default.

Recommended v0 output policy:

- stdout by default
- optional explicit `--out <path>`
- no implicit write to `generated-proof-gap-report.md`

If repo-local generated fixtures are needed later, use a separate explicit task
to decide whether `generated-proof-gap-report.md` files should be committed.

## Validation for future implementation

Future implementation must:

- run `npm run evals:check`
- run `npm run evals:check:selftest`
- render all three current scenarios
- compare generated output to golden snapshots only if snapshots are added in
  the same approved slice
- avoid package dependencies
- avoid `package-lock.json` changes
- avoid app/backend/frontend/runtime paths

Suggested validation commands:

```bash
git diff --check
npm run evals:check
npm run evals:check:selftest
node scripts/render-proof-gap-report.mjs --scenario workflow-change >/tmp/workflow-change-proof-gap-report.md
node scripts/render-proof-gap-report.mjs --scenario pricing-copy >/tmp/pricing-copy-proof-gap-report.md
node scripts/render-proof-gap-report.mjs --scenario csv-export >/tmp/csv-export-proof-gap-report.md
rg -n "[[:blank:]]$" STATUS.md docs/evals evals/scenarios scripts package.json
git status --short apps/api apps/web packages data/runtime package-lock.json package.json
```

If `package.json` is changed to add an npm alias, the implementation must state
that explicitly and confirm `package-lock.json` remains unchanged.

## Non-goals

- no code in this brief task
- no renderer implementation in this task
- no parser
- no benchmark runner
- no AI runtime
- no GitHub Action
- no web UI
- no backend/API endpoint
- no product integration
- no statistical scoring
- no production proof claim
- no merge-readiness claim

## Affected paths for future implementation

Expected future paths:

- `scripts/render-proof-gap-report.mjs`
- `package.json` only if adding an npm script
- `evals/scenarios/README.md` only if a tiny command note is needed
- `STATUS.md` only if a tiny status note is needed
- optional generated output fixtures if explicitly chosen in a later slice

Future implementation should not touch:

- `apps/api/`
- `apps/web/`
- `packages/`
- `data/runtime/`
- `package-lock.json`
- app/backend/frontend/runtime behavior

## Done criteria for future implementation

- One local command renders a report for each current scenario.
- Generated output includes required sections.
- Generated output uses allowed verdict vocabulary.
- Generated output avoids unsafe production, PR verification, merge approval,
  and deployment-safety claims.
- No dependencies are added.
- `package-lock.json` is unchanged.
- App/backend/frontend/runtime paths are unchanged.
- Manual `proof-gap-report.md` files are not overwritten by default.
