param(
    [string]$Root = "",
    [int[]]$Seeds = @(20260931, 20260932, 20260933)
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path }
$runner = Join-Path $Root "scripts\Invoke-Vikunja-ValidatedLifecycle.ps1"
if ($Seeds.Count -ne 3 -or ($Seeds | Select-Object -Unique).Count -ne 3) {
    throw "Supply exactly three distinct seeds."
}

$runs = @()
foreach ($seed in $Seeds) {
    $before = @(Get-ChildItem (Join-Path $Root "runs") -Directory -Filter "phase2-validated-lifecycle-seed-$seed-*")
    & $runner -Root $Root -Seed $seed
    $after = @(Get-ChildItem (Join-Path $Root "runs") -Directory -Filter "phase2-validated-lifecycle-seed-$seed-*" |
        Sort-Object LastWriteTime -Descending)
    $created = $after | Where-Object { $_.FullName -notin $before.FullName } | Select-Object -First 1
    if (-not $created) { throw "Could not identify the run directory for seed $seed." }
    $evaluation = Get-Content (Join-Path $created.FullName "phase2-evaluation.json") -Raw | ConvertFrom-Json
    if (-not $evaluation.phase2_passed) { throw "Seed $seed did not pass." }
    $runs += [pscustomobject]@{ seed = $seed; run_directory = $created.Name; passed = $true; witnesses = $evaluation.passed_count }
}
$summary = [ordered]@{ campaign = "phase2-three-seeds"; created_utc = (Get-Date).ToUniversalTime().ToString("o"); runs = $runs }
$summaryPath = Join-Path $Root ("runs\phase2-three-seeds-" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".json")
$summary | ConvertTo-Json -Depth 6 | Set-Content $summaryPath -Encoding UTF8
Write-Host "VIKUNJA_PHASE2_THREE_SEEDS_PASS"
Write-Host "Campaign summary: $summaryPath"
