# Workflow Change — Readout Sample

## Summary

The TrialOps sandbox now supports a bounded before/after workflow-change demo. Baseline mode still shows the weakness: a single operator can approve directly. Goalrail mode activates a review-gated slice: approval must pass through `manual_review`, the reviewer actor is visible, and the decision must carry owner plus reason.

## What worked

- The presenter can now show the weakness and the improved flow in one running app without checking out an older commit.
- The runtime workflow stays deterministic: `npm run reset` restores baseline mode and clears demo mutations.
- Audit evidence is inspectable in both API responses and the UI timeline, which keeps the proof story concrete.
- The Goalrail flow overlay makes the business request → clarification → contract → tasks → proof → readout chain easy to narrate live.

## What blocked or stayed intentionally out of scope

- No auth or permissions model was added; the reviewer actor is visible but not access-controlled.
- No database, notifications, policy profiles, workflow abstraction, or external integrations were introduced.
- This is still a deterministic sandbox, not a production Goalrail platform and not a live AI coding promise.

## Evidence

- Smoke result: `npm run smoke`
- UI behavior shown: baseline direct approval, mode switch, manual review path, owner + reason requirement, audit evidence
- Proof pack reference: `demo/proof-packs/workflow-change/proof-sample.md`
- Presenter route: `docs/demo/DEMO_FAST_PATH_7MIN.md`

## Rollout recommendation

This slice is suitable for a bounded pilot readout. Expand only after the team confirms that the contract/proof flow is useful on a real repo case.

## Next options

### Expand
- Reuse the same flow on one real repo change request with one team and one bounded case.
- Add a second demo slice only after this manual-review story lands cleanly with the audience.

### Stabilize and retry
- Tighten copy, reduce presenter clicks, and repeat the same scenario until the narrative feels automatic.
- Add a small set of seeded review states if the team wants richer before-demo visuals.

### Stop
- Do not broaden into a platform or workflow engine if the audience does not respond to the contract/proof value.
- Keep the sandbox narrow rather than inventing more automation than the demo can honestly support.
