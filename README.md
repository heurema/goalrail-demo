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

Current phase: **Phase 1 skeleton only**

What exists now:
- npm workspace structure
- placeholder API and Web app folders
- shared demo types
- fake seed data
- scenario manifests
- deterministic reset and smoke scripts

What does **not** exist yet:
- real API behavior
- real UI behavior
- database
- auth
- external integrations

## Commands

```bash
npm install
npm run reset
npm run smoke
npm run dev
```

## Repo intent

This repo is a deterministic demo sandbox for:
- founder-led live demos
- future guided replay demos

It should not be confused with:
- the Goalrail product repo
- a production SaaS application
- a public self-serve AI execution system

## Placeholders

- `apps/api` is a placeholder until Phase 2
- `apps/web` is a placeholder until Phase 3

## Data model posture

- data is file-backed JSON for v0
- all data is fake
- no real companies, no real customer data, no secrets
