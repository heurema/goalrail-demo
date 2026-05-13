---
title: "GLR Demo Flow"
tags: ["demo", "workflow", "glr", "process", "trialops"]
summary: "Recommended session-by-session GLR flow for the workflow-change scenario in goalrail-demo"
---

## Purpose

This document defines the recommended **session-by-session GLR flow** for the `workflow-change` scenario in `goalrail-demo`.

It exists so future AI sessions can discover the intended demo sequence via `search_context`.

## Default scenario

Use `workflow-change` as the default live-demo scenario unless the user explicitly chooses another one.

Raw request:

> Before a trial request can be approved, we need a manual review step. The reviewer must assign an owner and provide a decision reason. The dashboard should reflect the new status, and the audit log should show who made the decision and why.

## Demo objective

Demonstrate the Goalrail operating shape:

`business request -> clarification -> contract -> bounded task plan -> proof`

The safe stopping point for a **process-only demo** is after `/plan`.

## Session sequence

### 1. Analyze

Inputs:

- `demo/scenarios/workflow-change.yaml`
- `demo/proof-packs/workflow-change/business-request.md`
- `.ai/context/project-overview.md`
- `.ai/context/architecture.md`
- `.ai/context/domain-model.md`

Expected outputs:

- identified baseline weakness
- affected surfaces
- open questions
- initial scope boundary

### 2. Refine

Use the recommended answers in:

- `demo/proof-packs/workflow-change/clarification-questions.md`

Demo-default decisions:

- every approval must go through `manual_review` in v1
- no role/permission system in this demo
- owner is required at review decision time
- decision reason is required for any review decision
- audit evidence must show actor, from status, to status, reason, and timestamp
- auth, notifications, policy profiles, workflow engine, and DB migration are out of scope

### 3. Plan

Expected bounded decomposition:

- status model / shared types
- API validation + transitions + audit semantics
- frontend counts + controls + detail view
- smoke / proof / docs

Recommended task IDs:

- `WF-01`
- `WF-02`
- `WF-03`
- `WF-04`

### 4. Execute

Only if the user explicitly moves from process demo to implementation.

Recommended posture:

- execute one task at a time
- no scope creep
- stop after each task for review

### 5. Verify

Expected acceptance criteria:

1. direct approval is blocked
2. review requires owner
3. review requires reason
4. dashboard shows `manual_review`
5. audit log shows actor and reason
6. reset + smoke remain deterministic

## Boundaries

This demo flow must stay bounded.

Do not broaden the slice into:

- auth
- permissions
- notifications
- policy profiles
- workflow engine abstraction
- database migration
- broader lifecycle redesign

## Key files

- `STATUS.md`
- `docs/demo/DEMO_SHOW_SCRIPT.md`
- `docs/demo/DEMO_SESSION_PROMPTS_RU.md`
- `demo/proof-packs/workflow-change/contract-draft.md`
- `demo/proof-packs/workflow-change/task-plan.md`
- `demo/proof-packs/workflow-change/proof-template.md`
