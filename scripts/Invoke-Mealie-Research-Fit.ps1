[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$BaseUrl,
    [string]$Version = '',
    [int]$TimeoutSeconds = 180
)
$ErrorActionPreference = 'Stop'
$uri = [uri]$BaseUrl
if ($uri.Scheme -notin @('http','https') -or $uri.Host -notin @('127.0.0.1','localhost')) {
    throw 'Use the URL of your local, version-pinned Mealie instance (localhost or 127.0.0.1).'
}
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$path = Join-Path $root 'model\mealie\openapi.json'
New-Item -ItemType Directory -Force -Path (Split-Path $path -Parent) | Out-Null
$endpoint = $BaseUrl.TrimEnd('/') + '/openapi.json'
$temp = "$path.download"
try {
    try { Invoke-WebRequest -Uri $endpoint -OutFile $temp -ErrorAction Stop }
    catch { throw "Cannot read $endpoint. Start the local Mealie server and pass its actual URL with -BaseUrl. Original error: $($_.Exception.Message)" }
    $spec = Get-Content $temp -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Stop
    if (-not $spec.paths -or -not ($spec.openapi -or $spec.swagger)) { throw 'Downloaded file is not an OpenAPI specification.' }
    Move-Item $temp $path -Force
} finally { if (Test-Path $temp) { Remove-Item $temp -Force } }
$reportedVersion = if ($spec.info.version) { [string]$spec.info.version } else { 'not declared by OpenAPI' }
Write-Host "Mealie OpenAPI version: $reportedVersion; local deployment version: $(if ($Version) { $Version } else { 'unverified' })"
Write-Host "OpenAPI SHA256: $((Get-FileHash $path -Algorithm SHA256).Hash.ToLowerInvariant())"
& (Join-Path $PSScriptRoot 'Invoke-OpenAPI-Research-Fit.ps1') -Candidate mealie -SpecPath $path -TimeoutSeconds $TimeoutSeconds
