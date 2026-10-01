param(
    [string]$Root = "",
    [string]$Target = "http://127.0.0.1:3456",
    [int]$ProxyPort = 3457,
    [int[]]$TaskCounts = @(8, 12, 16),
    [int[]]$Seeds = @(20261401, 20261402, 20261403, 20261404, 20261405),
    [int]$MaxLength = 30000
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path }
else { $Root = (Resolve-Path $Root).Path }
if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN)) {
    throw "Set VIKUNJA_API_TOKEN in this PowerShell window."
}

$generator = Join-Path $Root "generator_baseline"
$openapi = Join-Path $Root "phase3b\vikunja-relations-openapi.json"
$runner = Join-Path $Root "scripts\Invoke-Vikunja-Interleaved-BP.ps1"
$summarizer = Join-Path $Root "scripts\summarize_vikunja_bug_search.py"
$scheduleAnalyzer = Join-Path $Root "scripts\analyze_vikunja_bp_schedules.py"
foreach ($path in @($generator, $openapi, $runner, $summarizer, $scheduleAnalyzer)) {
    if (-not (Test-Path $path)) { throw "Required path is missing: $path" }
}

$campaignStamp = Get-Date -Format "yyyyMMdd_HHmmss"
$campaignRoot = Join-Path $Root "campaigns\phase6-bug-search-$campaignStamp"
$campaignTag = "phase6-bug-search-$campaignStamp"
$modelsRoot = Join-Path $campaignRoot "models"
New-Item -ItemType Directory -Force $modelsRoot | Out-Null
$outcomes = @()

foreach ($taskCount in $TaskCounts) {
    if ($taskCount -lt 4) { throw "Every task count must be at least 4." }
    $model = Join-Path $modelsRoot "tasks-$taskCount"
    Push-Location $generator
    try {
        & python -m openapi_to_sbt generate `
            --openapi $openapi --output $model --name vikunja `
            --base-url "http://127.0.0.1:$ProxyPort" --seed 20261300 `
            --instances-per-entity $taskCount --instances-per-action 1 `
            --story-profile interleaved-relational-exploration --force
        if ($LASTEXITCODE -ne 0) { throw "Generation failed for task count $taskCount." }
    } finally { Pop-Location }

    foreach ($seed in $Seeds) {
        $started = (Get-Date).ToUniversalTime().ToString("o")
        $status = "PASS"
        $message = ""
        try {
            & $runner -Root $Root -Target $Target -ProxyPort $ProxyPort -Seed $seed `
                -ExpectedTasks $taskCount -MaxLength $MaxLength -Model $model `
                -RunTag "$campaignTag-tasks-$taskCount" `
                -Profile "interleaved-relational-exploration"
        } catch {
            $status = "PRESERVED_FOR_TRIAGE"
            $message = $_.Exception.Message
        }
        $outcomes += [pscustomobject]@{
            task_count = $taskCount
            seed = $seed
            status = $status
            started_utc = $started
            message = $message
        }
    }
}

$outcomes | ConvertTo-Json -Depth 5 | Set-Content `
    (Join-Path $campaignRoot "campaign-execution.json") -Encoding UTF8
& python $summarizer --runs (Join-Path $Root "runs") --prefix $campaignTag `
    --output (Join-Path $campaignRoot "campaign-summary.json")
if ($LASTEXITCODE -ne 0) { throw "Campaign summarization failed." }

$campaignRuns = @(Get-ChildItem (Join-Path $Root "runs") -Directory `
    -Filter "$campaignTag-tasks-*-seed-*" | Sort-Object Name)
if ($campaignRuns.Count -gt 0) {
    $analysisArgs = @($scheduleAnalyzer)
    foreach ($run in $campaignRuns) { $analysisArgs += @("--run", $run.FullName) }
    $analysisArgs += @("--output", (Join-Path $campaignRoot "schedule-comparison.json"))
    & python @analysisArgs
    if ($LASTEXITCODE -ne 0) { throw "Schedule comparison failed." }
}

Write-Host "VIKUNJA_BP_BUG_SEARCH_CAMPAIGN_COMPLETE"
Write-Host "Campaign directory: $campaignRoot"
Write-Host "Runs attempted:      $($outcomes.Count)"
Write-Host "Preserved failures:  $(@($outcomes | Where-Object status -ne 'PASS').Count)"
