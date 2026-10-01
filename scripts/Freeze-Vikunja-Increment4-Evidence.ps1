param(
    [string]$Root = "",
    [int[]]$Seeds = @(20262001, 20262002, 20262003, 20262004),
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
$ModelRoot = Join-Path $Root "phase10-verified-actions"
$GeneratedRoot = Join-Path $ModelRoot "generated-multi-resource-verified-actions"

function Get-ManifestProblems([IO.DirectoryInfo]$Run) {
    $problems = @()
    $manifestPath = Join-Path -Path $Run.FullName -ChildPath "SHA256SUMS.csv"
    if (-not (Test-Path $manifestPath)) { return @("SHA256SUMS.csv is missing") }
    try {
        foreach ($entry in Import-Csv $manifestPath) {
            $relative = ([string]$entry.Path).Replace('/', '\')
            $filePath = Join-Path -Path $Run.FullName -ChildPath $relative
            if (-not (Test-Path $filePath)) {
                $problems += "manifest file missing: $($entry.Path)"
                continue
            }
            $actual = (Get-FileHash -Path $filePath -Algorithm SHA256).Hash.ToLowerInvariant()
            if ($actual -ne ([string]$entry.SHA256).ToLowerInvariant()) {
                $problems += "manifest hash mismatch: $($entry.Path)"
            }
        }
    } catch {
        $problems += "manifest read failure: $($_.Exception.Message)"
    }
    return @($problems)
}

function Test-OracleSummary($Oracle, [string]$Name, [int]$Expected) {
    $property = $Oracle.oracle_summary.PSObject.Properties[$Name]
    if ($null -eq $property) { return "oracle missing: $Name" }
    $summary = $property.Value
    $problems = @()
    if ($summary.status -ne "PASS") { $problems += "$Name status=$($summary.status)" }
    if ($summary.witness_count -ne $Expected) { $problems += "$Name witnesses=$($summary.witness_count), expected=$Expected" }
    if ($summary.expected_witness_count -ne $Expected) { $problems += "$Name expected_witness_count=$($summary.expected_witness_count), expected=$Expected" }
    if ($summary.missing_witness_count -ne 0) { $problems += "$Name missing=$($summary.missing_witness_count)" }
    if ($summary.counts.PASS -ne $Expected) { $problems += "$Name PASS=$($summary.counts.PASS), expected=$Expected" }
    if ($summary.counts.VIOLATED -ne 0) { $problems += "$Name VIOLATED=$($summary.counts.VIOLATED)" }
    if ($summary.counts.INCONCLUSIVE -ne 0) { $problems += "$Name INCONCLUSIVE=$($summary.counts.INCONCLUSIVE)" }
    return @($problems)
}

function Inspect-Run([IO.DirectoryInfo]$Run, [int]$Seed) {
    $problems = @()
    $required = @(
        "http-trace.jsonl", "phase7-multi-resource-evaluation.json",
        "resource-verifier-evaluation.json", "action-verifier-evaluation.json", "post-delete-probe.json",
        "provengo-run.log", "run-metadata.json", "resource-oracle-manifest.json",
        "action-oracle-manifest.json",
        "SHA256SUMS.csv"
    )
    foreach ($name in $required) {
        if (-not (Test-Path (Join-Path -Path $Run.FullName -ChildPath $name))) {
            $problems += "required file missing: $name"
        }
    }
    if ($problems.Count -gt 0) {
        return [pscustomobject]@{ Valid = $false; Problems = @($problems) }
    }

    try {
        $phase = Get-Content (Join-Path $Run.FullName "phase7-multi-resource-evaluation.json") -Raw | ConvertFrom-Json
        $oracle = Get-Content (Join-Path $Run.FullName "resource-verifier-evaluation.json") -Raw | ConvertFrom-Json
        $action = Get-Content (Join-Path $Run.FullName "action-verifier-evaluation.json") -Raw | ConvertFrom-Json
        $probe = Get-Content (Join-Path $Run.FullName "post-delete-probe.json") -Raw | ConvertFrom-Json
        $meta = Get-Content (Join-Path $Run.FullName "run-metadata.json") -Raw | ConvertFrom-Json
    } catch {
        return [pscustomobject]@{ Valid = $false; Problems = @("JSON read failure: $($_.Exception.Message)") }
    }

    if ($meta.experiment -ne "vikunja-increment4-verified-actions") { $problems += "metadata experiment=$($meta.experiment)" }
    if ($meta.profile -ne "multi-resource-verified-actions") { $problems += "metadata profile=$($meta.profile)" }
    if ($meta.seed -ne $Seed) { $problems += "metadata seed=$($meta.seed), expected=$Seed" }
    if ($meta.tasks -ne $Tasks) { $problems += "metadata tasks=$($meta.tasks), expected=$Tasks" }
    if ($meta.projects -ne 1) { $problems += "metadata projects=$($meta.projects), expected=1" }
    if ($meta.labels -ne $Labels) { $problems += "metadata labels=$($meta.labels), expected=$Labels" }
    if ($meta.comments -ne $Comments) { $problems += "metadata comments=$($meta.comments), expected=$Comments" }
    if ($meta.relations -ne ($Tasks - 1)) { $problems += "metadata relations=$($meta.relations), expected=$($Tasks - 1)" }
    foreach ($field in @("provengo_exit_code", "deletion_probe_exit_code", "evaluation_exit_code", "resource_verifier_exit_code", "action_verifier_exit_code")) {
        if ($meta.$field -ne 0) { $problems += "metadata $field=$($meta.$field)" }
    }

    if ($phase.profile -ne "multi-resource-interleaving") { $problems += "phase profile=$($phase.profile)" }
    if ($phase.phase7_passed -ne $true) { $problems += "phase7_passed is not true" }
    if ($phase.passed_count -ne 16 -or $phase.required_count -ne 16) { $problems += "phase checks=$($phase.passed_count)/$($phase.required_count)" }
    if (@($phase.anomalies).Count -ne 0) { $problems += "phase anomalies=$(@($phase.anomalies).Count)" }
    if ($phase.trace_recovery.canonical_evidence_eligible -ne $true) { $problems += "trace is not canonical-evidence eligible" }
    if ($phase.trace_recovery.used -ne $false) { $problems += "trace recovery was used" }
    if ($probe.all_deletions_observable -ne $true) { $problems += "deletion probe did not pass" }

    if ($oracle.profile -ne "verified-resource-lifecycles") { $problems += "oracle profile=$($oracle.profile)" }
    if ($oracle.run_status -ne "PASS") { $problems += "oracle run_status=$($oracle.run_status)" }
    if ($oracle.confirmed_product_bug -ne $false) { $problems += "confirmed_product_bug is not false" }
    $expectedTotal = 3 * $Tasks + 3 + 3 * $Labels
    if (@($oracle.witnesses).Count -ne $expectedTotal) { $problems += "oracle witnesses=$(@($oracle.witnesses).Count), expected=$expectedTotal" }

    foreach ($resource in @("task", "project", "label")) {
        $expected = if ($resource -eq "task") { $Tasks } elseif ($resource -eq "project") { 1 } else { $Labels }
        foreach ($phaseName in @("create-visibility", "update-persistence", "delete-absence")) {
            $problems += @(Test-OracleSummary $oracle "$resource-$phaseName" $expected)
        }
    }
    if ($action.profile -ne "verified-association-actions") { $problems += "action oracle profile=$($action.profile)" }
    if ($action.run_status -ne "PASS") { $problems += "action oracle run_status=$($action.run_status)" }
    if ($action.confirmed_product_bug -ne $false) { $problems += "action confirmed_product_bug is not false" }
    $expectedActionTotal = 2 * $Labels + 3 * $Comments + 2 * ($Tasks - 1)
    if (@($action.witnesses).Count -ne $expectedActionTotal) { $problems += "action witnesses=$(@($action.witnesses).Count), expected=$expectedActionTotal" }
    $actionExpected = [ordered]@{
        "label-attachment-visible" = $Labels
        "label-detachment-absent" = $Labels
        "comment-create-visible" = $Comments
        "comment-update-persistence" = $Comments
        "comment-delete-absence" = $Comments
        "relation-create-visible" = ($Tasks - 1)
        "relation-delete-absence" = ($Tasks - 1)
    }
    foreach ($name in $actionExpected.Keys) {
        $problems += @(Test-OracleSummary $action $name $actionExpected[$name])
    }
    $problems += @(Get-ManifestProblems $Run)
    return [pscustomobject]@{ Valid = ($problems.Count -eq 0); Problems = @($problems) }
}

$selected = @()
$excluded = @()
foreach ($seed in $Seeds) {
    $candidates = @(Get-ChildItem $RunsRoot -Directory -Filter "increment4-verified-actions-seed-$seed-*" |
        Sort-Object LastWriteTime -Descending)
    if ($candidates.Count -eq 0) { throw "No Increment 4 run directory exists for seed $seed." }
    $valid = @()
    foreach ($candidate in $candidates) {
        $inspection = Inspect-Run $candidate $seed
        if ($inspection.Valid) {
            $valid += $candidate
        } else {
            $excluded += $candidate.Name
            Write-Warning "Rejected $($candidate.Name):"
            foreach ($problem in $inspection.Problems) { Write-Warning "  $problem" }
        }
    }
    if ($valid.Count -lt 1) { throw "No canonical Increment 4 PASS run found for seed $seed. Rejection reasons are printed above." }
    $selected += $valid[0]
    if ($valid.Count -gt 1) { $excluded += @($valid | Select-Object -Skip 1 | ForEach-Object Name) }
}

$modelHashes = foreach ($run in $selected) {
    $meta = Get-Content (Join-Path $run.FullName "run-metadata.json") -Raw | ConvertFrom-Json
    "$($meta.openapi_sha256)|$($meta.interfaces_sha256)|$($meta.stories_sha256)|$($meta.resource_oracle_manifest_sha256)|$($meta.action_oracle_manifest_sha256)"
}
if (@($modelHashes | Select-Object -Unique).Count -ne 1) { throw "Selected runs use different generated models." }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$freeze = Join-Path $Root "evidence\increment4-verified-actions-evidence-$stamp"
$runsTarget = Join-Path $freeze "runs"
$modelTarget = Join-Path $freeze "model"
$toolsTarget = Join-Path $freeze "tools"
$generatorTarget = Join-Path $freeze "generator"
New-Item -ItemType Directory -Force $runsTarget, $modelTarget, $toolsTarget, $generatorTarget | Out-Null

$runFiles = @("http-trace.jsonl", "phase7-multi-resource-evaluation.json", "resource-verifier-evaluation.json",
    "action-verifier-evaluation.json", "post-delete-probe.json", "resource-oracle-manifest.json",
    "action-oracle-manifest.json", "provengo-create.log", "provengo-run.log",
    "proxy.stderr.log", "proxy.stdout.log", "run-metadata.json", "SHA256SUMS.csv")
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
    if (-not (Test-Path $source)) { throw "Required model file missing: $source" }
    Copy-Item $source $modelTarget
}
Copy-Item $GeneratedRoot (Join-Path $modelTarget "generated-multi-resource-verified-actions") -Recurse

$toolNames = @("Prepare-Vikunja-Increment4.ps1", "Invoke-Vikunja-Increment4.ps1",
    "validate_resource_verifiers.py", "generate_resource_oracle_manifest.py", "evaluate_vikunja_multi_resource.py",
    "validate_action_verifiers.py", "generate_action_oracle_manifest.py",
    "probe_vikunja_multi_resource_deletions.py", "analyze_vikunja_bp_schedules.py",
    "vikunja_research_proxy.py", "build_vikunja_core_projection.py")
foreach ($name in $toolNames) { Copy-Item (Join-Path $Root "scripts\$name") $toolsTarget }
foreach ($relative in @("openapi_to_sbt\cli.py", "openapi_to_sbt\render\stories_js.py")) {
    $source = Join-Path $Root "generator_baseline\$relative"
    $destination = Join-Path $generatorTarget $relative
    New-Item -ItemType Directory -Force (Split-Path -Parent $destination) | Out-Null
    Copy-Item $source $destination
}
foreach ($name in @("test_increment4_verified_actions.py", "test_resource_verifiers.py")) {
    $source = Join-Path $Root "tests\$name"
    if (Test-Path $source) { Copy-Item $source $toolsTarget }
}

$comparison = Join-Path $freeze "schedule-comparison.json"
$analysisArgs = @((Join-Path $Root "scripts\analyze_vikunja_bp_schedules.py"))
foreach ($run in $selected) { $analysisArgs += @("--run", $run.FullName) }
$analysisArgs += @("--output", $comparison, "--require-variation")
& python @analysisArgs
if ($LASTEXITCODE -ne 0) { throw "Increment 4 schedule analysis failed." }
$schedules = Get-Content $comparison -Raw | ConvertFrom-Json
if ($schedules.distinct_intent_schedules -ne $selected.Count -or
    $schedules.distinct_permit_schedules -ne $selected.Count) {
    throw "Expected four distinct Intent and Permit schedules. Evidence was not frozen."
}

$summary = [ordered]@{
    evidence_type = "Vikunja Increment 4 generated resource and association/action verifier obligations"
    profile = "multi-resource-verified-actions"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    seeds = $Seeds
    expected = @{ projects = 1; tasks = $Tasks; labels = $Labels; comments = $Comments }
    run_count = $selected.Count
    phase_checks_per_run = 16
    resource_verifier_oracles_per_run = 9
    resource_verifier_witnesses_per_run = 3 * $Tasks + 3 + 3 * $Labels
    action_verifier_oracles_per_run = 7
    action_verifier_witnesses_per_run = 2 * $Labels + 3 * $Comments + 2 * ($Tasks - 1)
    total_verifier_oracles_per_run = 16
    total_verifier_witnesses_per_run = (3 * $Tasks + 3 + 3 * $Labels) + (2 * $Labels + 3 * $Comments + 2 * ($Tasks - 1))
    all_runs_passed = $true
    all_oracle_counts_complete = $true
    distinct_intent_schedules = $schedules.distinct_intent_schedules
    distinct_permit_schedules = $schedules.distinct_permit_schedules
    selected_run_directories = @($selected | ForEach-Object Name)
    excluded_run_directories = @($excluded | Select-Object -Unique)
    model_hash_bundle = $modelHashes[0]
    product_bug_claimed = $false
}
$summary | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $freeze "evidence-summary.json") -Encoding UTF8
"Increment 4: four canonical runs; 16/16 lifecycle checks and 58/58 verifier witnesses per run. No product bug claimed." |
    Set-Content (Join-Path $freeze "README.txt") -Encoding UTF8
