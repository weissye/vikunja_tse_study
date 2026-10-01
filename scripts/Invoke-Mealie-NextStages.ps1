[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][ValidateSet('tool-gap','mealplan-put-delete')][string]$Branch,
    [int]$BaseSeed = 20261821,
    [ValidateRange(1,3)][int]$Trials = 1,
    [ValidateRange(60,600)][int]$WaitSeconds = 240,
    [switch]$PreflightOnly
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$compose = Join-Path $root 'deployment\mealie_stage4\compose.yaml'
$runner = Join-Path $PSScriptRoot 'run_mealie_stage4.py'
if (-not (Test-Path -LiteralPath $compose)) { throw 'Stage4 compose file missing' }
if (-not (Test-Path -LiteralPath $runner)) { throw 'Stage4 runner missing' }
$instances = if ($Branch -eq 'mealplan-put-delete') { 3 } else { 2 }
$storyProfile = if ($Branch -eq 'mealplan-put-delete') { 'concurrency-breadth' } else { 'long-interleaving' }
Write-Host "MEALIE_NEXT_STAGE_PROFILE branch=$Branch story_profile=$storyProfile"
$baseArgs = @('--root', $root, '--runs', '1', '--max-length', '30000',
              '--instances-per-entity', [string]$instances, '--instances-per-action', '1',
              '--max-field-pairs', '3', '--max-concurrency-width', '2',
              '--story-profile', $storyProfile, '--prefix-rounds', '8',
              '--stage4-branch', $Branch, '--freeze-evidence')
if ($PreflightOnly) {
    & python $runner @baseArgs --base-seed ([string]$BaseSeed) --preflight-only
    if ($LASTEXITCODE -ne 0) { throw "Targeted preflight failed: $Branch" }
    return
}
& (Join-Path $PSScriptRoot 'Prepare-Mealie-Stage4.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Pinned Mealie preparation failed' }
$baseline = 'fse-mealie-stage4'
$running = @(& docker compose -p $baseline -f $compose ps --status running --services)
if ($LASTEXITCODE -ne 0 -or 'mealie' -notin $running) { throw 'Original Stage4 project is unavailable' }
$baselineStopped = $false
$savedToken = [Environment]::GetEnvironmentVariable('MEALIE_RESEARCH_TOKEN','Process')
try {
    [Environment]::SetEnvironmentVariable('MEALIE_RESEARCH_TOKEN', $null, 'Process')
    & docker compose -p $baseline -f $compose stop | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Stopping original project failed' }
    $baselineStopped = $true
    for ($i=0; $i -lt $Trials; $i++) {
        $seed = $BaseSeed + $i
        $project = 'fse-mealie-next-' + (Get-Date -Format 'yyyyMMddHHmmss') + '-' + $i
        $completed = $false
        try {
            & docker compose -p $project -f $compose up -d --wait
            if ($LASTEXITCODE -ne 0) { throw "Isolated startup failed: $project" }
            $ready = $false
            for ($t=0; $t -lt $WaitSeconds; $t += 3) {
                try {
                    $ping = Invoke-WebRequest 'http://127.0.0.1:9927/openapi.json' -TimeoutSec 5 -UseBasicParsing
                    if ($ping.StatusCode -eq 200) { $ready = $true; break }
                } catch { }
                Start-Sleep -Seconds 3
            }
            if (-not $ready) { throw "Isolated Mealie not ready: $project" }
            & python $runner @baseArgs --base-seed ([string]$seed)
            if ($LASTEXITCODE -ne 0) { throw "Evidence preserved for incomplete branch=$Branch seed=$seed" }
            $completed = $true
            Write-Host "MEALIE_NEXT_STAGE_COMPLETE branch=$Branch seed=$seed project=$project"
        } finally {
            if ($completed) {
                & docker compose -p $project -f $compose down --volumes | Out-Null
            } else {
                & docker compose -p $project -f $compose down | Out-Null
                Write-Warning "Incomplete isolated data volume preserved: $project"
            }
        }
    }
} finally {
    [Environment]::SetEnvironmentVariable('MEALIE_RESEARCH_TOKEN', $savedToken, 'Process')
    if ($baselineStopped) {
        & docker compose -p $baseline -f $compose up -d
        if ($LASTEXITCODE -ne 0) { Write-Warning 'Could not restart original Stage4 project' }
    }
}
