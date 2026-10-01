[CmdletBinding()]
param(
    [string]$Root = "",
    [string]$Generated = "",
    [string]$Name = "gitea",
    [string]$Target = "http://127.0.0.1:3477",
    [string]$ApiPrefix = "/api/v1",
    [string]$BearerTokenEnv = "GITEA_API_TOKEN",
    [int]$ProxyPort = 3487,
    [int]$AdapterPort = 3489,
    [int]$Seed = 20260924,
    [int]$MaxLength = 120000,
    [int]$QuiescenceMs = 100,
    [switch]$RequireConcurrency,
    [switch]$Quiet
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
    $Generated = Get-ChildItem (Join-Path $Root "generated") -Directory `
        -Filter "gitea-stage2-*" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTimeUtc -Descending |
        Select-Object -First 1 -ExpandProperty FullName
    if ([string]::IsNullOrWhiteSpace($Generated)) {
        throw "No generated Gitea Stage 2 directory was found. Run Invoke-Gitea-Stage2-Preflight.ps1 first."
    }
}
$Generated = (Resolve-Path $Generated).Path

foreach ($command in @("python", "provengo")) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "$command was not found on PATH." }
}
if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($BearerTokenEnv))) {
    throw "Token environment variable '$BearerTokenEnv' is empty. Run Prepare-Gitea-Stage1.ps1 in this PowerShell process, then retry Stage 3."
}

$interfaces = Join-Path $Generated "interfaces.$Name.js"
$stories = Join-Path $Generated "stories.$Name.js"
$verification = Join-Path $Generated "verification.$Name.js"
$manifest = Join-Path $Generated "verification-manifest.$Name.json"
$plan = Join-Path $Generated "concurrency-plan.$Name.json"
$coverage = Join-Path $Generated "verifier-coverage.$Name.json"
foreach ($path in @($interfaces, $stories, $verification, $manifest, $plan, $coverage)) {
    if (-not (Test-Path $path -PathType Leaf)) { throw "Required generated file is missing: $path" }
}

try {
    $version = Invoke-RestMethod -Uri "$Target/api/v1/version" -TimeoutSec 10
    if ([string]$version.version -ne "1.27.3") {
        throw "Expected Gitea 1.27.3; target reports $($version.version)."
    }
    Invoke-RestMethod -Uri "$Target/api/v1/user" `
        -Headers @{ Authorization = "token $([Environment]::GetEnvironmentVariable($BearerTokenEnv))" } `
        -TimeoutSec 10 | Out-Null
}
catch { throw "Gitea or the current token could not be validated at $Target. Run Prepare-Gitea-Stage1.ps1 in this same PowerShell process." }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$run = Join-Path $Root "runs\gitea-stage3-live-acceptance-$stamp"
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
        "--bearer-token-env", $BearerTokenEnv, "--require-bearer-token",
        "--authorization-scheme", "token")
    $proxy = Start-Process python -ArgumentList $proxyArgs -WorkingDirectory $generatorRoot `
        -RedirectStandardOutput $proxyOut -RedirectStandardError $proxyErr -PassThru
    $deadline = (Get-Date).AddSeconds(20)
    $ready = $false
    while ((Get-Date) -lt $deadline) {
        if ($proxy.HasExited) { throw "Trace proxy exited before readiness. See $proxyErr" }
        try { Invoke-RestMethod -Uri "http://127.0.0.1:$ProxyPort/version" -TimeoutSec 2 | Out-Null; $ready = $true; break }
        catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $ready) { throw "Trace proxy did not become ready." }

    # The proxy check proves that its runtime authentication configuration is
    # valid before any generated schedule is allowed to mutate state.
    try {
        Invoke-RestMethod -Uri "http://127.0.0.1:$ProxyPort/user" -TimeoutSec 10 | Out-Null
    }
    catch {
        throw "The token in '$BearerTokenEnv' was rejected by $Target. Run Prepare-Gitea-Stage1.ps1 again in this same PowerShell process, then retry."
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

    if ($Quiet) {
        & provengo --no-color run --run-source :random --random-seed $Seed --max-length $MaxLength $project *>&1 |
            Set-Content (Join-Path $run "provengo-run.log")
    } else {
        & provengo --no-color run --run-source :random --random-seed $Seed --max-length $MaxLength $project *>&1 |
            Tee-Object (Join-Path $run "provengo-run.log")
    }
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
Copy-Item $plan (Join-Path $run (Split-Path $plan -Leaf)) -Force
Copy-Item $coverage (Join-Path $run (Split-Path $coverage -Leaf)) -Force
$metadata = [ordered]@{
    schema_version = 1
    experiment = "gitea-stage3-openapi-only-live-acceptance"
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
    concurrency_ready_count = @([regex]::Matches((Get-Content (Join-Path $run "provengo-run.log") -Raw),
        'Selected: \[SBT:ConcurrencyReady:')).Count
    concurrency_permit_count = @([regex]::Matches((Get-Content (Join-Path $run "provengo-run.log") -Raw),
        'Selected: \[SBT:ConcurrencyPermit:')).Count
    concurrency_closed_count = @([regex]::Matches((Get-Content (Join-Path $run "provengo-run.log") -Raw),
        'Selected: \[SBT:ConcurrencyClosed:')).Count
    runtime_http_status_policy = "accept-all-at-actuator; external trace evaluator is authoritative"
    generated_source_modified = $false
    external_application_knowledge_used_by_generator = $false
    authentication_is_harness_configuration = $true
    authorization_scheme = "token"
    token_recorded = $false
    mutable_provengo_internal_products_in_evidence_zip = $false
}
$metadata | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $run "run-metadata.json") -Encoding UTF8

$hashes = foreach ($file in Get-ChildItem $run -Recurse -File | Where-Object {
    $_.Name -ne "SHA256SUMS.csv" -and
    $_.FullName -notlike "*provengo_project\products\internal\*"
}) {
    $relative = $file.FullName.Substring($run.Length + 1).Replace("\", "/")
    [pscustomobject]@{ path = $relative; size_bytes = $file.Length; sha256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
}
$hashes | Sort-Object path | Export-Csv (Join-Path $run "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8

$evidence = Join-Path $Root "evidence"
New-Item -ItemType Directory -Force $evidence | Out-Null
$zip = Join-Path $evidence ((Split-Path $run -Leaf) + "-review.zip")
if (Test-Path $zip) { Remove-Item $zip -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open($zip, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in Get-ChildItem $run -Recurse -File | Where-Object {
        $_.FullName -notlike "*provengo_project\products\internal\*"
    }) {
        $relative = $file.FullName.Substring($run.Length + 1).Replace("\", "/")
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive, $file.FullName, $relative,
            [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
}
finally { $archive.Dispose() }
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()

Write-Host ""
Write-Host "GITEA_STAGE3_EVIDENCE_READY"
Write-Host "Generated input: $Generated"
Write-Host "Run directory: $run"
Write-Host "Evidence ZIP:  $zip"
Write-Host "ZIP SHA256:    $zipHash"
Write-Host "Provengo exit: $provengoExit"
Write-Host "Evaluator exit: $evaluationExit"

if (Test-Path $evaluation -PathType Leaf) {
    $evaluationObject = Get-Content $evaluation -Raw | ConvertFrom-Json
    Write-Host "HTTP events:    $(@((Get-Content $trace) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }).Count)"
    Write-Host "Epochs logged:  $($metadata.concurrency_epoch_count)"
    Write-Host "Oracle result:  $($evaluationObject.run_status)"
    Write-Host "Contract layer: $($evaluationObject.layer_counts.contract | ConvertTo-Json -Compress)"
    Write-Host "State layer:    $($evaluationObject.layer_counts.state | ConvertTo-Json -Compress)"
    Write-Host "Concurrency:    $($evaluationObject.layer_counts.concurrency | ConvertTo-Json -Compress)"
}
Write-Host "GITEA_STAGE3_COMPLETE"

if ($RequireConcurrency) {
    $planObject = Get-Content $plan -Raw | ConvertFrom-Json
    $runtimeReady = @($planObject.oracles | Where-Object { $_.runtime.ready -eq $true }).Count
    $evaluatedConcurrency = 0
    if (Test-Path $evaluation -PathType Leaf) {
        $evaluatedConcurrency = [int]$evaluationObject.layer_counts.concurrency.PASS +
            [int]$evaluationObject.layer_counts.concurrency.VIOLATED +
            [int]$evaluationObject.layer_counts.concurrency.INCONCLUSIVE
    }
    Write-Host "Runtime-ready plans: $runtimeReady"
    Write-Host "Ready events:        $($metadata.concurrency_ready_count)"
    Write-Host "Permit events:       $($metadata.concurrency_permit_count)"
    Write-Host "Closed events:       $($metadata.concurrency_closed_count)"
    Write-Host "Evaluated epochs:    $evaluatedConcurrency"
    if ($runtimeReady -lt 1 -or $metadata.concurrency_ready_count -lt 1 -or
        $metadata.concurrency_permit_count -lt 1 -or $metadata.concurrency_closed_count -lt 1 -or
        $metadata.concurrency_epoch_count -lt 1 -or $evaluatedConcurrency -lt 1) {
        throw "GITEA_STAGE3_1_INCOMPLETE: generated concurrency was not proven end-to-end. Evidence was preserved at $zip."
    }
    Write-Host "GITEA_STAGE3_1_CONCURRENCY_ACCEPTED"
}

if ($null -eq $evaluationExit) { Write-Host "GITEA_STAGE3_INCONCLUSIVE"; exit 3 }
if ($evaluationExit -eq 2) {
    Write-Host "GITEA_STAGE3_$($evaluationObject.run_status)"
    exit 0
}
if ($evaluationExit -eq 3 -or $provengoExit -ne 0) { Write-Host "GITEA_STAGE3_INCONCLUSIVE"; exit 3 }
Write-Host "GITEA_STAGE3_PASS"
exit 0
