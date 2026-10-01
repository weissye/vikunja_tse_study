[CmdletBinding()]
param(
    [string]$Root = "",
    [string]$Target = "http://127.0.0.1:3477",
    [string]$Container = "gitea-stage1-server",
    [int]$Runs = 5,
    [int]$BaseSeed = 20260960,
    [int]$MinimumIndependentRuns = 3,
    [int]$MaxLength = 120000,
    [int]$QuiescenceMs = 100,
    [int]$MaxFieldPairs = 6
)

$ErrorActionPreference = "Stop"
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$studyRoot = if ([string]::IsNullOrWhiteSpace($Root)) {
    (Resolve-Path (Join-Path $scriptDir "..")).Path
} else { (Resolve-Path $Root).Path }
if ($Runs -lt $MinimumIndependentRuns) {
    throw "Runs must be at least MinimumIndependentRuns."
}
if ($MinimumIndependentRuns -lt 2) {
    throw "MinimumIndependentRuns must be at least 2."
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$campaign = Join-Path $studyRoot "runs\gitea-stage5-confirmation-$stamp"
New-Item -ItemType Directory -Force $campaign | Out-Null
$runDirectories = @()

for ($iteration = 1; $iteration -le $Runs; $iteration++) {
    $seed = $BaseSeed + $iteration - 1
    $generated = Join-Path $studyRoot "generated\gitea-stage5-$stamp-seed-$seed"
    & (Join-Path $scriptDir "Invoke-Gitea-Stage2-Preflight.ps1") `
        -Output $generated -Seed $seed -MaxFieldPairs $MaxFieldPairs -SkipEvidence | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Stage 5 generation failed for seed $seed." }

    $before = @(Get-ChildItem (Join-Path $studyRoot "runs") -Directory `
        -Filter "gitea-stage3-live-acceptance-*" -ErrorAction SilentlyContinue).FullName
    & (Join-Path $scriptDir "Invoke-Gitea-Stage3.ps1") `
        -Root $studyRoot -Generated $generated -Target $Target -Seed $seed `
        -MaxLength $MaxLength -QuiescenceMs $QuiescenceMs -Quiet | Out-Null
    $stageExit = $LASTEXITCODE
    if ($stageExit -notin @(0, 3)) {
        throw "Stage 5 live run failed unexpectedly for seed $seed (exit $stageExit)."
    }
    $after = @(Get-ChildItem (Join-Path $studyRoot "runs") -Directory `
        -Filter "gitea-stage3-live-acceptance-*" | Sort-Object LastWriteTimeUtc)
    $current = $after | Where-Object { $_.FullName -notin $before } | Select-Object -Last 1
    if (-not $current) { throw "Could not identify the Stage 5 trial for seed $seed." }
    $runDirectories += $current.FullName
    Write-Host "Stage 5 trial $iteration/$($Runs): seed=$seed"
}

$summary = Join-Path $campaign "stage5-confirmation-summary.json"
$csv = Join-Path $campaign "stage5-confirmation-candidates.csv"
$arguments = @(
    (Join-Path $scriptDir "analyze_gitea_stage5_confirmation.py"),
    "--output", $summary,
    "--csv", $csv,
    "--minimum-independent-runs", "$MinimumIndependentRuns"
)
foreach ($directory in $runDirectories) { $arguments += @("--run", $directory) }
& python @arguments
if ($LASTEXITCODE -ne 0) { throw "Stage 5 confirmation analysis failed." }

$index = foreach ($directory in $runDirectories) {
    $metadata = Get-Content (Join-Path $directory "run-metadata.json") -Raw | ConvertFrom-Json
    [pscustomobject]@{ seed = $metadata.seed; run_directory = $directory }
}
$index | Export-Csv (Join-Path $campaign "stage5-run-index.csv") -NoTypeInformation -Encoding UTF8

$containerLog = Join-Path $campaign "gitea-container.log"
$savedPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& docker logs $Container 2>&1 | Out-File $containerLog -Encoding utf8
$dockerExit = $LASTEXITCODE
$ErrorActionPreference = $savedPreference
if ($dockerExit -ne 0) {
    "docker logs failed with exit code $dockerExit" | Set-Content $containerLog -Encoding UTF8
}

$evidence = Join-Path $studyRoot "evidence"
New-Item -ItemType Directory -Force $evidence | Out-Null
$zip = Join-Path $evidence "gitea-stage5-confirmation-$stamp-review.zip"
Compress-Archive -Path (Join-Path $campaign "*") -DestinationPath $zip -Force
$sha = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()
$result = Get-Content $summary -Raw | ConvertFrom-Json

Write-Host ""
Write-Host "GITEA_STAGE5_EVIDENCE_READY"
Write-Host "Independent runs:                 $($result.totals.runs)"
Write-Host "Candidate groups:                 $($result.totals.candidate_groups)"
Write-Host "Confirmed contract deviations:    $($result.totals.confirmed_contract_deviations)"
Write-Host "Reproducible server candidates:    $($result.totals.reproducible_server_failure_candidates)"
Write-Host "Status:                            $($result.status)"
Write-Host "Evidence ZIP:                      $zip"
Write-Host "ZIP SHA256:                        $sha"
Write-Host "GITEA_STAGE5_COMPLETE"
