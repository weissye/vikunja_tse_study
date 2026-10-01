[CmdletBinding()]
param(
    [ValidateRange(1,20)][int]$Trials = 3,
    [ValidateRange(1,20)][int]$PrefixRounds = 4,
    [switch]$FreezeEvidence
)
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runner = Join-Path $PSScriptRoot 'run_immich_visibility_confirmation.py'
$serialHelper = Join-Path $PSScriptRoot 'run_immich_album_serial.py'
if (-not (Test-Path -LiteralPath $serialHelper)) {
    throw "Missing existing pilot helper $serialHelper; install the earlier Immich album pilot first"
}
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'python is not on PATH' }
$arguments = @($runner, '--root', $projectRoot, '--trials', $Trials,
    '--prefix-rounds', $PrefixRounds)
if ($FreezeEvidence) { $arguments += '--freeze-evidence' }
& python @arguments
if ($LASTEXITCODE -ne 0) {
    throw "IMMICH_VISIBILITY_INCOMPLETE exit=$LASTEXITCODE; inspect the preserved run directory"
}
