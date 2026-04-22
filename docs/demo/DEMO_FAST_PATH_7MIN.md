# Goalrail Demo — Fast Path (7 Minutes)

## 1. Start the app

Run:

```bash
npm run reset
npm run dev
```

Optional confidence check before the meeting:

```bash
npm run typecheck
npm run api:build
npm run web:build
npm run smoke
```

Open:
- Web UI: `http://127.0.0.1:5173`
- Fallback Web UI: `http://127.0.0.1:5174`
- Keep markdown artifacts available only as fallback/reference

Fallback start if default ports are busy:

```bash
npm run reset
API_PORT=4411 WEB_PORT=5174 npm run dev
```

## 2. Show baseline mode

- Point to the top-bar switcher: `Demo mode: Baseline / Goalrail slice`
- Confirm the default is **Baseline**
- Call out the warning in the detail panel:
  `Direct approval enabled. Approve provisions the trial immediately — no second reviewer required.`

## 3. Show the direct approval weakness

- Select a `qualified` request such as `TR-002` or `TR-005`
- Show that `Approve trial` is available immediately
- Do **not** click approve in baseline mode
- Explain: this is the deliberate before-state weakness

## 4. Open the Goalrail artifacts panel

- Click `Goalrail artifacts`
- Walk the in-app tabs quickly:
  - Business request
  - Clarification
  - Working contract
  - Bounded task plan
  - Inspectable proof
  - Pilot readout
- Call out the presenter cue and artifact path metadata so the audience sees this is inspectable, not hand-wavy

## 5. Switch to Goalrail mode

- Flip the switcher to **Goalrail slice**
- Point to the banner: review gate is active
- Reuse the same kind of `qualified` request

## 6. Send request to manual review

- Click `Send to manual review`
- Pause and show the new `Manual review` count or filter tab **before** final approval
- Show the status chip changing to `Manual review`

## 7. Assign owner + reason

- In the `Review decision` form, keep reviewer actor visible (`demo.presenter`)
- Enter owner, for example `R. Singh`
- Enter decision reason

## 8. Approve after review

- Click `Approve after review`
- Show the final approved state
- Mention: approval is now an inspectable review decision, not a one-click baseline shortcut

## 9. Show audit log and dashboard evidence

- Point to the audit timeline entry
- Call out the visible fields:
  - actor
  - from status
  - to status
  - assigned owner
  - decision reason
  - timestamp
- Point to the dashboard/filter reflecting `Manual review`

## 10. Stay in the UI for proof and readout

- Keep `Goalrail artifacts` open
- Go to `Proof`
- Show the `Current evidence` card next to the proof summary
- Then switch to `Pilot readout`

Say:
- “The point is not only that the behavior changed.”
- “The point is that the change ends with inspectable proof and a pilot-style readout without leaving the browser.”

## 11. CTA

Use a short close:

> One team, one repo, one case, one visible flow to proof.

Optional follow-up line:

> If this matches your delivery pain, the next step is a bounded pilot, not a broad rollout.

## Fallback only

Do **not** open proof/readout markdown during the normal demo.

Use markdown only if the UI breaks:
- `demo/proof-packs/workflow-change/proof-sample.md`
- `demo/proof-packs/workflow-change/readout-sample.md`
