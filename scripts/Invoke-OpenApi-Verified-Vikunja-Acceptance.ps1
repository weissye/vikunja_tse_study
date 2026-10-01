[CmdletBinding()]
param(
    [string]$Root = "",
    [string]$Generated = "",
    [string]$Name = "vikunja_verified",
    [string]$Target = "http://127.0.0.1:3466",
    [string]$ApiPrefix = "/api/v2",
    [string]$BearerTokenEnv = "VIKUNJA_API_TOKEN",
    [int]$ProxyPort = 3457,
    [int]$AdapterPort = 3459,
    [int]$Seed = 20262251,
    [int]$MaxLength = 50000,
    [int]$QuiescenceMs = 100
)

$ErrorActionPreference = "Stop"
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) {
    $Root = (Resolve-Path (Join-Path $scriptDir "..")).Path
} else {
    $Root = (Resolve-Path $Root).Path
}
$generatorRoot = Join-Path $Root "generator_baseline"
if ([string]::IsNullOrWhiteSpace($Generated)) {
    $Generated = Join-Path $Root "generated\vikunja-verified"
}
$Generated = (Resolve-Path $Generated).Path

foreach ($command in @("python", "provengo")) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "$command was not found on PATH." }
}
if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($BearerTokenEnv))) {
    throw "Bearer token environment variable '$BearerTokenEnv' is empty. Prepare the Vikunja test account in this PowerShell process first."
}

$interfaces = Join-Path $Generated "interfaces.$Name.js"
$stories = Join-Path $Generated "stories.$Name.js"
$verification = Join-Path $Generated "verification.$Name.js"
$manifest = Join-Path $Generated "verification-manifest.$Name.json"
foreach ($path in @($interfaces, $stories, $verification, $manifest)) {
    if (-not (Test-Path $path -PathType Leaf)) { throw "Required generated file is missing: $path" }
}

try { Invoke-RestMethod -Uri "$Target/api/v2/info" -TimeoutSec 10 | Out-Null }
catch { throw "Vikunja is not reachable at $Target." }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$run = Join-Path $Root "runs\openapi-verified-vikunja-$stamp"
$project = Join-Path $run "provengo_project"
$trace = Join-Path $run "http-trace.jsonl"
$epochs = Join-Path $run "concurrent-epochs.jsonl"
$evaluation = Join-Path $run "generated-verifier-evaluation.json"
$runtimeObservation = Join-Path $run "runtime-observation-policy.json"
New-Item -ItemType Directory -Force $run | Out-Null
# Preserve explicit zero-epoch evidence as an empty file instead of omitting
# the artifact, so absence of concurrent execution is machine-checkable.
New-Item -ItemType File -Force $epochs | Out-Null

& provengo --batch-mode create $project *>&1 | Set-Content (Join-Path $run "provengo-create.log")
if ($LASTEXITCODE -ne 0) { throw "provengo create failed." }
$spec = Join-Path $project "spec\js"
$disabled = Join-Path $spec "disabled"
New-Item -ItemType Directory -Force $disabled | Out-Null
$hello = Join-Path $spec "hello-world.js"
if (Test-Path $hello) { Move-Item $hello $disabled -Force }
$runtimeConfig = @(
    "//@provengo summon rest",
    "var host = '127.0.0.1';",
    "var port = $ProxyPort;",
    "var protocol = 'http';",
    "var sbtConcurrencyAdapterUrl = 'http://127.0.0.1:$AdapterPort';",
    "var __sbtObservedHttpStatuses = [];",
    "for (var __sbtStatus = 100; __sbtStatus <= 599; __sbtStatus++) { __sbtObservedHttpStatuses.push(__sbtStatus); }"
)
$runtimeConfig | Set-Content (Join-Path $spec "000-runtime-config.js") -Encoding UTF8
$runtimeInterfaces = Join-Path $spec (Split-Path $interfaces -Leaf)
$runtimeVerification = Join-Path $spec (Split-Path $verification -Leaf)
Copy-Item $interfaces $runtimeInterfaces -Force
Copy-Item $stories (Join-Path $spec (Split-Path $stories -Leaf)) -Force
Copy-Item $verification $runtimeVerification -Force

# Do not let Provengo's transport layer terminate the campaign on the first
# undocumented status.  The immutable source remains contract-exact; only the
# disposable runtime copies accept all statuses.  The preserved HTTP trace and
# generated evaluator remain authoritative and still report every violation.
Push-Location $generatorRoot
try {
    & python -m openapi_to_sbt.runtime_observation `
        --file $runtimeInterfaces --file $runtimeVerification `
        --report $runtimeObservation
    if ($LASTEXITCODE -ne 0) { throw "Runtime observation preparation failed with exit code $LASTEXITCODE." }
}
finally { Pop-Location }

