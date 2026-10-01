param([string]$StudyRoot = 'C:\work\temp\vikunja_tse_study', [int]$Trials = 16)
$ErrorActionPreference = 'Stop'
$script = Join-Path $StudyRoot 'keycloak-role-concurrent-probe-v53\probe_keycloak_role_concurrent_v53.py'
if (-not (Test-Path -LiteralPath $script)) { throw "Probe not found: $script" }
$report = Join-Path $StudyRoot 'keycloak-role-concurrent-v53.json'
$evidence = Join-Path $StudyRoot 'keycloak-role-concurrent-v53-evidence.zip'
python $script --trials $Trials --output $report
if ($LASTEXITCODE -ne 0) { throw "Probe stopped with code $LASTEXITCODE" }
Compress-Archive -LiteralPath $report -DestinationPath $evidence -Force
Write-Host "Evidence ZIP: $evidence"
