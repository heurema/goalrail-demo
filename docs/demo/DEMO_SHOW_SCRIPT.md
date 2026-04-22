# TrialOps Demo — Show Script

## Demo window

- Target duration: **10–12 minutes**
- Fast path: **7 minutes** using `docs/demo/DEMO_FAST_PATH_7MIN.md`
- Audience: CTO, Head of Engineering, product-minded buyer
- Goal: show the Goalrail-style flow on top of a bounded TrialOps sandbox

## Setup / preflight

Run:

```bash
npm install
npm run reset
npm run dev
```

Recommended confidence run before the meeting:

```bash
npm run typecheck
npm run api:build
npm run web:build
npm run smoke
```

Open:
- Web UI: `http://127.0.0.1:5173`
- Proof pack folder: `demo/proof-packs/workflow-change/`
- Fast path script: `docs/demo/DEMO_FAST_PATH_7MIN.md`

## What this demo is and is not

### Say

- “This is a deterministic demo sandbox, not the Goalrail product codebase.”
- “The point is not AI writing code live; the point is a controlled path from business request to proof.”
- “The app is intentionally small so the workflow change is obvious.”

### Avoid saying

- “This is a finished platform.”
- “Everything here is automatic end to end.”
- “This is a generic workflow engine.”
- “This is production-ready customer infrastructure.”

## Recommended timeline

### 1. Introduce the app and the mode switch — 1.5 minutes

Show:
- the top-bar `Demo mode` switcher
- the request list
- the detail panel
- the audit log panel

Say:
- “This is TrialOps, a small internal tool for handling trial requests.”
- “The switcher lets us show both the weakness and the bounded Goalrail slice in one running app.”

### 2. Show the baseline weakness — 1.5 minutes

In the UI:
- stay in **Baseline** mode
- select a `qualified` request
- point to the warning in the detail panel
- show that `Approve trial` is immediately available
- do not click approve yet

Say:
- “This is the deliberate before-state.”
- “A single operator can approve directly. No second reviewer is required.”

### 3. Open the Goalrail flow overlay — 1.5 minutes

Click:
- `Goalrail flow`

Say:
- “This is the operating shape we want to talk about.”
- “Business request, clarification, contract, bounded task plan, inspectable proof, pilot readout.”

Call out:
- the step titles
- the artifact paths in the drawer

### 4. Switch to Goalrail mode — 1 minute

Toggle:
- `Goalrail slice`

Say:
- “Now the workflow-change slice is active.”
- “Approval is blocked until review is completed.”

### 5. Move the request into manual review — 1 minute

In the detail panel:
- click `Send to manual review`
- pause on the updated `Manual review` count/filter before approving

Say:
- “The request must now pass through `manual_review` before it can be approved.”

Show:
- manual review status chip
- dashboard/filter visibility for `Manual review`

### 6. Complete the review decision — 2 minutes

In the `Review decision` form:
- keep reviewer actor visible (`demo.presenter`)
- enter owner
- enter reason
- click `Approve after review`

Say:
- “Now approval is an inspectable review decision, not a one-click shortcut.”

### 7. Show audit and proof — 1.5 minutes

Show:
- audit log entry with actor, from status, to status, owner, reason, timestamp
- proof sample: `demo/proof-packs/workflow-change/proof-sample.md`
- readout sample: `demo/proof-packs/workflow-change/readout-sample.md`

Say:
- “The value is not only the code change.”
- “The value is that the change ends with inspectable proof and a bounded readout.”

### 8. Close with CTA — 1 minute

Suggested close:

> “If this type of workflow-change pain is real in your team, the next step is one team, one repo, one case, one visible flow to proof.”

## Fallback path if anything is noisy

If any live step becomes noisy:
1. keep the UI open in baseline or Goalrail mode
2. use the flow overlay
3. open the proof sample and readout sample
4. keep the message focused on bounded flow, not automation theatrics

## Presenter notes

- Keep the story narrow.
- Do not improvise new requirements mid-demo.
- Do not overclaim AI automation.
- Use the flow overlay and proof artifacts whenever the room needs a clearer frame.
