param(
  [string]$ProvengoJar,
  [string]$BaseUrl='http://127.0.0.1:9928',
  [string]$Username='admin',
  [int]$Start=1,
  [int]$End=15,
  [string]$Python='python',
  [string]$Out='runs/keycloak-15'
)
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $MyInvocation.MyCommand.Path
$arguments = @((Join-Path $root 'run_15.py'), '--base-url', $BaseUrl,
  '--username', $Username, '--start', "$Start", '--end', "$End",
  '--out', (Join-Path $root $Out))
if ($ProvengoJar) { $arguments += @('--jar', $ProvengoJar) }
& $Python @arguments
if ($LASTEXITCODE -ne 0) { throw "Keycloak ensemble stopped with exit code $LASTEXITCODE; inspect $Out" }
