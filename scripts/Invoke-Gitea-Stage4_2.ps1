[CmdletBinding()]
param(
    [string]$Root = "",
    [string]$Target = "http://127.0.0.1:3477",
    [int]$Runs = 5,
    [int]$BaseSeed = 20260940,
    [int]$SaturationRuns = 2,
    [int]$MinimumUniqueOracles = 7,
    [int]$MinimumProducerFamilies = 2,
    [int]$MaxLength = 120000,
    [int]$QuiescenceMs = 100,
    [int]$MaxFieldPairs = 6
)

$ErrorActionPreference = "Stop"
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$studyRoot = if ([string]::IsNullOrWhiteSpace($Root)) {
    (Resolve-Path (Join-Path $scriptDir "..")).Path
} else { (Resolve-Path $Root).Path }

Push-Location (Join-Path $studyRoot "generator_baseline")
try {
    $version = (& python -c "import openapi_to_sbt; print(openapi_to_sbt.__version__)").Trim()
    if ($LASTEXITCODE -ne 0 -or $version -ne "0.26.2") {
        throw "Stage 4.2 requires generic generator 0.26.2; found '$version'."
    }
    & python -m unittest tests.unit.test_v0261_generic_semantics
    if ($LASTEXITCODE -ne 0) { throw "Stage 4.2 generic semantic regression tests failed." }
}
finally { Pop-Location }

& (Join-Path $scriptDir "Invoke-Gitea-Stage4.ps1") `
    -Root $studyRoot -Target $Target -Runs $Runs -BaseSeed $BaseSeed `
    -SaturationRuns $SaturationRuns -MinimumUniqueOracles $MinimumUniqueOracles `
    -MinimumProducerFamilies $MinimumProducerFamilies -MaxLength $MaxLength `
    -QuiescenceMs $QuiescenceMs -MaxFieldPairs $MaxFieldPairs
if ($LASTEXITCODE -notin @(0, 3)) {
    throw "Gitea Stage 4.2 campaign failed with exit code $LASTEXITCODE."
}

Write-Host "GITEA_STAGE4_2_COMPLETE"
