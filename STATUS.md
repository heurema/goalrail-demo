# STATUS.md — Current Demo State

## Status

🟢 Active implementation / demo hardening

**Last updated:** 2026-05-13
**Current phase:** Phase 5 demo-ready workflow-change slice plus docs-only eval
artifacts

---

## Current focus

- Keep the executable demo bounded to one useful workflow-change story
- Preserve the baseline weakness in `baseline` mode
- Show the Goalrail after-state in `goalrail` mode with `manual_review`, owner, reason, and audit evidence
- Keep tomorrow's golden path fully inside the browser with an in-app artifact viewer
- Add a Russian-localized `/ru` route so the same UI-only demo works for Russian-speaking audiences
- Keep the normal UI buyer-facing by moving presenter hints out of the browser and into docs
- Stabilize docs-only baseline-vs-GoalRail deterministic evaluation planning without adding app/runtime behavior

## Recent achievements

- Added switchable demo mode so before/after can be shown in one running app
- Implemented the local deterministic `manual_review` runtime workflow for the Goalrail slice
- Replaced the simple flow overlay with a full in-app Goalrail artifact workspace
- Added dynamic Current evidence so proof/readout can be shown next to live request evidence
- Extended smoke coverage to validate baseline direct approval and Goalrail review-gated approval
- Added path-based locale switching so English stays on `/` and Russian runs on `/ru`
- Polished the flow panel so the normal UI stays buyer-facing without presenter hints or file-path metadata
- Added a docs-only baseline-vs-GoalRail evaluation plan and reference scenario directory for deterministic paired eval artifacts
- Added first docs-only paired scenario artifacts for `workflow-change`, `pricing-copy`, and `csv-export`
- Added manual Proof Gap Report artifacts for the first paired scenarios; no report automation, renderer, parser, runtime, or product behavior was added
- Added a docs-only implementation brief for the Proof Gap Scenario Pack Checker
- Added local deterministic `npm run evals:check` scenario-pack checker; no app/runtime behavior, renderer, parser, benchmark runner, AI runtime, or package dependency was added
- Added `npm run evals:check:selftest` to validate checker failure modes with temporary fixtures only
- Added docs-only Scenario Packet v0 data-contract spec
- Added first manual Scenario Packet v0 files for the three paired scenarios
- Added docs-only Scenario Packet checker extension brief; no checker code or runtime behavior was changed
- Extended local `npm run evals:check` to validate `scenario.yaml` packet structure; no dependencies or runtime/app behavior were added
- Added docs-only Scenario Packet renderer readiness review with `revise_packets_first` decision; no renderer or runtime behavior was added
- Revised Scenario Packet v0 and the three scenario packets with renderer-supporting fields; no renderer, checker update, app/runtime behavior, or product integration was added
- Added docs-only brief for future checker validation of renderer-supporting Scenario Packet fields; no checker code or runtime behavior was changed
- Extended `npm run evals:check` to validate renderer-supporting Scenario Packet fields; no renderer, dependencies, or app/runtime behavior were added
- Added docs-only Proof Gap Report renderer brief; no renderer code or runtime behavior was changed

## Next steps

1. Run one final human rehearsal of the UI-only golden path
2. Decide whether a tiny recovery preset helper is still needed after the UI-only route
3. Avoid any new product expansion unless a real demo risk appears

## Open questions

- Whether a minimal presenter recovery preset is needed, or whether `npm run reset` plus the artifact viewer is already enough
- Whether tomorrow's room benefits from showing one validation failure path live, or only the happy path

## Demo boundaries

- In scope: `manual_review` before approval, demo mode switch, visible review requirements, dashboard visibility, audit evidence, in-app artifact viewer, presenter docs, deterministic smoke
- Out of scope: auth, permissions, notifications, policy profiles, workflow engine abstraction, database migration, broader lifecycle redesign

## Key demo files

- `apps/web/src/demoArtifacts.ts`
- `demo/proof-packs/workflow-change/business-request.md`
- `demo/proof-packs/workflow-change/clarification-questions.md`
- `demo/proof-packs/workflow-change/contract-draft.md`
- `demo/proof-packs/workflow-change/task-plan.md`
- `demo/proof-packs/workflow-change/proof-sample.md`
- `demo/proof-packs/workflow-change/readout-sample.md`
- `docs/demo/DEMO_FAST_PATH_7MIN.md`
- `docs/demo/DEMO_SHOW_SCRIPT.md`
- `docs/demo/DEMO_PRESENTER_NOTES_RU.md`
- `docs/evals/BASELINE_VS_GOALRAIL_EVAL_PLAN.md`
- `docs/evals/PROOF_GAP_SCENARIO_PACK_CHECKER_BRIEF.md`
- `evals/scenarios/README.md`
- `evals/scenarios/workflow-change/`
- `evals/scenarios/pricing-copy/`
- `evals/scenarios/csv-export/`
