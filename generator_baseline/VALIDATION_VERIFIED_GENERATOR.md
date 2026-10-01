# Validation record: OpenAPI-only verified generator

## Scope

This release extends the existing OpenAPI-to-Provengo generator with generated
contract, state, and concurrency verifiers. The implementation is deliberately
application-neutral: it consumes only the supplied OpenAPI document and does
not encode system names, field names, business rules, seeded defects, or
undocumented status semantics.

## Five-contract generation matrix

| Contract | Operations | Contract verifiers | Mutations | State verified | Contract only | Concurrency oracles |
|---|---:|---:|---:|---:|---:|---:|
| Vikunja | 29 | 29 | 20 | 10 | 10 | 71 |
| Garage | 32 | 32 | 20 | 18 | 2 | 46 |
| Library | 13 | 13 | 8 | 1 | 7 | 0 |
| Pharmacy | 29 | 29 | 18 | 10 | 8 | 12 |
| NetBox projection | 12 | 12 | 6 | 2 | 4 | 2 |

For all five inputs, complete base generation and verifier generation
completed successfully. Every generated JavaScript file passed `node --check`.
Every coverage manifest reported `coverage_complete=true` and zero manual
assumptions.

`CONTRACT_ONLY` is an explicit result, not missing implementation. It means
that the contract supports checking the response but does not document enough
information to construct a safe follow-up observation. The generator does not
invent that information.

## Replay against the preserved Vikunja Increment 9 trace

The generic evaluator, using only the generated Vikunja manifest, reported:

- concurrency: 3 violated, 2 passed, 0 inconclusive;
- the three violations were `successful-disjoint-update-lost` for epochs 0, 1,
  and 3;
- the same-field history in epoch 2 passed;
- the disjoint control history in epoch 5 passed.

This independently reproduces the Increment 9 lost-update finding without a
Vikunja-specific oracle. Update/delete was not classified because the supplied
OpenAPI projection does not document the item-read absence status; inferring
one would violate the OpenAPI-only method.

The evaluator also reported three response-contract deviations: two item reads
and one delete returned 404 although those operation contracts did not document
404. One create-visibility witness was inconclusive because that preserved
trace did not contain the required follow-up project read. These results are
kept visible rather than suppressed.

## Test boundary

The focused verifier suite contains eight passing tests, including a regression
test that proves every request inside a concurrent epoch retains an individual
response-contract witness. The archived baseline suite has one known fixture
omission: `holdout/todoist_rest_v2_openapi.yaml` is absent from the supplied
checkpoint. That missing input is not created or substituted by this release.

Container-backed execution against the user's local SUTs remains the acceptance
test. This build environment performed generation, static validation, syntax
checks, and trace replay; it did not claim a fresh Docker execution of all five
systems.
