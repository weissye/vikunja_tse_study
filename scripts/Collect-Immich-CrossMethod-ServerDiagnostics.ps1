param(
    [string]$RunDirectory = '.\runs\research-fit-immich-generated-20260927_042449_784',
    [int]$Seed = 20261704,
    [string]$Container = 'fse_album_immich_server'
)

$ErrorActionPreference = 'Stop'
$project = (Get-Location).Path
$run = (Resolve-Path -LiteralPath $RunDirectory).Path
$seedDir = Join-Path $run "seed-$Seed"
$epochPath = Join-Path $seedDir 'concurrent-epochs.jsonl'
$tracePath = Join-Path $seedDir 'http-trace.jsonl'
$evaluationPath = Join-Path $seedDir 'generated-verifier-evaluation.json'
foreach ($path in @($epochPath, $tracePath, $evaluationPath)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing run evidence: $path" }
}

$epochs = @(Get-Content -LiteralPath $epochPath | Where-Object { $_.Trim() } |
    ForEach-Object { $_ | ConvertFrom-Json })
$selected = @($epochs | Where-Object {
    $_.scenario -in @(
        'cross-method::update-delete::updateAlbumInfo::deleteAlbum',
        'cross-method::update-delete::updateSharedLink::removeSharedLink') -and
    $_.overlap_observed -eq $true
})
if ($selected.Count -ne 2) { throw "Expected two overlapping update/delete epochs, found $($selected.Count)" }

$timeValues = @($selected | ForEach-Object { $_.operations } | ForEach-Object {
    [datetimeoffset]::Parse($_.started_utc, [globalization.cultureinfo]::InvariantCulture)
    [datetimeoffset]::Parse($_.ended_utc, [globalization.cultureinfo]::InvariantCulture)
})
$start = ($timeValues | Sort-Object | Select-Object -First 1).ToUniversalTime().AddSeconds(-15)
$end = ($timeValues | Sort-Object | Select-Object -Last 1).ToUniversalTime().AddSeconds(15)
$since = $start.ToString("yyyy-MM-ddTHH:mm:ssZ")
$until = $end.ToString("yyyy-MM-ddTHH:mm:ssZ")

& docker info --format '{{.ServerVersion}}' 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Docker engine unavailable; start Docker Desktop and retry' }
& docker container inspect $Container --format '{{.Id}}' 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Container unavailable: $Container" }

$outDir = Join-Path $project ("evidence\immich-cross-method-diagnostics-$Seed")
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

# Docker logs are indexed in UTC. Obtain a short window from the actual HTTP
# timestamps, not from the local Windows clock or the run directory name.
$previousErrorAction = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
    $dockerLines = @(& docker logs $Container --timestamps --since $since --until $until 2>&1 |
        ForEach-Object { [string]$_ })
    $dockerExit = $LASTEXITCODE
} finally {
    $ErrorActionPreference = $previousErrorAction
}
if ($dockerExit -ne 0) { throw "docker logs failed with exit code $dockerExit" }

# The full run evidence was already frozen. Collect only an error window here.
# Drop any line with a possible credential, and mask URLs and email addresses.
$cleanLines = @($dockerLines | ForEach-Object {
    if ($_ -match '(?i)authorization|bearer|password|secret|token|cookie|api[_-]?key') {
        '[POTENTIALLY_SENSITIVE_LINE_REDACTED]'
    } else {
        ($_ -replace 'https?://\S+', '[URL_REDACTED]') -replace
            '[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}', '[EMAIL_REDACTED]'
    }
})
if ($cleanLines.Count -eq 0) { $cleanLines = @('[No server log lines returned for the UTC window]') }
$cleanLines | Set-Content -LiteralPath (Join-Path $outDir 'server-logs-redacted.txt') -Encoding UTF8

$trace = @(Get-Content -LiteralPath $tracePath | Where-Object { $_.Trim() } |
    ForEach-Object { $_ | ConvertFrom-Json })
$observed = @($trace | Where-Object {
    $_.epoch_id -match '^generated-epoch-[01]$|^cross-(baseline|control)-[ab01-]' -and
    $_.model_path -match '^/(albums|shared-links)(/|$)'
} | ForEach-Object {
    [pscustomobject]@{
        epoch_id = $_.epoch_id
        method = $_.method
        model_path = $_.model_path
        operation_id = $_.operation_id
        request_id = $_.request_id
        status = $_.status
        response_message = if ($_.response -and $_.response.message) { $_.response.message } else { $null }
        upstream_started_utc = $_.upstream_started_utc
        upstream_completed_utc = $_.upstream_completed_utc
    }
})
$evaluation = Get-Content -LiteralPath $evaluationPath -Raw | ConvertFrom-Json
$witnesses = @($evaluation.witnesses | Where-Object { $_.kind -eq 'empirical-update-delete' } |
    ForEach-Object {
        [pscustomobject]@{
            oracle_id = $_.oracle_id
            epoch_id = $_.epoch_id
            result = $_.result
            reason = $_.reason
            server_error_candidate = $_.server_error_candidate
        }
    })
$report = [pscustomobject]@{
    seed = $Seed
    container = $Container
    since_utc = $since
    until_utc = $until
    overlap_scenarios = @($selected | ForEach-Object { $_.scenario })
    witnesses = $witnesses
    relevant_http_events = $observed
    docker_log_lines = $dockerLines.Count
}
$report | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $outDir 'request-and-oracle-summary.json') -Encoding UTF8

$files = @(Get-ChildItem -LiteralPath $outDir -File | Sort-Object Name)
$hashes = @($files | ForEach-Object {
    [pscustomobject]@{ file = $_.Name; sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash }
})
$hashes | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $outDir 'checksums.json') -Encoding UTF8
$zip = Join-Path $project ("evidence\immich-cross-method-diagnostics-$Seed.zip")
Compress-Archive -Path (Join-Path $outDir '*') -DestinationPath $zip -Force
Write-Host "IMMICH_DIAGNOSTICS_READY $zip"
Write-Host "UTC window: $since to $until; Docker log lines: $($dockerLines.Count)"
Write-Host "ZIP SHA256: $((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant())"
