# Immich cross-method generated experiment

This overlay extends the existing OpenAPI -> SBT -> Provengo pipeline. It is
opt-in. Existing campaign profiles and default generator output stay as they
were. Apply the ZIP at the root of `vikunja_tse_study`, after the previous
Immich concurrency breadth and reevaluation overlays.

## Run in Windows PowerShell

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_cross_method_generated_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_cross_method_discovery.py
python -m unittest discover -s .\tests -p test_empirical_update_delete.py
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile cross_method -PreflightOnly
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile cross_method
```

The profile runs one seed (20261621) with three instances per entity and
`MaxLength=45000`. The preflight must print two ready cross-method oracles
(`updateAlbumInfo` and `updateSharedLink`). The actual run needs the local
Immich v3.2.0 container, its pinned spec, and its existing isolated research
identity. The profile freezes review evidence in `evidence/`. Inspect the
printed run directory and its `seed-20261621/generated/` subdirectory.

If you already applied the first cross-method ZIP and the run produced three
successful creations of each resource but zero epochs, apply
`immich_cross_method_instance_ready_fix_delta.zip` on top before repeating
preflight and the live run. The verifier now waits for each generated
`InstanceReady` event, which follows a successful create and the story's
read, and gets the exact event names from `generation_report.json`. This
delta changes only that prerequisite binding; it does not assert that the
live run has passed.

## What the experiment establishes

For each OpenAPI-inferred PATCH/DELETE pair, the generated Provengo verifier
waits for three distinct successful creator outcomes, binds their real IDs,
and reads each one. It then runs PATCH, read, DELETE, read on resource A;
DELETE, read, PATCH, read on resource B; and concurrent PATCH + DELETE via
the existing epoch adapter on resource C, followed by a final read. The
evaluation requires both serial histories to end absent, confirmed request
overlap on C, and a final observation after both requests complete. If those
requirements fail, the verdict is INCONCLUSIVE. A final visible C in that
setting is a semantic candidate requiring an independent repeat. A final
absent C passes this specific oracle; it says nothing about other races.

Generated `cross-method-plan.immich.json` is an inventory of hypotheses:
11 candidates on the pinned Immich specification, including 5 relation
PUT/DELETE pairs. All 11 are deliberately marked *discovery-only*. The
separate `concurrency-plan.immich.json` contains the 2 experimentally
executable PATCH/DELETE oracles. The relation candidates need two genuine
member IDs and an independent way to read relation membership before a
generic semantic verdict can be produced. They have not been silently
converted to oracles. The existing separate album-asset test remains a
focused relation experiment, not a replacement for this coverage gap.

The profile tests two cross-method families, not all 45 prior ready
same-method pairs. Existing `concurrency_breadth` remains available for
that campaign. The final `IMMICH_GENERATED_RESULT` may contain contract
deviations unrelated to the cross-method result; inspect the cross-method
entries in `seed-20261621/generated-verifier-evaluation.json`, and the observed overlap in the run
summary before reporting a finding. The live outcome is unknown until the
profile executes on your machine.
