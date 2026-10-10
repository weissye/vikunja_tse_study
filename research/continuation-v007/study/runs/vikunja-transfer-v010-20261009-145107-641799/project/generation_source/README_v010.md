# Vikunja Transfer v010 — generic positive native acceptance

## First acceptance run

The default composes the four eligible resource closures from v009: label,
project, task and team. The project ancestor is created once per instance.
One instance, zero prefix update rounds and seed 1 produce 16 REST steps,
17 bthreads (one per step plus completion), and two task-parent readback checks.
Requests execute sequentially; no true concurrency or multi-account scenarios
are implemented. Created resources remain for inspection; no database reset or
automatic deletion occurs. Fresh randomized scalar tags distinguish each run.

The complete contract is inventoried. Selection retains the declared root-id,
title/name scalar policy and its documented conservative binding heuristics.
This is general selection within that policy, not coverage of all 170 operations.
Eight duplicate parent-child plans are removed: 32 unique graphs and 320 queued
seed trials remain. That queue is metadata only, not an automatically dispatched
campaign. The small first acceptance combines four closures; it is not one of
the isolated per-candidate trials and must be reported separately.

## Launch

Requires Python 3.10+, Java and the previously used Provengo 0.7.5-SNAPSHOT JAR.
Use the provided versioned PowerShell wrapper:

```powershell
.\Run-Vikunja-Stage5-v010.ps1 `
  -StudyRoot 'D:\Yeshayahu\Temp\vikunja_tse_study' `
  -BaseUrl 'http://127.0.0.1:3456/api/v1' `
  -Username 'SBT-tester' -Instances 1 -Depth 0 -Seed 1
```

The raw captured contract is included and used by default. A supplied contract
may be passed with `-ContractPath`. Live execution checks package hashes, server
version and canonical equality of the server contract. The known label PUT to
POST adapter applies only to the recorded raw contract hash and version; a
read-only OPTIONS gate confirms the observed method mismatch. The source
contract is unchanged. If gates fail, no research mutation is dispatched.

The runner finds the JAR in nearby study directories or Downloads and asks if
there is no unique match. `-ProvengoJar` provides an exact path. Password entry
is hidden; secrets are passed through an environment variable and excluded from
the exported whitelisted review ZIP. Runtime workspace products can contain
credentials and should not be published or zipped wholesale.

Success is `V010_LIVE_POSITIVE_ACCEPTED` only after the native completion receipt,
all expected callbacks, scalar/identity/parent checks, dependency order and
prefix barrier have passed. Failure exports `NOT_ACCEPTED` with sanitized
evidence. A 500 is a candidate observation, not automatic proof of a product
bug; accepted baseline failures must be investigated and reproduced separately.

The review ZIP path is printed. It includes selection, rules, graph, callbacks,
native log, generation report, generated JS, configuration and hash manifest.

## Offline reproduction and source ownership

```powershell
python .\Test-v010.py
python .\Generate-Package-v010.py --contract .\live-contract-v010.json --output .\generated-v010
```

`prepare_v010.py` calls the all-operation analyzer and selector, deduplicates
graphs and composes resource closure. The additive prefix compiler records
original operation pointers. The JS compiler emits dependency-constrained
REST bthreads, RTV captures, scalar readback and parent checks. JS is never
patched by hand. The generated project includes a generation-source snapshot;
the archived manifest is the authoritative delivery identity. The snapshot is
for reproduction, not a new immutable release with a regenerated manifest.

These components are integrated in this version's package-generation/runner
entry points. The older generator's unrelated historical pipelines have not
been changed. The frozen Method Spec v001 is included unchanged.

Allowed expansion is Instances 1 or 2, Depth 0/1/3/6 and Seed 1..10. `-Candidate`
can be `RESOURCE:label`, `RESOURCE:project`, `RESOURCE:task`, `RESOURCE:team`
or `all`. Task always includes its project ancestor. Start with the default
small live acceptance; expand only after its review has been checked.

## Validation and remaining work

Local unit tests cover deduplication, all allowed depths, parent closure,
configuration bounds, adapter emission and parent verifier generation. Native
Provengo is checked against a positive fixture plus two deliberately defective
fixtures: nonpersisting scalar updates and wrong task-parent membership.
Fixtures are not real Vikunja evidence. Native version and receipts accompany
the validation results. Live acceptance of v010 on the user's Vikunja is pending.

Accounts, shared-resource semantics, negative tests, complete budget dispatch,
A-D evaluation arms and true concurrency are deferred. Authentication still
uses one existing research owner acting on its own created resources.
