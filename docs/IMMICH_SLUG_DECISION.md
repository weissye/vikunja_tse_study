# Immich shared-link slug decision

This is a directed confirmation of an OpenAPI-generated `updateSharedLink` candidate; it does not alter the generator or reclassify historical machine verdicts.

It reuses the pinned Immich v3.2.0 OpenAPI and the existing `run_immich_album_serial.authenticate()` and `openapi_to_sbt.trace_proxy.build_server()` helpers. It creates three independent verified albums and shared links with `allowDownload=false`, and executes these histories on fresh links:

1. Serial `PATCH {"slug":...}` → GET → `PATCH {"allowDownload":true}` → GET.
2. Serial `PATCH {"allowDownload":true}` → GET → `PATCH {"slug":...}` → GET.
3. Barrier-released overlapping PATCHes on the third link → independent GET.

The verdict checks the proxy's *upstream* start/end timestamps for actual overlap. If the first serial history loses `slug`, `SERIAL_SLUG_RESET_OBSERVED` rules out the claimed concurrency-only interpretation; it remains an API behavior candidate pending a separate contract assessment. If both serial orders preserve it but a genuinely overlapping pair loses it, the verdict is `CONCURRENCY_CANDIDATE`. Incomplete prerequisites, failed operations or no overlap produce `INCONCLUSIVE`. Each fresh link's boolean changes from `false` to `true`, so the second PATCH is not a no-op.

Install this delta at the project root. From the existing Windows PowerShell session:

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_slug_decision_tree_overlay.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_immich_slug_decision.py
& .\scripts\Invoke-Immich-Slug-Decision.ps1 -PreflightOnly
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Slug-Decision.ps1 -FreezeEvidence
```

The last command writes `runs/research-fit-immich-slug-decision-*/summary.json` and a redacted review ZIP in `evidence` with its SHA-256. The in-process proxy removes its private raw trace after producing a field-limited version; no access token or shared-link access key is included in the ZIP. Keep the earlier `research-fit-immich-generated-20260924_195135_376-review.zip` unchanged; its reverse serial control had already lost `slug` while the boolean update was a no-op. This new test specifically checks a real boolean change. If local login returns 401 or the server is in maintenance mode, restore the existing isolated research identity/environment before retrying; do not reset the research volume as a first response.
