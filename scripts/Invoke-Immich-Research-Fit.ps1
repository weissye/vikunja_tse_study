[CmdletBinding()]
param(
    [ValidatePattern('^v[0-9]+\.[0-9]+\.[0-9]+$')][string]$Version = 'v3.2.0',
    [int]$TimeoutSeconds = 240
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runner = Join-Path $PSScriptRoot 'Invoke-OpenAPI-Research-Fit.ps1'
if (-not (Test-Path -LiteralPath $runner)) {
    throw "Existing generic research-fit runner is missing: $runner"
}
$spec = Join-Path $root ('model\immich\immich-' + $Version + '-openapi.json')
$dir = Split-Path -Parent $spec
New-Item -Path $dir -ItemType Directory -Force | Out-Null
$url = 'https://raw.githubusercontent.com/immich-app/immich/' + $Version + '/open-api/immich-openapi-specs.json'
$temp = $spec + '.download'
try {
    Invoke-WebRequest -Uri $url -OutFile $temp -UseBasicParsing -TimeoutSec 90 -ErrorAction Stop
    $document = Get-Content -LiteralPath $temp -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Stop
    if (-not $document.openapi -or -not $document.paths) { throw "Downloaded content does not contain an OpenAPI paths object: $url" }
    $actualVersion = [string]$document.info.version
    if ($actualVersion.TrimStart('v') -ne $Version.TrimStart('v')) {
        throw "Version mismatch: requested $Version; OpenAPI declares $actualVersion. Spec was not installed."
    }
    Move-Item -LiteralPath $temp -Destination $spec -Force
} finally {
    if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
}
Write-Host "IMMICH_RESEARCH_FIT_SPEC_READY version=$actualVersion path=$spec"
Write-Host ('OpenAPI SHA256: ' + (Get-FileHash -LiteralPath $spec -Algorithm SHA256).Hash.ToLowerInvariant())
& $runner -Candidate immich -SpecPath $spec -TimeoutSeconds $TimeoutSeconds
if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "Research-fit runner exited $LASTEXITCODE" }
