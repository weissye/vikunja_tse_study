# OpenAPI Verified Generator 0.25.4

This delta fixes the false semantic anomaly observed in the Vikunja acceptance
run `openapi-verified-vikunja-20260922_235007_709` and tightens the evidence
rules for generated concurrency verification.

## What was wrong

The Vikunja OpenAPI operation for partial updates advertises several request
media types. The execution planner selected the first variant
(`application/json-patch+json`, an array), while verifier generation selected
`application/merge-patch+json` (an object). As a result, the generated PATCH
could send no body, Vikunja correctly returned HTTP 422, and the evaluator
incorrectly reported a semantic anomaly. The same run also contained no
concurrent epoch, but that absence was not visible in the final verdict.

## Changes

- One shared request-variant selector is used by planning, rendering, and
  verifier derivation. PATCH prefers an object-shaped merge-patch variant when
  the contract provides one.
- Generated calls set the selected request `Content-Type` explicitly.
- Positive baseline stories send required fields plus one safe mutation field;
  unrelated optional fields and unbound identifiers are omitted.
- Dependencies referring to the same target entity bind to the same generated
  instance, preventing path/body identity disagreement.
- Successful creates and updates schedule an OpenAPI-derived item GET when an
  item-read operation exists. Delete absence checks are generated only when the
  item GET documents the required not-found response.
- The trace records request media type. The evaluator validates request-body
  preconditions before attributing a response mismatch to the SUT. Invalid
  generated input is `INCONCLUSIVE`, never `VIOLATED`.
- A run with ready concurrency oracles but no exercised concurrent epoch is
  explicitly `INCONCLUSIVE`.
- Unbounded numeric generators use small positive values instead of extreme
  values that are legal by type but poor positive baselines.

All rules above are derived from OpenAPI structure. No Vikunja-specific field
names, values, or business rules were added.

## Verification performed

- Unit/regression suite: 124 tests passed; 3 external-SUT integration tests
  skipped because their SUT fixtures were unavailable in the build environment.
- Generated JavaScript passed `node --check`.
- Independent static validation covered every declared Vikunja operation and
  response code.
- Six-spec generation matrix passed for Library, Garage, Pharmacy, NetBox,
  Todoist, and Vikunja, with complete contract-verifier coverage and zero
  manual assumptions.
- Re-evaluating the supplied failing HTTP trace produced `VIOLATED=0`. The bad
  PATCH is now `INCONCLUSIVE` with reason
  `invalid-test-input:required-request-body-missing`; missing concurrency is
  separately reported as `no-concurrent-epoch-was-exercised`.

## Apply and run on Windows

Extract the delta ZIP into the study root, preserving paths:

```powershell
Set-Location "C:\work\temp\vikunja_tse_study"
Expand-Archive ".\openapi-verified-generator-v0.25.4-delta.zip" "." -Force
```

Run the regression suite through the wrapper so the package root is configured
correctly:

```powershell
& ".\scripts\Test-OpenApi-Verified-Generator-Matrix.ps1"
```

Regenerate and execute Vikunja evidence:

```powershell
$spec = (Resolve-Path ".\phase12-linearizable-conflicts\vikunja-multi-resource-openapi.json").Path

& ".\scripts\Invoke-OpenApi-Verified-Generator.ps1" `
  -OpenApi $spec `
  -Output ".\generated\vikunja-verified" `
  -Name "vikunja_verified" `
  -BaseUrl "http://127.0.0.1:3457"

& ".\scripts\Invoke-OpenApi-Verified-Vikunja-Acceptance.ps1"
```

The acceptance result must not be interpreted as a concurrency pass unless the
evaluation reports a nonzero `concurrency_oracles_exercised` value.
