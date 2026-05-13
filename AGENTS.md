# goalrail-demo

> Update this file with your project description and specifics.
> This file is read by AI coding agents (Claude, Cursor, Copilot, Gemini, etc.)

## About

`goalrail-demo` is a deterministic demo sandbox for Goalrail. It hosts a fake internal tool called TrialOps and is used to demonstrate the Goalrail operating flow from business request to clarification, contract, bounded task plan, and proof. It is for founder-led live demos and pilot conversations, not for production delivery.

<!-- glr:start:ai-tools -->
## AI Tools — MANDATORY

**This project uses glr MCP tools. You MUST use them for all project queries.**

Do NOT use Bash, Read, Grep, or cat to check project status, read tasks, or search context.

- **Project status** → `board_status`, `list_tasks`
- **Architecture, requirements, decisions** → `search_context`, `list_documents`, `get_document`
- **Past sessions and decisions** → `chronicle_search`
- **Task is fundamentally wrong** → `reject_task`

If a tool returns no results, the knowledge base may not be populated yet — proceed with what is available.
<!-- glr:end:ai-tools -->

<!-- glr:start:project-status -->
## Project Status — MANDATORY at session start

**ALWAYS do this FIRST, before any other action:**
1. Call `board_status` — what's active, blocked, ready, rejected
2. Read `STATUS.md` — priorities, next steps, open questions
3. Call `search_context("project-knowledge boundaries decisions")` — load project rules and recent decisions
4. If Serena MCP is available, call `check_onboarding_performed` — if not yet done, call `onboarding`

**When:** session start, "what's next", "status", "что дальше", before proposing new work.

NEVER skip this. NEVER substitute with `git log`, `cat`, or `grep` via Bash — use the MCP tools.
<!-- glr:end:project-status -->

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Fastify
- **Data:** file-backed JSON under `data/runtime/`
- **Workspace:** npm workspaces
- **Infra posture:** local deterministic demo sandbox, no auth, no external integrations

<!-- glr:start:knowledge-vault -->
## Knowledge Vault

Project context is stored in `.ai/context/` as atomic markdown files.

To add documentation:
```bash
npx glr add-doc ./path/to/spec.docx
```
<!-- glr:end:knowledge-vault -->

<!-- glr:start:workflow -->
## Workflow

GLR provides a structured workflow for understanding, planning, and executing a project:

### Core pipeline
1. **`/analyze`** — Analyze project requirements from Knowledge Vault. Produces structured analysis in `.ai/context/analysis/`.
2. **`/refine`** — Refine analysis iteratively: answer questions, record decisions, detect contradictions.
3. **`/plan`** — Decompose into tasks with acceptance criteria and dependencies. Also reviews feedback backlog.
4. **`/execute`** — Execute tasks in isolated worktrees (or Docker containers for parallel work).
5. **`/verify`** — Verify completed tasks/waves against acceptance criteria.

**After `/analyze`, suggest `/refine` if there are open questions. Do not jump straight to `/plan` unless the user explicitly asks.**

### Execution modes
AI automatically chooses the right execution mode:
- **Quick mode** — trivial changes (1-3 files, not critical): work directly in main, commit with `quickfix:` prefix. No board task, no worktree.
- **Planned mode** — features, refactoring, anything touching auth/DB/API: full task board + worktree/docker isolation.

### Feedback capture (use anytime)
- **`/fix`** — Quick bug report → backlog
- **`/idea`** — Feature idea → backlog
- **`/note`** — Context note → backlog
- **`/feedback`** — Generic feedback (AI classifies during `/plan` review)

### Utilities
- **`/demo-prep`** — Prepare demo environment: mock services, seed data, show script
- **`/client-questions`** — Export open questions for stakeholder review
- **`/security-audit`** — OWASP top 10, secrets, deps, auth checks
- **`/gc`** — Garbage collection: dead code, doc drift, dependency audit
- **`/scan-docs`** — Smart project scan: synthesize Knowledge Vault from existing codebase
<!-- glr:end:workflow -->

<!-- glr:start:skill-priority -->
## Skill Priority Override

