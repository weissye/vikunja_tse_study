[CmdletBinding()]
param(
    [string]$Root = '',
    [string]$Target = 'http://127.0.0.1:3477',
    [ValidateRange(1,20)][int]$Runs = 1,
    [int]$BaseSeed = 20260970,
    [ValidateRange(1000,1000000)][int]$MaxLength = 120000,
    [ValidateRange(1,20)][int]$InstancesPerEntity = 3,
    [ValidateRange(1,20)][int]$InstancesPerAction = 2,
    [ValidateRange(0,10000)][int]$MinimumPriorHttpEvents = 12,
    [ValidateRange(0,60000)][int]$QuiescenceMs = 100,
    [ValidateRange(1,100)][int]$MaxFieldPairs = 6
)
$ErrorActionPreference = 'Stop'
$scriptDir = $PSScriptRoot
$studyRoot = if ([string]::IsNullOrWhiteSpace($Root)) {
    (Resolve-Path (Join-Path $scriptDir '..')).Path
} else { (Resolve-Path $Root).Path }
$preflight = Join-Path $scriptDir 'Invoke-Gitea-Stage2-Preflight.ps1'
$live = Join-Path $scriptDir 'Invoke-Gitea-Stage3.ps1'
$analyzer = Join-Path $scriptDir 'analyze_gitea_stage6_campaign.py'
foreach ($path in @($preflight, $live, $analyzer)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing Stage 6 dependency: $path" }
}
if ([string]::IsNullOrWhiteSpace($env:GITEA_API_TOKEN)) {
    throw 'GITEA_API_TOKEN is empty. Use the Stage 1 research identity in this PowerShell session.'
}
foreach ($name in @('python', 'provengo')) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) { throw "$name is not on PATH." }
}
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss_fff'
$campaign = Join-Path $studyRoot "runs\gitea-stage6-generated-$stamp"
New-Item -ItemType Directory -Path $campaign -Force | Out-Null
$indexPath = Join-Path $campaign 'stage6-run-index.json'
$entries = [System.Collections.Generic.List[object]]::new()
$failure = $null
for ($iteration = 1; $iteration -le $Runs; $iteration++) {
    $seed = $BaseSeed + $iteration - 1
    $generated = Join-Path $studyRoot "generated\gitea-stage6-$stamp-seed-$seed"
    $entry = [ordered]@{ seed = $seed; generated_directory = $generated;
                        run_directory = $null; stage3_exit = $null; phase = 'GENERATION' }
    try {
        & $preflight -Output $generated -Seed $seed -MaxFieldPairs $MaxFieldPairs `
            -InstancesPerEntity $InstancesPerEntity -InstancesPerAction $InstancesPerAction `
            -StoryProfile 'long-interleaving' `
            -SkipEvidence | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Stage 2 preflight failed for seed $seed." }
        $entry.phase = 'LIVE_RUN'
        $prior = @((Get-ChildItem (Join-Path $studyRoot 'runs') -Directory `
            -Filter 'gitea-stage3-live-acceptance-*' -ErrorAction SilentlyContinue).FullName)
        & $live -Root $studyRoot -Generated $generated -Target $Target -Seed $seed `
            -MaxLength $MaxLength -QuiescenceMs $QuiescenceMs -Quiet | Out-Null
        $entry.stage3_exit = $LASTEXITCODE
        $new = @(Get-ChildItem (Join-Path $studyRoot 'runs') -Directory `
            -Filter 'gitea-stage3-live-acceptance-*' | Where-Object {
                $_.FullName -notin $prior
            } | Sort-Object LastWriteTimeUtc)
        if ($new.Count -ne 1) { throw "Could not uniquely identify Stage 3 run for seed $seed." }
        $entry.run_directory = $new[0].FullName
        if ($entry.stage3_exit -notin @(0, 3)) {
            throw "Stage 3 returned unexpected exit code $($entry.stage3_exit)."
        }
        $entry.phase = 'RECORDED'
        Write-Host "GITEA_STAGE6_SEED seed=$seed exit=$($entry.stage3_exit) run=$($entry.run_directory)"
    }
    catch {
        $entry.phase = 'FAILED'
        $entry.error = [string]$_.Exception.Message
        $failure = "Seed $seed failed: $($entry.error)"
    }
    finally {
        $entries.Add([pscustomobject]$entry)
        [ordered]@{
            schema_version = 1; requested_runs = $Runs; runs = @($entries.ToArray())
            parameters = [ordered]@{
                base_seed = $BaseSeed; max_length = $MaxLength;
                instances_per_entity = $InstancesPerEntity;
                instances_per_action = $InstancesPerAction;
                story_profile = 'long-interleaving';
                quiescence_ms = $QuiescenceMs; target = $Target
            }
        } | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $indexPath -Encoding UTF8
    }
    if ($failure) { break }
}
try {
    & python $analyzer --root $studyRoot --campaign $campaign `
        --min-prior-http-events $MinimumPriorHttpEvents
    if ($LASTEXITCODE -ne 0) { throw 'Stage 6 campaign analysis failed.' }
}
catch {
    $failure = "Stage 6 analysis failed: $($_.Exception.Message)"
    $failure | Set-Content -LiteralPath (Join-Path $campaign 'analysis-error.txt') -Encoding UTF8
}
foreach ($source in @($PSCommandPath, $preflight, $live, $analyzer)) {
    Copy-Item -LiteralPath $source -Destination (Join-Path $campaign (Split-Path $source -Leaf))
}
$generatorFiles = @(
    (Join-Path $studyRoot 'generator_baseline\openapi_to_sbt\cli.py'),
    (Join-Path $studyRoot 'generator_baseline\openapi_to_sbt\render\stories_js.py')
)
foreach ($source in $generatorFiles) {
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        throw "Generator source missing from evidence snapshot: $source"
    }
    Copy-Item -LiteralPath $source -Destination (Join-Path $campaign ('generator-' + (Split-Path $source -Leaf)))
}
$hashRows = @(Get-ChildItem -LiteralPath $campaign -File |
    Where-Object { $_.Name -ne 'SHA256SUMS.csv' } |
    Sort-Object Name |
    ForEach-Object { [pscustomobject]@{
        path = $_.Name; size_bytes = $_.Length;
        sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    } })
$hashRows | Export-Csv -LiteralPath (Join-Path $campaign 'SHA256SUMS.csv') -NoTypeInformation -Encoding UTF8
$evidenceDir = Join-Path $studyRoot 'evidence'
New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null
$zip = Join-Path $evidenceDir ((Split-Path $campaign -Leaf) + '-review.zip')
if (Test-Path -LiteralPath $zip) { throw "Evidence ZIP already exists: $zip" }
Compress-Archive -Path (Join-Path $campaign '*') -DestinationPath $zip
$sha = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Host 'GITEA_STAGE6_GENERATED_EVIDENCE_READY'
Write-Host "Run directory: $campaign"
Write-Host "Evidence ZIP:  $zip"
Write-Host "ZIP SHA256:    $sha"
if ($failure) { throw "GITEA_STAGE6_INCOMPLETE: $failure. Evidence preserved at $zip" }
$summary = Get-Content -LiteralPath (Join-Path $campaign 'stage6-campaign-summary.json') -Raw | ConvertFrom-Json
Write-Host "Status:        $($summary.status)"
Write-Host "HTTP events:   $($summary.total_http_events)"
Write-Host "Epochs:        $($summary.total_epochs)"
Write-Host "Real overlap:  $($summary.observed_overlapping_epochs)"
Write-Host "Position+overlap (noncausal): $($summary.overlapping_epochs_after_prior_http_threshold)"
Write-Host "Long story steps: $($summary.long_story_steps_selected)"
Write-Host "Longest observed story (rounds): $($summary.longest_observed_story_rounds)"
Write-Host 'GITEA_STAGE6_GENERATED_COMPLETE'
