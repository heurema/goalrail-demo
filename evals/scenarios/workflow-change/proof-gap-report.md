# Workflow Change — Proof Gap Report

## Diagnostic status

This is a deterministic demo/eval artifact for `heurema/goalrail-demo`.

It is not production proof, not server-owned `Proof`, not PR verification, and
not merge approval. It is a manual diagnostic report shaped from the canonical
Goalrail `ProofGapReport` spec and the local scenario artifacts.

## Executive summary

The baseline path preserves the visible weakness: a `qualified` trial request
can move directly to approval without a second reviewer.

The GoalRail path narrows the proof gap by requiring `manual_review`, reviewer
actor, assigned owner, decision reason, and audit evidence. The remaining gap
is not code proof; it is workflow proof and audit confidence inside a local
deterministic sandbox with fake data and no real auth.

Soft verdict: `aligned_but_proof_incomplete`.

## Source inputs

- [task.md](task.md)
- [hidden-acceptance.md](hidden-acceptance.md)
- [baseline.md](baseline.md)
- [goalrail-contract.md](goalrail-contract.md)
- [goalrail.md](goalrail.md)
- [rubric.yaml](rubric.yaml)
- [delta-report.md](delta-report.md)

Reference source artifacts:

- [../../../demo/proof-packs/workflow-change/proof-sample.md](../../../demo/proof-packs/workflow-change/proof-sample.md)
- [../../../demo/proof-packs/workflow-change/readout-sample.md](../../../demo/proof-packs/workflow-change/readout-sample.md)

## Reconstructed working contract

Goal: add a bounded manual review step before trial request approval.

Scope in:
- block direct approval from intake states in the GoalRail path
- require `manual_review` before approval
- require reviewer actor
- require assigned owner
- require decision reason
- show audit evidence for the review decision
- keep baseline mode available for before/after comparison

Scope out:
- real auth or role enforcement
- notifications
- policy profiles
- generic workflow engine behavior
- production customer proof

Expected proofs:
- direct approval is blocked in GoalRail mode
- `manual_review` is visible
- owner and reason are required before review approval
- audit evidence captures actor, from/to status, owner, reason, and timestamp
- deterministic reset keeps baseline replay possible

## Scope boundary

The scenario boundary is workflow/audit behavior only.

It should show whether the approval path has enough review evidence. It should
not claim that repository code, production permissions, or deployment safety
were checked.

## Scope delta

Aligned changes:
- GoalRail path adds `manual_review` before approval.
- GoalRail path requires reviewer actor, owner, and reason.
- GoalRail path exposes audit evidence.
- Baseline path remains available as the before-state.

Unexplained changes:
- none in the current reference scenario artifacts.

Possible scope drift:
- adding real permissions, notifications, policy profiles, or generic workflow
  engine behavior would exceed this scenario.

Missing expected changes:
- none for the deterministic scenario shape.

## Evidence map

Present evidence:
- baseline documents direct approval from `qualified`
- GoalRail contract states the review boundary
- GoalRail result states `manual_review`, actor, owner, reason, and audit
  evidence
- source proof/readout artifacts document the deterministic demo behavior
- rubric covers acceptance, scope, proof, regression, minimality, review burden,
  evidence, out-of-scope changes, and time-to-confidence

Missing evidence:
- real role-based authorization
- production audit persistence
- production customer data handling
- independent reviewer signoff outside the sandbox

Weak evidence:
- reviewer actor is visible, but not backed by real auth
- proof/readout artifacts are local reference artifacts, not production proof

Manual review evidence:
- `manual_review` state
- reviewer actor
- assigned owner
- decision reason
- audit trail fields

## Proof gaps

- Gap: baseline direct approval does not prove review-gated approval.
  Severity: high.
  Evidence basis: `baseline.md`, `hidden-acceptance.md`, `delta-report.md`.
  Recommended next proof: show direct approval blocked in GoalRail mode.

- Gap: reviewer actor visibility is not role enforcement.
  Severity: medium.
  Evidence basis: `goalrail.md`, source proof/readout artifacts.
  Recommended next proof: in a later implementation slice, add real permission
  evidence before claiming role enforcement.

- Gap: sandbox proof is not production proof.
  Severity: medium.
  Evidence basis: scenario non-goals and source proof limits.
  Recommended next proof: run the same contract/proof shape on a private repo
  case during a one-repo pilot.

## Risk notes

- Risk: users may read the audit evidence as production governance.
  Reason: the scenario is realistic and inspectable.
  Mitigation: keep deterministic sandbox disclaimers visible.

- Risk: review-gated approval may be confused with security or compliance.
  Reason: owner/reason/audit language can sound stronger than the demo boundary.
  Mitigation: state that this is workflow evidence, not a security audit.

## Soft verdict

Status: `aligned_but_proof_incomplete`.

Rationale: the GoalRail path is aligned with the reconstructed contract and has
clear workflow/audit evidence, but it remains a deterministic sandbox artifact
without real auth, production audit guarantees, or server-owned `Proof`.

## Next required proofs

- Show the blocked direct approval path in the deterministic demo.
- Show `manual_review -> approved` requiring reviewer actor, owner, and reason.
- Show audit evidence for actor, status transition, owner, reason, and
  timestamp.
- For any real pilot claim, repeat the same report shape on a private repo case.

## Residual risks

- Real role enforcement is not present.
- The scenario does not prove production audit durability.
- It does not cover notifications, policy profiles, or broader workflow
  lifecycle behavior.
- It should not be used as a production approval artifact.

## Baseline-vs-GoalRail delta

| Axis | Baseline | GoalRail | Diagnostic delta |
| --- | --- | --- | --- |
| acceptance | partial | pass | GoalRail satisfies the manual review requirement in the scenario. |
| scope adherence | partial | pass | GoalRail keeps the change to the review boundary. |
| proof coverage | fail | pass | GoalRail names and references workflow/audit evidence. |
| regression safety | partial | pass | GoalRail keeps deterministic reset/smoke evidence in scope. |
| change minimality | partial | pass | GoalRail limits the scenario to manual review before approval. |
| review burden | fail | pass | GoalRail reduces inference with a contract and proof map. |
| evidence quality | partial | pass | GoalRail names the checks and audit fields. |
| out-of-scope changes | partial | pass | GoalRail excludes auth, notifications, and generic workflow work. |
| time-to-confidence | fail | pass | GoalRail makes the expected proof visible before review. |

This delta is a deterministic reference comparison, not a statistical benchmark.