**For planning and task decomposition: ALWAYS use glr skills (`/analyze`, `/refine`, `/plan`, `/execute`, `/verify`), NEVER superpowers:writing-plans or superpowers:brainstorming.**

This project has its own structured workflow (see "Workflow" above). Superpowers planning/brainstorming skills are designed for greenfield work without a task board — they conflict with glr's Knowledge Vault → analysis → task board pipeline.

| Task                    | Use                    | Do NOT use                                                           |
| ----------------------- | ---------------------- | -------------------------------------------------------------------- |
| Understand requirements | `/analyze`, `/refine`  | superpowers:brainstorming                                            |
| Create task board       | `/plan`                | superpowers:writing-plans                                            |
| Execute tasks           | `/execute`             | superpowers:executing-plans, superpowers:subagent-driven-development |
| Verify work             | `/verify`              | superpowers:verification-before-completion                           |

**Superpowers skills that ARE useful here:** TDD, systematic-debugging, code-review, dispatching-parallel-agents, using-git-worktrees — these don't conflict with glr workflow.
<!-- glr:end:skill-priority -->

## Rules for AI

### Do freely:
- Create files following existing patterns
- Write and run tests
- Refactor with preserved interfaces
- Fix bugs with explanation

### Ask first:
- Add new dependencies
- Change database schema / migrations
- Modify auth / security middleware
- Change build or deploy configuration

### Always:
- Keep the demo bounded to the requested scenario; do not broaden scope into auth, permissions, notifications, or platform redesign unless explicitly asked
- Treat `workflow-change` as the default live-demo scenario unless the user says otherwise
- Update `STATUS.md` at the end of each session with current focus, recent achievements, next steps, and open questions

### Never:
- Commit directly to main/master
- Modify .env files or secrets
- Delete tests without replacement
- Update major dependency versions without approval

<!-- glr:start:security -->
### Security self-check
Before committing, run available security scanners on your changes:
- `gitleaks detect --no-git -s .` — fix any secrets found (move to .env)
- `uvx semgrep scan --config=auto --severity=ERROR` — fix vulnerabilities found
- `npm audit --audit-level=high` — fix critical deps if safe
If a scanner is not installed, skip it and note in commit message.
<!-- glr:end:security -->

<!-- glr:start:security-posture -->
### Security Posture

When adding dependencies, tools, or MCP servers, evaluate security risk:

**Risk levels:**
- **HIGH** — known CVE, compromised package, no maintainer → resolve now (vendor/replace/reject)
- **MEDIUM** — low downloads, single maintainer, many transitive deps → note and continue
- **LOW** — established package, active maintenance → record and proceed

**Decisions for each dependency:**
- **trust** — verified provider, stable library (e.g. express, React)
- **vendor** — pull source into project, review, make part of solution
- **replace** — use built-in alternative (e.g. Node zlib instead of pako)
- **accept-with-risk** — no alternative exists, risk documented

**Tools:** Use `evaluate_dependency` to check a package before adding it.

**MCP whitelist:** Only whitelisted MCP servers are trusted. Adding non-whitelisted servers generates a security warning.
<!-- glr:end:security-posture -->

<!-- glr:start:chronicle -->
## Chronicle (Event Log)

Prompts, tool calls, and session boundaries are captured automatically — no action needed.

### When to log manually
After completing any phase, call `chronicle_log` to capture:
- **decision** — architectural or design choice made (with reasoning)
- **observation** — something unexpected found during work
- **reflection** — process insight after verify/completion (only if notable)

Required fields: `type`, `content`. Optional: `phase`, `task_id`, `severity`, `tags`.

### Recall past context
Use `chronicle_search` to find past decisions and observations.

If nothing notable happened — skip. Don't write "everything went well."
<!-- glr:end:chronicle -->

<!-- glr:start:knowledge-policy -->
## Knowledge Policy

- **Your** preferences, workflow feedback → MEMORY.md (private to you)
- **Project** decisions, architecture, problems → `chronicle_log` (shared across team)
- **Derivable from code** (build commands, file paths) → neither
<!-- glr:end:knowledge-policy -->
