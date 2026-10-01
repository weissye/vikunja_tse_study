[CmdletBinding()]
param(
    [int]$BaseSeed = 20261817,
    [int]$Trials = 2,
    [int]$WaitSeconds = 240
)
$ErrorActionPreference = 'Stop'
if ($Trials -lt 1 -or $Trials -gt 5) { throw 'Trials must be 1..5' }
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$compose = Join-Path $root 'deployment\mealie_stage4\compose.yaml'
$baseline = 'fse-mealie-stage4'
$analyzer = Join-Path $PSScriptRoot 'analyze_mealie_decision.py'
if (-not (Test-Path -LiteralPath $compose)) { throw 'Stage4 compose.yaml missing' }
if (-not (Test-Path -LiteralPath $analyzer)) { throw 'Decision analyzer missing' }

# Check the pinned image/spec while the original server is still running.
& (Join-Path $PSScriptRoot 'Prepare-Mealie-Stage4.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Pinned Stage4 preparation failed' }
$running = @(& docker compose -p $baseline -f $compose ps --status running --services)
if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect original Stage4 project' }
if ('mealie' -notin $running) { throw 'Original Stage4 server is not running' }

$runParams = @{
    Runs = 1; MaxLength = 25000
    InstancesPerEntity = 2; InstancesPerAction = 1
    MaxFieldPairs = 3; MaxConcurrencyWidth = 2
    StoryProfile = 'long-interleaving'
    PrefixRounds = 8; PrefixBeforeConcurrency = 8
    FreezeEvidence = $true
}
$date = Get-Date -Format 'yyyyMMddHHmmss'
$baselineStopped = $false
$savedToken = [Environment]::GetEnvironmentVariable('MEALIE_RESEARCH_TOKEN', 'Process')
try {
    # A token issued by the original project cannot authenticate against a fresh database.
    [Environment]::SetEnvironmentVariable('MEALIE_RESEARCH_TOKEN', $null, 'Process')
    $baselineStopped = $true
    & docker compose -p $baseline -f $compose stop | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Stopping original containers failed' }
    for ($i = 0; $i -lt $Trials; $i++) {
        $seed = $BaseSeed + $i
        $project = 'fse-mealie-decision-' + $date + '-' + $i
        $completed = $false
        try {
            & docker compose -p $project -f $compose up -d
            if ($LASTEXITCODE -ne 0) { throw "Fresh container startup failed: $project" }
            $deadline = (Get-Date).AddSeconds($WaitSeconds)
            $ready = $false
            while ((Get-Date) -lt $deadline) {
                try {
                    $response = Invoke-WebRequest 'http://127.0.0.1:9927/openapi.json' -TimeoutSec 5 -UseBasicParsing
                    if ($response.StatusCode -eq 200) { $ready = $true; break }
                } catch { }
                Start-Sleep -Seconds 3
            }
            if (-not $ready) { throw "New isolated server did not become ready: $project" }
            $before = @(Get-ChildItem -LiteralPath (Join-Path $root 'runs') -Directory -Filter 'research-fit-mealie-stage4-*' |
                ForEach-Object { $_.FullName })
            $runParams.BaseSeed = $seed
            & (Join-Path $PSScriptRoot 'Invoke-Mealie-Stage4.ps1') @runParams
            if ($LASTEXITCODE -ne 0) { throw "Stage4 run failed: seed=$seed" }
            $created = @(Get-ChildItem -LiteralPath (Join-Path $root 'runs') -Directory -Filter 'research-fit-mealie-stage4-*' |
                Where-Object { $_.FullName -notin $before } | Sort-Object LastWriteTime -Descending)
            if ($created.Count -ne 1) { throw "Cannot identify exactly one new run: seed=$seed" }
            $runDir = $created[0].FullName
            $summary = Join-Path $runDir "seed-$seed\summary.json"
            $evaluation = Join-Path $runDir "seed-$seed\generated-verifier-evaluation.json"
            if (-not (Test-Path -LiteralPath $summary) -or -not (Test-Path -LiteralPath $evaluation)) {
                throw "Missing frozen evaluation: seed=$seed"
            }
            $report = Join-Path $runDir 'clean-decision.json'
            & python $analyzer $runDir --output $report
            if ($LASTEXITCODE -ne 0) { throw "Analysis failed: seed=$seed" }
            Write-Host "MEALIE_CLEAN_DECISION seed=$seed project=$project report=$report"
            $completed = $true
        } finally {
            if ($completed) {
                # Only the newly created project's volumes are removed; the original data is untouched.
                & docker compose -p $project -f $compose down --volumes | Out-Null
                if ($LASTEXITCODE -ne 0) { Write-Warning "Could not remove fresh project: $project" }
            } else {
                & docker compose -p $project -f $compose down | Out-Null
                Write-Warning "Investigation volumes preserved for incomplete project: $project"
            }
        }
    }
} finally {
    [Environment]::SetEnvironmentVariable('MEALIE_RESEARCH_TOKEN', $savedToken, 'Process')
    if ($baselineStopped) {
        & docker compose -p $baseline -f $compose up -d
        if ($LASTEXITCODE -ne 0) { Write-Warning 'Original Stage4 project could not be restarted' }
    }
}
