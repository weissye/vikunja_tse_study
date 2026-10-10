# Vikunja Transfer v015 — contract-derived schema rejection checks

## Scope and first run

v014 remains unchanged as the accepted positive baseline. v015 adds isolated
schema-invalid updates on newly created, owned resources, after their valid
prefix and before the final positive suffix. Defaults: one existing research
owner, two instances per resource, six prefix update/read rounds, seed 1.
HTTP dispatch remains sequential and dependency-constrained by native Provengo.
No accounts, permissions or shared-resource topology are changed.

The contract yields these cases on selected update fields:

| Resource | Selected field | Wrong type | Below minLength | Above maxLength |
|---|---|---|---|---|
| Label | title | integer 42 | empty string | 251 characters |
| Project | title | integer 42 | empty string | 251 characters |
| Task | title | integer 42 | empty string | Not declared |
| Team | name | integer 42 | empty string | 251 characters |

These are 11 cases per instance, 22 total. Each has an invalid request and
independent readback. The 128-step positive graph plus 44 new steps totals
172 research requests, 173 bthreads and 20 parent membership observations.
Login and read-only preflight requests are additional. No full campaign is
automatically dispatched.

`negative_v015.py` derives cases from the selected original request schema,
not a hard-coded resource/endpoint list. Case records retain the violated
constraint, invalid value, schema pointer and documented response pointer.
This increment supports selected string fields, type and min/max length only.
Required, numeric range, enum and pattern tests across other fields are future
work. Compound string constraints are blocked rather than mislabeled as an
isolated violation; generated payloads are bounded to at most 4097 characters.

## Oracles and methodological limits

For these update operations the contract explicitly describes 400 as an
invalid-object response. Combining that documentation with a demonstrated
request-schema violation yields the declared expected status 400. No role or
ownership denial is inferred from these cases. An operation without documented
400 is blocked by this first-increment policy.

Rejected-write preservation is a **declared research policy**, not a postcondition
explicitly present in OpenAPI. It checks only the observed identity, selected
scalar and inferred parent-ID projection; it is not proof that every database
field or related resource is unchanged. Each readback compares to the actual
preceding valid observation. No positive mutation of the same instance can
intervene between the baseline, invalid request and readback.

Invalid requests allow observed 2xx through 5xx to reach the callback so an
unexpected response does not prevent the following readback. The callback
records expected rejection, unexpected acceptance, server error or other status
mismatch; the subsequent readback records the measured projection. Acceptance
requires both expected rejection and unchanged projection. A negative request's
step-completion marker does not mean it passed its oracle; only the paired
readback verdict establishes that. The runner independently checks all 22
readback verdicts before accepting. Network failure or an unavailable readback
does not count as a passed case.

The run stops after the first observed failed consistency check, preserving
partial callbacks and counts. Failure is a candidate observation requiring
review, controlled repetition and possible minimization; not an automatically
confirmed product bug. No automatic replay is implemented.

The frozen Method Spec v001 is included unchanged. This negative-testing
increment is an explicit extension, not a claim that its oracles were part of
the already frozen positive evaluation protocol. All earlier live evidence is
preserved separately and not relabeled as negative coverage.

## Run

Requires Python 3.10+, Java and the existing Provengo 0.7.5-SNAPSHOT JAR:

```powershell
.\Run-Vikunja-Stage5-v015.ps1 `
  -StudyRoot 'D:\Yeshayahu\Temp\vikunja_tse_study' `
  -BaseUrl 'http://127.0.0.1:3456/api/v1' `
  -Username 'SBT-tester' -Instances 2 -Depth 6 -Seed 1
```

The captured raw contract is included. Package hashes, server version and
canonical live-contract equality are checked before research writes. The known
label PUT-to-POST adapter remains explicitly hash/version scoped and requires
the live OPTIONS method gate. Password entry is hidden. The printed review ZIP
contains only whitelisted sanitized evidence. Do not publish runtime workspace
products wholesale: native products can contain authorization headers.

Successful live acceptance is `V015_LIVE_SCHEMA_NEGATIVE_ACCEPTED`. On any failure,
preserve `review_v015.zip`. Newly created resources remain for inspection; there
is no database reset or automatic cleanup. Cases use fresh unique positive
values and never deliberately reference another user's resources.

## Reproduce generation and validation

```powershell
python .\Test-v015.py
python .\Generate-Package-v015.py --contract .\live-contract-v015.json --output .\generated-v015
python .\Check-Runner-Fixture-v015.py --jar '<existing Provengo JAR>' --output .\fixture-v015
```

The generator owns JS production. No hand edits to generated JS are needed.
Depth 0, 1, 3 or 6 and one or two instances are supported. The selected negative
cases are the same; each runs in the state produced by that configured prefix.
Source/contract pointers remain in the graph and generation report.

Validation includes synthetic full-runner acceptance, an unexpected-acceptance
control, and a write-on-rejection control. Synthetic fixtures are not live
Vikunja evidence. A first local JVM startup failed during simultaneous tests;
the positive fixture was rerun sequentially and passed. User live acceptance is
pending. Account/permission tests, richer state transitions, complete evaluation
arms and budget dispatch remain separate work.
