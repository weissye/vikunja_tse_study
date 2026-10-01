param(
    [string]$DevelopmentKit,
    [string]$OutputRoot = (Join-Path $PSScriptRoot "..\build\reconstructed_standard_models"),
    [int]$InstancesPerEntity = 5,
    [int]$Seed = 1
)

$ErrorActionPreference = "Stop"
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if (-not $DevelopmentKit) {
    $candidate = Join-Path (Split-Path $ProjectRoot -Parent) "OpenAPI_to_SBT_generator_development_kit_v2"
    if (Test-Path $candidate) { $DevelopmentKit = $candidate }
}
if (-not $DevelopmentKit -or -not (Test-Path $DevelopmentKit)) {
    throw "Pass -DevelopmentKit with the path to OpenAPI_to_SBT_generator_development_kit_v2."
}

$env:PYTHONPATH = $ProjectRoot
$systems = @("library", "garage", "pharmacy", "netbox")
New-Item -ItemType Directory -Force $OutputRoot | Out-Null

foreach ($system in $systems) {
    $example = Join-Path $DevelopmentKit "examples\$system"
    $openapi = Join-Path $example "openapi.json"
    $output = Join-Path $OutputRoot $system
    Write-Host "=== Reconstructing $system (instances/entity=$InstancesPerEntity) ==="

    python -m openapi_to_sbt generate --openapi $openapi --output $output `
        --name $system --seed $Seed --instances-per-entity $InstancesPerEntity --force
    if ($LASTEXITCODE -ne 0) { throw "Generation failed for $system" }

    python -m openapi_to_sbt validate --openapi $openapi --generated $output `
        | Set-Content (Join-Path $output "validation_report.json") -Encoding UTF8
    if ($LASTEXITCODE -ne 0) { throw "Validation failed for $system" }

    python -m openapi_to_sbt compare-reference --openapi $openapi --generated $output `
        --reference-stories (Join-Path $example "stories.reference.js") `
        --reference-interfaces (Join-Path $example "interfaces.reference.js") `
        --report (Join-Path $output "reference_comparison.json")
    if ($LASTEXITCODE -ne 0) { throw "Reference comparison failed for $system" }
}

Write-Host "FOUR-SYSTEM RECONSTRUCTION: PASS"
Write-Host "Outputs: $OutputRoot"
