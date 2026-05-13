---
tags: []
source: "docs/demo/DEMO_SESSION_PROMPTS_RU.md"
embed_lines: "1-222"
embed_slice: "1-222"
---

# TrialOps Demo — Session Prompts (RU)

Этот файл нужен для live demo полного GLR flow по сценарию `workflow-change`.

Цель: запускать **каждый этап в отдельной AI session**, без импровизации и без scope creep.

---

## Scenario SSoT

Используй эту формулировку без переписывания:

> Before a trial request can be approved, we need a manual review step. The reviewer must assign an owner and provide a decision reason. The dashboard should reflect the new status, and the audit log should show who made the decision and why.

Primary references:

- `demo/scenarios/workflow-change.yaml`
- `demo/proof-packs/workflow-change/business-request.md`
- `.ai/context/project-overview.md`
- `.ai/context/architecture.md`
- `.ai/context/domain-model.md`

---

## Preflight before the first session

Run:

```bash
npm install
npm run reset
npm run smoke
npm run dev
```

Open:

- UI: `http://127.0.0.1:5173`
- proof pack: `demo/proof-packs/workflow-change/`

---

## Session 1 — Analyze

Use this prompt:

```text
Прочитай AGENTS.md и следуй ему.
Проект уже инициализирован под glr.

Нужен полный GLR flow для demo scenario `workflow-change`.

Исходный запрос:
Before a trial request can be approved, we need a manual review step.
The reviewer must assign an owner and provide a decision reason.
The dashboard should reflect the new status, and the audit log should show who made the decision and why.

Используй существующие артефакты проекта:
- demo/scenarios/workflow-change.yaml
- demo/proof-packs/workflow-change/business-request.md
- .ai/context/project-overview.md
- .ai/context/architecture.md
- .ai/context/domain-model.md

Код не меняй.
Сначала сделай project-status flow, затем выполни /analyze.
```

### Expected output

- `.ai/context/analysis/` created
- baseline weakness captured
- affected surfaces identified
- open questions listed
- scope boundary made explicit

---

## Session 2 — Refine

Use this prompt:

```text
Продолжаем workflow-change.
Выполни /refine.

Используй demo-default ответы из:
demo/proof-packs/workflow-change/clarification-questions.md

Зафиксируй такие решения:
1. Every approval must go through manual_review in v1.
2. No role/permission system in this demo.
3. Owner is required at review decision time.
4. Decision reason is required for any review decision.
5. Audit evidence must show actor, from status, to status, reason, timestamp.
6. Out of scope: auth, notifications, policy profiles, workflow engine, DB migration.

Код не менять.
Нужен refined scope без расширения задачи.
```

### Expected output

- ambiguity closed
- demo-default workflow agreed
- in-scope / out-of-scope stabilized
- working contract boundaries ready for planning

---

## Session 3 — Plan

Use this prompt:

```text
Продолжаем workflow-change.
Выполни /plan и создай bounded task board.

Нужно декомпозировать только этот slice:
- manual_review status before approval
- owner required
- decision reason required
- dashboard reflects new status
- audit log shows actor and reason

Не расширять scope в auth, permissions, notifications, workflow engine, DB.

Предпочитаем bounded tasks уровня:
- status model / shared types
- API validation + transitions + audit recording
- frontend counts + controls + detail view
- smoke/proof/docs
```

### Expected output

- `.ai/tasks/*.md` created
- bounded task board exists
- tasks are suitable for separate `/execute` sessions

Recommended shape:

- `WF-01` — status model + fixtures
- `WF-02` — API validation + transitions + audit semantics
- `WF-03` — frontend workflow surfaces
- `WF-04` — smoke + proof + docs

---

## Session 4+ — Execute (only if you decide to implement later)

Use one task at a time.

Example prompt:

```text
Продолжаем workflow-change.
Выполни /execute только для WF-01.
Работай bounded, без scope creep.
После завершения остановись и покажи что изменилось.
```

Do the same separately for:

- `WF-02`
- `WF-03`
- `WF-04`

---

## Final Session — Verify

Use this prompt:

```text
Выполни /verify для workflow-change against the agreed contract and proof expectations.

Acceptance criteria:
1. direct approval is blocked
2. review requires owner
3. review requires reason
4. dashboard shows manual_review
5. audit log shows actor and reason
6. reset + smoke remain deterministic

Собери proof-oriented readout.
```

### Expected output

- acceptance criteria evaluation
- proof pack completed
- final verdict: `accept` / `block` / `escalate`

---

## Safe stopping point for sales demo

Если нужен **demo without code**, останавливайся после `/plan`.

At that point the story is already complete:

`business request -> clarification -> contract -> bounded task plan -> expected proof`

Это достаточно, чтобы показать Goalrail methodology без live implementation risk.

---

## Presenter reminder

Не говорить:

- “manual_review уже реализован”
- “AI сейчас сам всё внедрит live”
- “это finished enterprise platform”

Говорить:

- “сейчас мы показываем controlled flow from request to proof”
- “implementation идёт только после clarification, contract и bounded planning”
- “для demo-показа безопасная точка остановки — после plan”
