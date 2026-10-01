param([string]$Root="")
$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path } else { $Root = (Resolve-Path $Root).Path }

$seeds = @(20262201, 20262202, 20262203, 20262204)
$runsRoot = Join-Path $Root "runs"
$evidenceRoot = Join-Path $Root "evidence"
$analyzer = Join-Path $Root "scripts\analyze_vikunja_bp_schedules.py"
$model = Join-Path $Root "phase12-linearizable-conflicts"
foreach ($required in @($runsRoot, $analyzer, $model)) {
    if (-not (Test-Path $required)) { throw "Required path is missing: $required" }
}

function Read-Json([string]$Path) {
    if (-not (Test-Path $Path)) { return $null }
    return Get-Content $Path -Raw | ConvertFrom-Json
}

function Is-CanonicalPass([IO.DirectoryInfo]$Run, [int]$Seed) {
    try {
        $phase = Read-Json (Join-Path $Run.FullName "phase7-multi-resource-evaluation.json")
        $resource = Read-Json (Join-Path $Run.FullName "resource-verifier-evaluation.json")
        $action = Read-Json (Join-Path $Run.FullName "action-verifier-evaluation.json")
        $negative = Read-Json (Join-Path $Run.FullName "negative-verifier-evaluation.json")
        $conflict = Read-Json (Join-Path $Run.FullName "conflict-verifier-evaluation.json")
        $metadata = Read-Json (Join-Path $Run.FullName "run-metadata.json")
        if ($null -eq $phase -or $null -eq $resource -or $null -eq $action -or $null -eq $negative -or $null -eq $conflict -or $null -eq $metadata) { return $false }
        if ([int]$metadata.seed -ne $Seed) { return $false }
        if (-not $phase.phase7_passed -or [int]$phase.passed_count -ne 16 -or [int]$phase.required_count -ne 16) { return $false }
        if ($resource.run_status -ne "PASS" -or [int]$resource.witnesses.Count -ne 30) { return $false }
        if ($action.run_status -ne "PASS" -or [int]$action.witnesses.Count -ne 28) { return $false }
        if ($negative.run_status -ne "PASS" -or [int]$negative.witness_count -ne 51 -or $negative.bug_candidate) { return $false }
        if ($conflict.run_status -ne "PASS" -or [int]$conflict.witness_count -ne 28 -or $conflict.bug_candidate) { return $false }
        foreach ($value in @($metadata.provengo_exit_code, $metadata.deletion_probe_exit_code, $metadata.evaluation_exit_code, $metadata.resource_verifier_exit_code, $metadata.action_verifier_exit_code, $metadata.negative_verifier_exit_code, $metadata.conflict_verifier_exit_code)) {
            if ([int]$value -ne 0) { return $false }
        }
        return $true
    } catch { return $false }
}

$allRuns = @(Get-ChildItem $runsRoot -Directory -Filter "increment6-linearizable-conflicts-seed-*")
$selected = @()
foreach ($seed in $seeds) {
    $candidates = @($allRuns | Where-Object { $_.Name -like "increment6-linearizable-conflicts-seed-$seed-*" } | Sort-Object LastWriteTime -Descending)
    $chosen = $candidates | Where-Object { Is-CanonicalPass $_ $seed } | Select-Object -First 1
    if ($null -eq $chosen) { throw "No canonical Increment 6 PASS run found for seed $seed." }
    $selected += $chosen
}
$selectedNames = @($selected | ForEach-Object Name)
$excludedNames = @($allRuns | Where-Object { $_.Name -notin $selectedNames } | Sort-Object Name | ForEach-Object Name)

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$freeze = Join-Path $evidenceRoot "increment6-linearizable-conflicts-evidence-$stamp"
$freezeRuns = Join-Path $freeze "runs"
$freezeTools = Join-Path $freeze "tools"
$freezeModel = Join-Path $freeze "model"
New-Item -ItemType Directory -Force $freezeRuns, $freezeTools, $freezeModel | Out-Null

$runFiles = @(
    "http-trace.jsonl", "post-delete-probe.json", "provengo-create.log", "provengo-run.log",
    "proxy.stdout.log", "proxy.stderr.log", "run-metadata.json", "SHA256SUMS.csv",
    "phase7-multi-resource-evaluation.json", "resource-verifier-evaluation.json",
    "action-verifier-evaluation.json", "negative-verifier-evaluation.json",
    "conflict-verifier-evaluation.json", "resource-oracle-manifest.json",
    "action-oracle-manifest.json", "negative-oracle-manifest.json", "conflict-oracle-manifest.json"
)
foreach ($run in $selected) {
    $destination = Join-Path $freezeRuns $run.Name
    New-Item -ItemType Directory -Force $destination | Out-Null
    foreach ($name in $runFiles) {
        $source = Join-Path $run.FullName $name
        if (Test-Path $source) { Copy-Item $source $destination -Force }
    }
}

