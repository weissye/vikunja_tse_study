param(
    [ValidateRange(1, 8)][int]$Processes = 1,
    [ValidateRange(1, 8)][int]$Instances = 1
)

$ErrorActionPreference = 'Stop'
$runner = Join-Path $PSScriptRoot 'scripts\run_keycloak_parallel_crud_pilot.py'
if (-not (Test-Path -LiteralPath $runner)) {
    throw "Runner missing: $runner. Extract the ZIP to the project directory first."
}

Push-Location $PSScriptRoot
try {
    python $runner --processes $Processes --instances $Instances
    if ($LASTEXITCODE -ne 0) {
        throw "Pilot stopped with exit $LASTEXITCODE; inspect the printed SUMMARY path"
    }
} finally {
    Pop-Location
}
