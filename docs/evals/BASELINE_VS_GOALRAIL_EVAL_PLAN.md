# Baseline vs GoalRail Evaluation Plan

## Purpose

The demo repo should support deterministic comparison between a raw baseline
path and a GoalRail-guided path for the same task.

This is not a product benchmark, not a live AI benchmark, and not production
proof. It exists to make the GoalRail value claim inspectable inside the
deterministic demo sandbox.

The target question is simple: does the GoalRail path make the change easier to
understand, constrain, verify, and trust than the baseline path?

## Evaluation question

For the same task, does GoalRail improve:
- scope adherence
- proof coverage
- acceptance evidence
- regression safety
- review burden
- time-to-confidence

## Two-path model

Baseline:

```text
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator
```

GoalRail:

```text
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

The evaluator can be a deterministic rubric, a human reviewer using the rubric,
or a future replay harness. The first repo version is docs/reference only.

## Measurement axes

Each scenario should be evaluated on:
- acceptance pass/fail
- scope adherence
- proof coverage
- regression safety
- change minimality
- review burden
- evidence quality
- out-of-scope changes
- time-to-confidence

## Scenario format

Recommended folder layout:

```text
evals/scenarios/<scenario-id>/
  task.md
  hidden-acceptance.md
  baseline.md or baseline.diff
  goalrail-contract.md
  goalrail.md or goalrail.diff
  rubric.yaml
  delta-report.md
```

Recommended file roles:
- `task.md` contains the shared raw task.
- `hidden-acceptance.md` contains evaluator-only expectations.
- `baseline.md` or `baseline.diff` captures the direct/raw path result.
- `goalrail-contract.md` captures the working contract and bounded task packet.
- `goalrail.md` or `goalrail.diff` captures the GoalRail-guided result.
- `rubric.yaml` defines deterministic scoring dimensions.
- `delta-report.md` summarizes the measured difference between both paths.

Scenarios should use fake data only and must not require external APIs,
customer data, secrets, live AI agents, or product runtime services.

## First scenarios

Recommended first deterministic scenarios:
- `workflow-change` existing scenario
- `pricing-copy`
- `csv-export`
- `session-timeout`
- `refactor-no-behavior-change`

These should start as reference artifacts before any runner, harness, UI, or
script is added.

## Existing workflow-change mapping

The current `workflow-change` proof/readout can become the first paired
scenario.

Current mapping:
- baseline: direct approval possible
- GoalRail: `manual_review` required
- GoalRail evidence: owner, reason, and reviewer actor visible
- GoalRail audit: review decision evidence captured in the audit trail
- existing proof/readout samples remain source/reference artifacts

Source/reference artifacts:
- `demo/proof-packs/workflow-change/proof-sample.md`
- `demo/proof-packs/workflow-change/readout-sample.md`

The first paired eval should not duplicate large proof content. It should point
to these artifacts and add only the baseline-vs-GoalRail comparison layer.

## Non-goals

- no live AI agents
- no real customer data
- no benchmark claims
- no statistical superiority claims
- no product implementation
- no generic workflow engine
- no production proof
