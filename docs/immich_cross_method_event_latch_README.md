# Cross-method event latch fix

This delta is applied **after** `immich_cross_method_dependency_absence_delta.zip`. It changes only the generated JS rendering and its regression test.

The first release waited for the child oracle's `SBT:ConcurrencyClosed` before subscribing to the parent resource's `InstanceReady` events. If the parent instances were created meanwhile, Provengo did not replay those events, so the parent oracle never ran. The new generated observer records both signals, regardless of their order. The parent collects its three verified instances, announces readiness, then waits for a permit issued after the child oracle closes. No application-specific entity name is used in the gate logic.

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_cross_method_event_latch_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_cross_method_discovery.py
python -m unittest discover -s .\tests -p test_empirical_update_delete.py
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile cross_method -PreflightOnly
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile cross_method
```

Expected preflight: two ready oracles. Live validation target: two distinct `generated-epoch-*` rows with real overlap and independently evaluated verdicts; an `INCONCLUSIVE` must be investigated against its preserved baseline and control trace, never silently counted as PASS. The 2026-09-26 run before this delta yielded one PASS for shared link and one NOT_OBSERVED for album; that is the regression this fixes.

Packaging checks: 22 local tests PASS; the regression explicitly checks both arrival orders; an Immich OpenAPI verifier generation yielded two empirical oracles and syntactically valid generated JS. Live Windows/Docker execution is not available in the packaging environment.
