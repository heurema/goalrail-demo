---
title: "Architecture"
tags: ["architecture", "backend", "frontend", "data-flow"]
summary: "Two-app npm workspace: Fastify API reading/writing file-backed JSON, React SPA proxied through Vite"
---

## High-Level Shape

```
[Browser]
    │
    ├── dev mode: Vite dev server (5173) → proxies /api/* → Fastify (4311)
    └── prod mode: Fastify (4311) serves built web/dist/ directly
```

No database. No auth. No external services. State lives entirely in two JSON files under `data/runtime/`.

## Data Flow

```
[Browser action]
    → PATCH /api/trial-requests/:id/status
    → routes.ts validates input
    → data-store.ts reads trial-requests.json
    → data-store.ts writes updated trial-requests.json
    → data-store.ts appends event to audit-log.json
    → response: { item, auditEvent }
```

Reads are direct file reads. Writes are full-file rewrites (read → mutate → write). No transactions, no concurrency protection — acceptable for a single-user demo sandbox.

## Backend Layers (`apps/api/src/`)

| File | Role |
|---|---|
| `main.ts` | Process entry — creates Fastify instance, registers routes, starts listen |
| `server.ts` | Fastify factory / plugin setup |
| `routes.ts` | All HTTP route handlers; serves static web assets in prod |
| `data-store.ts` | All file I/O; the only layer that touches the filesystem |
| `types.ts` | Domain types (`TrialRequest`, `AuditEvent`) |
| `errors.ts` | Typed error classes (`NotFoundError`, `ValidationError`, `RuntimeDataError`) |

The backend is deliberately structured with a single `data-store.ts` module — easy to swap for a real DB later without touching routes.

## Frontend Structure (`apps/web/src/`)

| File | Role |
|---|---|
| `main.tsx` | React entry, mounts `<App>` |
| `App.tsx` | Single root component — all UI lives here |
| `api.ts` | Thin HTTP client wrapping fetch calls to `/api/*` |
| `types.ts` | Mirrors backend domain types for the frontend |
| `styles.css` | All styles, no CSS modules |

No router, no state manager, no component library. Single-page, single-component tree.

## Data at Rest

```
data/
  seed.json                  # canonical baseline snapshot (read-only)
  runtime/
    trial-requests.json      # live mutable state
    audit-log.json           # append-only event log
```

`npm run reset` copies from `seed.json` back into `data/runtime/`, returning the sandbox to its known-good demo state.

## Static Asset Serving

In **dev mode**: Vite handles the frontend, proxies API calls.

In **prod mode** (after `npm run api:build && npm run web:build`): the Fastify server itself serves `apps/web/dist/` static files. Routes are:
- `/` → `index.html`
- `/assets/*` → static asset files
- `/*` → SPA fallback to `index.html`, or try static file first

## Demo Scenario Layer

Independent from the application code:

```
demo/
  scenarios/*.yaml        # declarative scenario manifests
  proof-packs/*/          # business-request, clarification, contract, task-plan, proof docs
  replay/                 # (empty) future replayable demo assets
```

Scenario manifests (`workflow-change.yaml`, etc.) describe the demo story, touched areas, and proof expectations. They are human-readable declarations, not executable scripts.
