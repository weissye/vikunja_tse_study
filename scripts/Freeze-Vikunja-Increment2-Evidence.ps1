param(
    [string]$Root = "",
    [int[]]$Seeds = @(20261811, 20261812, 20261813, 20261814),
    [int]$Tasks = 6
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) {
    $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path
} else {
    $Root = (Resolve-Path $Root).Path
}

$Labels = [Math]::Max(2, [Math]::Min(4, [Math]::Floor($Tasks / 2)))
$Comments = [Math]::Max(2, [Math]::Min(4, $Tasks))
$RunsRoot = Join-Path $Root "runs"
$ModelRoot = Join-Path $Root "phase8-verified-obligations"
$GeneratedRoot = Join-Path $ModelRoot "generated-multi-resource-verified-obligations"

function Test-SourceManifest([IO.DirectoryInfo]$Run) {
    $manifestPath = Join-Path $Run.FullName "SHA256SUMS.csv"
    if (-not (Test-Path $manifestPath)) { return $false }
    try {
        foreach ($entry in Import-Csv $manifestPath) {
            $path = Join-Path $Run.FullName ($entry.Path -replace '/', '\')
            if (-not (Test-Path $path)) { return $false }
            $actual = (Get-FileHash $path -Algorithm SHA256).Hash.ToLowerInvariant()
            if ($actual -ne $entry.SHA256.ToLowerInvariant()) { return $false }
        }
    } catch { return $false }
    return $true
}

function Test-OracleSummary($Summary, [int]$Expected) {
    if ($null -eq $Summary) { return $false }
    return (
        $Summary.status -eq "PASS" -and
        $Summary.witness_count -eq $Expected -and
        $Summary.expected_witness_count -eq $Expected -and
        $Summary.missing_witness_count -eq 0 -and
        $Summary.counts.PASS -eq $Expected -and
        $Summary.counts.VIOLATED -eq 0 -and
        $Summary.counts.INCONCLUSIVE -eq 0
    )
}

function Test-CanonicalRun([IO.DirectoryInfo]$Run, [int]$Seed) {
    $required = @(
        "http-trace.jsonl", "phase7-multi-resource-evaluation.json",
        "task-verifier-evaluation.json", "post-delete-probe.json",
        "provengo-run.log", "run-metadata.json", "oracle-manifest.json",
        "SHA256SUMS.csv"
    )
    foreach ($name in $required) {
        if (-not (Test-Path (Join-Path $Run.FullName $name))) { return $false }
    }
    try {
        $phase = Get-Content (Join-Path $Run.FullName "phase7-multi-resource-evaluation.json") -Raw | ConvertFrom-Json
        $oracle = Get-Content (Join-Path $Run.FullName "task-verifier-evaluation.json") -Raw | ConvertFrom-Json
        $probe = Get-Content (Join-Path $Run.FullName "post-delete-probe.json") -Raw | ConvertFrom-Json
        $meta = Get-Content (Join-Path $Run.FullName "run-metadata.json") -Raw | ConvertFrom-Json
    } catch { return $false }

    $create = $oracle.oracle_summary.'task-create-visibility'
    $update = $oracle.oracle_summary.'task-update-persistence'
    $delete = $oracle.oracle_summary.'task-delete-absence'
    return (
        $meta.experiment -eq "vikunja-increment2-verified-obligations" -and
        $meta.profile -eq "multi-resource-verified-obligations" -and
        $meta.seed -eq $Seed -and $meta.tasks -eq $Tasks -and
        $meta.labels -eq $Labels -and $meta.comments -eq $Comments -and
        $meta.provengo_exit_code -eq 0 -and $meta.deletion_probe_exit_code -eq 0 -and
        $meta.evaluation_exit_code -eq 0 -and $meta.task_verifier_exit_code -eq 0 -and
        $phase.profile -eq "multi-resource-interleaving" -and
        $phase.phase7_passed -eq $true -and $phase.passed_count -eq 16 -and
        $phase.required_count -eq 16 -and @($phase.anomalies).Count -eq 0 -and
        $phase.trace_recovery.canonical_evidence_eligible -eq $true -and
        $phase.trace_recovery.used -eq $false -and
        $probe.all_deletions_observable -eq $true -and
        $oracle.profile -eq "verified-task-lifecycle" -and
        $oracle.run_status -eq "PASS" -and $oracle.confirmed_product_bug -eq $false -and
        @($oracle.witnesses).Count -eq (3 * $Tasks) -and
        (Test-OracleSummary $create $Tasks) -and
        (Test-OracleSummary $update $Tasks) -and
        (Test-OracleSummary $delete $Tasks) -and
        (Test-SourceManifest $Run)
    )
}

$selected = @()
$excluded = @()
foreach ($seed in $Seeds) {
    $candidates = @(Get-ChildItem $RunsRoot -Directory -Filter "increment2-verified-obligations-seed-$seed-*" |
        Sort-Object LastWriteTime -Descending)
    $valid = @()
    foreach ($candidate in $candidates) {
        if (Test-CanonicalRun $candidate $seed) { $valid += $candidate }
        else { $excluded += $candidate.Name }
    }
    if ($valid.Count -lt 1) { throw "No canonical Increment 2 PASS run found for seed $seed." }
    $selected += $valid[0]
    if ($valid.Count -gt 1) {
        $excluded += @($valid | Select-Object -Skip 1 | ForEach-Object Name)
    }
}

$hashTriples = foreach ($run in $selected) {
    $meta = Get-Content (Join-Path $run.FullName "run-metadata.json") -Raw | ConvertFrom-Json
    "$($meta.openapi_sha256)|$($meta.interfaces_sha256)|$($meta.stories_sha256)|$($meta.oracle_manifest_sha256)"
}
if (@($hashTriples | Select-Object -Unique).Count -ne 1) {
    throw "Selected runs do not use one identical OpenAPI/interfaces/stories/oracle model."
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$freeze = Join-Path $Root "evidence\increment2-verified-obligations-evidence-$stamp"
$runsTarget = Join-Path $freeze "runs"
$modelTarget = Join-Path $freeze "model"
$toolsTarget = Join-Path $freeze "tools"
$generatorTarget = Join-Path $freeze "generator"
New-Item -ItemType Directory -Force $runsTarget, $modelTarget, $toolsTarget, $generatorTarget | Out-Null

$runFiles = @(
    "http-trace.jsonl", "phase7-multi-resource-evaluation.json",
    "task-verifier-evaluation.json", "post-delete-probe.json", "oracle-manifest.json",
    "provengo-create.log", "provengo-run.log", "proxy.stderr.log", "proxy.stdout.log",
    "run-metadata.json", "SHA256SUMS.csv"
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

foreach ($name in @("vikunja-multi-resource-openapi.json", "multi-resource-projection-manifest.json")) {
    $source = Join-Path $ModelRoot $name
    if (-not (Test-Path $source)) { throw "Required model file is missing: $source" }
    Copy-Item $source $modelTarget
}
Copy-Item $GeneratedRoot (Join-Path $modelTarget "generated-multi-resource-verified-obligations") -Recurse

$toolNames = @(
    "Prepare-Vikunja-Increment2.ps1", "Invoke-Vikunja-Increment2.ps1",
    "validate_task_verifiers.py", "generate_task_oracle_manifest.py",
    "evaluate_vikunja_multi_resource.py", "probe_vikunja_multi_resource_deletions.py",
    "analyze_vikunja_bp_schedules.py", "vikunja_research_proxy.py",
    "build_vikunja_core_projection.py"
)
foreach ($name in $toolNames) {
    $source = Join-Path $Root "scripts\$name"
    if (-not (Test-Path $source)) { throw "Required tool is missing: $source" }
    Copy-Item $source $toolsTarget
}
foreach ($relative in @("openapi_to_sbt\cli.py", "openapi_to_sbt\render\stories_js.py")) {
    $source = Join-Path $Root "generator_baseline\$relative"
    if (-not (Test-Path $source)) { throw "Required generator source is missing: $source" }
    $destination = Join-Path $generatorTarget $relative
    New-Item -ItemType Directory -Force (Split-Path -Parent $destination) | Out-Null
    Copy-Item $source $destination
}
foreach ($name in @("test_increment2_verified_obligations.py", "test_task_verifiers.py")) {
    $source = Join-Path $Root "tests\$name"
    if (Test-Path $source) { Copy-Item $source $toolsTarget }
}

$comparison = Join-Path $freeze "schedule-comparison.json"
$analysisArgs = @((Join-Path $Root "scripts\analyze_vikunja_bp_schedules.py"))
foreach ($run in $selected) { $analysisArgs += @("--run", $run.FullName) }
$analysisArgs += @("--output", $comparison, "--require-variation")
& python @analysisArgs
if ($LASTEXITCODE -ne 0) { throw "Increment 2 schedule analysis failed." }
$schedules = Get-Content $comparison -Raw | ConvertFrom-Json
if ($schedules.distinct_intent_schedules -ne $selected.Count -or
    $schedules.distinct_permit_schedules -ne $selected.Count) {
    throw "Expected four distinct Intent and Permit schedules. Evidence was not frozen."
}

$summary = [ordered]@{
    evidence_type = "Vikunja Increment 2 generated BP verifier obligations"
    profile = "multi-resource-verified-obligations"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    seeds = $Seeds
    expected = @{ tasks = $Tasks; labels = $Labels; comments = $Comments }
    run_count = $selected.Count
    phase_checks_per_run = 16
    verifier_oracles_per_run = 3
    verifier_witnesses_per_run = 3 * $Tasks
    all_runs_passed = $true
    all_oracle_counts_complete = $true
    distinct_intent_schedules = $schedules.distinct_intent_schedules
    distinct_permit_schedules = $schedules.distinct_permit_schedules
    selected_run_directories = @($selected | ForEach-Object Name)
    excluded_run_directories = @($excluded | Select-Object -Unique)
    model_hash_quadruple = $hashTriples[0]
    product_bug_claimed = $false
    interpretation = "Four canonical runs passed 16/16 lifecycle checks and 18/18 generated Task verifier witnesses. Distinct BP schedules were observed. No product bug was found or claimed."
}
$summary | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $freeze "evidence-summary.json") -Encoding UTF8

@"
Vikunja Increment 2 verified-obligations evidence.

Each selected run passed:
- 16/16 external multi-resource lifecycle checks.
- 6/6 create-visibility Task verifier witnesses.
- 6/6 update-persistence Task verifier witnesses.
- 6/6 delete-absence Task verifier witnesses.
- zero violated, inconclusive, or missing Task verifier witnesses.

The BP model contains generated obligations and independent verifier bthreads.
The external HTTP-trace validator remains the authoritative semantic oracle.
Excluded or duplicate runs are recorded in evidence-summary.json.
No Vikunja product bug is claimed by this package.
"@ | Set-Content (Join-Path $freeze "README.txt") -Encoding UTF8

$manifest = foreach ($file in Get-ChildItem $freeze -Recurse -File | Where-Object { $_.Name -ne "SHA256SUMS.csv" }) {
    [pscustomobject]@{
        Path = $file.FullName.Substring($freeze.Length + 1).Replace("\", "/")
        SHA256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        SizeBytes = $file.Length
    }
}
$manifest | Sort-Object Path | Export-Csv (Join-Path $freeze "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8

$zip = "$freeze.zip"
Compress-Archive -Path (Join-Path $freeze "*") -DestinationPath $zip -CompressionLevel Optimal
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()

Write-Host "INCREMENT2_VERIFIED_OBLIGATIONS_EVIDENCE_FREEZE_PASS"
Write-Host "Selected runs:"
@($selected | ForEach-Object { "  $($_.Name)" }) | Write-Host
Write-Host "Excluded runs:"
@($excluded | Select-Object -Unique | ForEach-Object { "  $_" }) | Write-Host
Write-Host "Phase checks:             16/16 per run"
Write-Host "Task verifier witnesses:  18/18 per run"
Write-Host "Distinct Intent schedules: $($schedules.distinct_intent_schedules)/$($selected.Count)"
Write-Host "Distinct Permit schedules: $($schedules.distinct_permit_schedules)/$($selected.Count)"
Write-Host "Evidence directory: $freeze"
Write-Host "Evidence ZIP:       $zip"
Write-Host "ZIP SHA256:         $zipHash"
