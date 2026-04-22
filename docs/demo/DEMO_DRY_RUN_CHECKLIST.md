# TrialOps Demo — Dry Run Checklist

## Before-demo checklist

- [ ] Repo is on the expected demo branch/commit
- [ ] No unexpected local changes beyond planned demo files
- [ ] Ports `4311` and `5173` are free
- [ ] Terminal windows are ready
- [ ] Goalrail artifacts viewer is part of the planned live path

## App startup checklist

Run:

```bash
npm run reset
npm run dev
```

Optional confidence checks before the meeting:

```bash
npm run typecheck
npm run api:build
npm run web:build
npm run smoke
```

- [ ] API starts on `http://127.0.0.1:4311`
- [ ] Web starts on `http://127.0.0.1:5173`
- [ ] UI loads in the browser
- [ ] Demo mode defaults to **Baseline**
- [ ] Fallback run is known if default ports are busy: `API_PORT=4411 WEB_PORT=5174 npm run dev`

## Baseline / before-state checklist

- [ ] Top-bar demo mode switcher is visible
- [ ] Dashboard counts are visible
- [ ] `Manual review` card/filter exists (count may be `0`)
- [ ] Selecting a qualified request opens detail
- [ ] Baseline warning is visible: direct approval enabled
- [ ] `Approve trial` is available directly in baseline mode

## Goalrail / after-state checklist

- [ ] `Goalrail artifacts` button opens the artifact workspace
- [ ] Switching to **Goalrail slice** works without reload
- [ ] Goalrail banner appears
- [ ] `Send to manual review` is visible for intake requests
- [ ] Manual review status chip/filter/count is visible
- [ ] `Manual review` count is shown before final approval
- [ ] Review form shows reviewer actor, owner, and reason fields
- [ ] `Approve after review` works only with owner + reason
- [ ] Audit log shows actor, status transition, owner, reason, timestamp

## Artifact checklist

- [ ] Business request tab renders in the UI
- [ ] Clarification tab renders in the UI
- [ ] Working contract tab renders in the UI
- [ ] Task plan tab renders in the UI
- [ ] Proof tab renders in the UI
- [ ] Readout tab renders in the UI
- [ ] Current evidence card updates after a workflow transition
- [ ] `docs/demo/DEMO_FAST_PATH_7MIN.md` is accessible during the demo
- [ ] Markdown artifacts remain available only as fallback/reference

## Failure fallback checklist

- [ ] If UI becomes noisy, continue with the Goalrail artifacts panel first
- [ ] Open markdown artifacts only if the UI becomes unusable
- [ ] If smoke was run recently, `npm run reset` before the meeting
- [ ] Keep the message focused on bounded flow, not automation theatrics

## Reset-after-demo checklist

Run:

```bash
npm run reset
```

- [ ] Runtime files restored to baseline
- [ ] Audit log cleared
- [ ] Demo mode returned to `baseline`
- [ ] Baseline counts match expected seed
