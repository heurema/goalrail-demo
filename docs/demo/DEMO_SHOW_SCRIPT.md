# TrialOps Demo — Show Script

## Demo window

- Target duration: **12–15 minutes**
- Audience: CTO, Head of Engineering, product-minded buyer
- Goal: show the Goalrail-style flow on top of the existing TrialOps baseline app

## Setup / preflight

Run:

```bash
npm install
npm run reset
npm run dev
```

Optional confidence check:

```bash
npm run smoke
```

Open:
- Web UI: `http://127.0.0.1:5173`
- Proof pack folder: `demo/proof-packs/workflow-change/`

## What this demo is and is not

### Say

- “This is a deterministic demo sandbox, not the Goalrail product codebase.”
- “We are showing a pilot-style operating flow from business request to proof.”
- “The app is intentionally a baseline internal tool so the change request is easy to understand.”

### Avoid saying

- “This is a finished platform.”
- “The system will autonomously implement anything live.”
- “Everything here is already production-ready.”

## Recommended timeline

### 1. Introduce the baseline app — 2 minutes

Show:
- dashboard counts
- request list
- request detail
- audit log panel

Say:
- “This is TrialOps, a small internal tool for handling trial requests.”
- “It already works, but the workflow is intentionally simple.”

### 2. Show the current weakness — 1 minute

In the UI, select one request and show the status update form.

Say:
- “Right now the baseline flow allows direct approval.”
- “That is exactly the weakness we want the audience to see before the business request arrives.”

## 3. Introduce the business request — 2 minutes

Open:
- `demo/proof-packs/workflow-change/business-request.md`

Say:
- “The request is simple in business language: approvals now need manual review, owner assignment, and a decision reason.”
- “At this point we should not jump straight into code.”

## 4. Show clarification questions — 2 minutes

Open:
- `demo/proof-packs/workflow-change/clarification-questions.md`

Say:
- “The first move is clarification, not implementation.”
- “For demo reliability we also have recommended answers so the narrative stays bounded.”

Call out:
- workflow
- ownership
- validation
- audit/proof
- rollout risk

## 5. Show the contract draft — 2 minutes

Open:
- `demo/proof-packs/workflow-change/contract-draft.md`

Say:
- “This is the working contract draft for the slice.”
- “It makes scope, non-goals, acceptance criteria, and proof expectations explicit.”

Emphasize:
- in scope
- out of scope
- acceptance criteria
- proof expectations

## 6. Show the bounded task plan — 2 minutes

Open:
- `demo/proof-packs/workflow-change/task-plan.md`

Say:
- “The change is now decomposed into a few bounded tasks.”
- “This is not a rewrite. It is a controlled workflow change.”

Emphasize:
- shared status model
- API validation and transitions
- frontend controls and counts
- smoke/proof/docs updates

## 7. Show expected proof — 1.5 minutes

Open:
- `demo/proof-packs/workflow-change/proof-template.md`
- `demo/proof-packs/workflow-change/readout-template.md`

Say:
- “The goal is not only to ship a change.”
- “The goal is to end with inspectable proof: what changed, how it was checked, and whether to accept, block, or escalate.”

## 8. Optional pilot connection — 1 minute

Say:
- “This is the kind of bounded case we use to frame a managed pilot.”
- “One team, one repo, one visible flow to proof.”

## 9. Close with CTA — 1 minute

Suggested close:
- “If this kind of change is representative of your delivery pain, the next step is a bounded pilot case, not a broad rollout.”

## Fallback path if AI / GLR is unavailable

If any live AI or agentic step is unavailable:
- keep the UI running as the baseline before-state
- use the prepared proof-pack docs instead of live generation
- explicitly say that the demo is about the operating shape, not dependency on a live AI call

Fallback order:
1. baseline app
2. business request
3. clarification questions
4. contract draft
5. task plan
6. proof template

## Presenter notes

- keep the story bounded
- do not improvise new requirements mid-demo
- do not promise that the runtime behavior is already implemented
- use the proof pack whenever a live step risks becoming noisy
