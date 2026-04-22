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
- Make tomorrow's presenter route obvious without reading internal notes live

## Recent achievements

- Added switchable demo mode so before/after can be shown in one running app
- Implemented the local deterministic `manual_review` runtime workflow for the Goalrail slice
- Added flow overlay data, proof sample, readout sample, and a 7-minute fast path script
- Extended smoke coverage to validate baseline direct approval and Goalrail review-gated approval

## Next steps

1. Run one full human dry run with the new baseline → Goalrail switch
2. Tighten copy only if any presenter step still feels noisy
3. Decide whether tomorrow's demo should run from this branch or after merge

## Open questions

- Whether to keep this slice on a dedicated demo branch for the presentation or merge before the meeting
- Whether future follow-up should add a seeded `manual_review` example for zero-click visuals, or keep the live transition as the proof moment

## Demo boundaries

- In scope: `manual_review` before approval, demo mode switch, visible review requirements, dashboard visibility, audit evidence, proof/readout artifacts, presenter docs, deterministic smoke
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
