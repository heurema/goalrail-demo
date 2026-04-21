# TrialOps Demo — Dry Run Checklist

## Before-demo checklist

- [ ] Repo is on the expected baseline branch/commit
- [ ] No unexpected local changes
- [ ] Ports `4311` and `5173` are free
- [ ] Terminal windows are ready
- [ ] Proof pack files are easy to open

## App startup checklist

Run:

```bash
npm run reset
npm run dev
```

- [ ] API starts on `http://127.0.0.1:4311`
- [ ] Web starts on `http://127.0.0.1:5173`
- [ ] UI loads in the browser

## Baseline UI checklist

- [ ] Header is visible
- [ ] Dashboard counts are visible
- [ ] Request list is populated
- [ ] Selecting a request opens detail
- [ ] Status update form is visible
- [ ] Audit log panel is visible
- [ ] Direct approval is still possible in the baseline UI

## Artifact checklist

- [ ] `business-request.md` opens cleanly
- [ ] `clarification-questions.md` opens cleanly
- [ ] `contract-draft.md` opens cleanly
- [ ] `task-plan.md` opens cleanly
- [ ] `proof-template.md` opens cleanly
- [ ] `readout-template.md` opens cleanly
- [ ] `docs/demo/DEMO_SHOW_SCRIPT.md` is accessible during the demo

## Failure fallback checklist

- [ ] If UI becomes unreliable, continue with the proof pack only
- [ ] If live AI is unavailable, continue with prepared artifacts
- [ ] If smoke was run recently, reset before showing baseline counts again

## Reset-after-demo checklist

Run:

```bash
npm run reset
```

- [ ] Runtime files restored to baseline
- [ ] Audit log cleared
- [ ] Baseline counts match expected seed
