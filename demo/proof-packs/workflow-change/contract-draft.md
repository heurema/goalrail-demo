# Workflow Change — Contract Draft

> Demo artifact. This is a draft working contract for the live-demo narrative.
> It is not presented as an automatically generated Goalrail contract and not as a final production contract.

## Goal

Add a visible manual review step before approval in TrialOps so the demo can show a bounded workflow change from business request to proof.

## Background

The baseline app allows a trial request to move directly to `approved`.
That is intentionally useful as the before-state for the demo, but it no longer matches the requested business process.

## In scope

- add a dedicated review state before approval
- require owner assignment at review decision time
- require a decision reason at review decision time
- reflect the new review state in dashboard counts
- record the review decision in the audit log
- update seed/demo expectations and smoke coverage as needed

## Out of scope

- auth or permissions
- notifications
- policy profiles by segment
- workflow engine abstraction
- database migration
- multi-user collaboration rules
- public self-serve replay implementation

## Affected surfaces

- shared demo status model
- file-backed API validation and status transition logic
- baseline dashboard counts
- request detail status controls
- audit event recording
- smoke checks and demo artifacts

## Acceptance criteria

1. A request cannot move directly from baseline states to `approved` without going through review.
2. Review decisions require an owner and a decision reason.
3. Dashboard counts show the new review state.
4. The UI makes the review step visible.
5. Audit evidence captures who made the decision and why.
6. Reset plus smoke remains deterministic.

## Non-goals

- rethinking the entire request lifecycle
- building a generalized approval framework
- solving enterprise governance
- replacing the baseline demo UI architecture

## Risks

- the slice may accidentally broaden into permissions or policy work
- dashboard and audit behavior may drift apart if changed separately
- demo narrative may overclaim automation if the presenter is not explicit

## Open questions

- should rejection from review return to `rejected` directly or allow another intermediate path?
- should owner assignment happen only on approval or on any review decision?
- how much of the new flow should be covered in seed data versus live interaction?

## Proof expectations

- updated smoke checks for the happy path
- visible before/after behavior in the UI
- audit evidence for review decisions
- a short readout explaining what changed and what remains out of scope
