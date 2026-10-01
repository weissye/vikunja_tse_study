[CmdletBinding()]
param(
    [ValidateRange(1,10)][int]$Trials = 2,
    [ValidateRange(1,10)][int]$PrefixRounds = 4,
    [switch]$FreezeEvidence
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$spec = Join-Path $root 'model\immich\immich-v3.2.0-openapi.json'
$runner = Join-Path $PSScriptRoot 'run_immich_album_serial.py'
foreach ($file in @($spec, $runner)) { if (-not (Test-Path -LiteralPath $file)) { throw "Required file missing: $file" } }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'python is not on PATH' }
$argsList = @($runner, '--root', $root, '--trials', $Trials, '--prefix-rounds', $PrefixRounds)
if ($FreezeEvidence) { $argsList += '--freeze-evidence' }
& python @argsList
if ($LASTEXITCODE -ne 0) { throw "IMMICH_ALBUM_SERIAL_INCOMPLETE runner exit $LASTEXITCODE" }
