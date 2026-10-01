param(
    [string]$Root = "",
    [string]$Target = "http://127.0.0.1:3456",
    [int]$ProxyPort = 3457,
    [int]$Seed = 20260920,
    [int]$MaxLength = 1000
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path }
else { $Root = (Resolve-Path $Root).Path }

if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN) -or
    $env:VIKUNJA_API_TOKEN -eq "PASTE-TOKEN-HERE") {
    throw "Set VIKUNJA_API_TOKEN to the real research token in this PowerShell window."
}
foreach ($command in @("python", "provengo", "node")) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "$command was not found on PATH."
    }
}

$model = Join-Path $Root "phase1\core-generated-minimal-smoke"
$proxyScript = Join-Path $Root "scripts\vikunja_research_proxy.py"
$evaluator = Join-Path $Root "scripts\evaluate_vikunja_smoke.py"
foreach ($path in @(
    $proxyScript, $evaluator,
    (Join-Path $model "interfaces.vikunja.js"),
    (Join-Path $model "stories.vikunja.js")
)) {
    if (-not (Test-Path $path)) { throw "Required file is missing: $path" }
}

try {
    $info = Invoke-RestMethod -Uri "$Target/api/v2/info" -TimeoutSec 10
} catch {
    throw "Vikunja is not reachable at $Target. Verify docker compose ps. $($_.Exception.Message)"
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$run = Join-Path $Root "runs\vikunja-provengo-smoke-$stamp"
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
Copy-Item (Join-Path $model "interfaces.vikunja.js") $specDir -Force
Copy-Item (Join-Path $model "stories.vikunja.js") $specDir -Force

$proxyOut = Join-Path $run "proxy.stdout.log"
$proxyErr = Join-Path $run "proxy.stderr.log"
$proxy = $null
$provengoExit = $null
try {
    $proxy = Start-Process python -ArgumentList @(
        $proxyScript, "--target", $Target, "--listen-port", $ProxyPort,
        "--trace", $trace
    ) -WorkingDirectory $Root -RedirectStandardOutput $proxyOut `
      -RedirectStandardError $proxyErr -PassThru

    $ready = $false
    $deadline = (Get-Date).AddSeconds(20)
    while ((Get-Date) -lt $deadline) {
        if ($proxy.HasExited) {
            throw "The proxy exited during startup. Port $ProxyPort may already be occupied; inspect proxy.stderr.log."
        }
        try {
            Invoke-RestMethod -Uri "http://127.0.0.1:$ProxyPort/info" -TimeoutSec 2 | Out-Null
            $ready = $true
            break
        } catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $ready) { throw "The proxy did not become ready within 20 seconds." }

    & provengo --no-color run --run-source :random --random-seed $Seed `
        --max-length $MaxLength $project *>&1 |
        Tee-Object (Join-Path $run "provengo-run.log")
    $provengoExit = $LASTEXITCODE
}
finally {
    if ($proxy -and -not $proxy.HasExited) {
        Stop-Process -Id $proxy.Id -Force -ErrorAction SilentlyContinue
    }
}

$evaluationPath = Join-Path $run "smoke-evaluation.json"
& python $evaluator --trace $trace --output $evaluationPath
$evaluationExit = $LASTEXITCODE

$metadata = [ordered]@{
    experiment = "vikunja-real-sut-provengo-smoke"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    vikunja_version = $info.version
    target = $Target
    proxy_port = $ProxyPort
    seed = $Seed
    max_length = $MaxLength
    provengo_exit_code = $provengoExit
    evaluation_exit_code = $evaluationExit
    model_openapi_sha256 = (Get-FileHash (Join-Path $Root "phase1\vikunja-core-openapi.json") -Algorithm SHA256).Hash.ToLowerInvariant()
    interfaces_sha256 = (Get-FileHash (Join-Path $model "interfaces.vikunja.js") -Algorithm SHA256).Hash.ToLowerInvariant()
    stories_sha256 = (Get-FileHash (Join-Path $model "stories.vikunja.js") -Algorithm SHA256).Hash.ToLowerInvariant()
}
$metadata | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $run "run-metadata.json") -Encoding UTF8

Write-Host ""
Write-Host "Run directory: $run"
Get-Content $evaluationPath
if ($evaluationExit -ne 0) {
    throw "The external trace did not confirm the complete smoke chain. Preserve the run directory for diagnosis."
}
Write-Host "VIKUNJA_PROVENGO_SMOKE_PASS"
