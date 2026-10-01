param(
    [string]$Root = "",
    [int[]]$Seeds = @(20261001, 20261002, 20261003, 20261004)
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path }
if ($Seeds.Count -ne 4 -or ($Seeds | Select-Object -Unique).Count -ne 4) {
    throw "Exactly four distinct seeds are required."
}

$selected = @()
foreach ($seed in $Seeds) {
    $candidates = @(Get-ChildItem (Join-Path $Root "runs") -Directory `
        -Filter "phase3-comment-lifecycle-seed-$seed-*" | Sort-Object LastWriteTime -Descending)
    $valid = $null
    foreach ($candidate in $candidates) {
        $evaluationPath = Join-Path $candidate.FullName "phase3-comment-evaluation.json"
        $metadataPath = Join-Path $candidate.FullName "run-metadata.json"
        if (-not (Test-Path $evaluationPath) -or -not (Test-Path $metadataPath)) { continue }
        $evaluation = Get-Content $evaluationPath -Raw | ConvertFrom-Json
        $metadata = Get-Content $metadataPath -Raw | ConvertFrom-Json
        if ($evaluation.phase3_pilot_passed -and $evaluation.passed_count -eq 15 -and
            $evaluation.required_count -eq 15 -and $metadata.seed -eq $seed -and
            $metadata.provengo_exit_code -eq 0 -and $metadata.deletion_probe_exit_code -eq 0 -and
            $metadata.evaluation_exit_code -eq 0) {
            $valid = $candidate
            break
        }
    }
    if (-not $valid) { throw "No valid 15/15 PASS run found for seed $seed." }
    $selected += $valid
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$stage = Join-Path $Root "runs\phase3-comment-evidence-$stamp"
New-Item -ItemType Directory -Force $stage | Out-Null
$runsDir = Join-Path $stage "runs"
$reproDir = Join-Path $stage "reproducibility"
New-Item -ItemType Directory -Force $runsDir, $reproDir | Out-Null

foreach ($run in $selected) { Copy-Item $run.FullName $runsDir -Recurse }
Copy-Item (Join-Path $Root "phase3\vikunja-comments-openapi.json") $reproDir
Copy-Item (Join-Path $Root "phase3\comments-projection-manifest.json") $reproDir
Copy-Item (Join-Path $Root "phase3\lifecycle-candidates.json") $reproDir
Copy-Item (Join-Path $Root "phase3\generated-comments-lifecycle") $reproDir -Recurse
$scriptsDir = Join-Path $reproDir "scripts"
New-Item -ItemType Directory -Force $scriptsDir | Out-Null
foreach ($name in @(
    "Invoke-Vikunja-Comment-Lifecycle.ps1",
    "evaluate_vikunja_comment_lifecycle.py",
    "probe_vikunja_comment_deletions.py",
    "vikunja_research_proxy.py",
    "discover_lifecycle_candidates.py",
    "build_vikunja_core_projection.py"
)) { Copy-Item (Join-Path $Root "scripts\$name") $scriptsDir }

$sourceDir = Join-Path $reproDir "generator-source"
New-Item -ItemType Directory -Force $sourceDir | Out-Null
Copy-Item (Join-Path $Root "generator_baseline\openapi_to_sbt") $sourceDir -Recurse
Copy-Item (Join-Path $Root "generator_baseline\pyproject.toml") $sourceDir
Copy-Item (Join-Path $Root "generator_baseline\tests\unit\test_nested_collection_inference.py") $sourceDir
Copy-Item (Join-Path $Root "generator_baseline\tests\unit\test_vikunja_phase3_comment_evaluator.py") $sourceDir

$summary = [ordered]@{
    experiment = "vikunja-phase3-comment-lifecycle"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    seeds = $Seeds
    selected_runs = @($selected | ForEach-Object Name)
    required_witnesses_per_run = 15
    all_runs_passed = $true
}
$summary | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $stage "evidence-summary.json") -Encoding UTF8

$manifest = foreach ($file in Get-ChildItem $stage -Recurse -File | Where-Object Name -ne "SHA256SUMS.csv") {
    [pscustomobject]@{
        Path = $file.FullName.Substring($stage.Length + 1).Replace("\", "/")
        SHA256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        SizeBytes = $file.Length
    }
}
$manifest | Sort-Object Path | Export-Csv (Join-Path $stage "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8
$zip = "$stage.zip"
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip
Write-Host "VIKUNJA_PHASE3_COMMENT_EVIDENCE_FROZEN"
Write-Host "Evidence directory: $stage"
Write-Host "Evidence archive: $zip"
Write-Host "Selected runs:"
$selected | ForEach-Object { Write-Host "  $($_.Name)" }
