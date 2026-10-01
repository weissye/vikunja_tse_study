param(
    [string]$RunDirectory = '.\runs\research-fit-mealie-stage4-20260927_082845_535',
    [int]$Seed = 20261813
)
$ErrorActionPreference = 'Stop'
$run = (Resolve-Path -LiteralPath $RunDirectory).Path
$seedDir = Join-Path $run "seed-$Seed"
$trace = Join-Path $seedDir 'http-trace.jsonl'
$manifest = Join-Path $seedDir 'generated\verification-manifest.mealie.json'
$output = Join-Path $seedDir 'reevaluation-v0268.json'
$evaluator = Join-Path (Resolve-Path '.').Path 'generator_baseline\openapi_to_sbt\evaluate_verifiers.py'
foreach ($path in @($trace, $manifest, $evaluator)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing file: $path" }
}
& python $evaluator --trace $trace --manifest $manifest --output $output
if ($LASTEXITCODE -notin @(0, 2, 3)) { throw "Evaluator failed: $LASTEXITCODE" }
$result = Get-Content -LiteralPath $output -Raw | ConvertFrom-Json
$result.witnesses | Where-Object { $_.epoch_id -eq 'generated-epoch-2' } |
    Select-Object oracle_id, result, reason, trigger_events, observation_event
Write-Host "MEALIE_REEVALUATION_READY $output status=$($result.run_status)"
