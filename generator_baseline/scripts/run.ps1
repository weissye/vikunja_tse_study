# Generic wrapper: .\scripts\run.ps1 <generate|inspect|validate|compare-reference> ...args
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")
if (-not $env:PYTHON_BIN) { $env:PYTHON_BIN = "python" }
& $env:PYTHON_BIN -m openapi_to_sbt @args
exit $LASTEXITCODE
