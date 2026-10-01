[CmdletBinding()]
param(
    [switch]$ResetState,
    [int]$ReadyTimeoutSeconds = 180
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$deployment = Join-Path $root "deployment\increment8_2"
$compose = Join-Path $deployment "docker-compose.yml"
$envFile = Join-Path $deployment ".env"
$sessionFile = Join-Path $deployment "increment8_2-session.json"
$project = "vikunja_increment8_2"
$vikunjaContainer = "vikunja-increment8-2-postgres"
$baseUrl = "http://127.0.0.1:3466/api/v2"

function New-RandomSecret([int]$Bytes = 32) {
    $buffer = New-Object byte[] $Bytes
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($buffer) } finally { $rng.Dispose() }
    return [Convert]::ToBase64String($buffer).Replace('+', 'A').Replace('/', 'B').TrimEnd('=')
}

function Write-NewEnvironmentFile {
    $postgresPassword = New-RandomSecret 36
    $serviceSecret = New-RandomSecret 48
    @(
        "INC82_POSTGRES_PASSWORD=$postgresPassword"
        "INC82_SERVICE_SECRET=$serviceSecret"
    ) | Set-Content $envFile -Encoding ASCII
}

if (-not (Test-Path $compose -PathType Leaf)) {
    throw "Missing compose file: $compose"
}

docker version | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Docker is not available." }
docker compose version | Out-Null
if ($LASTEXITCODE -ne 0) { throw "docker compose is not available." }

# Compose requires the env file even for `down`.  Create it before the first
# reset attempt so `-ResetState` also works on a completely fresh checkout.
if (-not (Test-Path $envFile -PathType Leaf)) {
    Write-NewEnvironmentFile
}

if ($ResetState) {
    Write-Host "Removing only the isolated Increment 8.2 containers and volumes..."
    docker compose -p $project --env-file $envFile -f $compose down -v --remove-orphans
    if ($LASTEXITCODE -ne 0) { throw "Could not reset the isolated Increment 8.2 stack." }
    Write-NewEnvironmentFile
}

docker compose -p $project --env-file $envFile -f $compose config --quiet
if ($LASTEXITCODE -ne 0) { throw "Increment 8.2 compose validation failed." }

docker compose -p $project --env-file $envFile -f $compose up -d
if ($LASTEXITCODE -ne 0) { throw "Increment 8.2 stack failed to start." }

$deadline = (Get-Date).AddSeconds($ReadyTimeoutSeconds)
$ready = $false
while ((Get-Date) -lt $deadline) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/info" -TimeoutSec 5
        if ($response.StatusCode -eq 200) { $ready = $true; break }
    }
    catch { Start-Sleep -Seconds 2 }
}
if (-not $ready) {
    docker logs $vikunjaContainer --tail 100
    throw "PostgreSQL-backed Vikunja did not become ready within $ReadyTimeoutSeconds seconds."
}

$stamp = Get-Date -Format "yyyyMMddHHmmss"
$username = "sbt_pg_$stamp"
$email = "$username@example.invalid"
$password = New-RandomSecret 30

docker exec $vikunjaContainer /app/vikunja/vikunja user create `
    --username $username `
    --email $email `
    --password $password | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Could not create the isolated PostgreSQL test user." }

$loginBody = @{ username = $username; password = $password; long_token = $false } | ConvertTo-Json
$login = $null
foreach ($loginUrl in @("$baseUrl/login", "http://127.0.0.1:3466/api/v1/login")) {
    try {
        $login = Invoke-RestMethod -Uri $loginUrl -Method Post -ContentType "application/json" -Body $loginBody
        if ($login.token) { break }
    }
    catch { $login = $null }
}
if ($null -eq $login -or [string]::IsNullOrWhiteSpace($login.token)) {
    throw "The test user was created, but neither the v2 nor v1 login endpoint returned a token."
}

$env:VIKUNJA_API_TOKEN = [string]$login.token

$vikunjaImage = docker inspect $vikunjaContainer --format '{{.Image}}'
$postgresImage = docker inspect "vikunja-increment8-2-db" --format '{{.Image}}'
$session = [ordered]@{
    experiment = "vikunja-increment8.2-postgresql-differential"
    prepared_utc = (Get-Date).ToUniversalTime().ToString("o")
    base_url = $baseUrl
    compose_project = $project
    vikunja_container = $vikunjaContainer
    postgres_container = "vikunja-increment8-2-db"
    vikunja_image_id = $vikunjaImage.Trim()
    postgres_image_id = $postgresImage.Trim()
    username = $username
    password_recorded = $false
    token_recorded = $false
    token_exported_to_current_process = $true
    reset_state = [bool]$ResetState
}
$session | ConvertTo-Json -Depth 5 | Set-Content $sessionFile -Encoding UTF8

Write-Host ""
Write-Host "INCREMENT8_2_POSTGRES_READY"
Write-Host "Base URL: $baseUrl"
Write-Host "Test user: $username"
Write-Host "VIKUNJA_API_TOKEN was set only in the current PowerShell process."
Write-Host "Next: & '.\scripts\Invoke-Vikunja-Increment8_2.ps1' -Trials 20"
