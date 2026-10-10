param(
    [Parameter(Mandatory=$true)][string]$StudyRoot,
    [string]$ContractPath,
    [string]$BaseUrl,
    [string]$ProvengoJar,
    [string]$Username,
    [int]$Seed = 1,
    [int]$Instances = 1,
    [int]$Depth = 6,
    [string]$Candidate = "all",
    [switch]$PreflightOnly
)
$ErrorActionPreference = 'Stop'
Write-Host 'VIKUNJA_TRANSFER_STAGE5 v013'
if (-not $ContractPath) { $ContractPath = Join-Path $PSScriptRoot 'live-contract-v013.json' }
$argsList = @((Join-Path $PSScriptRoot 'run_v013.py'), '--study-root', $StudyRoot, '--contract', $ContractPath, '--seed', "$Seed", '--instances', "$Instances", '--depth', "$Depth", '--candidate', $Candidate)
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
