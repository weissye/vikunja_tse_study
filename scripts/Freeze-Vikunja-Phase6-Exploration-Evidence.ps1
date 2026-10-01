param(
    [string]$Root = "",
    [string]$CampaignTag = "phase6-bug-search-20260920_165133",
    [int]$ExpectedTasks = 12,
    [int[]]$Seeds = @(20261502, 20262503, 20263504)
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path }
else { $Root = (Resolve-Path $Root).Path }

function Test-SourceManifest([System.IO.DirectoryInfo]$Run) {
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
        (Join-Path $Run.FullName "http-trace.jsonl"),
        (Join-Path $Run.FullName "provengo-run.log"))) {
        if (-not (Test-Path $path)) { return $false }
    }
    try {
        $evaluation = Get-Content $evaluationPath -Raw | ConvertFrom-Json
        $metadata = Get-Content $metadataPath -Raw | ConvertFrom-Json
        $probe = Get-Content $probePath -Raw | ConvertFrom-Json
    } catch { return $false }
    return ($evaluation.phase5_bp_passed -eq $true -and
        $evaluation.profile -eq "interleaved-relational-exploration" -and
        $evaluation.passed_count -eq 13 -and $evaluation.required_count -eq 13 -and
        @($evaluation.anomalies).Count -eq 0 -and
        $metadata.seed -eq $Seed -and $metadata.expected_tasks -eq $ExpectedTasks -and
        $metadata.profile -eq "interleaved-relational-exploration" -and
        $metadata.provengo_exit_code -eq 0 -and
        $metadata.deletion_probe_exit_code -eq 0 -and
        $metadata.evaluation_exit_code -eq 0 -and
        $probe.all_deletions_observable -eq $true -and
        (Test-SourceManifest $Run))
}

$selected = @()
$excluded = @()
foreach ($seed in $Seeds) {
    $pattern = "$CampaignTag-tasks-$ExpectedTasks-seed-$seed-*"
    $candidates = @(Get-ChildItem (Join-Path $Root "runs") -Directory -Filter $pattern |
        Sort-Object LastWriteTime -Descending)
    $valid = @()
    foreach ($candidate in $candidates) {
        if (Test-Run $candidate $seed) { $valid += $candidate }
        else { $excluded += $candidate.Name }
    }
    if ($valid.Count -ne 1) {
        throw "Expected exactly one valid Phase 6 exploration run for seed $seed; found $($valid.Count)."
    }
    $selected += $valid[0]
}

$modelHashes = foreach ($run in $selected) {
    $metadata = Get-Content (Join-Path $run.FullName "run-metadata.json") -Raw | ConvertFrom-Json
    "$($metadata.openapi_sha256)|$($metadata.interfaces_sha256)|$($metadata.stories_sha256)"
}
if (@($modelHashes | Select-Object -Unique).Count -ne 1) {
    throw "Selected runs do not share one identical OpenAPI/interfaces/stories model."
}

$campaignRoot = Join-Path $Root "campaigns\$CampaignTag"
$modelSource = Join-Path $campaignRoot "models\tasks-$ExpectedTasks"
if (-not (Test-Path $modelSource)) { throw "Generated campaign model is missing: $modelSource" }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$freezeRoot = Join-Path $Root "evidence\phase6-exploration-evidence-$stamp"
$runsTarget = Join-Path $freezeRoot "runs"
$modelTarget = Join-Path $freezeRoot "model"
$toolsTarget = Join-Path $freezeRoot "tools"
$campaignTarget = Join-Path $freezeRoot "campaign"
New-Item -ItemType Directory -Force $runsTarget, $modelTarget, $toolsTarget, $campaignTarget | Out-Null

$runFiles = @(
    "http-trace.jsonl", "phase5-interleaved-bp-evaluation.json",
    "post-delete-probe.json", "provengo-create.log", "provengo-run.log",
    "proxy.stderr.log", "proxy.stdout.log", "run-metadata.json", "SHA256SUMS.csv"
)
foreach ($run in $selected) {
    $target = Join-Path $runsTarget $run.Name
    New-Item -ItemType Directory -Force $target | Out-Null
    foreach ($name in $runFiles) {
        $source = Join-Path $run.FullName $name
        if (Test-Path $source) {
            $destinationName = if ($name -eq "SHA256SUMS.csv") { "source-run-SHA256SUMS.csv" } else { $name }
            Copy-Item $source (Join-Path $target $destinationName)
        }
    }
}

