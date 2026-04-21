# Workflow Change — Business Request

## Raw request

> Before a trial request can be approved, we need a manual review step. The reviewer must assign an owner and provide a decision reason. The dashboard should reflect the new status, and the audit log should show who made the decision.

## Request context

- **Requested by:** Head of Revenue Operations
- **Working audience:** product manager, engineering lead, demo presenter
- **System in scope:** TrialOps baseline sandbox
- **Current state:** the baseline app allows direct status updates to `approved`

## Why it matters

- approval is currently too easy for a process that has commercial impact
- unowned approvals create confusion during onboarding
- missing decision reasons weaken auditability and handoff quality
- the dashboard should reflect review load, not only end states

## Why this is a good demo request

- business-readable from the first sentence
- clearly exposes a weakness in the baseline app
- requires backend, frontend, validation, and proof updates
- supports a clean before/after demo story

## What is ambiguous right now

- who can perform the review
- whether review is required for all requests or only some requests
- whether owner assignment happens during review or before it
- whether decision reason is required only on approval or on every review outcome
- how the new review state should appear in counts and audit evidence

## What must not be assumed yet

- that every team member can review
- that the new state should be called anything other than the agreed demo label
- that approval should remain a one-click transition
- that seed data or proof expectations can be changed without updating the contract
- that Goalrail generated the contract or task plan automatically in this demo
