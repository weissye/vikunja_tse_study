# Phase 1 findings: unmodified generator

## Result

The frozen v38 generator successfully parsed and rendered the full Vikunja v2
contract and the fixed core projection. Static representation is complete, but
the core model is not yet semantically adequate for execution.

## Full contract

- OpenAPI: 3.0.3
- Paths: 141
- Operations represented: 205/205
- Response codes represented: 206/206
- Inferred entity families: 17
- Reported ambiguities: 20
- JavaScript syntax: PASS

Observed false-positive candidate:

- `admin/users.username -> avatar`

## Fixed core boundary

- Scope: projects, tasks, labels, and task-label association
- Operations represented: 21/21
- Response codes represented: 21/21
- Entity families: projects, tasks, labels
- JavaScript syntax: PASS
- Dependency edges: 0

## Blocking semantic gap

The current generic inference treats `POST /projects/{project}/tasks` as an
action belonging to the projects family instead of recognizing it as the
producer for a task whose prefix depends on a project. Consequently, the task
family has no producer story and the graph omits `tasks -> projects`.

Likewise, `/tasks/{task}/labels` is represented as an action but does not carry
both resource dependencies needed for a meaningful task-label association.

## Decision

Do not begin a bug-finding campaign with this model. The next implementation
step is a generic nested-resource inference rule, validated against synthetic
unit contracts and all preserved benchmark goldens. No Vikunja-specific story
or binding should be introduced.

## Test status

The extracted generator snapshot executed 78 unit/integration tests:

- 74 passed
- 3 skipped
- 1 could not execute because the frozen artifact does not contain the
  Todoist holdout OpenAPI file referenced by that golden test

The failure is an absent test input, not a failed assertion or regression in
the Vikunja work.

