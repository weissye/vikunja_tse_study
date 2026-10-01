param([string]$StudyRoot = 'C:\work\temp\vikunja_tse_study')
$ErrorActionPreference = 'Stop'
$run = Join-Path $StudyRoot 'keycloak-pilot-v48\runs\pilot-01'
$lines = @(Get-Content -LiteralPath (Join-Path $run 'provengo.log'))
$hit = $lines | Select-String 'FAIL: RACE_OUTCOME_UNCLASSIFIED' | Select-Object -First 1
if (-not $hit) { throw 'Expected race failure not found' }
$index = $hit.LineNumber - 1
Write-Host "FIRST_RACE_FAILURE_LOG_LINE $($hit.LineNumber)"
for ($i = [Math]::Max(0, $index - 90); $i -le $index; $i++) {
    $line = $lines[$i]
    if ($line -match 'Selected: \[(GET|POST|PUT|PATCH|DELETE) ') {
        $method = $Matches[1]
        if ($line -match 'url:"([^"]+)"') {
            $safe = $Matches[1] -replace '^https?://[^/]+', ''
            Write-Host ("line {0}: HTTP {1} {2}" -f ($i + 1), $method, $safe)
        }
    } elseif ($line -match 'Selected: \[SBT:CrudStep .*owner:"([^"]+)"') {
        $owner = $Matches[1]
        $stage = if ($line -match 'stage:"([^"]+)"') { $Matches[1] } else { '?' }
        Write-Host ("line {0}: STEP {1} {2}" -f ($i + 1), $owner, $stage)
    } elseif ($line -match 'Selected: \[SBT:CrudVerified .*owner:"([^"]+)"') {
        $owner = $Matches[1]
        $stage = if ($line -match 'stage:"([^"]+)"') { $Matches[1] } else { '?' }
        Write-Host ("line {0}: VERIFIED {1} {2}" -f ($i + 1), $owner, $stage)
    } elseif ($line -match 'FAIL: RACE_OUTCOME_UNCLASSIFIED') {
        Write-Host ("line {0}: FAIL RACE_OUTCOME_UNCLASSIFIED" -f ($i + 1))
    }
}
