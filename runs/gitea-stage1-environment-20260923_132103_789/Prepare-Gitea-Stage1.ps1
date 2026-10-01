[CmdletBinding()]
param(
    [switch]$ResetState,
    [int]$ReadyTimeoutSeconds = 240
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$deployment = Join-Path $root "deployment\gitea_stage1"
$compose = Join-Path $deployment "docker-compose.yml"
$envFile = Join-Path $deployment ".env"
$sessionFile = Join-Path $deployment "gitea-stage1-session.json"
$project = "gitea_stage1"
$giteaContainer = "gitea-stage1-server"
$postgresContainer = "gitea-stage1-db"
$rootUrl = "http://127.0.0.1:3477"
$apiBaseUrl = "$rootUrl/api/v1"
$swaggerUrl = "$rootUrl/swagger.v1.json"
$modelDirectory = Join-Path $root "model\gitea"
$openApiFile = Join-Path $modelDirectory "gitea-1.27.3-swagger.json"
$runsDirectory = Join-Path $root "runs"
$evidenceDirectory = Join-Path $root "evidence"

function New-RandomSecret([int]$Bytes = 36) {
    $buffer = New-Object byte[] $Bytes
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($buffer) } finally { $rng.Dispose() }
    return [Convert]::ToBase64String($buffer).Replace('+', 'A').Replace('/', 'B').TrimEnd('=')
}

function Write-NewEnvironmentFile {
    "GITEA_STAGE1_POSTGRES_PASSWORD=$(New-RandomSecret 36)" |
        Set-Content $envFile -Encoding ASCII
}

function Get-ImageEvidence([string]$Container) {
    $imageId = (docker inspect $Container --format '{{.Image}}').Trim()
    if ($LASTEXITCODE -ne 0) { throw "Could not inspect container $Container." }
    $configuredImage = (docker inspect $Container --format '{{.Config.Image}}').Trim()
    if ($LASTEXITCODE -ne 0) { throw "Could not read the configured image for $Container." }
    $digestsJson = docker image inspect $configuredImage --format '{{json .RepoDigests}}'
    if ($LASTEXITCODE -ne 0) { throw "Could not inspect image $configuredImage." }
    $digests = @()
    if (-not [string]::IsNullOrWhiteSpace($digestsJson)) {
        $parsed = $digestsJson | ConvertFrom-Json
        if ($null -ne $parsed) { $digests = @($parsed) }
    }
    return [ordered]@{
        configured_image = $configuredImage
        image_id = $imageId
        repo_digests = $digests
    }
}

if (-not (Test-Path $compose -PathType Leaf)) { throw "Missing compose file: $compose" }
New-Item -ItemType Directory -Force $modelDirectory, $runsDirectory, $evidenceDirectory | Out-Null

docker version | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Docker is not available." }
docker compose version | Out-Null
if ($LASTEXITCODE -ne 0) { throw "docker compose is not available." }

# Compose resolves the password even for `down`; create it before a first reset.
if (-not (Test-Path $envFile -PathType Leaf)) { Write-NewEnvironmentFile }

if ($ResetState) {
    Write-Host "Removing only the isolated Gitea Stage 1 containers and volumes..."
    docker compose -p $project --env-file $envFile -f $compose down -v --remove-orphans
    if ($LASTEXITCODE -ne 0) { throw "Could not reset the isolated Gitea Stage 1 stack." }
    Write-NewEnvironmentFile
}

docker compose -p $project --env-file $envFile -f $compose config --quiet
if ($LASTEXITCODE -ne 0) { throw "Gitea Stage 1 compose validation failed." }

docker compose -p $project --env-file $envFile -f $compose up -d
if ($LASTEXITCODE -ne 0) { throw "Gitea Stage 1 stack failed to start." }

