# Evaluation Scenarios

This directory is for deterministic baseline-vs-GoalRail reference and eval
artifacts.

Scenarios compare two paths for the same task:

```text
Baseline:
raw task -> direct implementation / raw AI-style implementation -> result -> evaluator

GoalRail:
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

These are not production proof artifacts and not benchmark claims.

## Scenario index

- `workflow-change` - existing manual-review scenario. Baseline keeps direct
  approval possible; GoalRail requires `manual_review`, reviewer actor, owner,
  decision reason, and audit evidence.
- `pricing-copy` - narrow UI copy scenario. Baseline illustrates scope drift
  into billing or provisioning behavior; GoalRail constrains the change to CTA
  copy and no-drift evidence.
- `csv-export` - data export scenario. Baseline produces visible CSV without
  enough permission/minimization proof; GoalRail captures role limits, allowed
  fields, filter preservation, and blocked unauthorized export evidence.

## Scenario layout

Recommended layout:

```text
evals/scenarios/<scenario-id>/
  task.md
  hidden-acceptance.md
  baseline.md or baseline.diff
  goalrail-contract.md
  goalrail.md or goalrail.diff
  rubric.yaml
  delta-report.md
  proof-gap-report.md
  scenario.yaml
```

Scenario packs may include `scenario.yaml` as a machine-readable summary/index.
Markdown files remain the human-readable source/reference artifacts.
`scenario.yaml` is not production evidence or a product data model; it is only
for deterministic eval/demo packets.
Scenario Packet v0 includes renderer-supporting fields such as scope delta,
evidence map, next proofs, delta rationale, and risk mitigation, but those
fields still describe eval/demo artifacts only.

Use the smallest artifact set needed for the scenario. If a scenario references
existing proof/readout samples, link to them instead of copying large content.

`proof-gap-report.md` is the diagnostic artifact shape for the scenario:
intent, reconstructed contract, scope delta, evidence map, proof gaps, soft
verdict, next proofs, and residual risks.

`delta-report.md` is the paired comparison / eval readout between baseline and
GoalRail paths.

Neither file is production proof.

## Local check

Run:

```bash
npm run evals:check
npm run evals:check:selftest
```

These are local deterministic scenario-pack checks only. The self-test uses
temporary invalid fixtures to prove failure modes. `evals:check` validates both
markdown artifacts and `scenario.yaml` packet structure. They do not run app,
backend, frontend, benchmark, AI, renderer/parser, or runtime behavior.

## Rules

- Scenarios are deterministic reference/eval artifacts only.
- Use fake data only.
- Do not include secrets, credentials, private customer data, or PII.
- Do not call external APIs.
- Do not require live AI agents.
- Do not imply production proof or benchmark claims.

## Adding scenarios

Future scenarios should preserve the paired comparison:
- same raw task for both paths
- clear baseline result
- explicit GoalRail contract / bounded task packet
- comparable evidence for both paths
- deterministic rubric
- delta report that explains the difference in scope, evidence, safety, review
  burden, and time-to-confidence
- proof gap report that keeps diagnostic verdicts separate from production
  proof or merge approval
