# OpenAPI verified generator 0.25.1 validation

This delta completes the runtime path that was missing from 0.25.0.

## Corrected design gap

The Increment 9 adapter was intentionally Vikunja/task-specific and therefore
could not execute generic generated epochs. Version 0.25.1 provides a transport-
only adapter and configurable trace proxy with no resource paths, field names,
or domain values. Deployment authentication and API prefix remain runtime
configuration, not generator semantic inputs.

The OpenAPI-only binder now combines documented create-response identities with
documented create-request path parameters. This permits cross-path lifecycle
bindings such as a nested collection create followed by an item operation at a
different documented path, without relying on application knowledge.

## Vikunja result

- operations / contract verifiers: 29 / 29;
- mutations: 20;
- state verified / contract only: 12 / 8;
- concurrency oracles: 71;
- concrete runtime-ready concurrency schedules: 60;
- runtime-ready task schedules: 24;
- manual assumptions: 0.

The earlier 0.25.0 output had only 34 runtime-ready schedules and none for the
task resource. The corrected generic binding includes the same operation family
in which the real lost-update defect was observed.

## Validation

- focused tests: 10 passed;
- generic adapter smoke test: passed;
- generic trace proxy smoke test: passed;
- generated JavaScript syntax checks: passed for all five contracts;
- five-contract generation: passed with complete contract coverage and zero
  manual assumptions;
- preserved Increment 9 trace replay: concurrency 3 violated, 2 passed,
  0 inconclusive.

The archived baseline test suite reports one unrelated missing fixture,
`holdout/todoist_rest_v2_openapi.yaml`; 84 tests pass and 3 are skipped. The
fixture is not fabricated or replaced by this delta.
