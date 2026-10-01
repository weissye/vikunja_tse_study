[CmdletBinding()]
param(
    [ValidateRange(1,3)][int]$Trials = 2,
    [int]$BaseSeed = 20261841,
    [ValidateRange(300,60000)][int]$MaxLength = 35000,
    [ValidateRange(2,16)][int]$PrefixRounds = 10,
    [ValidateRange(1,16)][int]$PrefixBeforeConcurrency = 8,
    [ValidateRange(60,600)][int]$WaitSeconds = 240,
    [switch]$PreflightOnly
)
$ErrorActionPreference = 'Stop'
if ($PrefixBeforeConcurrency -gt $PrefixRounds) { throw 'PrefixBeforeConcurrency exceeds PrefixRounds' }
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$compose = Join-Path $root 'deployment\mealie_stage4\compose.yaml'
$runner = Join-Path $PSScriptRoot 'run_mealie_stage4.py'
if (-not (Test-Path -LiteralPath $compose) -or -not (Test-Path -LiteralPath $runner)) {
    throw 'Install the Mealie Stage4 environment and v0.26.16a correction first'
}
$oracleId = 'concurrency::disjoint-put::update_one_api_households_mealplans_rules__item_id__put'
$common = @('--root', $root, '--runs', '1', '--max-length', [string]$MaxLength,
            '--instances-per-entity', '2', '--instances-per-action', '1',
            '--max-field-pairs', '3', '--max-concurrency-width', '2',
            '--story-profile', 'long-interleaving', '--prefix-rounds', [string]$PrefixRounds,
            '--prefix-before-concurrency', [string]$PrefixBeforeConcurrency,
            '--combined-campaign', '--target-oracle-id', $oracleId, '--freeze-evidence')
if ($PreflightOnly) {
    & python $runner @common --base-seed ([string]$BaseSeed) --preflight-only
    if ($LASTEXITCODE -ne 0) { throw 'Mealie rule target preflight failed' }
    return
}
& (Join-Path $PSScriptRoot 'Prepare-Mealie-Stage4.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Pinned Mealie preparation failed' }
$baseline = 'fse-mealie-stage4'
$running = @(& docker compose -p $baseline -f $compose ps --status running --services)
if ($LASTEXITCODE -ne 0 -or 'mealie' -notin $running) { throw 'Baseline Stage4 project is unavailable' }
$stopped = $false
$outcomes = @()
$savedToken = [Environment]::GetEnvironmentVariable('MEALIE_RESEARCH_TOKEN', 'Process')
try {
    [Environment]::SetEnvironmentVariable('MEALIE_RESEARCH_TOKEN', $null, 'Process')
    & docker compose -p $baseline -f $compose stop | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Stopping baseline project failed' }
    $stopped = $true
    for ($i = 0; $i -lt $Trials; $i++) {
        $seed = $BaseSeed + $i
        $project = 'fse-mealie-rule-' + (Get-Date -Format 'yyyyMMddHHmmss') + '-' + $i
        $completed = $false
        try {
            & docker compose -p $project -f $compose up -d --wait
            if ($LASTEXITCODE -ne 0) { throw "Isolated startup failed: $project" }
            $ready = $false
            for ($t = 0; $t -lt $WaitSeconds; $t += 3) {
                try {
                    $ping = Invoke-WebRequest 'http://127.0.0.1:9927/openapi.json' -TimeoutSec 5 -UseBasicParsing
                    if ($ping.StatusCode -eq 200) { $ready = $true; break }
                } catch { }
                Start-Sleep -Seconds 3
            }
            if (-not $ready) { throw "Isolated Mealie not ready: $project" }
            $ErrorActionPreference = 'Continue'
            try {
                $outputLines = @(& python $runner @common --base-seed ([string]$seed) 2>&1)
                $runnerExit = $LASTEXITCODE
            } finally { $ErrorActionPreference = 'Stop' }
            foreach ($line in $outputLines) { Write-Host $line }
            $runMarkers = @($outputLines | Where-Object { [string]$_ -match '^MEALIE_STAGE4_RUN\s+' })
            if ($runMarkers.Count -ne 1 -or [string]$runMarkers[0] -notmatch '^MEALIE_STAGE4_RUN\s+(.+)$') {
                throw "Missing focused run report: seed=$seed project=$project exit=$runnerExit"
            }
            $reportPath = Join-Path $Matches[1] 'target-decision.json'
            if (-not (Test-Path -LiteralPath $reportPath)) {
                throw "Missing focused decision report: seed=$seed project=$project exit=$runnerExit"
            }
            $report = Get-Content -LiteralPath $reportPath -Raw | ConvertFrom-Json
            $trial = $report.seeds.PSObject.Properties["seed-$seed"].Value
            if ($null -eq $trial -or $trial.classification -notin @('REPRODUCED_IN_FRESH_INSTANCE', 'SERIALIZABLE_IN_FRESH_INSTANCE', 'INCONCLUSIVE')) {
                throw "Invalid focused decision report: seed=$seed project=$project exit=$runnerExit"
            }
            if ($runnerExit -ne 0 -and $trial.classification -ne 'INCONCLUSIVE') {
                throw "Execution failed after reporting $($trial.classification): seed=$seed project=$project exit=$runnerExit"
            }
            $outcomes += [string]$trial.classification
            $completed = $true
            Write-Host "MEALIE_RULE_TRIAL seed=$seed classification=$($trial.classification) project=$project report=$reportPath"
        } finally {
            if ($completed) {
                & docker compose -p $project -f $compose down --volumes | Out-Null
            } else {
                & docker compose -p $project -f $compose down | Out-Null
                Write-Warning "Incomplete project's volume preserved for inspection: $project"
            }
        }
    }
} finally {
    [Environment]::SetEnvironmentVariable('MEALIE_RESEARCH_TOKEN', $savedToken, 'Process')
    if ($stopped) {
        & docker compose -p $baseline -f $compose up -d
        if ($LASTEXITCODE -ne 0) { Write-Warning 'Could not restart baseline Stage4 project' }
    }
}
$classes = @($outcomes | Select-Object -Unique)
$campaign = if ($classes.Count -eq 1 -and $classes[0] -eq 'REPRODUCED_IN_FRESH_INSTANCE') {
    'REPRODUCED_IN_ALL_FRESH_TRIALS'
} elseif ($classes.Count -eq 1 -and $classes[0] -eq 'SERIALIZABLE_IN_FRESH_INSTANCE') {
    'SERIALIZABLE_IN_ALL_FRESH_TRIALS'
} else { 'MIXED_OR_INCONCLUSIVE' }
Write-Host "MEALIE_RULE_CAMPAIGN verdict=$campaign trials=$($outcomes.Count) results=$($outcomes -join ',')"
