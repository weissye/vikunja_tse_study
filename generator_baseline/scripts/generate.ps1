# Thin wrapper around `python -m openapi_to_sbt`. Forwards all arguments.
# Usage: .\scripts\generate.ps1 --openapi PATH --output DIR --name NAME --base-url URL --seed 1
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")
if (-not $env:PYTHON_BIN) { $env:PYTHON_BIN = "python" }
& $env:PYTHON_BIN -m openapi_to_sbt generate @args
exit $LASTEXITCODE
