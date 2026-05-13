# Scenario Packet Renderer Readiness Review

## Purpose

This review checks whether Scenario Packet v0 files contain enough structured
information to support a future local renderer for Proof Gap Reports.

The review is intentionally docs-only. It does not approve renderer logic,
parser logic, benchmark runner behavior, AI runtime, app/runtime behavior, or
production proof claims.

## Review criteria

Each scenario packet is evaluated against:

- enough task intent for report summary
- enough hidden acceptance / inferred acceptance
- enough baseline failure detail
- enough GoalRail contract boundary detail
- enough proof gap detail
- enough risk/residual risk detail
- enough delta axis detail
- references complete and useful
- avoids duplicating full markdown content
- keeps markdown files as human-readable artifacts
- ready for deterministic rendering

## Per-scenario review table

| Scenario | Task intent | Hidden acceptance | Baseline failure | Contract boundary | Proof gaps | Risks | Delta axes | References | No full duplication | Markdown remains source | Renderer-ready |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `workflow-change` | pass | pass | pass | pass | partial | partial | partial | pass | pass | pass | partial |
| `pricing-copy` | pass | pass | pass | pass | partial | partial | partial | pass | pass | pass | partial |
| `csv-export` | pass | pass | pass | pass | partial | partial | partial | pass | pass | pass | partial |

### `workflow-change`

Rationale:

- The packet has clear task intent, hidden acceptance, baseline direct-approval
  failure, and GoalRail review boundary.
- It can drive a basic reconstructed contract and soft verdict.
- Proof gaps are useful but do not cover every manual report gap, such as the
  sandbox proof limit as a first-class gap.
- Delta axes contain scores but not renderer-ready rationale text.
- Risk notes and residual risks are present but lack reason/mitigation fields
  used by the manual report.

### `pricing-copy`

Rationale:

- The packet captures the narrow copy task and the scope-drift baseline failure.
- The GoalRail contract boundary is strong and directly renderable.
- Proof gaps name the main drift and missing no-drift evidence.
- The packet does not include explicit scope delta fields such as aligned
  changes, unexplained changes, possible scope drift, and missing expected
  changes.
- Delta axes are scores only, so a renderer would need to invent rationale or
  pull it from markdown.

### `csv-export`

Rationale:

- The packet captures the data-access nature of the task and the hidden
  permission/minimization/filter constraints.
- The GoalRail contract boundary and expected proofs are strong.
- Proof gaps are enough for a short report but omit some manual report texture,
  such as artifact-only limits.
- Risk notes are useful but too thin for the manual report's
  risk/reason/mitigation shape.
- Delta axes are consistent but lack explanatory text per axis.

## Cross-scenario findings

### Fields that are consistently useful

- `intent` is enough to generate a short task summary.
- `hidden_acceptance` is enough to generate inferred acceptance bullets.
- `baseline_path.summary` and `baseline_path.failure_modes` are enough to
  describe the baseline failure mode.
- `goalrail_path.contract_boundary` is enough to generate a reconstructed
  contract and basic scope boundary.
- `proof_gap_report.soft_verdict` uses the correct safe vocabulary.
- `proof_gap_report.proof_gaps` provides severity and next proof hooks.
- `references` consistently point to the local human-readable artifacts.

### Fields that are too thin

- `delta_axes` has scores but no per-axis rationale.
- There is no explicit `scope_delta` object for aligned changes, unexplained
  changes, possible scope drift, and missing expected changes.
- There is no explicit `evidence_map` object for present, missing, weak, and
  manual-review evidence.
- `risk_notes` only has description, not reason or mitigation.
- `residual_risks` has no owner hint or follow-up proof target.
- There is no explicit diagnostic status block for renderer-safe disclaimers.

### Fields that duplicate markdown

- `goalrail_path.contract_boundary.scope_in`, `scope_out`, `non_goals`, and
  `expected_proofs` intentionally summarize the contract markdown.
- `proof_gap_report.proof_gaps` intentionally summarize the manual report.
- This duplication is acceptable because the packet is a machine-readable
  index, but it should stay concise and not become a second full report.

