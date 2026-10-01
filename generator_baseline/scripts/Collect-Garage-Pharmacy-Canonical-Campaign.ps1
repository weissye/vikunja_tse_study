[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$CampaignRoot
)

$ErrorActionPreference = 'Stop'
$CampaignRoot = (Resolve-Path $CampaignRoot).Path

$cells = @(
    [pscustomobject]@{ System='Garage'; Tool='RESTler'; Name='garage_restler' },
    [pscustomobject]@{ System='Garage'; Tool='EvoMaster'; Name='garage_evomaster' },
    [pscustomobject]@{ System='Pharmacy'; Tool='RESTler'; Name='pharmacy_restler' },
    [pscustomobject]@{ System='Pharmacy'; Tool='EvoMaster'; Name='pharmacy_evomaster' }
)

$summary = foreach ($cell in $cells) {
    $runDir = Join-Path $CampaignRoot $cell.Name
    $metaPath = Join-Path $runDir 'run_metadata.json'
    $semanticPath = Join-Path $runDir 'sequence_local_v35_b4\semantic_evaluation_sequence_local.json'
    $manifestPath = Join-Path $runDir 'sequence_local_v35_b4\sequence_manifest.json'
    foreach ($path in @($metaPath, $semanticPath, $manifestPath)) {
        if (-not (Test-Path $path)) { throw "Missing canonical result: $path" }
    }
    $meta = Get-Content $metaPath -Raw | ConvertFrom-Json
    $semantic = Get-Content $semanticPath -Raw | ConvertFrom-Json
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    [pscustomobject]@{
        System = $cell.System
        Tool = $cell.Tool
        RequestedBudget = $(if ($cell.Tool -eq 'RESTler') { "$($meta.requested_restler_time_budget_hours)h" } else { $meta.requested_evomaster_max_time })
        ObservedSeconds = $meta.observed_elapsed_seconds
        WallClockLimitSeconds = $(if ($cell.Tool -eq 'RESTler') { $meta.requested_restler_wall_clock_seconds } else { $meta.requested_evomaster_wall_clock_seconds })
        TerminationReason = $meta.termination_reason
        TrafficCutoffUtc = $meta.traffic_cutoff_utc
        TrafficCutoffElapsedSeconds = $meta.traffic_cutoff_elapsed_seconds
        TraceLastWriteUtc = $meta.campaign_trace_last_write_utc
        NativeExit = $meta.native_exit_code
        Complete = $semantic.official_evaluation_complete
        OfficialStatus = $semantic.official_status
        OfficialScore = $semantic.sequence_confirmed_score
        LowerBound = $semantic.sequence_confirmed_lower_bound
        Confirmed = @($semantic.sequence_confirmed_semantic_classes) -join ','
        ParsedSequences = $manifest.parsed_sequence_count
        Candidates = $manifest.candidate_sequence_count
        Replayed = $manifest.replayed_sequence_count
        ReplayErrors = $manifest.replay_error_count
        CampaignDiagnostic = $semantic.campaign_global_diagnostic.semantic_score
        RunDir = $runDir
    }
}

$summary | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $CampaignRoot 'canonical_summary.json') -Encoding UTF8
$summary | Export-Csv (Join-Path $CampaignRoot 'canonical_summary.csv') -NoTypeInformation -Encoding UTF8

$hashes = Get-ChildItem $CampaignRoot -Recurse -File | ForEach-Object {
    [pscustomobject]@{
        RelativePath = $_.FullName.Substring($CampaignRoot.Length).TrimStart('\')
        Length = $_.Length
        SHA256 = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    }
}
$hashes | Export-Csv (Join-Path $CampaignRoot 'SHA256SUMS.csv') -NoTypeInformation -Encoding UTF8

$reviewRoot = Join-Path ([IO.Path]::GetTempPath()) ('gp_canonical_review_' + [guid]::NewGuid().ToString('N'))
$reviewZip = Join-Path (Split-Path $CampaignRoot -Parent) ((Split-Path $CampaignRoot -Leaf) + '_review_bundle.zip')
if (Test-Path $reviewZip) { throw "Refusing to overwrite: $reviewZip" }
New-Item -ItemType Directory $reviewRoot | Out-Null
try {
    foreach ($file in @('campaign_metadata.json','canonical_summary.json','canonical_summary.csv','SHA256SUMS.csv')) {
        Copy-Item (Join-Path $CampaignRoot $file) $reviewRoot
    }
    foreach ($cell in $cells) {
        $destination = Join-Path $reviewRoot $cell.Name
        New-Item -ItemType Directory $destination | Out-Null
        $runDir = Join-Path $CampaignRoot $cell.Name
        foreach ($relative in @(
            'run_metadata.json',
            'restler_compile.log',
            'restler_fuzz.log',
            'restler_fuzz.stderr.log',
            'restler_wall_clock_termination.log',
            'evomaster.stdout.log',
            'evomaster.stderr.log',
            'evomaster_wall_clock_termination.log',
            'sut.stdout.log',
            'sut.stderr.log',
            'proxy.stdout.log',
            'proxy.stderr.log',
            'sequence_local_v35_b4\sequence_manifest.json',
            'sequence_local_v35_b4\semantic_evaluation_sequence_local.json',
            'sequence_local_v35_b4\run_metadata_sequence_local.json',
            'sequence_local_v35_b4\prepare_sequences.log',
            'sequence_local_v35_b4\evaluate_sequences.log',
            'sequence_local_v35_b4\restler_replay_log.json',
            'sequence_local_v35_b4\evomaster_replay_log.json'
        )) {
            $source = Join-Path $runDir $relative
            if (Test-Path $source) {
                $target = Join-Path $destination $relative
                New-Item -ItemType Directory -Force (Split-Path $target -Parent) | Out-Null
                Copy-Item $source $target
            }
        }
    }
    Compress-Archive -Path (Join-Path $reviewRoot '*') -DestinationPath $reviewZip -CompressionLevel Optimal
} finally {
    if (Test-Path $reviewRoot) { Remove-Item $reviewRoot -Recurse -Force }
}

$reviewHash = (Get-FileHash $reviewZip -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Host ''
Write-Host '===== CANONICAL FOUR-CELL SUMMARY =====' -ForegroundColor Cyan
$summary | Format-Table System,Tool,RequestedBudget,WallClockLimitSeconds,ObservedSeconds,TerminationReason,Complete,OfficialScore,ParsedSequences,Candidates,Replayed,ReplayErrors -AutoSize
Write-Host ''
Write-Host "Canonical raw evidence root: $CampaignRoot" -ForegroundColor Green
Write-Host "Review bundle            : $reviewZip" -ForegroundColor Green
Write-Host "Review bundle SHA256     : $reviewHash" -ForegroundColor Green
Write-Host 'Keep the entire raw evidence root. Upload the smaller review bundle first.' -ForegroundColor Yellow
