[CmdletBinding()]
param([int]$WaitSeconds = 180)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$compose = Join-Path $root 'deployment\mealie_research_fit\compose.yaml'
if (-not (Test-Path $compose)) { throw "Missing compose file: $compose" }
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker is not on PATH.' }
$project = 'fse-mealie-research-fit'
& docker compose -p $project -f $compose up -d
if ($LASTEXITCODE -ne 0) { throw 'Docker Compose could not start isolated Mealie; inspect Docker output.' }
$endpoint = 'http://127.0.0.1:9925/openapi.json'
$deadline = (Get-Date).AddSeconds($WaitSeconds)
$ready = $false
while ((Get-Date) -lt $deadline) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200 -and $response.Content -match '"paths"') { $ready = $true; break }
    } catch { Start-Sleep -Seconds 3 }
}
if (-not $ready) {
    & docker compose -p $project -f $compose ps
    throw "Mealie did not expose $endpoint within $WaitSeconds seconds. Inspect: docker compose -p $project -f $compose logs --tail 80"
}
Write-Host "MEALIE_RESEARCH_FIT_READY $endpoint image=ghcr.io/mealie-recipes/mealie:v3.27.0"
& (Join-Path $PSScriptRoot 'Invoke-Mealie-Research-Fit.ps1') -BaseUrl 'http://127.0.0.1:9925' -Version 'v3.27.0'
