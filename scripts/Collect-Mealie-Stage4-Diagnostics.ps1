[CmdletBinding()]
param([string]$Run = 'research-fit-mealie-stage4-20260927_064156_798')
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runPath = Join-Path (Join-Path $root 'runs') $Run
if (-not (Test-Path -LiteralPath $runPath)) { throw "Missing preserved run: $runPath" }
& python (Join-Path $PSScriptRoot 'collect_mealie_stage4_diagnostics.py') --root $root --run $runPath
if ($LASTEXITCODE -ne 0) { throw "Mealie diagnostic collection failed: $LASTEXITCODE" }
