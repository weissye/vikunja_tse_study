# Generic OpenAPI→SBT dependency liveness update

Apply this ZIP at the root of the project, maintaining relative paths. Requires the previously installed `openapi_sbt_generic_campaign_delta_regenerated.zip` baseline and preceding Immich overlays. Do not replace the project tree with this ZIP alone.

## Why
Cross-method parent oracles previously waited for a child closure event that never came when the API failed to create all required resources. This could leave a valid parent unobserved and report zero overlaps. The child now emits `SBT:ConcurrencySkipped:<index>` with observed and required resource counts after all three creation stories finish without three verified resources; its dependency gate accepts a terminal closure or skip. Neither an unready child nor an unobserved oracle is reported as PASS.

For empirical update/delete campaigns, the existing optional enum dependency branch is enabled automatically. It derives a shared link's optional album binding and enum type from the supplied OpenAPI schema. No Immich-specific branch is introduced in the generator.

## Windows verification
```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\openapi_sbt_generic_dependency_liveness_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_generic_campaign.py
python -m unittest discover -s .\tests -p test_cross_method_discovery.py
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Pilot.ps1 `
  -Runs 1 -BaseSeed 20261704 -MaxLength 45000 `
  -InstancesPerEntity 3 -InstancesPerAction 1 `
  -MaxFieldPairs 4 -MaxConcurrencyWidth 2 `
  -EmpiricalUpdateDelete -StoryProfile concurrency-breadth `
  -RequireNewOverlap -FreezeEvidence
```
Inspect the `IMMICH_CONCURRENCY_MATRIX` and `summary.json` for `skipped_runtime_oracles`; any skip indicates a prerequisite was unavailable, not that both oracles passed. A fully covered run needs both ready oracles overlapped with concrete PASS/VIOLATED verdicts. The requested live test requires the local pinned Immich Docker service and was not run in the package build environment.

## Offline verification completed
28 unit tests pass. Generic Gitea normal generator run completed with 478 contract verifiers. Immich empirical preflight completed with 2 ready oracles; generated JavaScript syntax checked with Node. Full historical live regression is not claimed.
