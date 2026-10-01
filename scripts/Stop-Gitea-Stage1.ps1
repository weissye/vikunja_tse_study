[CmdletBinding()]
param([switch]$RemoveState)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$deployment = Join-Path $root "deployment\gitea_stage1"
$compose = Join-Path $deployment "docker-compose.yml"
$envFile = Join-Path $deployment ".env"
$project = "gitea_stage1"

if (-not (Test-Path $compose -PathType Leaf)) { throw "Missing compose file: $compose" }
if (-not (Test-Path $envFile -PathType Leaf)) { throw "Missing environment file. Run Prepare-Gitea-Stage1.ps1 first." }

if ($RemoveState) {
    Write-Host "Removing only the isolated Gitea Stage 1 containers and volumes..."
    docker compose -p $project --env-file $envFile -f $compose down -v --remove-orphans
    if ($LASTEXITCODE -ne 0) { throw "Could not remove the isolated Gitea Stage 1 stack." }
    Write-Host "GITEA_STAGE1_STATE_REMOVED"
} else {
    docker compose -p $project --env-file $envFile -f $compose stop
    if ($LASTEXITCODE -ne 0) { throw "Could not stop the isolated Gitea Stage 1 stack." }
    Write-Host "GITEA_STAGE1_STOPPED"
    Write-Host "State was preserved. Run Prepare-Gitea-Stage1.ps1 to start it again."
}
