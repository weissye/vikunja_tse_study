[CmdletBinding()]
param(
    [ValidateRange(1,50)][int]$Trials = 8,
    [ValidateRange(1,10)][int]$PrefixRounds = 4,
    [ValidateRange(0,60000)][int]$QuiescenceMs = 150,
    [int]$Seed = 20261006,
    [switch]$FreezeEvidence
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runner = Join-Path $PSScriptRoot 'run_immich_album_concurrent.py'
$generator = Join-Path $root 'generator_baseline'
$required = @($runner, (Join-Path $PSScriptRoot 'run_immich_album_serial.py'),
    (Join-Path $generator 'openapi_to_sbt\trace_proxy.py'),
    (Join-Path $generator 'openapi_to_sbt\concurrency_adapter.py'),
    (Join-Path $root 'model\immich\immich-v3.2.0-openapi.json'))
foreach ($path in $required) { if (-not (Test-Path -LiteralPath $path)) { throw "Required project path missing: $path" } }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'python is not on PATH' }
$oldPythonPath = $env:PYTHONPATH
try {
    if ($oldPythonPath) { $env:PYTHONPATH = "$generator$([IO.Path]::PathSeparator)$oldPythonPath" }
    else { $env:PYTHONPATH = $generator }
    $params = @($runner, '--root', $root, '--trials', $Trials, '--prefix-rounds', $PrefixRounds,
                '--quiescence-ms', $QuiescenceMs, '--seed', $Seed)
    if ($FreezeEvidence) { $params += '--freeze-evidence' }
    & python @params
    if ($LASTEXITCODE -ne 0) { throw "IMMICH_ALBUM_OVERLAP_INCOMPLETE runner exit $LASTEXITCODE" }
} finally { $env:PYTHONPATH = $oldPythonPath }
