# Pricing Copy - GoalRail Path

## Path

```text
raw task -> working contract -> bounded task packet -> implementation -> evidence -> evaluator
```

## GoalRail result

The GoalRail-guided path keeps the task bounded to copy:

- CTA text changes from `Start trial` to `Request access`
- existing CTA action is preserved
- pricing rules are unchanged
- billing logic is unchanged
- trial provisioning behavior is unchanged
- API behavior and database schema are unchanged

## Evidence available

This scenario expects deterministic reference evidence, not a live test run:

- UI copy evidence showing the changed CTA label
- artifact note that handler/route behavior remained unchanged
- artifact note that billing/API/schema surfaces were not changed

## Remaining proof gap

If the scenario only has static artifact evidence, the public verdict should
stay soft. The scenario can show improved scope adherence without claiming
production-grade proof.