$manifest = foreach ($file in Get-ChildItem $freeze -Recurse -File | Where-Object { $_.Name -ne "SHA256SUMS.csv" }) {
    [pscustomobject]@{ Path = $file.FullName.Substring($freeze.Length + 1).Replace("\", "/"); SHA256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant(); SizeBytes = $file.Length }
}
$manifest | Sort-Object Path | Export-Csv (Join-Path $freeze "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8
$zip = "$freeze.zip"
Compress-Archive -Path (Join-Path $freeze "*") -DestinationPath $zip -CompressionLevel Optimal
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Host "INCREMENT4_VERIFIED_ACTIONS_EVIDENCE_FREEZE_PASS"
Write-Host "Selected runs:"; @($selected | ForEach-Object { "  $($_.Name)" }) | Write-Host
Write-Host "Excluded runs:"; @($excluded | Select-Object -Unique | ForEach-Object { "  $_" }) | Write-Host
Write-Host "Phase checks: 16/16 per run"
Write-Host "Resource verifier witnesses: 30/30 per run"
Write-Host "Action verifier witnesses:   28/28 per run"
Write-Host "Total verifier witnesses:    58/58 per run"
Write-Host "Distinct Intent schedules: $($schedules.distinct_intent_schedules)/$($selected.Count)"
Write-Host "Distinct Permit schedules: $($schedules.distinct_permit_schedules)/$($selected.Count)"
Write-Host "Evidence directory: $freeze"
Write-Host "Evidence ZIP:       $zip"
Write-Host "ZIP SHA256:         $zipHash"
