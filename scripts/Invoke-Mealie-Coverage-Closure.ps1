[CmdletBinding()]
param(
    [ValidateSet('cross_entity_rules','cross_entity_mealplans','same_field_rules')]
    [string]$Profile = 'cross_entity_rules',
    [ValidateRange(1,3)][int]$Trials = 2,
    [int]$BaseSeed = 20261851,
    [ValidateRange(8,16)][int]$PrefixRounds = 10,
    [ValidateRange(1,16)][int]$PrefixBeforeConcurrency = 8,
    [ValidateRange(300,60000)][int]$MaxLength = 35000,
    [ValidateRange(60,600)][int]$WaitSeconds = 240,
    [switch]$PreflightOnly
)
$ErrorActionPreference = 'Stop'
if ($PrefixBeforeConcurrency -gt $PrefixRounds) { throw 'PrefixBeforeConcurrency exceeds PrefixRounds' }
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runner = Join-Path $PSScriptRoot 'run_mealie_stage4.py'
$compose = Join-Path $root 'deployment\mealie_stage4\compose.yaml'
if (-not (Test-Path -LiteralPath $runner) -or -not (Test-Path -LiteralPath $compose)) {
    throw 'Install Stage4 and the coverage closure overlay first'
}
$targets = @{
    cross_entity_rules = 'concurrency::cross-entity::update_one_api_recipes_timeline_events__item_id__put::update_one_api_households_mealplans_rules__item_id__put'
    cross_entity_mealplans = 'concurrency::cross-entity::update_one_api_recipes_timeline_events__item_id__put::update_one_api_households_mealplans__item_id__put'
    same_field_rules = 'concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day'
}
$oracle = $targets[$Profile]
$common = @('--root', $root, '--runs', '1', '--max-length', [string]$MaxLength,
            '--instances-per-entity', '2', '--instances-per-action', '1',
            '--max-field-pairs', '3', '--max-concurrency-width', '2',
            '--story-profile', 'long-interleaving', '--prefix-rounds', [string]$PrefixRounds,
            '--prefix-before-concurrency', [string]$PrefixBeforeConcurrency,
            '--combined-campaign', '--coverage-target-oracle-id', $oracle, '--freeze-evidence')
if ($PreflightOnly) {
    & python $runner @common --base-seed ([string]$BaseSeed) --preflight-only
    if ($LASTEXITCODE -ne 0) { throw "Coverage preflight failed: $Profile" }
    Write-Host "MEALIE_CLOSURE_PREFLIGHT profile=$Profile oracle=$oracle"
    return
}
& (Join-Path $PSScriptRoot 'Prepare-Mealie-Stage4.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Pinned Mealie startup failed' }
$baseline = 'fse-mealie-stage4'
$running = @(& docker compose -p $baseline -f $compose ps --status running --services)
if ($LASTEXITCODE -ne 0 -or 'mealie' -notin $running) { throw 'Baseline Stage4 unavailable' }
$savedToken = [Environment]::GetEnvironmentVariable('MEALIE_RESEARCH_TOKEN', 'Process')
$stopped = $false
$outcomes = @()
try {
    [Environment]::SetEnvironmentVariable('MEALIE_RESEARCH_TOKEN', $null, 'Process')
    & docker compose -p $baseline -f $compose stop | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Could not stop baseline deployment' }
    $stopped = $true
    for ($i = 0; $i -lt $Trials; $i++) {
        $seed = $BaseSeed + $i
        $project = 'fse-mealie-closure-' + (Get-Date -Format 'yyyyMMddHHmmss') + '-' + $i
        $finished = $false
        try {
            & docker compose -p $project -f $compose up -d --wait
            if ($LASTEXITCODE -ne 0) { throw "Could not start isolated project: $project" }
            $ready = $false
            for ($t = 0; $t -lt $WaitSeconds; $t += 3) {
                try {
                    $ping = Invoke-WebRequest 'http://127.0.0.1:9927/openapi.json' -TimeoutSec 5 -UseBasicParsing
                    if ($ping.StatusCode -eq 200) { $ready = $true; break }
                } catch { }
                Start-Sleep -Seconds 3
            }
            if (-not $ready) { throw "Mealie did not become ready: $project" }
            $ErrorActionPreference = 'Continue'
            try {
                $lines = @(& python $runner @common --base-seed ([string]$seed) 2>&1)
                $exitCode = $LASTEXITCODE
            } finally { $ErrorActionPreference = 'Stop' }
            foreach ($line in $lines) { Write-Host $line }
            $markers = @($lines | Where-Object { [string]$_ -match '^MEALIE_STAGE4_RUN\s+' })
            if ($markers.Count -ne 1 -or [string]$markers[0] -notmatch '^MEALIE_STAGE4_RUN\s+(.+)$') {
                throw "Could not locate preserved run: seed=$seed project=$project exit=$exitCode"
            }
            $runDir = $Matches[1]
            $report = Join-Path $runDir 'coverage-target.json'
            if (-not (Test-Path -LiteralPath $report)) {
                throw "Missing coverage report: seed=$seed project=$project run=$runDir"
            }
            $data = Get-Content -LiteralPath $report -Raw | ConvertFrom-Json
            $item = $data.seeds.PSObject.Properties["seed-$seed"].Value
            $state = if ($null -eq $item) { 'NOT_OBSERVED' } else { [string]$item.state }
            $outcomes += $state
            Write-Host "MEALIE_CLOSURE_TRIAL seed=$seed profile=$Profile state=$state report=$report"
            if ($exitCode -ne 0 -or $state -ne 'VERIFIED_PREFIX_AND_ORACLE_COVERAGE') {
                throw "Target coverage incomplete: seed=$seed profile=$Profile state=$state run=$runDir"
            }
            $finished = $true
        } finally {
            if ($finished) {
                & docker compose -p $project -f $compose down --volumes | Out-Null
            } else {
                & docker compose -p $project -f $compose down | Out-Null
                Write-Warning "Incomplete project's data volume preserved: $project"
            }
        }
    }
} finally {
    [Environment]::SetEnvironmentVariable('MEALIE_RESEARCH_TOKEN', $savedToken, 'Process')
    if ($stopped) {
        & docker compose -p $baseline -f $compose up -d
        if ($LASTEXITCODE -ne 0) { Write-Warning 'Baseline project could not be restarted' }
    }
}
Write-Host "MEALIE_CLOSURE_COMPLETE profile=$Profile trials=$($outcomes.Count) state=VERIFIED_PREFIX_AND_ORACLE_COVERAGE"
