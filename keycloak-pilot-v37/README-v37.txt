Keycloak OpenAPI pilot v37: one newly sampled scenario.

Extract the ZIP into C:\work\temp\vikunja_tse_study. It creates only keycloak-pilot-v37.
The earlier pilot directories remain untouched. Use the installed Provengo 0.7.5-SNAPSHOT.

PowerShell:
$study = 'C:\work\temp\vikunja_tse_study'
$zip = Join-Path $env:USERPROFILE 'Downloads\keycloak-openapi-pilot-v37.zip'
Expand-Archive -LiteralPath $zip -DestinationPath $study -Force
& (Join-Path $study 'keycloak-pilot-v37\Run-Keycloak-Pilot-v37.ps1')

The original OpenAPI and evidence-backed operation overlay are SHA-256 pinned.
The generic generator's exclusive_parent rule binds each execution config
worker to its own execution instance. The static audit rejects duplicate
execution config parents and verifies all 400 workers and 224 race dispatches.
The relay uses perf_counter_ns to measure HTTP PUT overlap. All 16 generated
realms are removed after the run; the expanded scenario is deleted only
when all cleanup requests succeed. The compact scenario and logs remain.
No resampling or reranking occurs during the Windows run.
