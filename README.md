# Goalrail Demo Sandbox

This repository is the **executable deterministic demo sandbox** for Goalrail.

It is **not** the Goalrail product implementation.

Product canon, positioning, and planning docs live in the sibling repository:
- `heurema/goalrail`

This repo exists to support:
- deterministic live demos
- fake TrialOps sandbox data
- inspectable proof/readout artifacts
- bounded pilot-style conversations

## Current phase

Current phase: **Phase 5 demo-ready workflow-change slice**

What exists now:
- npm workspace structure
- minimal file-backed Fastify backend
- demo-ready React/Web UI
- switchable demo workflow mode: `baseline` or `goalrail`
- local `manual_review` runtime workflow for the Goalrail slice
- in-app buyer-facing Goalrail flow panel for request, clarification, contract, task plan, proof, and readout
- shared demo types
- fake seed data
- deterministic reset and smoke scripts
- workflow-change proof pack, proof sample, and readout sample as source/reference artifacts
- presenter docs for a 7-minute and longer demo path

What this repo still does **not** try to be:
- the production Goalrail platform
- a live AI coding demo
- a generic workflow engine
- a production SaaS application
- a system with auth, database, external integrations, or multi-tenant architecture

## Commands

```bash
npm install
npm run reset
npm run typecheck
npm run api:build
npm run web:build
npm run smoke
npm run dev
```

Default API URL:
- `http://127.0.0.1:4311`

Default Web URL:
- `http://127.0.0.1:5173`
- Russian UI: `http://127.0.0.1:5173/ru`

## Repo intent

This repo is a deterministic demo sandbox for:
- founder-led live demos
- bounded workflow-change stories
- future guided replay demos

It should not be confused with:
- the Goalrail product repo
- a production customer environment
- a public self-serve AI execution system

## Data model posture

- data is file-backed JSON under `data/runtime/`
- all data is fake
- no real companies, no real customer data, no secrets
- no database
- no auth
- no external APIs

## Backend posture

The backend is intentionally small and boring:
- Fastify
- file-backed runtime JSON under `data/runtime/`
- no DB
- no auth
- no external services
- explicit if/else validation for the demo workflow
- no generalized workflow engine abstraction

## Frontend posture

The frontend is intentionally minimal:
- Vite
- React
- TypeScript
- plain CSS
- no router
- no UI library
- no state manager

Vite dev proxy forwards:
- `/api`
- `/health`

to the backend at `http://127.0.0.1:4311`

No backend CORS dependency is used.

## Demo workflow modes

### `baseline` mode

This is the before-state.

- direct approval remains possible
- the UI warns that no second reviewer is required
- presenter can show the weakness without checking out an old commit

### `goalrail` mode

This is the after-state / Goalrail slice.

- adds `manual_review`
- blocks direct approval from intake states
- requires visible reviewer actor, assigned owner, and decision reason for review approval/rejection
- exposes the workflow change in counts, filters, status chips, audit log, and the in-app Goalrail artifact viewer

Default after `npm run reset`:
- `workflowMode: baseline`

## Recommended verification flow

```bash
npm run reset
npm run typecheck
npm run api:build
npm run web:build
npm run smoke
npm run dev
```

`npm run smoke` resets the sandbox before and after its API checks so the runtime returns to baseline.

## Demo artifacts

- live demo flow panel: open `Goalrail flow` in the web UI
- Russian live-demo route: open `/ru` for a Russian-localized UI (`http://127.0.0.1:5173/ru` or fallback `http://127.0.0.1:5174/ru`)
- primary scenario: `workflow-change`
- proof pack: `demo/proof-packs/workflow-change/`
- proof sample: `demo/proof-packs/workflow-change/proof-sample.md` (source/reference fallback)
- readout sample: `demo/proof-packs/workflow-change/readout-sample.md` (source/reference fallback)
- fast path: `docs/demo/DEMO_FAST_PATH_7MIN.md`
- show script: `docs/demo/DEMO_SHOW_SCRIPT.md`
- session prompts (RU): `docs/demo/DEMO_SESSION_PROMPTS_RU.md`
- dry-run checklist: `docs/demo/DEMO_DRY_RUN_CHECKLIST.md`
- Russian presenter notes: `docs/demo/DEMO_PRESENTER_NOTES_RU.md`

Normal golden path for the live demo is UI-only and buyer-facing.
For Russian-speaking audiences, use the same golden path on `/ru` so the presenter stays inside one browser UI.
Presenter notes stay in docs, not in the normal UI.
Markdown files remain available as fallback/reference if the UI becomes noisy.