$deadline = (Get-Date).AddSeconds($ReadyTimeoutSeconds)
$versionResponse = $null
while ((Get-Date) -lt $deadline) {
    try {
        $versionResponse = Invoke-RestMethod -Uri "$apiBaseUrl/version" -TimeoutSec 5
        if (-not [string]::IsNullOrWhiteSpace([string]$versionResponse.version)) { break }
    }
    catch { Start-Sleep -Seconds 2 }
}
if ($null -eq $versionResponse -or [string]::IsNullOrWhiteSpace([string]$versionResponse.version)) {
    docker logs $giteaContainer --tail 120
    throw "Gitea did not become ready within $ReadyTimeoutSeconds seconds."
}
if ([string]$versionResponse.version -ne "1.27.3") {
    throw "Expected Gitea 1.27.3 but the instance reports $($versionResponse.version)."
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$bootstrapUsername = "sbt-bootstrap-$stamp"
$testUsername = "sbt-gitea-$stamp"
$bootstrapPassword = New-RandomSecret 30
$testPassword = New-RandomSecret 30

docker exec --user git $giteaContainer gitea admin user create `
    --username $bootstrapUsername `
    --password $bootstrapPassword `
    --email "$bootstrapUsername@example.invalid" `
    --admin `
    --must-change-password=false | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Could not create the isolated bootstrap administrator." }

docker exec --user git $giteaContainer gitea admin user create `
    --username $testUsername `
    --password $testPassword `
    --email "$testUsername@example.invalid" `
    --must-change-password=false | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Could not create the isolated research user." }

$tokenName = "sbt-stage1-$stamp"
$tokenOutput = @(docker exec --user git $giteaContainer gitea admin user generate-access-token `
    --username $testUsername `
    --token-name $tokenName `
    --scopes all `
    --raw)
if ($LASTEXITCODE -ne 0) { throw "Could not create the research user's API token." }
$token = [string]($tokenOutput | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | Select-Object -Last 1)
$token = $token.Trim()
if ([string]::IsNullOrWhiteSpace($token) -or $token.Length -lt 20) {
    throw "Gitea did not return a usable API token."
}

$headers = @{ Authorization = "token $token" }
$authenticatedUser = Invoke-RestMethod -Uri "$apiBaseUrl/user" -Headers $headers -TimeoutSec 10
if ([string]$authenticatedUser.login -ne $testUsername) {
    throw "The generated token did not authenticate as the research user."
}
$env:GITEA_API_TOKEN = $token
$env:GITEA_BASE_URL = $apiBaseUrl

Invoke-WebRequest -UseBasicParsing -Uri $swaggerUrl -OutFile $openApiFile -TimeoutSec 60
$specDocument = Get-Content $openApiFile -Raw | ConvertFrom-Json
if ([string]$specDocument.swagger -ne "2.0" -and [string]::IsNullOrWhiteSpace([string]$specDocument.openapi)) {
    throw "The downloaded API description is neither Swagger 2.0 nor OpenAPI 3.x."
}

$giteaImage = Get-ImageEvidence $giteaContainer
$postgresImage = Get-ImageEvidence $postgresContainer
$dockerServerVersion = (docker version --format '{{.Server.Version}}').Trim()
$composeVersion = (docker compose version --short).Trim()
$giteaCliVersion = [string](docker exec --user git $giteaContainer gitea --version)
$postgresCliVersion = [string](docker exec $postgresContainer psql --version)
$composeSha = (Get-FileHash $compose -Algorithm SHA256).Hash.ToLowerInvariant()
$openApiSha = (Get-FileHash $openApiFile -Algorithm SHA256).Hash.ToLowerInvariant()

$session = [ordered]@{
    schema_version = 1
    experiment = "gitea-stage1-frozen-environment"
    prepared_utc = (Get-Date).ToUniversalTime().ToString("o")
    status = "READY"
    system = "Gitea"
    expected_version = "1.27.3"
    reported_version = [string]$versionResponse.version
    root_url = $rootUrl
    api_base_url = $apiBaseUrl
    swagger_url = $swaggerUrl
    openapi_file = "model/gitea/gitea-1.27.3-swagger.json"
    openapi_sha256 = $openApiSha
    compose_file = "deployment/gitea_stage1/docker-compose.yml"
    compose_sha256 = $composeSha
    compose_project = $project
    containers = [ordered]@{
        gitea = $giteaContainer
        postgres = $postgresContainer
    }
    images = [ordered]@{
        gitea = $giteaImage
        postgres = $postgresImage
    }
    runtime_versions = [ordered]@{
        docker_server = $dockerServerVersion
        docker_compose = $composeVersion
        gitea_cli = $giteaCliVersion.Trim()
        postgres_cli = $postgresCliVersion.Trim()
    }
    research_identity = [ordered]@{
        username = $testUsername
        authenticated_user_id = $authenticatedUser.id
        administrator = $false
        password_recorded = $false
        token_recorded = $false
        token_exported_to_current_process = $true
        token_environment_variable = "GITEA_API_TOKEN"
    }
    bootstrap_identity = [ordered]@{
        username = $bootstrapUsername
        administrator = $true
        password_recorded = $false
        token_created = $false
    }
    reset_state = [bool]$ResetState
    methodology_boundary = "Environment, identity, instance OpenAPI capture, and provenance only; no generated test was executed."
}
$session | ConvertTo-Json -Depth 10 | Set-Content $sessionFile -Encoding UTF8

$runDirectory = Join-Path $runsDirectory "gitea-stage1-environment-$stamp"
New-Item -ItemType Directory -Force $runDirectory | Out-Null
Copy-Item $compose (Join-Path $runDirectory "docker-compose.yml")
Copy-Item $openApiFile (Join-Path $runDirectory "gitea-1.27.3-swagger.json")
Copy-Item $sessionFile (Join-Path $runDirectory "gitea-stage1-session.json")
Copy-Item $PSCommandPath (Join-Path $runDirectory "Prepare-Gitea-Stage1.ps1")

$hashRows = Get-ChildItem $runDirectory -File | Sort-Object Name | ForEach-Object {
    [pscustomobject]@{
        path = $_.Name
        size_bytes = $_.Length
        sha256 = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    }
}
$hashRows | Export-Csv (Join-Path $runDirectory "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8

$zip = Join-Path $evidenceDirectory "gitea-stage1-environment-$stamp-review.zip"
Compress-Archive -Path (Join-Path $runDirectory "*") -DestinationPath $zip -Force
$zipSha = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()

Write-Host ""
Write-Host "GITEA_STAGE1_READY"
Write-Host "Gitea version:     $($versionResponse.version)"
Write-Host "API base URL:      $apiBaseUrl"
Write-Host "Research user:     $testUsername"
Write-Host "OpenAPI:           $openApiFile"
Write-Host "OpenAPI SHA256:    $openApiSha"
Write-Host "Run directory:     $runDirectory"
Write-Host "Evidence ZIP:      $zip"
Write-Host "Evidence SHA256:   $zipSha"
Write-Host "GITEA_API_TOKEN and GITEA_BASE_URL were set only in the current PowerShell process."
Write-Host "Stage 1 executed no generated API test."
