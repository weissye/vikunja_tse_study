param([string]$StudyRoot = 'C:\work\temp\vikunja_tse_study')
$ErrorActionPreference = 'Stop'
$script = Join-Path $StudyRoot 'keycloak-pilot-v56\extract_race_v56.py'
if (-not (Test-Path -LiteralPath $script)) { throw "Diagnostic not found: $script" }
python $script --study-root $StudyRoot
if ($LASTEXITCODE -ne 0) { throw "Diagnostic failed with code $LASTEXITCODE" }
