# Goalrail Demo Sandbox

This repository is the **executable demo sandbox** for Goalrail.

It is **not** the Goalrail product implementation.

Product canon, positioning, and planning docs live in the sibling repository:
- `heurema/goalrail`

This repo exists to support:
- deterministic live demos
- fake TrialOps sandbox data
- future replayable demo assets

## Current phase

Current phase: **Phase 4.5 demo-ready baseline + proof artifacts**

What exists now:
- npm workspace structure
- minimal file-backed backend API
- demo-ready baseline Web UI
- shared demo types
- fake seed data
- scenario manifests
- deterministic reset and smoke scripts
- workflow-change proof pack and presenter notes
- dry-run checklist, show script, and troubleshooting docs

What does **not** exist yet:
- Phase 5 `manual_review` runtime workflow
- database
- auth
- external integrations

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

## Repo intent

This repo is a deterministic demo sandbox for:
- founder-led live demos
- future guided replay demos

It should not be confused with:
- the Goalrail product repo
- a production SaaS application
- a public self-serve AI execution system

## Data model posture

- data is file-backed JSON for v0
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
- no `manual_review` status yet

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

## Demo baseline

Current baseline behavior:
- trial requests can be moved directly to `approved`
- dashboard counts update from backend data
- audit log records status changes
- this is intentionally the before-state for the future workflow-change scenario

The future `manual_review` flow is not implemented yet by design.

Recommended verification flow:

```bash
npm run reset
npm run smoke
```

## Demo artifacts

- primary scenario: `workflow-change`
- proof pack: `demo/proof-packs/workflow-change/`
- show script: `docs/demo/DEMO_SHOW_SCRIPT.md`
- dry-run checklist: `docs/demo/DEMO_DRY_RUN_CHECKLIST.md`
- Russian presenter notes: `docs/demo/DEMO_PRESENTER_NOTES_RU.md`