Copy-Item (Join-Path $model "*") $freezeModel -Recurse -Force
$toolNames = @(
    "Prepare-Vikunja-Increment6.ps1", "Invoke-Vikunja-Increment6.ps1",
    "generate_conflict_bp_stories.py", "validate_conflict_verifiers.py",
    "validate_resource_verifiers.py", "validate_action_verifiers.py",
    "generate_negative_bp_stories.py", "validate_negative_verifiers.py",
    "generate_resource_oracle_manifest.py", "generate_action_oracle_manifest.py",
    "evaluate_vikunja_multi_resource.py", "analyze_vikunja_bp_schedules.py",
    "build_vikunja_core_projection.py", "vikunja_research_proxy.py",
    "probe_vikunja_multi_resource_deletions.py"
)
foreach ($name in $toolNames) {
    $source = Join-Path $Root "scripts\$name"
    if (Test-Path $source) { Copy-Item $source $freezeTools -Force }
}
$generatorCli = Join-Path $Root "generator_baseline\openapi_to_sbt\cli.py"
if (Test-Path $generatorCli) {
    $generatorDestination = Join-Path $freeze "generator\openapi_to_sbt"
    New-Item -ItemType Directory -Force $generatorDestination | Out-Null
    Copy-Item $generatorCli $generatorDestination -Force
}

$scheduleOutput = Join-Path $freeze "schedule-comparison.json"
$analysisArgs = @($analyzer)
foreach ($run in $selected) { $analysisArgs += @("--run", $run.FullName) }
$analysisArgs += @("--output", $scheduleOutput, "--require-variation")
& python @analysisArgs
if ($LASTEXITCODE -ne 0) { throw "Schedule comparison failed." }
$comparison = Read-Json $scheduleOutput
if ([int]$comparison.distinct_intent_schedules -ne 4 -or [int]$comparison.distinct_permit_schedules -ne 4) {
    throw "The four runs do not have four distinct Intent and Permit schedules."
}

$summary = [ordered]@{
    evidence_type = "Vikunja Increment 6 generated BP linearizable-write conflict verification"
    profile = "linearizable-write-conflicts"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    seeds = $seeds
    run_count = 4
    phase_checks_per_run = 16
    resource_verifier_witnesses_per_run = 30
    action_verifier_witnesses_per_run = 28
    negative_verifier_witnesses_per_run = 51
    prior_verifier_witnesses_per_run = 109
    conflict_verifier_witnesses_per_run = 28
    combined_verifier_witnesses_per_run = 137
    conflict_oracles_per_run = 4
    all_runs_passed = $true
    product_bug_claimed = $false
    distinct_intent_schedules = [int]$comparison.distinct_intent_schedules
    distinct_permit_schedules = [int]$comparison.distinct_permit_schedules
    selected_run_directories = $selectedNames
    excluded_run_directories = $excludedNames
}
$summary | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $freeze "evidence-summary.json") -Encoding UTF8
@"
Increment 6: four canonical runs of OpenAPI-derived SBT/BP linearizable-write conflict exploration.
Each run passed 16/16 lifecycle checks, 109/109 prior verifier obligations, and 28/28 conflict witnesses.
All four Intent and Permit schedules are distinct. No product bug is claimed by this evidence set.
"@ | Set-Content (Join-Path $freeze "README.txt") -Encoding UTF8

$hashes = foreach ($file in Get-ChildItem $freeze -Recurse -File | Where-Object { $_.Name -ne "SHA256SUMS.csv" }) {
    [pscustomobject]@{
        Path = $file.FullName.Substring($freeze.Length + 1).Replace("\", "/")
        SHA256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        SizeBytes = $file.Length
    }
}
$hashes | Sort-Object Path | Export-Csv (Join-Path $freeze "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8

$zip = "$freeze.zip"
Compress-Archive -Path (Join-Path $freeze "*") -DestinationPath $zip -CompressionLevel Optimal -Force
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()

Write-Host "INCREMENT6_LINEARIZABLE_CONFLICTS_EVIDENCE_FREEZE_PASS"
Write-Host "Selected runs:"
$selectedNames | ForEach-Object { Write-Host "  $_" }
Write-Host "Excluded runs:"
$excludedNames | ForEach-Object { Write-Host "  $_" }
Write-Host "Phase checks:                16/16 per run"
Write-Host "Prior verifier witnesses:    109/109 per run"
Write-Host "Conflict verifier witnesses: 28/28 per run"
Write-Host "Combined verifier witnesses: 137/137 per run"
Write-Host "Distinct Intent schedules:   4/4"
Write-Host "Distinct Permit schedules:   4/4"
Write-Host "Evidence directory: $freeze"
Write-Host "Evidence ZIP:       $zip"
Write-Host "ZIP SHA256:         $zipHash"
