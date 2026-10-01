param(
    [string]$Root = "",
    [string]$Target = "http://127.0.0.1:3456",
    [int]$ProxyPort = 3457,
    [int]$Seed = 20261301,
    [int]$ExpectedTasks = 8,
    [int]$MaxLength = 10000,
    [string]$Model = "",
    [string]$RunTag = "phase5-interleaved-bp"
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path }
else { $Root = (Resolve-Path $Root).Path }
if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN) -or $env:VIKUNJA_API_TOKEN -eq "PASTE-TOKEN-HERE") {
    throw "Set VIKUNJA_API_TOKEN to the real research token in this PowerShell window."
}
foreach ($command in @("python", "provengo", "node")) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "$command was not found on PATH." }
}

if ([string]::IsNullOrWhiteSpace($Model)) {
    $model = Join-Path $Root "phase5\generated-interleaved-relational-lifecycle"
} elseif ([System.IO.Path]::IsPathRooted($Model)) {
    $model = (Resolve-Path $Model).Path
} else {
    $model = (Resolve-Path (Join-Path $Root $Model)).Path
}
$interfaces = Join-Path $model "interfaces.vikunja.js"
$stories = Join-Path $model "stories.vikunja.js"
$proxyScript = Join-Path $Root "scripts\vikunja_research_proxy.py"
$probeScript = Join-Path $Root "scripts\probe_vikunja_interleaved_bp_deletions.py"
$evaluator = Join-Path $Root "scripts\evaluate_vikunja_interleaved_bp.py"
foreach ($path in @($interfaces, $stories, $proxyScript, $probeScript, $evaluator)) {
    if (-not (Test-Path $path)) { throw "Required file is missing: $path" }
}
& node --check $stories
if ($LASTEXITCODE -ne 0) { throw "Generated stories failed JavaScript syntax validation." }
try { $info = Invoke-RestMethod -Uri "$Target/api/v2/info" -TimeoutSec 10 }
catch { throw "Vikunja is not reachable at $Target. $($_.Exception.Message)" }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$safeRunTag = $RunTag -replace '[^A-Za-z0-9._-]', '-'
$run = Join-Path $Root "runs\$safeRunTag-seed-$Seed-$stamp"
$project = Join-Path $run "provengo_project"
$trace = Join-Path $run "http-trace.jsonl"
New-Item -ItemType Directory -Force $run | Out-Null
& provengo --batch-mode create $project *> (Join-Path $run "provengo-create.log")
if ($LASTEXITCODE -ne 0) { throw "provengo create failed; inspect provengo-create.log" }
$specDir = Join-Path $project "spec\js"
$disabled = Join-Path $specDir "disabled"
New-Item -ItemType Directory -Force $disabled | Out-Null
$hello = Join-Path $specDir "hello-world.js"
if (Test-Path $hello) { Move-Item $hello $disabled -Force }
Copy-Item $interfaces $specDir -Force
Copy-Item $stories $specDir -Force

$proxyOut = Join-Path $run "proxy.stdout.log"
$proxyErr = Join-Path $run "proxy.stderr.log"
$proxy = $null
$provengoExit = $null
$probeExit = $null
try {
    $proxy = Start-Process python -ArgumentList @($proxyScript, "--target", $Target,
        "--listen-port", $ProxyPort, "--trace", $trace) -WorkingDirectory $Root `
        -RedirectStandardOutput $proxyOut -RedirectStandardError $proxyErr -PassThru
    $ready = $false
    $deadline = (Get-Date).AddSeconds(20)
    while ((Get-Date) -lt $deadline) {
        if ($proxy.HasExited) { throw "The proxy exited during startup; inspect proxy.stderr.log." }
        try {
            Invoke-RestMethod -Uri "http://127.0.0.1:$ProxyPort/info" -TimeoutSec 2 | Out-Null
            $ready = $true
            break
        } catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $ready) { throw "The proxy did not become ready within 20 seconds." }
    & provengo --no-color run --run-source :random --random-seed $Seed `
        --max-length $MaxLength $project *>&1 | Tee-Object (Join-Path $run "provengo-run.log")
    $provengoExit = $LASTEXITCODE
    if ($provengoExit -eq 0) {
        & python $probeScript --trace $trace --base-url "http://127.0.0.1:$ProxyPort" `
            --expected-tasks $ExpectedTasks --output (Join-Path $run "post-delete-probe.json")
        $probeExit = $LASTEXITCODE
    }
}
finally {
    if ($proxy -and -not $proxy.HasExited) { Stop-Process -Id $proxy.Id -Force -ErrorAction SilentlyContinue }
}

$evaluationPath = Join-Path $run "phase5-interleaved-bp-evaluation.json"
& python $evaluator --trace $trace --expected-tasks $ExpectedTasks --output $evaluationPath
$evaluationExit = $LASTEXITCODE
$metadata = [ordered]@{
    experiment = "vikunja-real-sut-openapi-sbt-bp-interleaving"
    profile = "interleaved-relational-lifecycle"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    vikunja_version = $info.version
    target = $Target
    proxy_port = $ProxyPort
    seed = $Seed
    expected_tasks = $ExpectedTasks
    max_length = $MaxLength
    run_tag = $safeRunTag
    scheduler = "Provengo random event selection"
    provengo_exit_code = $provengoExit
    deletion_probe_exit_code = $probeExit
    evaluation_exit_code = $evaluationExit
    openapi_sha256 = (Get-FileHash (Join-Path $Root "phase3b\vikunja-relations-openapi.json") -Algorithm SHA256).Hash.ToLowerInvariant()
    interfaces_sha256 = (Get-FileHash $interfaces -Algorithm SHA256).Hash.ToLowerInvariant()
    stories_sha256 = (Get-FileHash $stories -Algorithm SHA256).Hash.ToLowerInvariant()
}
$metadata | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $run "run-metadata.json") -Encoding UTF8
$manifest = foreach ($file in Get-ChildItem $run -Recurse -File | Where-Object Name -ne "SHA256SUMS.csv") {
    [pscustomobject]@{
        Path = $file.FullName.Substring($run.Length + 1).Replace("\", "/")
        SHA256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        SizeBytes = $file.Length
    }
}
$manifest | Sort-Object Path | Export-Csv (Join-Path $run "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8
Write-Host ""
Write-Host "Run directory: $run"
if (Test-Path $evaluationPath) { Get-Content $evaluationPath }
if ($provengoExit -ne 0 -or $probeExit -ne 0 -or $evaluationExit -ne 0) {
    throw "Phase 5 interleaved BP run failed or exposed a semantic anomaly. Preserve the run directory."
}
Write-Host "VIKUNJA_INTERLEAVED_BP_PASS"
