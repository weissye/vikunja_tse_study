param(
    [string]$StudyRoot = 'C:\work\temp\vikunja_tse_study',
    [string]$ProvengoJar
)
$ErrorActionPreference = 'Stop'
$pilot = Join-Path $StudyRoot 'keycloak-pilot-v42'
$script = Join-Path $pilot 'run_pilot_v42.py'
if (-not (Test-Path -LiteralPath $script)) { throw "Pilot script not found: $script" }
if ($ProvengoJar) { python $script --jar $ProvengoJar }
else { python $script }
if ($LASTEXITCODE -ne 0) { throw 'Pilot incomplete; inspect runs/pilot-01/pilot-summary-v42.json' }
