[CmdletBinding()]
param(
    [string]$Root = "",
    [string]$Target = "http://127.0.0.1:3477",
    [int]$Runs = 5,
    [int]$BaseSeed = 20260940,
    [int]$SaturationRuns = 2,
    [int]$MinimumUniqueOracles = 7,
    [int]$MinimumProducerFamilies = 2,
    [int]$MaxLength = 120000,
    [int]$QuiescenceMs = 100,
    [int]$MaxFieldPairs = 6
)

$ErrorActionPreference = "Stop"
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) {
    $Root = (Resolve-Path (Join-Path $scriptDir "..")).Path
} else { $Root = (Resolve-Path $Root).Path }
if ($Runs -lt 1) { throw "Runs must be at least 1." }
if ($SaturationRuns -lt 1) { throw "SaturationRuns must be at least 1." }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$campaign = Join-Path $Root "runs\gitea-stage4-campaign-$stamp"
New-Item -ItemType Directory -Force $campaign | Out-Null
$runDirectories = @()
$seen = @{}
$seenProducers = @{}
$withoutNew = 0

for ($iteration = 1; $iteration -le $Runs; $iteration++) {
    $seed = $BaseSeed + $iteration - 1
    $generated = Join-Path $Root "generated\gitea-stage4-$stamp-seed-$seed"
    & (Join-Path $scriptDir "Invoke-Gitea-Stage2-Preflight.ps1") `
        -Output $generated -Seed $seed -MaxFieldPairs $MaxFieldPairs -SkipEvidence | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Stage 4 generation failed for seed $seed." }

    $before = @(Get-ChildItem (Join-Path $Root "runs") -Directory `
        -Filter "gitea-stage3-live-acceptance-*" -ErrorAction SilentlyContinue).FullName
    & (Join-Path $scriptDir "Invoke-Gitea-Stage3.ps1") `
        -Root $Root -Generated $generated -Target $Target -Seed $seed `
        -MaxLength $MaxLength -QuiescenceMs $QuiescenceMs -Quiet | Out-Null
    $stageExit = $LASTEXITCODE
    if ($stageExit -notin @(0, 3)) { throw "Stage 4 live run failed unexpectedly for seed $seed (exit $stageExit)." }

    $after = @(Get-ChildItem (Join-Path $Root "runs") -Directory `
        -Filter "gitea-stage3-live-acceptance-*" | Sort-Object LastWriteTimeUtc)
    $current = $after | Where-Object { $_.FullName -notin $before } | Select-Object -Last 1
    if (-not $current) { throw "Could not identify the Stage 3 run for seed $seed." }
    $runDirectories += $current.FullName

    $newCount = 0
    $epochFile = Join-Path $current.FullName "concurrent-epochs.jsonl"
    foreach ($line in Get-Content $epochFile -ErrorAction SilentlyContinue) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $oracle = ([string](ConvertFrom-Json $line).scenario)
        if ($oracle -and -not $seen.ContainsKey($oracle)) { $seen[$oracle] = $true; $newCount++ }
    }
    $planPath = Join-Path $current.FullName "concurrency-plan.gitea.json"
    if (Test-Path $planPath -PathType Leaf) {
        $plan = Get-Content $planPath -Raw | ConvertFrom-Json
        foreach ($entry in $plan.oracles) {
            if ($seen.ContainsKey([string]$entry.oracle_id)) {
                $producer = [string]$entry.runtime.create_operation_id
                if ($producer) { $seenProducers[$producer] = $true }
            }
        }
    }
    if ($newCount -eq 0) { $withoutNew++ } else { $withoutNew = 0 }
    Write-Host "Stage 4 run $iteration/$($Runs): seed=$seed, new=$newCount, cumulative=$($seen.Count)"
    $acceptanceReached = ($seen.Count -ge $MinimumUniqueOracles -and
                          $seenProducers.Count -ge $MinimumProducerFamilies)
    if ($withoutNew -ge $SaturationRuns -and $acceptanceReached) {
        Write-Host "Coverage saturation reached after $withoutNew consecutive runs without a new oracle."
        break
    }
}

$summary = Join-Path $campaign "stage4-campaign-summary.json"
$csv = Join-Path $campaign "stage4-epochs.csv"
$arguments = @((Join-Path $scriptDir "analyze_gitea_stage4_campaign.py"),
    "--output", $summary, "--csv", $csv,
    "--minimum-unique-oracles", "$MinimumUniqueOracles",
    "--minimum-producer-families", "$MinimumProducerFamilies")
foreach ($directory in $runDirectories) { $arguments += @("--run", $directory) }
& python @arguments
$analysisExit = $LASTEXITCODE

$indexRows = foreach ($directory in $runDirectories) {
    $metadata = Get-Content (Join-Path $directory "run-metadata.json") -Raw | ConvertFrom-Json
    $zip = Join-Path (Join-Path $Root "evidence") ((Split-Path $directory -Leaf) + "-review.zip")
    [pscustomobject]@{
        seed = $metadata.seed
        run_directory = $directory
        evidence_zip = $zip
        evidence_sha256 = if (Test-Path $zip) { (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant() } else { $null }
    }
}
$indexRows | Export-Csv (Join-Path $campaign "stage4-run-index.csv") -NoTypeInformation -Encoding UTF8

$evidence = Join-Path $Root "evidence"
New-Item -ItemType Directory -Force $evidence | Out-Null
$zip = Join-Path $evidence "gitea-stage4-campaign-$stamp-review.zip"
Compress-Archive -Path (Join-Path $campaign "*") -DestinationPath $zip -Force
$sha = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()
$result = Get-Content $summary -Raw | ConvertFrom-Json

Write-Host ""
Write-Host "GITEA_STAGE4_EVIDENCE_READY"
Write-Host "Campaign runs:       $($result.totals.runs)"
Write-Host "Concurrency epochs:  $($result.totals.epochs)"
Write-Host "Unique oracles:      $($result.totals.unique_oracles)"
Write-Host "Producer families:   $($result.totals.producer_families)"
Write-Host "Status:              $($result.status)"
Write-Host "Evidence ZIP:        $zip"
Write-Host "ZIP SHA256:          $sha"
if ($analysisExit -ne 0) { throw "GITEA_STAGE4_INCOMPLETE: evidence was preserved at $zip." }
Write-Host "GITEA_STAGE4_COMPLETE"
