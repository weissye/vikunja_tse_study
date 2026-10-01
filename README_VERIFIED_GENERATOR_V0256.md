# OpenAPI-to-Verified-Provengo Generator 0.25.6

Version 0.25.6 closes the Vikunja validation cycle before applying the
methodology to another system.

## Evaluator correction

A sequential concurrency control is now valid only when both conditions hold:

1. its mutation and observation status codes satisfy the generated oracle; and
2. the independent observation proves that the intended value persisted.

If the server returns success but ignores or normalizes the field, the related
concurrent history is classified `INCONCLUSIVE`, not `VIOLATED`.  This prevents
unsupported concurrency-defect claims while retaining the complete evidence.

The correction also uses the actually varying field for domain same-field
oracles and compares JSON values without assuming that they are hashable.

## Vikunja offline re-evaluation

The immutable evidence from the final v0.25.5 run was evaluated again without
re-running the SUT:

- original result: 72 `INCONCLUSIVE`, 121 `PASS`, 42 `VIOLATED`;
- corrected result: 74 `INCONCLUSIVE`, 121 `PASS`, 40 `VIOLATED`;
- concurrency layer: 48 `INCONCLUSIVE`, 10 `PASS`, 0 `VIOLATED`.

The two changed histories are the PUT and PATCH `bucket_id` cases.  Their
sequential controls returned HTTP 200 but an independent GET observed
`bucket_id=0`, not either requested value.  Both are therefore control failures,
not concurrency defects.  The 40 remaining violations are contract-layer
findings, including the separately confirmed HTTP 304 no-op PATCH family.

## Validation

- 115 generator unit/regression tests pass.
- The existing Vikunja execution evidence is sufficient; no SUT re-run is
  required for this evaluator-only correction.
- The six-system generation matrix remains the portability acceptance gate for
  Library, Garage, Pharmacy, NetBox, Todoist, and Vikunja.

## Reproduction

Run all tests from the study root:

```powershell
$env:PYTHONPATH = ".\generator_baseline"
python -m unittest discover -s ".\generator_baseline\tests\unit" -p "test_*.py"
```

Run the six-system generation matrix with the supplied PowerShell wrapper:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& ".\scripts\Test-OpenApi-Verified-Generator-Matrix.ps1"
```

The Vikunja acceptance run need not be repeated.  Its trace, manifest, original
evaluation, corrected evaluation, evaluator source, and hashes are preserved in
the separate v0.25.6 offline re-evaluation archive.
