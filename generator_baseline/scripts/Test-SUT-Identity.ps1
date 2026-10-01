$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot ".." )).Path
$sutRoot = Join-Path $root "resources\development_kit\validation_only\suts"
$manifest = Get-Content (Join-Path $root "sut_identity_manifest.json") -Raw | ConvertFrom-Json
foreach ($property in $manifest.files.PSObject.Properties) {
    $path = Join-Path $sutRoot ($property.Name -replace '/', '\')
    if (-not (Test-Path $path)) { throw "Canonical SUT file missing: $($property.Name)" }
    $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash.ToLowerInvariant()
    if ($actual -ne [string]$property.Value) {
        throw "SUT identity mismatch: $($property.Name); expected $($property.Value); actual $actual"
    }
}
$fileCount = @($manifest.files.PSObject.Properties).Count
Write-Host "SUT IDENTITY: PASS ($fileCount canonical files)"
