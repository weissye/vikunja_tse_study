param([string]$StudyRoot = 'C:\work\temp\vikunja_tse_study', [int]$Trials = 16)
$ErrorActionPreference = 'Stop'
$script = Join-Path $StudyRoot 'keycloak-role-confirm-v54\confirm_keycloak_role_v54.py'
if (-not (Test-Path -LiteralPath $script)) { throw "Probe not found: $script" }
python $script --study-root $StudyRoot --trials $Trials
if ($LASTEXITCODE -ne 0) { throw "Probe stopped with code $LASTEXITCODE" }