Copy-Item (Join-Path $Root "phase3b\vikunja-relations-openapi.json") $modelTarget
if (Test-Path (Join-Path $Root "phase3b\relations-projection-manifest.json")) {
    Copy-Item (Join-Path $Root "phase3b\relations-projection-manifest.json") $modelTarget
}
Copy-Item $modelSource (Join-Path $modelTarget "generated-interleaved-relational-exploration") -Recurse

foreach ($name in @(
    "Invoke-Vikunja-Interleaved-BP.ps1", "Invoke-Vikunja-Bug-Search-Campaign.ps1",
    "evaluate_vikunja_interleaved_bp.py", "probe_vikunja_interleaved_bp_deletions.py",
    "analyze_vikunja_bp_schedules.py", "summarize_vikunja_bug_search.py",
    "vikunja_research_proxy.py"
)) { Copy-Item (Join-Path $Root "scripts\$name") $toolsTarget }

foreach ($name in @("campaign-execution.json", "campaign-summary.json")) {
    $source = Join-Path $campaignRoot $name
    if (Test-Path $source) { Copy-Item $source $campaignTarget }
}

$comparison = Join-Path $freezeRoot "schedule-comparison.json"
$analysisArgs = @((Join-Path $Root "scripts\analyze_vikunja_bp_schedules.py"))
foreach ($run in $selected) { $analysisArgs += @("--run", $run.FullName) }
$analysisArgs += @("--output", $comparison, "--require-variation")
& python @analysisArgs
if ($LASTEXITCODE -ne 0) { throw "Phase 6 semantic schedule comparison failed." }
$schedule = Get-Content $comparison -Raw | ConvertFrom-Json
if ($schedule.distinct_intent_schedules -ne $selected.Count -or
    $schedule.distinct_permit_schedules -ne $selected.Count) {
    throw "Expected all selected Phase 6 runs to have distinct Intent and Permit schedules."
}

$summary = [ordered]@{
    evidence_type = "Vikunja Phase 6 OpenAPI-to-SBT BP exploration"
    profile = "interleaved-relational-exploration"
    campaign_tag = $CampaignTag
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    seeds = $Seeds
    expected_tasks = $ExpectedTasks
    run_count = $selected.Count
    all_runs_passed = $true
    checks_per_run = 13
    distinct_intent_schedules = $schedule.distinct_intent_schedules
    distinct_permit_schedules = $schedule.distinct_permit_schedules
    schedule_variation_observed = $schedule.schedule_variation_observed
    permit_schedule_variation_observed = $schedule.permit_schedule_variation_observed
    selected_run_directories = @($selected | ForEach-Object Name)
    excluded_run_directories = @($excluded)
    model_hash_triple = $modelHashes[0]
    packaging = "Lean evidence package: raw traces/logs/results/model/tools included; rebuildable Provengo working databases excluded."
    interpretation = "Three passing executions of one generated model exercised three distinct BP Permit and Intent schedules; no semantic anomaly was observed and no real bug is claimed."
}
$summary | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $freezeRoot "evidence-summary.json") -Encoding UTF8

$readme = @"
Vikunja Phase 6 exploration evidence

This package preserves three passing executions of one OpenAPI-derived SBT/BP model.
Every run passed 13/13 external checks. Intent and Permit schedules are distinct across all runs.
The package excludes rebuildable Provengo internal databases, but includes raw HTTP traces,
Provengo logs, evaluations, deletion probes, generated model, campaign summaries, and tools.
No semantic anomaly was observed; this package does not claim a real Vikunja bug.
"@
$readme | Set-Content (Join-Path $freezeRoot "README.txt") -Encoding UTF8

$manifest = foreach ($file in Get-ChildItem $freezeRoot -Recurse -File |
    Where-Object Name -ne "SHA256SUMS.csv") {
    [pscustomobject]@{
        Path = $file.FullName.Substring($freezeRoot.Length + 1).Replace("\", "/")
        SHA256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        SizeBytes = $file.Length
    }
}
$manifest | Sort-Object Path | Export-Csv (Join-Path $freezeRoot "SHA256SUMS.csv") `
    -NoTypeInformation -Encoding UTF8

$zip = "$freezeRoot.zip"
Compress-Archive -Path (Join-Path $freezeRoot "*") -DestinationPath $zip -CompressionLevel Optimal
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Host "PHASE6_EXPLORATION_EVIDENCE_FREEZE_PASS"
Write-Host "Distinct Intent schedules: $($schedule.distinct_intent_schedules)/$($selected.Count)"
Write-Host "Distinct Permit schedules: $($schedule.distinct_permit_schedules)/$($selected.Count)"
Write-Host "Evidence directory: $freezeRoot"
Write-Host "Evidence ZIP:       $zip"
Write-Host "ZIP SHA256:         $zipHash"
