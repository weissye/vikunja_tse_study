[CmdletBinding()]
param(
    [string]$StudyRoot = "",
    [string]$TodoistOpenApi = "",
    [string]$VikunjaOpenApi = "",
    [string]$Output = ""
)

$ErrorActionPreference = "Stop"
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($StudyRoot)) {
    $StudyRoot = (Resolve-Path (Join-Path $scriptDir "..")).Path
} else {
    $StudyRoot = (Resolve-Path $StudyRoot).Path
}
$generator = Join-Path $StudyRoot "generator_baseline"
if (-not (Test-Path (Join-Path $generator "openapi_to_sbt") -PathType Container)) {
    throw "generator_baseline was not found under $StudyRoot"
}
if ([string]::IsNullOrWhiteSpace($TodoistOpenApi)) {
    $TodoistOpenApi = Join-Path $generator "holdout\todoist_rest_v2_openapi.yaml"
}
if (-not (Test-Path $TodoistOpenApi -PathType Leaf)) {
    throw "Todoist OpenAPI was not found: $TodoistOpenApi"
}

if ([string]::IsNullOrWhiteSpace($VikunjaOpenApi)) {
    $phase7Spec = Join-Path $StudyRoot "phase7\vikunja-multi-resource-openapi.json"
    $candidate = if (Test-Path $phase7Spec -PathType Leaf) {
        Get-Item $phase7Spec
    } else {
        Get-ChildItem (Join-Path $StudyRoot "evidence") -Recurse -File `
            -Filter "vikunja-multi-resource-openapi.json" -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match "increment6-linearizable-conflicts" } |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
    }
    if (-not $candidate) { throw "Vikunja OpenAPI was not found; pass -VikunjaOpenApi explicitly." }
    $VikunjaOpenApi = $candidate.FullName
}
$VikunjaOpenApi = (Resolve-Path $VikunjaOpenApi).Path

# Restore the intentionally external Todoist holdout fixture so the reviewed
# five-system golden dependency test can run from this checkout.
$holdout = Join-Path $generator "holdout"
New-Item -ItemType Directory -Force $holdout | Out-Null
Copy-Item (Resolve-Path $TodoistOpenApi).Path `
    (Join-Path $holdout "todoist_rest_v2_openapi.yaml") -Force

Push-Location $generator
try {
    & python -m unittest discover -s tests -p "test_*.py"
    if ($LASTEXITCODE -ne 0) { throw "Generator regression suite failed with exit code $LASTEXITCODE." }
}
finally { Pop-Location }

if ([string]::IsNullOrWhiteSpace($Output)) {
    $Output = Join-Path $StudyRoot "generated\verified-generator-matrix"
}
New-Item -ItemType Directory -Force $Output | Out-Null

$systems = @(
    @{ name = "library"; spec = Join-Path $generator "resources\development_kit\examples\library\openapi.json" },
    @{ name = "garage"; spec = Join-Path $generator "resources\development_kit\examples\garage\openapi.json" },
    @{ name = "pharmacy"; spec = Join-Path $generator "resources\development_kit\examples\pharmacy\openapi.json" },
    @{ name = "netbox"; spec = Join-Path $generator "resources\development_kit\examples\netbox\openapi.json" },
    @{ name = "todoist"; spec = Join-Path $holdout "todoist_rest_v2_openapi.yaml" },
    @{ name = "vikunja"; spec = $VikunjaOpenApi }
)

$rows = @()
foreach ($system in $systems) {
    $destination = Join-Path $Output $system.name
    & (Join-Path $StudyRoot "scripts\Invoke-OpenApi-Verified-Generator.ps1") `
        -OpenApi $system.spec -Output $destination -Name $system.name `
        -BaseUrl "http://127.0.0.1:5000" -GeneratorRoot $generator
    $exit = $LASTEXITCODE
    if ($exit -notin @(0, 3)) { throw "Generation failed for $($system.name), exit $exit." }
    $coverage = Get-Content (Join-Path $destination "verifier-coverage.$($system.name).json") -Raw | ConvertFrom-Json
    $rows += [pscustomobject]@{
        system = $system.name
        exit_code = $exit
        operations = $coverage.counts.operations
        contract_verifiers = $coverage.counts.contract_verifiers
        mutations = $coverage.counts.mutations
        state_verified_mutations = $coverage.counts.state_verified_mutations
        concurrency_oracles = $coverage.counts.concurrency_oracles
        manual_assumptions = $coverage.manual_assumptions.Count
        coverage_complete = $coverage.coverage_complete
    }
}

$summary = Join-Path $Output "matrix-summary.json"
$rows | ConvertTo-Json -Depth 6 | Set-Content $summary -Encoding UTF8
$rows | Format-Table -AutoSize
Write-Host "VERIFIED_GENERATOR_SIX_SYSTEM_MATRIX_COMPLETE"
Write-Host "Summary: $summary"
