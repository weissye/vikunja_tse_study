param([string]$StudyRoot = 'C:\work\temp\vikunja_tse_study')
$ErrorActionPreference = 'Stop'
$script = Join-Path $StudyRoot 'keycloak-v50-race-diagnostic-v51\extract_race_v51.py'
if (-not (Test-Path -LiteralPath $script)) { throw "Missing diagnostic: $script" }
python $script --study-root $StudyRoot
if ($LASTEXITCODE -ne 0) { throw "v51 diagnostic failed with code $LASTEXITCODE" }
