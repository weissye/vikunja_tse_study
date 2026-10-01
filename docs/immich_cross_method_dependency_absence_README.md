# Immich cross-method experiment delta

Copy this ZIP over the existing `C:\work\temp\vikunja_tse_study` tree. It contains only the two generator modules, evaluator, two regression test files and this note. Keep the existing `scripts`, `model`, and campaign profiles.

## Why

The 2026-09-26 `cross_method` run recorded two overlaps but no verdicts. Each shared link was bound to an album that the earlier album experiment deleted. The album deletion controls and final read consistently returned Immich HTTP 400 with the same absence response, while the evaluator required 404/410.

The generator reads its existing OpenAPI-derived `dependency_graph.json`. If the creator of one empirical update/delete resource depends on another tested resource, the parent experiment waits in Provengo for `SBT:ConcurrencyClosed:<child index>` before acquiring its instances or issuing baseline and control requests. The controller continues to block concurrent admission of a second experiment until the active one closes. No application-specific name is hard-coded. The ordinary profiles are unchanged.

The evaluator now allows an undocumented 400 absence response only if both isolated serial delete orders return the same nonempty response for their final reads, the read after DELETE before the reverse PATCH has the same response, and the concurrent final read reproduces the signature. If the final read is successful after both controls proved absence, it retains the `VIOLATED` outcome. If any control fails, it stays `INCONCLUSIVE`.

## Install and run in Windows PowerShell

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_cross_method_dependency_absence_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_cross_method_discovery.py
python -m unittest discover -s .\tests -p test_empirical_update_delete.py
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile cross_method -PreflightOnly
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile cross_method
```

Before the live run, `Prepare` must print `IMMICH_ALBUM_PILOT_READY`. Examine `IMMICH_CONCURRENCY_MATRIX`: the goal is `overlapped=2` and both verdicts evaluated; `INCONCLUSIVE` remains possible when the generated fixtures or empirical controls are unavailable. Upload the resulting review ZIP to inspect any remaining inconclusive witness. Do not report a semantic bug from overlap alone.

## Verification performed during packaging

- Immich verifier generation with the existing `generation_report.json` and OpenAPI-derived dependency graph: two executable empirical oracles; the album oracle has `wait_for_closed_oracles: [1]` for the shared-link oracle.
- Unit regression suite in the partial local project: 21 tests pass.
- Offline evaluation of the supplied 2026-09-26 HTTP trace: album oracle `PASS`; shared-link oracle remains `INCONCLUSIVE` because its three baselines already failed in that historic run.
- No live Windows Docker/Immich execution was available to the packager; the command above is the live verification step.
