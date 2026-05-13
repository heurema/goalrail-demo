---
title: "Project Overview"
tags: ["overview", "demo", "sandbox", "trialops"]
summary: "Deterministic demo sandbox showcasing a Goalrail-style operating flow on top of a fake TrialOps internal tool"
---

## What This Project Is

`goalrail-demo` is the **executable demo sandbox** for Goalrail — not the Goalrail product itself. It hosts a fake internal tool called **TrialOps** (trial request management) that serves as the "before state" for a live founder demo.

The product canon, positioning, and planning docs live in the sibling repo: `heurema/goalrail`.

## Who It's For

- Founder-led live demos to technical buyers (CTO, Head of Engineering, product-minded buyer)
- Future replayable/guided demo assets
- Target audience per show script: a 12–15 minute demo session

## What Problem It Demonstrates

Goalrail's pitch: instead of jumping straight into implementation, a team should move from **business request → clarification → contract → bounded task plan → proof**. The demo makes this operating shape tangible using a simple, believable workflow change on a real (but fake) app.

## The Demo Story: `workflow-change` Scenario

The primary demo scenario is:

> "Before a trial request can be approved, we need a manual review step. The reviewer must assign an owner and provide a decision reason."

The demo shows the **before state** (direct approval, no review) and walks through the full Goalrail proof-pack flow to show *how* such a change would be handled under Goalrail methodology.

The `manual_review` status and the full "after state" are **intentionally not yet implemented** — the demo sells the methodology, not the finished result.

## Current Phase

**Phase 4.5 — demo-ready baseline + proof artifacts**

What exists:
- npm workspace with minimal file-backed API and demo-ready Web UI
- Fake seed data (no real companies, no secrets)
- Scenario manifests (`demo/scenarios/`)
- `workflow-change` proof pack (`demo/proof-packs/workflow-change/`)
- Show script, dry-run checklist, Russian presenter notes
- Deterministic reset and smoke scripts

What does NOT exist yet (by design):
- `manual_review` runtime workflow
- Database (file-backed JSON only)
- Auth
- External integrations

## Key Demo Artifacts

| Artifact | Path |
|---|---|
| Primary scenario | `demo/scenarios/workflow-change.yaml` |
| Proof pack | `demo/proof-packs/workflow-change/` |
| Show script | `docs/demo/DEMO_SHOW_SCRIPT.md` |
| Dry-run checklist | `docs/demo/DEMO_DRY_RUN_CHECKLIST.md` |
| Russian presenter notes | `docs/demo/DEMO_PRESENTER_NOTES_RU.md` |

## Commands

```bash
npm install
npm run reset      # restore seed data
npm run smoke      # quick API health check
npm run dev        # run API + web concurrently
```

Default ports: API `http://127.0.0.1:4311`, Web `http://127.0.0.1:5173`
