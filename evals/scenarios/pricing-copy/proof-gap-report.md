# Pricing Copy — Proof Gap Report

## Diagnostic status

This is a deterministic demo/eval artifact for `heurema/goalrail-demo`.

It is not production proof, not server-owned `Proof`, not PR verification, and
not merge approval. It is a manual diagnostic report shaped from the canonical
Goalrail `ProofGapReport` spec and the local scenario artifacts.

## Executive summary

The raw task asks for a narrow UI copy change: change the pricing card CTA from
`Start trial` to `Request access`.

The baseline path changes the visible label but drifts into billing, pricing,
or trial provisioning behavior. That creates a wide proof gap because the
reviewer now needs to inspect product behavior that was never part of the task.

The GoalRail path reconstructs the real contract boundary: UI copy only, with
billing logic, pricing rules, trial provisioning, API behavior, and database
schema explicitly out of scope.

Soft verdict: `scope_drift_detected`.

## Source inputs

- [task.md](task.md)
- [hidden-acceptance.md](hidden-acceptance.md)
- [baseline.md](baseline.md)
- [goalrail-contract.md](goalrail-contract.md)
- [goalrail.md](goalrail.md)
- [rubric.yaml](rubric.yaml)
- [delta-report.md](delta-report.md)

## Reconstructed working contract

Goal: change only the visible pricing card CTA copy from `Start trial` to
`Request access`.

Scope in:
- update the pricing card CTA label
- preserve existing CTA action, route, and side effects
- provide evidence that the visible copy changed
- provide evidence that adjacent behavior did not change

Scope out:
- billing logic
- pricing rules
- trial provisioning behavior
- API behavior
- database schema
- checkout flow
- access-request workflow
- analytics or tracking changes

Expected proofs:
- before/after UI text shows `Request access`
- diff or artifact summary shows display-copy-only change
- no API contract change
- no billing or trial provisioning behavior change
- no database schema change

## Scope boundary

The scenario boundary is copy-only UI behavior.

The task should not change what the CTA does. It should only change what the
CTA says.

## Scope delta

Aligned changes:
- CTA text changes to `Request access`.

Unexplained changes:
- baseline path changes CTA behavior or access-request behavior.
- baseline path may alter billing or trial provisioning assumptions.

Possible scope drift:
- any billing logic change
- any pricing rule change
- any trial provisioning change
- any API behavior change
- any database schema change

Missing expected changes:
- baseline does not provide no-drift evidence for API/schema/billing surfaces.

## Evidence map

Present evidence:
- task file defines the narrow copy request
- hidden acceptance lists behavior-preservation expectations
- baseline file describes out-of-scope behavior drift
- GoalRail contract names non-goals and expected proof
- delta report compares baseline drift against GoalRail bounded scope

Missing evidence:
- concrete UI before/after artifact
- concrete no-handler-change artifact
- concrete no-API-change artifact
- concrete no-schema-change artifact

Weak evidence:
- synthetic scenario notes can show the shape, but not actual repository diffs
  or runtime checks

Manual review evidence:
- reviewer should inspect whether any billing, provisioning, API, or schema
  surface changed

## Proof gaps

- Gap: baseline changes behavior outside the copy request.
  Severity: high.
  Evidence basis: `baseline.md`, `hidden-acceptance.md`, `delta-report.md`.
  Recommended next proof: show the exact changed surface and remove or explain
  any billing/provisioning/API/schema change.

- Gap: no concrete no-drift artifact exists yet.
  Severity: medium.
  Evidence basis: `goalrail-contract.md`, `goalrail.md`.
  Recommended next proof: add manual evidence showing copy-only change and no
  adjacent behavior changes.

- Gap: synthetic scenario is not tied to an existing demo UI surface.
  Severity: low.
  Evidence basis: scenario quality review buyer-readability caveat.
  Recommended next proof: add fake fixture or example UI reference before
  public demo use.

## Risk notes

- Risk: a small copy request can silently change business behavior.
  Reason: the baseline path treats the wording change as an access-flow change.
  Mitigation: keep non-goals explicit and require no-drift evidence.

- Risk: visible UI success hides behavior drift.
  Reason: the label looks correct even if the handler changed.
  Mitigation: require evidence for unchanged action, API, billing, and schema.

## Soft verdict

Status: `scope_drift_detected`.

Rationale: the baseline path satisfies the visible copy request but includes
unexplained behavior drift outside the reconstructed contract. The GoalRail
contract makes the intended scope and no-drift proof requirements explicit.

## Next required proofs

- Show the CTA text changed to `Request access`.
- Show the CTA action, route, and side effects stayed unchanged.
- Show no billing logic changed.
- Show no pricing rules changed.
- Show no trial provisioning behavior changed.
- Show no API behavior or database schema changed.

## Residual risks

- Without concrete artifacts, the report remains a manual reference example.
- A future renderer/parser must not turn this into a merge or deployment claim.
- A buyer-facing example may need a fake UI fixture to make the scenario easier
  to inspect.

## Baseline-vs-GoalRail delta

| Axis | Baseline | GoalRail | Diagnostic delta |
| --- | --- | --- | --- |
| acceptance | partial | pass | Baseline changes the label but fails hidden preservation requirements. |
| scope adherence | fail | pass | GoalRail blocks billing/provisioning drift through explicit non-goals. |
| proof coverage | fail | partial | GoalRail names required proof, but no automated harness exists. |
| regression safety | fail | partial | GoalRail narrows the regression surface to copy preservation. |
| change minimality | fail | pass | GoalRail keeps the task to one visible label. |
| review burden | fail | pass | GoalRail tells reviewers what should and should not have changed. |
| evidence quality | fail | partial | GoalRail requires copy and no-drift evidence. |
| out-of-scope changes | fail | pass | Baseline illustrates scope drift; GoalRail prevents it in the contract. |
| time-to-confidence | fail | pass | GoalRail makes the proof gap small enough to inspect quickly. |

This delta is a deterministic reference comparison, not a statistical benchmark.
