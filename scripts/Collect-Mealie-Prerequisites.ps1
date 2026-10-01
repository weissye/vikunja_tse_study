param(
    [string]$RunDirectory = '.\runs\research-fit-mealie-stage4-20260927_081035_603',
    [int]$Seed = 20261812
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path '.').Path
$run = (Resolve-Path -LiteralPath $RunDirectory).Path
$spec = Join-Path $run 'openapi-projected.json'
$trace = Join-Path $run "seed-$Seed\http-trace.jsonl"
$analyzer = Join-Path $root 'scripts\analyze_openapi_prerequisites.py'
foreach ($file in @($spec, $trace, $analyzer)) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Missing file: $file" }
}
$out = Join-Path $root "evidence\mealie-prerequisites-$Seed.json"
$zip = Join-Path $root "evidence\mealie-prerequisites-$Seed.zip"
New-Item -ItemType Directory -Path (Split-Path -Parent $out) -Force | Out-Null
& python $analyzer --spec $spec --trace $trace --output $out
if ($LASTEXITCODE -ne 0) { throw "Prerequisite analysis failed ($LASTEXITCODE)" }
Compress-Archive -LiteralPath $out -DestinationPath $zip -Force
Write-Host "MEALIE_PREREQUISITES_READY $zip"
Get-FileHash -LiteralPath $zip -Algorithm SHA256 | Select-Object Hash, Path
