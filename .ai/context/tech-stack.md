---
title: "Tech Stack"
tags: ["tech-stack", "dependencies", "tooling"]
summary: "Node.js/TypeScript npm workspace with Fastify API and React/Vite frontend — intentionally minimal"
---

## Runtime

- **Node.js** ≥ 22.0.0 (ESM modules throughout, `"type": "module"`)
- **TypeScript** 5.9.x (strict, compiled to `dist/` by `tsc`)
- **Package manager:** npm with workspaces

## Monorepo Structure

```
goalrail-demo/          # root workspace
  apps/api/             # @goalrail-demo/api
  apps/web/             # @goalrail-demo/web
  packages/shared/      # shared types (not yet used cross-app)
```

## Backend — `apps/api`

| Layer | Choice |
|---|---|
| HTTP framework | **Fastify** 5.x |
| Data store | **File-backed JSON** (`data/runtime/*.json`) |
| Auth | None |
| Database | None |
| Build | `tsc` (outputs to `apps/api/dist/`) |

The API also serves the compiled web frontend as static files from `apps/web/dist/` — no separate static server needed in production mode.

## Frontend — `apps/web`

| Layer | Choice |
|---|---|
| Framework | **React** 19.x |
| Build tool | **Vite** 7.x |
| Language | TypeScript |
| Styling | Plain CSS (`styles.css`) |
| State management | None (local component state) |
| Router | None (single-page, no routing) |
| UI library | None |

Vite dev server proxies `/api` and `/health` to `http://127.0.0.1:4311` — no CORS config needed.

## Shared Package — `packages/shared`

Contains shared TypeScript types. Currently minimal; the API and web each define their own `types.ts` (identical shape).

## Dev Tooling

| Tool | Purpose |
|---|---|
| `scripts/dev.mjs` | Starts API and web concurrently |
| `scripts/reset-demo.mjs` | Restores `data/runtime/` from `data/seed.json` |
| `scripts/smoke-test.mjs` | Quick HTTP health + data check |
| `tsconfig.base.json` | Root-level TypeScript base config |

## Infrastructure

None. This is a local-only demo sandbox. No Docker, no cloud, no CI/CD.
