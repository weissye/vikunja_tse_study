param(
    [Parameter(Mandatory=$true)][string]$StudyRoot,
    [Parameter(Mandatory=$true)][string]$ContractPath,
    [string]$BaseUrl,
    [string]$ProvengoJar,
    [string]$Username,
    [int]$Seed = 1,
    [switch]$PreflightOnly
)
$ErrorActionPreference = 'Stop'
Write-Host 'VIKUNJA_TRANSFER_STAGE5 v008'
$argsList = @((Join-Path $PSScriptRoot 'run_v008.py'), '--study-root', $StudyRoot, '--contract', $ContractPath, '--seed', "$Seed")
if ($BaseUrl) { $argsList += @('--base-url', $BaseUrl) }
if ($ProvengoJar) { $argsList += @('--provengo-jar', $ProvengoJar) }
if ($Username) { $argsList += @('--username', $Username) }
if ($PreflightOnly) { $argsList += '--preflight-only' }
if (Get-Command python -ErrorAction SilentlyContinue) {
    & python @argsList
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    & py -3 @argsList
} else { throw 'Python 3 is required.' }
if ($LASTEXITCODE -ne 0) { throw 'Stage 5 not accepted; preserve its review ZIP.' }
