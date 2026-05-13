# Pricing Copy - Task

## Raw task

Change pricing card CTA copy from `Start trial` to `Request access`.

## Shared input

This raw task is used for both evaluation paths:

```text
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

## Scenario context

This is a deterministic reference scenario for a narrow UI copy change. It uses
fake product context only and does not claim that a real pricing surface exists
in the sandbox today.

## Intended change

- Replace the visible pricing card CTA text.
- Preserve existing behavior behind the CTA.
- Avoid changing billing, trial provisioning, API behavior, or schema.

## Out of scope

- pricing rules
- billing logic
- trial provisioning behavior
- API changes
- database schema changes
- new checkout or access workflow
