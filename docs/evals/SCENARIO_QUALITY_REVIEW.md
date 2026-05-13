# Scenario Quality Review

## Purpose

This review checks whether the deterministic paired scenarios are clear enough
to support GoalRail's artifact-led Proof Gap / delta-evidence story.

The review is intentionally docs-only. It does not approve a renderer, parser,
GitHub Action, runtime integration, benchmark runner, or live AI workflow.

The question is whether the current scenario artifacts make this comparison
inspectable:

```text
Baseline:
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator

GoalRail:
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

## Review criteria

- task clarity
- realistic baseline failure
- contract usefulness
- visible delta
- proof-gap clarity
- hidden acceptance quality
- rubric consistency
- buyer readability
- absence of unsafe claims
- distinction from generic AI code review

## Scenario review table

| Scenario | Task clarity | Realistic baseline failure | Contract usefulness | Visible delta | Proof-gap clarity | Hidden acceptance quality | Rubric consistency | Buyer readability | Absence of unsafe claims | Distinction from generic AI code review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `workflow-change` | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `pricing-copy` | pass | pass | pass | pass | pass | pass | pass | partial | pass | pass |
| `csv-export` | pass | pass | pass | pass | pass | pass | pass | partial | pass | pass |

### `workflow-change`

Overall: pass.

Rationale:

- The task is concrete and maps to the existing TrialOps manual-review demo.
- The baseline failure is realistic and already visible: direct approval from
  `qualified` remains possible.
- The GoalRail contract adds useful boundaries around `manual_review`, owner,
  reason, reviewer actor, and audit evidence.
- The proof gap is clear: baseline proves speed, not review-gated acceptance.
- The scenario avoids unsafe production claims by pointing to deterministic
  sandbox proof/readout artifacts.

### `pricing-copy`

Overall: pass with buyer-readability caveat.

Rationale:

- The task is intentionally narrow and easy to understand.
- The baseline failure is a realistic AI-assisted drift pattern: changing copy
  while also changing behavior.
- The contract is useful because it converts a trivial-looking request into
  explicit non-goals and no-drift proof expectations.
- The delta is visible in scope adherence and review burden.
- Buyer readability is partial because the scenario is synthetic and not tied
  to an existing demo surface or source artifact yet.

### `csv-export`

Overall: pass with buyer-readability caveat.

Rationale:

- The task is realistic because export features often hide permission and data
  minimization requirements.
- The baseline failure is strong: producing CSV can look complete while proof
  for authorization, field minimization, and filters is absent.
- The GoalRail contract is useful because it captures hidden acceptance before
  implementation.
- The proof gap is explicit and risk-oriented.
- Buyer readability is partial because the scenario is more technical and would
  benefit from a compact buyer-facing example row or fixture reference later.

## Cross-scenario findings

### Common strengths

- All three scenarios use the same baseline-vs-GoalRail comparison model.
- All scenarios make hidden acceptance visible before evaluation.
- All scenarios separate visible feature completion from proof quality.
- All scenarios use the same rubric axes and `pass` / `partial` / `fail`
  scoring vocabulary.
- All scenarios avoid benchmark, production proof, and live AI agent claims.
- The scenarios demonstrate GoalRail as contract/proof guidance, not generic AI
  code review.

### Common weaknesses

- Scenario metadata is not standardized yet.
- `next proof required` is implied but not a first-class field in every
  scenario.
- Evidence references are inconsistent: `workflow-change` links to existing
  proof/readout artifacts, while `pricing-copy` and `csv-export` remain
  synthetic reference scenarios.
- The scenarios are semantically consistent, but not strict enough for parser
  or renderer work without a schema pass.
- Buyer-facing phrasing is strongest in `workflow-change`; the synthetic
  scenarios need a shorter readout view before public demo use.

### Fields that appear in every scenario

- shared raw task
- baseline path
- GoalRail path
- hidden acceptance or evaluator-facing expectations
- baseline failure mode
- GoalRail working contract
- in-scope / non-goal boundary
- bounded task packet
- expected proof or evidence expectations
- rubric axes with `pass` / `partial` / `fail`
- delta report
- residual limits or proof gap

### Fields missing from the current scenario format

- scenario metadata: `scenario_id`, `status`, `owner`, `source_kind`,
  `review_after`
- explicit `next_proof_required`
- explicit `public_claim_safety`
- stable evidence reference list
- fixture or sample data references for synthetic scenarios
- report readiness state, such as `reference_only` or `schema_ready`
- clear distinction between evaluator-facing and buyer-facing sections

### Report sections that should become canonical later

- task
- hidden acceptance / inferred acceptance
- baseline failure mode
- GoalRail contract boundary
- evidence/proof expectations
- delta summary
- rubric results
- residual risks
- next proof required

## Recommended report shape

Based only on these three scenarios, the minimal common report shape should be:

1. `task`
2. `hidden_acceptance_or_inferred_acceptance`
3. `baseline_failure_mode`
4. `goalrail_contract_boundary`
5. `evidence_or_proof_expectations`
6. `delta_summary`
7. `rubric_results`
8. `residual_risks`
9. `next_proof_required`

Suggested display order for a human-readable report:

1. Task
2. Baseline result
3. GoalRail result
4. Proof gaps
5. Delta summary
6. Rubric results
7. Residual risks
8. Next proof required

## Revise-before-build list

Before any renderer, parser, GitHub Action, benchmark runner, or runtime logic:

- Add scenario metadata to every scenario.
- Add explicit `next proof required` to every scenario or delta report.
- Normalize evidence references so each scenario can distinguish existing
  source artifacts from synthetic reference evidence.
- Decide whether `pricing-copy` and `csv-export` need minimal fake fixture
  references before buyer-facing use.
- Define which sections are evaluator-facing and which are buyer-facing.
- Preserve soft verdict language and avoid merge-ready or production-proof
  claims.

These revisions are small documentation/schema-shaping edits. They do not
require app, backend, frontend, runtime, script, package, or AI integration
work.

## Ready/not-ready decision

Decision: `ready_for_report_schema`.

Why:

- The three scenarios are clear enough to derive a minimal common Proof Gap /
  delta-evidence report shape.
- The baseline failures are distinct and realistic: missing review gate, copy
  scope drift, and export proof gaps.
- The GoalRail paths consistently show the value of working contracts, bounded
  scope, and proof expectations.
- The current artifacts are not yet strict enough for renderer or parser work;
  the revise-before-build list should be handled before implementation.

## Non-goals

- no benchmark claims
- no statistical superiority claims
- no live AI agent claims
- no product runtime behavior
- no production proof claims
