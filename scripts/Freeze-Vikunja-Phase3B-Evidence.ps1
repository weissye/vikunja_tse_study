param(
    [string]$Root = "",
    [int[]]$Seeds = @(20261011, 20261012, 20261013, 20261014)
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path }
else { $Root = (Resolve-Path $Root).Path }

$selected = @()
foreach ($seed in $Seeds) {
    $matches = @(Get-ChildItem (Join-Path $Root "runs") -Directory `
        -Filter "phase3b-relation-lifecycle-seed-$seed-*" | Sort-Object LastWriteTime -Descending)
    if ($matches.Count -ne 1) {
        throw "Expected exactly one Phase 3B run for seed $seed, found $($matches.Count)."
    }
    $run = $matches[0]
    $evaluationPath = Join-Path $run.FullName "phase3b-relation-evaluation.json"
    $metadataPath = Join-Path $run.FullName "run-metadata.json"
    $manifestPath = Join-Path $run.FullName "SHA256SUMS.csv"
    foreach ($required in @($evaluationPath, $metadataPath, $manifestPath, (Join-Path $run.FullName "http-trace.jsonl"))) {
        if (-not (Test-Path $required)) { throw "Missing evidence file: $required" }
    }
    $evaluation = Get-Content $evaluationPath -Raw | ConvertFrom-Json
    $metadata = Get-Content $metadataPath -Raw | ConvertFrom-Json
    if (-not $evaluation.phase3b_pilot_passed -or $evaluation.passed_count -ne 21 -or $evaluation.required_count -ne 21) {
        throw "Seed $seed did not satisfy the required 21/21 evaluation."
    }
    if ($metadata.seed -ne $seed -or $metadata.provengo_exit_code -ne 0 -or
        $metadata.deletion_probe_exit_code -ne 0 -or $metadata.evaluation_exit_code -ne 0) {
        throw "Seed $seed has inconsistent run metadata or a non-zero exit code."
    }
    $manifest = Import-Csv $manifestPath
    foreach ($entry in $manifest) {
        $file = Join-Path $run.FullName ($entry.Path -replace '/', '\')
        if (-not (Test-Path $file)) { throw "Manifest entry is missing for seed ${seed}: $($entry.Path)" }
        $actual = (Get-FileHash $file -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actual -ne $entry.SHA256.ToLowerInvariant()) {
            throw "Manifest hash mismatch for seed ${seed}: $($entry.Path)"
        }
    }
    $selected += $run
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$freezeRoot = Join-Path $Root "evidence\phase3b-relation-evidence-$stamp"
$runsTarget = Join-Path $freezeRoot "runs"
$modelTarget = Join-Path $freezeRoot "model"
$toolsTarget = Join-Path $freezeRoot "tools"
New-Item -ItemType Directory -Force $runsTarget, $modelTarget, $toolsTarget | Out-Null

foreach ($run in $selected) {
    Copy-Item $run.FullName (Join-Path $runsTarget $run.Name) -Recurse
}
Copy-Item (Join-Path $Root "phase3b\vikunja-relations-openapi.json") $modelTarget
Copy-Item (Join-Path $Root "phase3b\relations-projection-manifest.json") $modelTarget
Copy-Item (Join-Path $Root "phase3b\generated-relations-lifecycle") $modelTarget -Recurse
foreach ($name in @(
    "Invoke-Vikunja-Relation-Lifecycle.ps1",
    "evaluate_vikunja_relation_lifecycle.py",
    "probe_vikunja_relation_deletions.py",
    "vikunja_research_proxy.py"
)) {
    Copy-Item (Join-Path $Root "scripts\$name") $toolsTarget
}

$summary = [ordered]@{
    evidence_type = "Vikunja Phase 3B validated relation lifecycle"
    profile = "validated-relation-lifecycle"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    seeds = $Seeds
    run_count = $selected.Count
    required_witnesses_per_run = 21
    all_runs_passed = $true
    run_directories = @($selected | ForEach-Object Name)
}
$summary | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $freezeRoot "evidence-summary.json") -Encoding UTF8

$files = @(Get-ChildItem $freezeRoot -Recurse -File | Where-Object Name -ne "SHA256SUMS.csv")
$freezeManifest = foreach ($file in $files) {
    [pscustomobject]@{
        Path = $file.FullName.Substring($freezeRoot.Length + 1).Replace("\", "/")
        SHA256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        SizeBytes = $file.Length
    }
}
$freezeManifest | Sort-Object Path | Export-Csv (Join-Path $freezeRoot "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8

$zip = "$freezeRoot.zip"
Compress-Archive -Path (Join-Path $freezeRoot "*") -DestinationPath $zip -CompressionLevel Optimal
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Host "PHASE3B_EVIDENCE_FREEZE_PASS"
Write-Host "Evidence directory: $freezeRoot"
Write-Host "Evidence ZIP:       $zip"
Write-Host "ZIP SHA256:         $zipHash"
