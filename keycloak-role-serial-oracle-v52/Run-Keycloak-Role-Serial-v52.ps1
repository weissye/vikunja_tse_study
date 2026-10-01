param([string]$StudyRoot = 'C:\work\temp\vikunja_tse_study')
$ErrorActionPreference = 'Stop'
$script = Join-Path $StudyRoot 'keycloak-role-serial-oracle-v52\probe_keycloak_role_serial_v52.py'
if (-not (Test-Path -LiteralPath $script)) { throw "Probe not found: $script" }
python $script
if ($LASTEXITCODE -ne 0) { throw "Probe stopped with code $LASTEXITCODE" }
