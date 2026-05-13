# Scenario Packet v0

## Purpose

`scenario.yaml` will be a machine-readable source packet for deterministic
Proof Gap scenario packs.

It should give future local renderer/checker work a structured source for
scenario metadata, baseline-vs-GoalRail comparison, expected proof fields, and
report references without scraping prose from markdown files.

This packet exists only for the deterministic demo/eval sandbox. It should not
turn this repo into GoalRail product runtime, a benchmark runner, or production
proof infrastructure.

## Non-goals

- no renderer in this task
- no parser in this task
- no AI runtime
- no benchmark runner
- no app/backend/frontend behavior
- no production proof claim
- no statistical superiority claim
- no GitHub Action
- no web UI
- no product integration

## File location

Recommended future location:

```text
evals/scenarios/<scenario-id>/scenario.yaml
```

Existing scenario packs may include this file as a structured summary/index.
This document defines the packet shape; it does not approve a renderer or
product data model.

## Required top-level fields

`scenario.yaml` files should include these top-level fields:

- `id`
- `title`
- `status`
- `intent`
- `hidden_acceptance`
- `baseline_path`
- `goalrail_path`
- `scope_delta`
- `evidence_map`
- `proof_gap_report`
- `delta_axes`
- `risk_notes`
- `residual_risks`
- `references`

`scope_delta`, `evidence_map`, per-axis delta rationale, risk reason /
mitigation, and `proof_gap_report.next_required_proofs` exist so future
renderers do not have to infer Proof Gap Report sections from markdown prose.

## Suggested YAML shape

This is a concise shape example, not full scenario content.

```yaml
id:
title:
status: active
intent:
  task_summary:
  actor:
  user_visible_goal:
  acceptance_summary:
hidden_acceptance:
  - id:
    description:
baseline_path:
  summary:
  failure_modes:
    - id:
      description:
      axis:
goalrail_path:
  contract_boundary:
    scope_in:
      - item:
    scope_out:
      - item:
    non_goals:
      - item:
    expected_proofs:
      - item:
  expected_improvements:
    - axis:
      description:
scope_delta:
  aligned_changes:
    - item:
  unexplained_changes:
    - item:
  possible_scope_drift:
    - item:
  missing_expected_changes:
    - item:
evidence_map:
  present_evidence:
    - item:
  missing_evidence:
    - item:
  weak_evidence:
    - item:
  manual_review_evidence:
    - item:
proof_gap_report:
  soft_verdict:
  proof_gaps:
    - id:
      severity:
      description:
      next_required_proof:
  next_required_proofs:
    - id:
      description:
delta_axes:
  acceptance:
    baseline:
    goalrail:
    rationale:
  scope_adherence:
    baseline:
    goalrail:
    rationale:
  proof_coverage:
    baseline:
    goalrail:
    rationale:
  regression_safety:
    baseline:
    goalrail:
    rationale:
  change_minimality:
    baseline:
    goalrail:
    rationale:
  review_burden:
    baseline:
    goalrail:
    rationale:
  evidence_quality:
    baseline:
    goalrail:
    rationale:
  out_of_scope_changes:
    baseline:
    goalrail:
    rationale:
  time_to_confidence:
    baseline:
    goalrail:
    rationale:
risk_notes:
  - id:
    description:
    reason:
    mitigation:
residual_risks:
  - id:
    description:
    owner_hint:
    mitigation:
references:
  task: task.md
  hidden_acceptance: hidden-acceptance.md
  baseline: baseline.md
  goalrail_contract: goalrail-contract.md
  goalrail: goalrail.md
  rubric: rubric.yaml
  delta_report: delta-report.md
  proof_gap_report: proof-gap-report.md
```

The packet should prefer short, stable values over long prose. Human-readable
markdown files remain the place for richer explanation.

## Allowed soft verdicts

`proof_gap_report.soft_verdict` must use the same v0 vocabulary as the manual
Proof Gap reports:

- `aligned_but_proof_incomplete`
- `scope_drift_detected`
- `evidence_too_weak`
- `high_risk_needs_review`
- `insufficient_input`

The packet must not introduce merge, deploy, acceptance, or production proof
verdicts.

## Relationship to existing files

Markdown files remain the human-readable source/reference artifacts.

`scenario.yaml` should not immediately replace readable scenario docs. It
should summarize and index the same story so future local tooling has a stable
contract to validate.

Future checker work may validate consistency between `scenario.yaml` and the
markdown files, including:

- required references point to existing local files
- `id` matches the scenario directory
- `proof_gap_report.soft_verdict` matches allowed vocabulary
- `delta_axes` includes the same axes as `rubric.yaml`
- `proof_gap_report.proof_gaps` names next required proof
- `proof_gap_report.next_required_proofs` can render the report follow-up list
- `scope_delta` can render aligned, unexplained, drift, and missing-change
  sections without scraping prose
- `evidence_map` can render present, missing, weak, and manual-review evidence
  sections without scraping prose
- `delta_axes` includes short per-axis rationale
- `risk_notes` and `residual_risks` include enough reason/mitigation detail for
  report output
- baseline and GoalRail summaries preserve the paired comparison

Future renderer work may generate report drafts from `scenario.yaml`, but that
is not approved here.

## Future implementation sequence

1. Keep `scenario.yaml` updated manually for each existing scenario.
2. Update the checker as Scenario Packet v0 fields become required.
3. Add checker selftest cases for broken `scenario.yaml`.
4. Only then consider a local renderer.

## Safety

`scenario.yaml` is not production evidence and not a product data model.

It is an eval/demo data contract only. It must not imply benchmark claims,
statistical superiority, live AI execution, product runtime behavior, PR
verification, merge approval, or production proof.
