param(
    [string] $Run = '.\runs\research-fit-mealie-stage4-20260927_085253_433',
    [int] $Seed = 20261814
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$trace = Join-Path (Join-Path $Run "seed-$Seed") 'http-trace.jsonl'
if (-not (Test-Path -LiteralPath $trace -PathType Leaf)) {
    throw "Unfrozen local trace missing: $trace"
}
$evidence = Join-Path $root 'evidence'
New-Item -ItemType Directory -Path $evidence -Force | Out-Null
$report = Join-Path $evidence "mealie-mealplan-create-$Seed-diagnostic.json"
python (Join-Path $PSScriptRoot 'diagnose_mealie_mealplan.py') --trace $trace --output $report
if ($LASTEXITCODE -ne 0) { throw "Meal plan diagnostic failed: $LASTEXITCODE" }
Get-FileHash -LiteralPath $report -Algorithm SHA256 | Select-Object Path, Hash
