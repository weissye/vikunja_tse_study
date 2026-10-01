[CmdletBinding()]
param(
    [switch]$PreflightOnly,
    [switch]$FreezeEvidence
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$script = Join-Path $PSScriptRoot 'run_immich_slug_decision.py'
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'python is not on PATH' }
if (-not (Test-Path -LiteralPath $script)) { throw "Missing $script" }
$arguments = @($script, '--root', $root)
if ($PreflightOnly) { $arguments += '--preflight-only' }
if ($FreezeEvidence) { $arguments += '--freeze-evidence' }
& python @arguments
if ($LASTEXITCODE -ne 0) {
    throw "IMMICH_SLUG_DECISION_INCOMPLETE exit=$LASTEXITCODE; see the preserved run and evidence ZIP"
}
