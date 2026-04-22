# STATUS.md — Current Demo State

## Status

🟢 Active implementation / demo hardening

**Last updated:** 2026-04-22
**Current phase:** Phase 5 demo-ready workflow-change slice

---

## Current focus

- Keep the executable demo bounded to one useful workflow-change story
- Preserve the baseline weakness in `baseline` mode
- Show the Goalrail after-state in `goalrail` mode with `manual_review`, owner, reason, and audit evidence
- Keep tomorrow's golden path fully inside the browser with an in-app artifact viewer

## Recent achievements

- Added switchable demo mode so before/after can be shown in one running app
- Implemented the local deterministic `manual_review` runtime workflow for the Goalrail slice
- Replaced the simple flow overlay with a full in-app Goalrail artifact workspace
- Added dynamic Current evidence so proof/readout can be shown next to live request evidence
- Extended smoke coverage to validate baseline direct approval and Goalrail review-gated approval

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
