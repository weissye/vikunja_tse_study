[CmdletBinding()]
param(
    [string]$Root = "",
    [int]$AdapterPort = 3459,
    [string]$OpenApi = ""
)

$ErrorActionPreference = "Stop"
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $scriptDir "..")).Path } else { $Root = (Resolve-Path $Root).Path }

if ([string]::IsNullOrWhiteSpace($OpenApi)) {
    $candidates = @(
        (Join-Path $Root "phase14-increment8-true-concurrent-epochs\vikunja-multi-resource-openapi.json"),
        (Join-Path $Root "vikunja-openapi-3.0.json")
    )
    $OpenApi = $candidates | Where-Object { Test-Path $_ -PathType Leaf } | Select-Object -First 1
}
if ([string]::IsNullOrWhiteSpace($OpenApi) -or -not (Test-Path $OpenApi -PathType Leaf)) { throw "A Vikunja OpenAPI document was not found." }

$phase = Join-Path $Root "phase15-increment9-concurrency-search"
$model = Join-Path $phase "generated-campaign"
New-Item -ItemType Directory -Force $model | Out-Null
$story = Join-Path $model "increment9-campaign.vikunja.js"
$manifest = Join-Path $model "increment9-campaign-manifest.json"

& python (Join-Path $Root "scripts\generate_vikunja_increment9_campaign.py") `
    --openapi $OpenApi `
    --output $story `
    --manifest $manifest `
    --adapter-port $AdapterPort
if ($LASTEXITCODE -ne 0) { throw "Increment 9 campaign generation failed." }

if (Get-Command node -ErrorAction SilentlyContinue) {
    & node --check $story
    if ($LASTEXITCODE -ne 0) { throw "Generated Increment 9 JavaScript is invalid." }
}

Write-Host "INCREMENT9_PREPARE_PASS"
Write-Host "Model:    $model"
Write-Host "Manifest: $manifest"

