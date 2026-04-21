# Workflow Change — Proof Template

## Contract reference

- Scenario: `workflow-change`
- Contract draft path: `demo/proof-packs/workflow-change/contract-draft.md`
- Task plan path: `demo/proof-packs/workflow-change/task-plan.md`

## What changed

- [Summarize the implemented workflow change]

## Checks run

- `npm run reset`
- `npm run typecheck`
- `npm run api:build`
- `npm run web:typecheck`
- `npm run web:build`
- `npm run smoke`
- [add any manual checks used in the demo]

## Acceptance criteria results

| Criterion | Result | Evidence |
| --- | --- | --- |
| Review step exists before approval | [pass / fail] | [evidence] |
| Owner is required | [pass / fail] | [evidence] |
| Decision reason is required | [pass / fail] | [evidence] |
| Dashboard reflects review state | [pass / fail] | [evidence] |
| Audit log shows decision details | [pass / fail] | [evidence] |

## Before / after behavior

### Before
- direct approval was possible from the baseline app

### After
- [describe the new review-gated behavior]

## Audit evidence

- request id:
- reviewer actor:
- from status:
- to status:
- reason:
- timestamp:

## Open risks

- [remaining risk 1]
- [remaining risk 2]

## Final verdict

Choose one:
- `accept`
- `block`
- `escalate`

### Verdict summary

- [one-sentence conclusion]
