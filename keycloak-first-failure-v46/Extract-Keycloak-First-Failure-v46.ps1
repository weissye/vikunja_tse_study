param(
    [string]$StudyRoot = 'C:\work\temp\vikunja_tse_study'
)

$ErrorActionPreference = 'Stop'
$log = Join-Path $StudyRoot 'keycloak-pilot-v45\runs\pilot-01\provengo.log'
if (-not (Test-Path -LiteralPath $log -PathType Leaf)) { throw "Log not found: $log" }
$lines = @(Get-Content -LiteralPath $log)
$hit = $lines | Select-String 'FAIL: update readback mismatch' | Select-Object -First 1
if (-not $hit) { throw 'Expected update readback failure not found' }
$index = $hit.LineNumber - 1
Write-Host "V45_FIRST_FAILURE_LOG_LINE $($hit.LineNumber)"
for ($i = [Math]::Max(0, $index - 65); $i -le $index; $i++) {
    $line = $lines[$i]
    if ($line -match 'Selected: \[(GET|POST|PUT|PATCH|DELETE) ') {
        $method = $Matches[1]
        if ($line -match 'url:"([^"]+)"') {
            $raw = $Matches[1]
            $safe = $raw -replace '^https?://[^/]+', ''
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
    } elseif ($line -match "RTV: setting '([^']+)'") {
        Write-Host ("line {0}: RTV {1}" -f ($i + 1), $Matches[1])
    } elseif ($line -match 'FAIL: update readback mismatch') {
        Write-Host ("line {0}: FAIL update readback mismatch" -f ($i + 1))
    }
}
