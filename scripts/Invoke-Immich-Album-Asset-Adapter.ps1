[CmdletBinding()]
param(
    [ValidateRange(1,20)][int]$Trials = 4,
    [ValidateRange(1,12)][int]$PrefixRounds = 8,
    [int]$Seed = 20261421,
    [switch]$FreezeEvidence
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runner = Join-Path $PSScriptRoot 'run_immich_album_asset_adapter.py'
$generator = Join-Path $root 'generator_baseline'
$required = @($runner, (Join-Path $PSScriptRoot 'run_immich_album_serial.py'),
    (Join-Path $generator 'openapi_to_sbt\trace_proxy.py'),
    (Join-Path $generator 'openapi_to_sbt\concurrency_adapter.py'),
    (Join-Path $root 'model\immich\immich-v3.2.0-openapi.json'))
foreach ($path in $required) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Required project path missing: $path" }
}
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'python is not on PATH' }
$oldPythonPath = $env:PYTHONPATH
try {
    if ($oldPythonPath) { $env:PYTHONPATH = "$generator$([IO.Path]::PathSeparator)$oldPythonPath" }
    else { $env:PYTHONPATH = $generator }
    $argsList = @($runner, '--root', $root, '--trials', $Trials,
                  '--prefix-rounds', $PrefixRounds, '--seed', $Seed)
    if ($FreezeEvidence) { $argsList += '--freeze-evidence' }
    & python @argsList
    if ($LASTEXITCODE -ne 0) { throw "IMMICH_ALBUM_ASSET_ADAPTER_INCOMPLETE exit $LASTEXITCODE" }
} finally { $env:PYTHONPATH = $oldPythonPath }
