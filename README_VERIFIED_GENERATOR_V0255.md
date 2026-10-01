# OpenAPI-to-Verified-Provengo Generator 0.25.5

## Purpose

Version 0.25.5 prevents one undocumented HTTP response from terminating a
generated campaign before concurrency epochs run, and adds an independent,
repeatable investigation of the Vikunja `PATCH /projects/{id}` 304 candidate.

The methodological boundary remains strict:

- generation, state verifiers, and concurrency oracles use only the OpenAPI;
- the generated source retains the exact documented response codes;
- only disposable Provengo runtime copies accept all HTTP statuses, so the
  actuator can continue;
- the preserved HTTP trace and generated evaluator remain the authoritative
  contract oracle;
- Vikunja-specific confirmation is post-discovery analysis and is never fed
  back into generation.

## What the prior run established

Evidence `openapi-verified-vikunja-20260923_063238_202-review.zip` contains eight
HTTP events. Its last event is a syntactically valid merge-patch request:

```text
PATCH /api/v2/projects/11
Content-Type: application/merge-patch+json
Body: {"is_archived":false}
Observed status: 304
OpenAPI documented success: 200
```

The generated evaluator reported `PASS=6`, `VIOLATED=1`, `INCONCLUSIVE=4`, and
`SEMANTIC_ANOMALY`. The resource already had `is_archived=false`, so this was a
no-op update. This is a valid contract-violation candidate, but one observation
is not enough to call it a confirmed Vikunja defect. The original run executed
zero concurrency epochs because Provengo entered fail mode on the unexpected
304. Version 0.25.5 addresses both limitations.

## Generator changes

1. Update stories read the current resource before mutation and derive a
   runtime-distinct value. Booleans are toggled, enums select another value,
   numbers move within documented bounds, and unconstrained strings receive a
   deterministic suffix when necessary.
2. Create and mutation stories propagate identifiers and readiness events only
   after a documented success response. A failed operation emits
   `SBT:OperationDidNotSucceed`; interface functions emit
   `SBT:OperationOutcome` instead of a misleading normal completion event.
3. The acceptance runner patches only disposable runtime copies of the
   generated interface and verifier. Provengo therefore observes statuses
   100--599 without entering fail mode. Immutable generated files still contain
   the OpenAPI status lists and the trace evaluator still reports violations.
4. A generic post-discovery confirmation engine and a Vikunja wrapper perform
   controlled A/B confirmation and freeze reproducible evidence.

## Candidate confirmation protocol

Each trial performs:

1. create a new project;
2. GET the baseline state;
3. PATCH `is_archived` with the already-observed value (no-op A);
4. GET and verify state preservation;
5. PATCH the opposite value (state-changing control B);
6. GET and verify that B persisted;
7. PATCH the new value again (no-op A2);
8. GET and verify state preservation;
9. delete the trial project.

`CONFIRMED` requires both no-op PATCH requests to return the same undocumented
status, while the state-changing control returns the documented success status
and its new value is observed. State corruption is reported separately as
`STATE_VIOLATION`. Transport or setup failures remain `INCONCLUSIVE`.

The evidence ZIP includes the complete HTTP trace, per-trial classification,
run metadata, generated verifier manifest, container identity (when available),
SHA-256 inventory, and a hash link to the discovery ZIP. Authorization tokens
are not recorded.

## Install on the Windows study tree

From `C:\work\temp\vikunja_tse_study`, expand the delta into the repository
root:

```powershell
Expand-Archive `
  ".\openapi-verified-generator-v0.25.5-delta.zip" `
  -DestinationPath "." `
  -Force
```

Run the regression and six-system matrix already present in the study:

```powershell
python ".\generator_baseline\tests\unit\test_v0255_campaign_continuation.py"
& ".\scripts\Test-OpenApi-Verified-Generator-Matrix.ps1"
```

## Run the corrected Vikunja campaign

Regenerate the Vikunja artifacts first so the acceptance run uses the 0.25.5
story and interface semantics:

```powershell
$spec = (
  Resolve-Path `
  ".\evidence\increment6-linearizable-conflicts-evidence-20260922_001635\model\vikunja-multi-resource-openapi.json"
).Path

& ".\scripts\Invoke-OpenApi-Verified-Generator.ps1" `
  -OpenApi $spec `
  -Output ".\generated\vikunja-verified" `
  -Name "vikunja_verified" `
  -BaseUrl "http://127.0.0.1:3457"
```

The token belongs to the PostgreSQL instance on port 3466. Prepare and run in
the same PowerShell process:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& ".\scripts\Prepare-Vikunja-Increment8_2.ps1"
& ".\scripts\Invoke-OpenApi-Verified-Vikunja-Acceptance.ps1"
```

Expected methodological outcome: an undocumented response is recorded as a
verifier violation, but it does not stop later generated actions or concurrency
epochs. The final verdict still comes from the external evaluator.

## Confirm the discovered 304 candidate

After preparation, and still in the same PowerShell process:

```powershell
& ".\scripts\Confirm-Vikunja-Patch304Candidate.ps1" `
  -Trials 10 `
  -Target "http://127.0.0.1:3466" `
  -Container "vikunja-increment8-2-postgres"
```

The command prints the evidence ZIP path and one of:

- `CONFIRMED`: repeatable contract deviation with a successful changing control;
- `STATE_VIOLATION`: a no-op unexpectedly changed observable state;
- `PARTIAL`: the undocumented status was not repeatable;
- `NOT_REPRODUCED`: no-op PATCH returned a documented status;
- `INCONCLUSIVE`: infrastructure, authentication, or control failure.

Do not describe the 304 behavior as a confirmed Vikunja bug until this direct
confirmation completes. If confirmed, report it as a response-contract defect
for a valid no-op PATCH; keep it separate from the previously confirmed
cross-backend lost-update defect.

## Local validation performed

- 112 unit tests: PASS.
- Six-system generation matrix: PASS for Library, Garage, Pharmacy, NetBox,
  Todoist, and Vikunja.
- Every system retained complete contract-verifier coverage and zero manual
  assumptions.
- Vikunja: 29 operations, 29 contract verifiers, 20 mutations, 12
  state-verified mutations, and 71 concurrency oracles.
- Disposable runtime transformation: 395 status-list replacements across the
  Vikunja interface and verifier copies; generated sources remained unchanged.