$proxyOut = Join-Path $run "proxy.stdout.log"
$proxyErr = Join-Path $run "proxy.stderr.log"
$adapterOut = Join-Path $run "adapter.stdout.log"
$adapterErr = Join-Path $run "adapter.stderr.log"
$proxy = $null
$adapter = $null
$provengoExit = $null
try {
    $proxyArgs = @("-m", "openapi_to_sbt.trace_proxy", "--listen-port", "$ProxyPort",
        "--target", $Target, "--api-prefix", $ApiPrefix, "--trace", $trace,
        "--bearer-token-env", $BearerTokenEnv, "--require-bearer-token")
    $proxy = Start-Process python -ArgumentList $proxyArgs -WorkingDirectory $generatorRoot `
        -RedirectStandardOutput $proxyOut -RedirectStandardError $proxyErr -PassThru
    $deadline = (Get-Date).AddSeconds(20)
    $ready = $false
    while ((Get-Date) -lt $deadline) {
        if ($proxy.HasExited) { throw "Trace proxy exited before readiness. See $proxyErr" }
        try { Invoke-RestMethod -Uri "http://127.0.0.1:$ProxyPort/info" -TimeoutSec 2 | Out-Null; $ready = $true; break }
        catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $ready) { throw "Trace proxy did not become ready." }

    # /info is public and cannot prove that the configured token belongs to
    # this database instance. /user is an authenticated Vikunja endpoint and
    # prevents a misleading Provengo failure caused by a stale/cross-instance
    # token.
    try {
        Invoke-RestMethod -Uri "http://127.0.0.1:$ProxyPort/user" -TimeoutSec 10 | Out-Null
    }
    catch {
        throw "The token in '$BearerTokenEnv' was rejected by $Target. Run Prepare-Vikunja-Increment8_2.ps1 again in this same PowerShell process, then retry."
    }

    $adapterArgs = @("-m", "openapi_to_sbt.concurrency_adapter", "--listen-port", "$AdapterPort",
        "--upstream", "http://127.0.0.1:$ProxyPort", "--epoch-log", $epochs,
        "--quiescence-ms", "$QuiescenceMs")
    $adapter = Start-Process python -ArgumentList $adapterArgs -WorkingDirectory $generatorRoot `
        -RedirectStandardOutput $adapterOut -RedirectStandardError $adapterErr -PassThru
    $deadline = (Get-Date).AddSeconds(20)
    $ready = $false
    while ((Get-Date) -lt $deadline) {
        if ($adapter.HasExited) { throw "Concurrency adapter exited before readiness. See $adapterErr" }
        try { Invoke-RestMethod -Uri "http://127.0.0.1:$AdapterPort/health" -TimeoutSec 2 | Out-Null; $ready = $true; break }
        catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $ready) { throw "Concurrency adapter did not become ready." }

    & provengo --no-color run --run-source :random --random-seed $Seed --max-length $MaxLength $project *>&1 |
        Tee-Object (Join-Path $run "provengo-run.log")
    $provengoExit = $LASTEXITCODE
}
finally {
    if ($adapter -and -not $adapter.HasExited) { Stop-Process -Id $adapter.Id -Force -ErrorAction SilentlyContinue }
    if ($proxy -and -not $proxy.HasExited) { Stop-Process -Id $proxy.Id -Force -ErrorAction SilentlyContinue }
}

$evaluationExit = $null
if (Test-Path $trace -PathType Leaf) {
    Push-Location $generatorRoot
    try {
        & python -m openapi_to_sbt.evaluate_verifiers `
            --trace $trace --manifest $manifest --output $evaluation 2>&1 |
            Tee-Object (Join-Path $run "evaluator.log")
        $evaluationExit = $LASTEXITCODE
    }
    finally { Pop-Location }
}

Copy-Item $manifest (Join-Path $run (Split-Path $manifest -Leaf)) -Force
Copy-Item $verification (Join-Path $run (Split-Path $verification -Leaf)) -Force
$metadata = [ordered]@{
    experiment = "openapi-only-verified-vikunja-acceptance"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    target = $Target
    api_prefix = $ApiPrefix
    seed = $Seed
    max_length = $MaxLength
    quiescence_ms = $QuiescenceMs
    provengo_exit_code = $provengoExit
    evaluator_exit_code = $evaluationExit
    concurrency_epoch_count = @((Get-Content $epochs -ErrorAction SilentlyContinue) |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) }).Count
    runtime_http_status_policy = "accept-all-at-actuator; external trace evaluator is authoritative"
    generated_source_modified = $false
    external_application_knowledge_used_by_generator = $false
    token_recorded = $false
}
$metadata | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $run "run-metadata.json") -Encoding UTF8

$hashes = foreach ($file in Get-ChildItem $run -Recurse -File | Where-Object { $_.Name -ne "SHA256SUMS.csv" }) {
    $relative = $file.FullName.Substring($run.Length + 1).Replace("\", "/")
    [pscustomobject]@{ path = $relative; size_bytes = $file.Length; sha256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
}
$hashes | Sort-Object path | Export-Csv (Join-Path $run "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8

$evidence = Join-Path $Root "evidence"
New-Item -ItemType Directory -Force $evidence | Out-Null
$zip = Join-Path $evidence ((Split-Path $run -Leaf) + "-review.zip")
Compress-Archive -Path (Join-Path $run "*") -DestinationPath $zip -Force
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()

Write-Host ""
Write-Host "OPENAPI_VERIFIED_VIKUNJA_EVIDENCE_READY"
Write-Host "Run directory: $run"
Write-Host "Evidence ZIP:  $zip"
Write-Host "ZIP SHA256:    $zipHash"
Write-Host "Provengo exit: $provengoExit"
Write-Host "Evaluator exit: $evaluationExit"

if ($null -eq $evaluationExit) { Write-Host "OPENAPI_VERIFIED_VIKUNJA_INCONCLUSIVE"; exit 3 }
if ($evaluationExit -eq 2) { Write-Host "OPENAPI_VERIFIED_VIKUNJA_SEMANTIC_ANOMALY"; exit 0 }
if ($evaluationExit -eq 3 -or $provengoExit -ne 0) { Write-Host "OPENAPI_VERIFIED_VIKUNJA_INCONCLUSIVE"; exit 3 }
Write-Host "OPENAPI_VERIFIED_VIKUNJA_PASS"
exit 0
