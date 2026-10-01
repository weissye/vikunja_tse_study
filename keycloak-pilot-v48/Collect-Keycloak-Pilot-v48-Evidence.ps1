param(
    [string]$StudyRoot = 'C:\work\temp\vikunja_tse_study',
    [string]$OutputZip
)

$ErrorActionPreference = 'Stop'
$pilot = Join-Path $StudyRoot 'keycloak-pilot-v48'
$run = Join-Path $pilot 'runs\pilot-01'
if (-not (Test-Path -LiteralPath $run -PathType Container)) {
    throw "Pilot run not found: $run"
}

if (-not $OutputZip) {
    $OutputZip = Join-Path $StudyRoot ('keycloak-pilot-v48-evidence-' +
        (Get-Date -Format 'yyyyMMdd-HHmmss') + '.zip')
}
if (Test-Path -LiteralPath $OutputZip) { throw "Output already exists: $OutputZip" }

$work = Join-Path $env:TEMP ('keycloak-pilot-v48-evidence-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $work | Out-Null
try {
    foreach ($name in @('pilot-summary-v48.json', 'http-intervals.jsonl', 'provengo.log')) {
        if (-not (Test-Path -LiteralPath (Join-Path $run $name) -PathType Leaf)) {
            throw "Missing run evidence: $name"
        }
    }

    foreach ($name in @('pilot-summary-v48.json', 'manifest-v48.json',
            'static-audit-v48.json', 'scenario-digest-v48.json')) {
        $source = if ($name -eq 'pilot-summary-v48.json') {
            Join-Path $run $name
        } else { Join-Path $pilot $name }
        if (Test-Path -LiteralPath $source -PathType Leaf) {
            Copy-Item -LiteralPath $source -Destination (Join-Path $work $name)
        }
    }

    $logLines = @(Get-Content -LiteralPath (Join-Path $run 'provengo.log'))
    $hits = @($logLines | Select-String -Pattern 'WARN .*FAIL:|ERR .*|actual [0-9]{3}, expected|Test Result|Exception|ReferenceError|TypeError' |
        Where-Object { $_.Line -notmatch 'Selected:' } |
        Select-Object -First 30)
    $safeLog = foreach ($hit in $hits) {
        $line = $hit.Line -replace 'Bearer\s+[A-Za-z0-9._~+/-]+', 'Bearer [REDACTED]'
        $line = $line -replace 'access_token["'':=\s]+[A-Za-z0-9._~+/-]+', 'access_token=[REDACTED]'
        "line $($hit.LineNumber): $line"
    }
    Set-Content -LiteralPath (Join-Path $work 'provengo-failures-redacted.txt') -Value @($safeLog) -Encoding UTF8

    $counts = [ordered]@{ requests = 0; http_failures = 0; race_pairs = 0;
        overlapping_pairs = 0; put_failures = 0 }
    $httpFailures = New-Object System.Collections.Generic.List[object]
    $raceFailures = New-Object System.Collections.Generic.List[object]
    $recent = New-Object System.Collections.Generic.Queue[object]
    Get-Content -LiteralPath (Join-Path $run 'http-intervals.jsonl') | ForEach-Object {
        if (-not $_.Trim()) { return }
        $entry = $_ | ConvertFrom-Json
        $method = [string]$entry.method
        if ($method -eq 'RACE_PAIR') {
            $counts.race_pairs++
            if ($entry.overlap -eq $true) { $counts.overlapping_pairs++ }
            else {
                $raceFailures.Add([ordered]@{
                    method = $method; path = $entry.path; pair_id = $entry.pair_id;
                    attempt = $entry.attempt; overlap = $entry.overlap;
                    overlap_ns = $entry.overlap_ns; A = $entry.A; B = $entry.B
                })
            }
        } elseif ($method -in @('GET', 'POST', 'PUT', 'DELETE', 'PATCH')) {
            $counts.requests++
            if ($entry.status -ge 400) {
                $counts.http_failures++
                $httpFailures.Add([ordered]@{
                    method = $method; path = $entry.path; status = $entry.status;
                    request_normalization = $entry.request_normalization
                })
            }
            if ($method -eq 'PUT' -and $entry.pair_id -and
                    ($entry.status -lt 200 -or $entry.status -ge 300)) {
                $counts.put_failures++
            }
            $recent.Enqueue([ordered]@{
                method = $method; path = $entry.path; status = $entry.status;
                request_normalization = $entry.request_normalization
            })
            if ($recent.Count -gt 25) { [void]$recent.Dequeue() }
        }
    }
    $diagnostics = [ordered]@{
        source_run = 'keycloak-pilot-v48/runs/pilot-01'
        counts = $counts
        http_failures = @($httpFailures.ToArray())
        race_pairs_without_overlap = @($raceFailures.ToArray())
        last_http_requests = @($recent.ToArray())
    }
    $diagnostics | ConvertTo-Json -Depth 8 |
        Set-Content -LiteralPath (Join-Path $work 'http-diagnostics-redacted.json') -Encoding UTF8

    $outputDirectory = Split-Path -Parent $OutputZip
    if (-not (Test-Path -LiteralPath $outputDirectory -PathType Container)) {
        throw "Output directory not found: $outputDirectory"
    }
    Compress-Archive -Path (Join-Path $work '*') -DestinationPath $OutputZip
    Write-Host "Evidence ZIP: $OutputZip"
    Write-Host "HTTP failures: $($counts.http_failures); race pairs: $($counts.race_pairs); overlapping: $($counts.overlapping_pairs)"
} finally {
    Remove-Item -LiteralPath $work -Recurse -Force -ErrorAction SilentlyContinue
}
