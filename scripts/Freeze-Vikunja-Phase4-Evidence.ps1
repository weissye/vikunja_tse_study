param(
    [string]$Root = "",
    [int[]]$Seeds = @(20261101, 20261102, 20261103, 20261104)
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path }
else { $Root = (Resolve-Path $Root).Path }

function Test-RunManifest([System.IO.DirectoryInfo]$Run) {
    $manifestPath = Join-Path $Run.FullName "SHA256SUMS.csv"
    if (-not (Test-Path $manifestPath)) { return $false }
    foreach ($entry in Import-Csv $manifestPath) {
        $file = Join-Path $Run.FullName ($entry.Path -replace '/', '\')
        if (-not (Test-Path $file)) { return $false }
        $actual = (Get-FileHash $file -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actual -ne $entry.SHA256.ToLowerInvariant()) { return $false }
    }
    return $true
}

function Test-SuccessfulRun([System.IO.DirectoryInfo]$Run, [int]$Seed) {
    $evaluationPath = Join-Path $Run.FullName "phase4-relation-kind-evaluation.json"
    $metadataPath = Join-Path $Run.FullName "run-metadata.json"
    $probePath = Join-Path $Run.FullName "post-delete-probe.json"
    foreach ($required in @($evaluationPath, $metadataPath, $probePath,
        (Join-Path $Run.FullName "http-trace.jsonl"))) {
        if (-not (Test-Path $required)) { return $false }
    }
    try {
        $evaluation = Get-Content $evaluationPath -Raw | ConvertFrom-Json
        $metadata = Get-Content $metadataPath -Raw | ConvertFrom-Json
        $probe = Get-Content $probePath -Raw | ConvertFrom-Json
    } catch { return $false }
    $anomalyCount = @($evaluation.anomalies).Count
    return ($evaluation.campaign_passed -eq $true -and
        $evaluation.passed_count -eq 15 -and
        $evaluation.required_count -eq 15 -and
        $anomalyCount -eq 0 -and
        $metadata.seed -eq $Seed -and
        $metadata.provengo_exit_code -eq 0 -and
        $metadata.deletion_probe_exit_code -eq 0 -and
        $metadata.evaluation_exit_code -eq 0 -and
        $probe.all_deletions_observable -eq $true -and
        (Test-RunManifest $Run))
}

$selected = @()
$excluded = @()
foreach ($seed in $Seeds) {
    $candidates = @(Get-ChildItem (Join-Path $Root "runs") -Directory `
        -Filter "phase4-relation-kind-campaign-seed-$seed-*" | Sort-Object LastWriteTime -Descending)
    $valid = @()
    foreach ($candidate in $candidates) {
        if (Test-SuccessfulRun $candidate $seed) { $valid += $candidate }
        else { $excluded += $candidate.Name }
    }
    if ($valid.Count -ne 1) {
        throw "Expected exactly one fully valid Phase 4 run for seed $seed; found $($valid.Count)."
    }
    $selected += $valid[0]
}

$modelTriples = @()
foreach ($run in $selected) {
    $metadata = Get-Content (Join-Path $run.FullName "run-metadata.json") -Raw | ConvertFrom-Json
    $modelTriples += "$($metadata.model_openapi_sha256)|$($metadata.interfaces_sha256)|$($metadata.stories_sha256)"
}
if (@($modelTriples | Select-Object -Unique).Count -ne 1) {
    throw "Selected runs do not use one identical OpenAPI/interfaces/stories model triple."
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$freezeRoot = Join-Path $Root "evidence\phase4-relation-kind-evidence-$stamp"
$runsTarget = Join-Path $freezeRoot "runs"
$modelTarget = Join-Path $freezeRoot "model"
$toolsTarget = Join-Path $freezeRoot "tools"
New-Item -ItemType Directory -Force $runsTarget, $modelTarget, $toolsTarget | Out-Null
foreach ($run in $selected) { Copy-Item $run.FullName (Join-Path $runsTarget $run.Name) -Recurse }
Copy-Item (Join-Path $Root "phase3b\vikunja-relations-openapi.json") $modelTarget
Copy-Item (Join-Path $Root "phase3b\relations-projection-manifest.json") $modelTarget
Copy-Item (Join-Path $Root "phase4\generated-relation-kind-campaign") $modelTarget -Recurse
foreach ($name in @(
    "Invoke-Vikunja-Relation-Kind-Campaign.ps1",
    "evaluate_vikunja_relation_kind_campaign.py",
    "probe_vikunja_relation_campaign_deletions.py",
    "vikunja_research_proxy.py"
)) { Copy-Item (Join-Path $Root "scripts\$name") $toolsTarget }

$summary = [ordered]@{
    evidence_type = "Vikunja Phase 4 high-complexity relation-kind campaign"
    profile = "relation-kind-campaign"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    seeds = $Seeds
    run_count = $selected.Count
    required_checks_per_run = 15
    all_runs_passed = $true
    selected_run_directories = @($selected | ForEach-Object Name)
    excluded_run_directories = @($excluded)
    model_hash_triple = $modelTriples[0]
}
$summary | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $freezeRoot "evidence-summary.json") -Encoding UTF8

$files = @(Get-ChildItem $freezeRoot -Recurse -File | Where-Object Name -ne "SHA256SUMS.csv")
$manifest = foreach ($file in $files) {
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

Write-Host "PHASE4_EVIDENCE_FREEZE_PASS"
Write-Host "Selected runs:"
$selected | ForEach-Object { Write-Host "  $($_.Name)" }
Write-Host "Excluded runs:"
$excluded | ForEach-Object { Write-Host "  $_" }
Write-Host "Evidence directory: $freezeRoot"
Write-Host "Evidence ZIP:       $zip"
Write-Host "ZIP SHA256:         $zipHash"
