[CmdletBinding()]
param(
    [ValidateRange(1,20)][int]$Trials = 3,
    [ValidateRange(1,20)][int]$PrefixRounds = 4,
    [switch]$FreezeEvidence
)
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$helper = Join-Path $PSScriptRoot 'run_immich_album_serial.py'
$runner = Join-Path $PSScriptRoot 'run_immich_semantic_confirmation.py'
if (-not (Test-Path -LiteralPath $helper)) { throw "Missing existing Immich pilot client $helper" }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'python is not on PATH' }
$runArgs = @($runner, '--root', $projectRoot, '--trials', $Trials,
    '--prefix-rounds', $PrefixRounds)
if ($FreezeEvidence) { $runArgs += '--freeze-evidence' }
& python @runArgs
if ($LASTEXITCODE -ne 0) {
    throw "IMMICH_SEMANTIC_CONFIRMATION_INCOMPLETE exit=$LASTEXITCODE; inspect the preserved run directory"
}
