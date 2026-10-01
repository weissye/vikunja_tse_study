param(
    [string]$StudyRoot = 'C:\work\temp\vikunja_tse_study',
    [string]$OutputZip
)
$ErrorActionPreference = 'Stop'
$collector = Join-Path $PSScriptRoot 'collect_evidence_v56_1.py'
if (-not (Test-Path -LiteralPath $collector -PathType Leaf)) { throw "Collector not found: $collector" }
if ($OutputZip) {
    & python $collector --study-root $StudyRoot --output $OutputZip
} else {
    & python $collector --study-root $StudyRoot
}
if ($LASTEXITCODE -ne 0) { throw "Offline evidence collection failed: $LASTEXITCODE" }
