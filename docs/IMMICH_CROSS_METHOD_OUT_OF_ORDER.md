# Cross-method instance admission correction

The prior cross-method run created and read three albums and three shared
links, yet admitted no concurrent epoch. In the run's Provengo diagnostic,
`InstanceReady:AlbumResponseDtos:2` preceded `:1`, and
`InstanceReady:SharedLinkResponseDtos:2` preceded `:1`. The generated verifier
was waiting for `:1`, then `:2`, then `:3`; because event synchronization
does not replay an earlier event, it waited indefinitely for `:2`.

This delta changes only the opt-in cross-method verifier renderer. It
collects three distinct ready events in any order, then binds paths in the
canonical instance order. No other profile or generated interface is changed.
The verification test simulates the order 2, 1, 3 and checks that the three
baseline reads have distinct IDs and the adapter receives an epoch.

Apply on top of `immich_cross_method_instance_ready_fix_delta.zip`:

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_cross_method_order_independent_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_cross_method_discovery.py
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile cross_method -PreflightOnly
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile cross_method
```

Check `IMMICH_CONCURRENCY_MATRIX` for overlap and the generated verifier
evaluation for PASS/INCONCLUSIVE/VIOLATED. Preflight proves model generation,
not a live outcome. If no epoch appears, preserve the new run's
`seed-20261621/provengo-run.log`; the review ZIP does not include that log.
