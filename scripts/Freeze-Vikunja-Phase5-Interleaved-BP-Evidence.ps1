param(
    [string]$Root = "",
    [int[]]$Seeds = @(20261301, 20261302, 20261303, 20261304)
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path }
else { $Root = (Resolve-Path $Root).Path }

function Test-Manifest([System.IO.DirectoryInfo]$Run) {
    $path = Join-Path $Run.FullName "SHA256SUMS.csv"
    if (-not (Test-Path $path)) { return $false }
    foreach ($entry in Import-Csv $path) {
        $file = Join-Path $Run.FullName ($entry.Path -replace '/', '\')
        if (-not (Test-Path $file)) { return $false }
        if ((Get-FileHash $file -Algorithm SHA256).Hash.ToLowerInvariant() -ne $entry.SHA256.ToLowerInvariant()) {
            return $false
        }
    }
    return $true
}

function Test-Run([System.IO.DirectoryInfo]$Run, [int]$Seed) {
    $evaluationPath = Join-Path $Run.FullName "phase5-interleaved-bp-evaluation.json"
    $metadataPath = Join-Path $Run.FullName "run-metadata.json"
    $probePath = Join-Path $Run.FullName "post-delete-probe.json"
    foreach ($path in @($evaluationPath, $metadataPath, $probePath,
        (Join-Path $Run.FullName "http-trace.jsonl"), (Join-Path $Run.FullName "provengo-run.log"))) {
        if (-not (Test-Path $path)) { return $false }
    }
    try {
        $evaluation = Get-Content $evaluationPath -Raw | ConvertFrom-Json
        $metadata = Get-Content $metadataPath -Raw | ConvertFrom-Json
        $probe = Get-Content $probePath -Raw | ConvertFrom-Json
    } catch { return $false }
    return ($evaluation.phase5_bp_passed -eq $true -and
        $evaluation.passed_count -eq 13 -and $evaluation.required_count -eq 13 -and
        @($evaluation.anomalies).Count -eq 0 -and $metadata.seed -eq $Seed -and
        $metadata.profile -eq "interleaved-relational-lifecycle" -and
        $metadata.provengo_exit_code -eq 0 -and $metadata.deletion_probe_exit_code -eq 0 -and
        $metadata.evaluation_exit_code -eq 0 -and $probe.all_deletions_observable -eq $true -and
        (Test-Manifest $Run))
}

$selected = @()
$excluded = @()
foreach ($seed in $Seeds) {
    $candidates = @(Get-ChildItem (Join-Path $Root "runs") -Directory `
        -Filter "phase5-interleaved-bp-seed-$seed-*" | Sort-Object LastWriteTime -Descending)
    $valid = @()
    foreach ($candidate in $candidates) {
        if (Test-Run $candidate $seed) { $valid += $candidate } else { $excluded += $candidate.Name }
    }
    if ($valid.Count -ne 1) { throw "Expected exactly one valid Phase 5 BP run for seed $seed; found $($valid.Count)." }
    $selected += $valid[0]
}

$modelHashes = foreach ($run in $selected) {
    $metadata = Get-Content (Join-Path $run.FullName "run-metadata.json") -Raw | ConvertFrom-Json
    "$($metadata.openapi_sha256)|$($metadata.interfaces_sha256)|$($metadata.stories_sha256)"
}
if (@($modelHashes | Select-Object -Unique).Count -ne 1) {
    throw "The selected runs do not use one identical OpenAPI/interfaces/stories model."
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$freezeRoot = Join-Path $Root "evidence\phase5-interleaved-bp-evidence-$stamp"
$runsTarget = Join-Path $freezeRoot "runs"
$modelTarget = Join-Path $freezeRoot "model"
$toolsTarget = Join-Path $freezeRoot "tools"
New-Item -ItemType Directory -Force $runsTarget, $modelTarget, $toolsTarget | Out-Null
foreach ($run in $selected) { Copy-Item $run.FullName (Join-Path $runsTarget $run.Name) -Recurse }
Copy-Item (Join-Path $Root "phase3b\vikunja-relations-openapi.json") $modelTarget
if (Test-Path (Join-Path $Root "phase3b\relations-projection-manifest.json")) {
    Copy-Item (Join-Path $Root "phase3b\relations-projection-manifest.json") $modelTarget
}
Copy-Item (Join-Path $Root "phase5\generated-interleaved-relational-lifecycle") $modelTarget -Recurse
foreach ($name in @(
    "Invoke-Vikunja-Interleaved-BP.ps1",
    "evaluate_vikunja_interleaved_bp.py",
    "probe_vikunja_interleaved_bp_deletions.py",
    "analyze_vikunja_bp_schedules.py",
    "vikunja_research_proxy.py"
)) { Copy-Item (Join-Path $Root "scripts\$name") $toolsTarget }

$comparison = Join-Path $freezeRoot "schedule-comparison.json"
$analysisArgs = @((Join-Path $Root "scripts\analyze_vikunja_bp_schedules.py"))
foreach ($run in $selected) { $analysisArgs += @("--run", $run.FullName) }
$analysisArgs += @("--output", $comparison)
& python @analysisArgs
if ($LASTEXITCODE -ne 0) { throw "Semantic schedule analysis failed." }
$scheduleAnalysis = Get-Content $comparison -Raw | ConvertFrom-Json

$summary = [ordered]@{
    evidence_type = "Vikunja Phase 5 OpenAPI-to-SBT interleaved BP stabilization"
    profile = "interleaved-relational-lifecycle"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    seeds = $Seeds
    run_count = $selected.Count
    required_checks_per_run = 13
    all_runs_passed = $true
    distinct_intent_schedules = $scheduleAnalysis.distinct_intent_schedules
    schedule_variation_observed = $scheduleAnalysis.schedule_variation_observed
    selected_run_directories = @($selected | ForEach-Object Name)
    excluded_run_directories = @($excluded)
    model_hash_triple = $modelHashes[0]
    interpretation = if ($scheduleAnalysis.schedule_variation_observed) {
        "Stabilization evidence with observed semantic schedule variation; no semantic anomaly was observed and no real bug is claimed."
    } else {
        "Stabilization evidence: all four runs passed, but their semantic Intent schedules were identical. These runs establish repeatability, not interleaving diversity; no real bug is claimed."
    }
}
$summary | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $freezeRoot "evidence-summary.json") -Encoding UTF8

$manifest = foreach ($file in Get-ChildItem $freezeRoot -Recurse -File | Where-Object Name -ne "SHA256SUMS.csv") {
    [pscustomobject]@{
        Path = $file.FullName.Substring($freezeRoot.Length + 1).Replace("\", "/")
        SHA256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        SizeBytes = $file.Length
    }
}
$manifest | Sort-Object Path | Export-Csv (Join-Path $freezeRoot "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8
$zip = "$freezeRoot.zip"
Compress-Archive -Path (Join-Path $freezeRoot "*") -DestinationPath $zip -CompressionLevel Optimal
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Host "PHASE5_INTERLEAVED_BP_EVIDENCE_FREEZE_PASS"
Write-Host "Distinct intent schedules: $($scheduleAnalysis.distinct_intent_schedules)/$($selected.Count)"
Write-Host "Evidence directory: $freezeRoot"
Write-Host "Evidence ZIP:       $zip"
Write-Host "ZIP SHA256:         $zipHash"
