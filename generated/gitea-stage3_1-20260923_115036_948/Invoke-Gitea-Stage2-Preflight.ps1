[CmdletBinding()]
param(
    [string]$OpenApi = "",
    [string]$Output = "",
    [int]$Seed = 20260923,
    [int]$MaxFieldPairs = 6
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$generator = Join-Path $root "generator_baseline"
$expectedSha = "a0baa9a766c22492bd8c45744157c611d3e95cfc0dc73d6f5d14f294cdddce38"
$expectedGeneratorVersion = "0.25.8"

if ([string]::IsNullOrWhiteSpace($OpenApi)) {
    $OpenApi = Join-Path $root "model\gitea\gitea-1.27.3-swagger.json"
}
$source = (Resolve-Path $OpenApi).Path
$actualSha = (Get-FileHash $source -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actualSha -ne $expectedSha) {
    throw "The Gitea specification SHA256 is $actualSha; expected the frozen Stage 1 value $expectedSha."
}
if (-not (Test-Path (Join-Path $generator "openapi_to_sbt") -PathType Container)) {
    throw "generator_baseline was not found under $root."
}

$version = $null
Push-Location $generator
try {
    $version = [string](& python -m openapi_to_sbt --version)
    if ($LASTEXITCODE -ne 0) { throw "Could not read the generator version." }
}
finally { Pop-Location }
$version = $version.Trim()
if ($version -ne $expectedGeneratorVersion) {
    throw "Gitea Stage 2 requires generator $expectedGeneratorVersion; found $version."
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
if ([string]::IsNullOrWhiteSpace($Output)) {
    $Output = Join-Path $root "generated\gitea-stage2-$stamp"
}
New-Item -ItemType Directory -Force $Output | Out-Null
$destination = (Resolve-Path $Output).Path

Push-Location $generator
try {
    & python -m openapi_to_sbt generate `
        --openapi $source `
        --output $destination `
        --name gitea `
        --base-url "http://127.0.0.1:3477/api/v1" `
        --seed $Seed `
        --instances-per-entity 2 `
        --instances-per-action 1 `
        --force
    if ($LASTEXITCODE -ne 0) { throw "Base generation failed with exit code $LASTEXITCODE." }

    & python -m openapi_to_sbt.verification_cli `
        --openapi $source `
        --output $destination `
        --name gitea `
        --max-field-pairs $MaxFieldPairs
    if ($LASTEXITCODE -ne 0) { throw "Verifier generation failed with exit code $LASTEXITCODE." }
}
finally { Pop-Location }

$analysis = Join-Path $destination "gitea-stage2-preflight.json"
& python (Join-Path $root "scripts\analyze_gitea_stage2.py") `
    --openapi $source `
    --generated $destination `
    --output $analysis `
    --expected-sha256 $expectedSha `
    --expected-generator-version $expectedGeneratorVersion
if ($LASTEXITCODE -ne 0) { throw "Gitea Stage 2 preflight audit failed with exit code $LASTEXITCODE." }

$summary = Get-Content $analysis -Raw | ConvertFrom-Json
if ($summary.preflight_status -ne "PASS") { throw "Gitea Stage 2 did not pass its preflight checks." }

Copy-Item $source (Join-Path $destination "gitea-1.27.3-swagger.json")
Copy-Item $PSCommandPath (Join-Path $destination "Invoke-Gitea-Stage2-Preflight.ps1")
Copy-Item (Join-Path $root "scripts\analyze_gitea_stage2.py") (Join-Path $destination "analyze_gitea_stage2.py")

$hashRows = Get-ChildItem $destination -File |
    Where-Object { $_.Name -ne "SHA256SUMS.gitea-stage2.csv" } |
    Sort-Object Name |
    ForEach-Object {
        [pscustomobject]@{
            path = $_.Name
            size_bytes = $_.Length
            sha256 = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        }
    }
$hashRows | Export-Csv (Join-Path $destination "SHA256SUMS.gitea-stage2.csv") -NoTypeInformation -Encoding UTF8

$evidenceDirectory = Join-Path $root "evidence"
New-Item -ItemType Directory -Force $evidenceDirectory | Out-Null
$zip = Join-Path $evidenceDirectory "gitea-stage2-preflight-$stamp-review.zip"
Compress-Archive -Path (Join-Path $destination "*") -DestinationPath $zip -Force
$zipSha = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()

Write-Host ""
Write-Host "GITEA_STAGE2_COMPLETE"
Write-Host "Generator version:          $version"
Write-Host "Raw operations:             $($summary.source.raw_operations)"
Write-Host "Active operations:          $($summary.source.active_operations)"
Write-Host "Deprecated excluded:        $($summary.source.deprecated_operations.Count)"
Write-Host "Contract verifiers:         $($summary.verification.contract_verifiers)"
Write-Host "Mutations:                  $($summary.verification.mutations)"
Write-Host "State-verified mutations:   $($summary.verification.state_verified_mutations)"
Write-Host "Contract-only mutations:    $($summary.verification.contract_only_mutations)"
Write-Host "Concurrency oracles:        $($summary.verification.concurrency_oracles)"
Write-Host "Concurrency runtime-ready:  $($summary.verification.concurrency_runtime_ready)"
Write-Host "Manual assumptions:         $($summary.verification.manual_assumptions)"
Write-Host "Generated directory:        $destination"
Write-Host "Evidence ZIP:               $zip"
Write-Host "Evidence SHA256:            $zipSha"
Write-Host "No request was sent to Gitea during Stage 2."
