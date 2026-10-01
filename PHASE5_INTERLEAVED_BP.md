# Phase 5 — OpenAPI-to-SBT Interleaved BP Pilot

This phase tests the research pipeline itself:

```text
OpenAPI -> inferred CRUD/dependencies -> BP stories -> Provengo scheduling
        -> HTTP binding -> real Vikunja SUT -> external trace oracle
```

The generated model is not a pre-authored end-to-end sequence. It contains
independent CRUD, relation, constraint, and coordination b-threads. Runtime IDs
flow through `waitFor`; premature cleanup is prohibited through `block`; and
Provengo selects among simultaneously requested semantic intent events.

For the Vikunja pilot, the OpenAPI-derived model contains one project story,
eight task CRUD stories, seven chained relation stories, explicit constraints,
and milestone collectors. Relation kinds come from the contract enum. Each
selected semantic intent is followed by its generated HTTP binding.

## Run one seed

```powershell
Set-Location "D:\Yeshayahu\Temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Invoke-Vikunja-Interleaved-BP.ps1"

& ".\scripts\Invoke-Vikunja-Interleaved-BP.ps1" -Seed 20261301
```

Expected terminal marker:

```text
VIKUNJA_INTERLEAVED_BP_PASS
```

The first run is a pilot. Do not run multiple seeds or freeze evidence until
the Provengo event log and the external HTTP evaluation have both been checked.