### Fields that should be required before renderer

- `scope_delta`
- `evidence_map`
- `delta_axes.<axis>.rationale` or equivalent per-axis delta text
- `risk_notes.reason`
- `risk_notes.mitigation`
- `diagnostic_status` or a fixed renderer-owned disclaimer policy

### Fields that should remain optional

- buyer-facing short title or display copy
- external reference artifacts
- fixture/sample data references
- owner hints for residual risks
- source/readout links beyond the local required references

## Renderer feasibility

| Report section | Feasibility | Notes |
| --- | --- | --- |
| Executive summary | can_generate_now | Use `intent`, `baseline_path.summary`, `goalrail_path.contract_boundary`, and `soft_verdict`; output will be short. |
| Reconstructed contract | can_generate_now | `goalrail_path.contract_boundary` maps directly to goal/scope/non-goals/expected proofs. |
| Scope boundary | can_generate_now | Can be derived from contract boundary, but a dedicated boundary summary would improve consistency. |
| Proof gaps | can_generate_now | `proof_gap_report.proof_gaps` is structured enough for a basic section. |
| Risk notes | needs_more_packet_data | Current risks lack reason/mitigation structure. |
| Soft verdict | can_generate_now | Safe verdict is explicit and validated by the checker. |
| Delta summary | needs_more_packet_data | Scores exist, but per-axis rationale is not in the packet. |
| Next required proofs | can_generate_now | Each proof gap has `next_required_proof`; may need deduplication. |

Additional canonical report sections not listed above, such as evidence map and
scope delta, currently need more packet data or should remain manual.

## Packet revisions before renderer

Before implementing a renderer, revise Scenario Packet v0 or the current packet
files to add:

- `scope_delta.aligned_changes`
- `scope_delta.unexplained_changes`
- `scope_delta.possible_scope_drift`
- `scope_delta.missing_expected_changes`
- `evidence_map.present_evidence`
- `evidence_map.missing_evidence`
- `evidence_map.weak_evidence`
- `evidence_map.manual_review_evidence`
- `delta_axes.<axis>.rationale`
- `risk_notes.reason`
- `risk_notes.mitigation`
- a fixed diagnostic disclaimer policy or `diagnostic_status` field

Do not pull these fields from markdown during renderer work. Add them to the
packet explicitly if deterministic rendering is the goal.

## Recommended renderer input contract

### Required fields

- `id`
- `title`
- `status`
- `intent`
- `hidden_acceptance`
- `baseline_path.summary`
- `baseline_path.failure_modes`
- `goalrail_path.contract_boundary`
- `proof_gap_report.soft_verdict`
- `proof_gap_report.proof_gaps`
- `scope_delta`
- `evidence_map`
- `delta_axes`
- `risk_notes`
- `residual_risks`
- `references`

### Optional fields

- buyer-facing title or subtitle
- source artifact links beyond local required references
- fixture/sample data references
- owner hints for residual risks
- report display notes

### Fields that should not be parsed from markdown

- soft verdict
- proof gaps
- next required proofs
- delta axis scores and rationale
- scope delta
- evidence map
- risk reason/mitigation
- production-proof disclaimers

### Fields that may still reference markdown

- `references.task`
- `references.hidden_acceptance`
- `references.baseline`
- `references.goalrail_contract`
- `references.goalrail`
- `references.rubric`
- `references.delta_report`
- `references.proof_gap_report`
- optional external proof/readout reference artifacts

## Decision

Decision: `revise_packets_first`.

Why:

- Current packets are good enough for structural checking and a basic report
  skeleton.
- They are not yet rich enough for deterministic Proof Gap Report rendering
  without deriving missing sections from prose.
- The main blockers are missing `scope_delta`, missing `evidence_map`, and thin
  delta/risk rationale.
- A renderer brief should come after those packet revisions so the renderer can
  consume structured data rather than scrape markdown.

## Non-goals

- no renderer implemented
- no parser implemented
- no benchmark runner
- no AI runtime
- no app/runtime behavior
- no production proof claims
- no statistical superiority claims
