[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$OpenApi,
    [Parameter(Mandatory = $true)][string]$Output,
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$BaseUrl,
    [int]$Seed = 1,
    [int]$InstancesPerEntity = 2,
    [int]$InstancesPerAction = 1,
    [int]$MaxFieldPairs = 6,
    [string]$GeneratorRoot = "",
    [switch]$SkipBaseModel,
    [switch]$RequireStateVerifierForEveryMutation
)

$ErrorActionPreference = "Stop"
$studyRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($GeneratorRoot)) {
    $GeneratorRoot = Join-Path $studyRoot "generator_baseline"
}
if (-not (Test-Path (Join-Path $GeneratorRoot "openapi_to_sbt") -PathType Container)) {
    throw "Generator package was not found under '$GeneratorRoot'. Use -GeneratorRoot to override it."
}
$generatorRootResolved = (Resolve-Path $GeneratorRoot).Path
$source = (Resolve-Path $OpenApi).Path
New-Item -ItemType Directory -Force $Output | Out-Null
$destination = (Resolve-Path $Output).Path

Push-Location $generatorRootResolved
try {
    if (-not $SkipBaseModel) {
        & python -m openapi_to_sbt generate `
            --openapi $source `
            --output $destination `
            --name $Name `
            --base-url $BaseUrl `
            --seed $Seed `
            --instances-per-entity $InstancesPerEntity `
            --instances-per-action $InstancesPerAction `
            --force
        if ($LASTEXITCODE -ne 0) { throw "Base OpenAPI-to-Provengo generation failed with exit code $LASTEXITCODE." }
    }

    $verificationArgs = @(
        "-m", "openapi_to_sbt.verification_cli",
        "--openapi", $source,
        "--output", $destination,
        "--name", $Name,
        "--max-field-pairs", $MaxFieldPairs
    )
    if ($RequireStateVerifierForEveryMutation) { $verificationArgs += "--fail-on-contract-only" }
    & python @verificationArgs
    $verificationExit = $LASTEXITCODE
    if ($verificationExit -notin @(0, 3)) {
        throw "Verifier generation failed with exit code $verificationExit."
    }

    $required = @(
        "verification-manifest.$Name.json",
        "verifier-coverage.$Name.json",
        "concurrency-plan.$Name.json",
        "verification.$Name.js"
    )
    if (-not $SkipBaseModel) {
        $required += "interfaces.$Name.js"
        $required += "stories.$Name.js"
    }
    foreach ($file in $required) {
        if (-not (Test-Path (Join-Path $destination $file) -PathType Leaf)) {
            throw "Required generated artifact is missing: $file"
        }
    }

    $hashRows = Get-ChildItem $destination -File |
        Where-Object { $_.Name -ne "SHA256SUMS.verified-generator.csv" } |
        Sort-Object Name |
        ForEach-Object {
            [pscustomobject]@{
                path = $_.Name
                size_bytes = $_.Length
                sha256 = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
            }
        }
    $hashRows | Export-Csv (Join-Path $destination "SHA256SUMS.verified-generator.csv") -NoTypeInformation -Encoding UTF8

    $coverage = Get-Content (Join-Path $destination "verifier-coverage.$Name.json") -Raw | ConvertFrom-Json
    Write-Host ""
    Write-Host "OPENAPI_TO_VERIFIED_PROVENGO_GENERATION_COMPLETE"
    Write-Host "System:                    $Name"
    Write-Host "Output:                    $destination"
    Write-Host "Operations:                $($coverage.counts.operations)"
    Write-Host "Contract verifiers:        $($coverage.counts.contract_verifiers)"
    Write-Host "Mutations:                 $($coverage.counts.mutations)"
    Write-Host "State-verified mutations:  $($coverage.counts.state_verified_mutations)"
    Write-Host "Contract-only mutations:   $($coverage.counts.contract_only_mutations)"
    Write-Host "Concurrency oracles:       $($coverage.counts.concurrency_oracles)"
    Write-Host "Manual assumptions:        $($coverage.manual_assumptions.Count)"
    exit $verificationExit
}
finally {
    Pop-Location
}
