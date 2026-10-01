# RC2b: bind gated concurrency to the verified resource

Apply over RC1, RC2 and RC2a at the project root. The only generator code changed is `generator_baseline/openapi_to_sbt/render/verification_js.py`.

The original gated oracle latched onto the first create event for an entity. In the preserved seed `20261411`, the first album ID was not the album whose generated update stories completed ten verified rounds. Ninety-two tagged GETs (all 200), including two album stories through round ten, were recorded, yet no concurrency epoch began. The new gated oracle waits for the first verified round of the corresponding OpenAPI update operation on an item path matching its template, then requires successive rounds on precisely that story and path. It still records the concrete prefix in the trace for the independent evaluator. Ungated oracle generation is unchanged.

The old evidence cannot be turned into concurrency evidence by reevaluation; the concurrent operations were never issued. Generate a fresh preflight and live run:

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_prefix_resource_binding_rc2b_delta.zip" -DestinationPath . -Force
& .\scripts\Invoke-Immich-Generated-Pilot.ps1 -Runs 1 -BaseSeed 20261411 -MaxLength 60000 -InstancesPerEntity 2 -InstancesPerAction 1 -MaxFieldPairs 4 -JsonDisjoint -LongStoryMinRounds 10 -LongStoryMaxRounds 12 -PrefixBeforeConcurrency 10 -PreflightOnly -FreezeEvidence
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Pilot.ps1 -Runs 1 -BaseSeed 20261411 -MaxLength 60000 -InstancesPerEntity 2 -InstancesPerAction 1 -MaxFieldPairs 4 -JsonDisjoint -LongStoryMinRounds 10 -LongStoryMaxRounds 12 -PrefixBeforeConcurrency 10 -FreezeEvidence
```

Validation performed locally: opt-in Immich preflight, generated JavaScript syntax, unit tests and byte-identical default artifacts for Immich, Gitea, Vikunja full OpenAPI input, Library, Garage, Pharmacy and NetBox. Provengo and a live Immich server were not available in the validation environment; a live run remains the decisive gate.
