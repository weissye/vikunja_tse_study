param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("library", "garage", "pharmacy", "netbox", "todoist")]
    [string]$System,

    [ValidateSet("correct", "buggy")]
    [string]$Variant = "buggy",

    [string]$DevelopmentKit = "",
    [string]$ResultsRoot = "",
    [int]$Seed = 1,
    [int]$MaxLength = 500,
    [int]$InstancesPerEntity = 5,
    [int]$InstancesPerAction = 7,
    [int]$StartupTimeoutSeconds = 60,
    [string]$ReplayFrom = ""
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($DevelopmentKit)) { $DevelopmentKit = Join-Path $ScriptDir "..\resources\development_kit" }
if ([string]::IsNullOrWhiteSpace($ResultsRoot)) { $ResultsRoot = Join-Path $ScriptDir "..\results\provengo_four_systems" }
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "..")).Path
if ($System -ne "todoist") {
    & (Join-Path $PSScriptRoot "Test-SUT-Identity.ps1")
    if (-not (Test-Path $DevelopmentKit)) { throw "Development-kit resources were not found: $DevelopmentKit" }
    $DevelopmentKit = (Resolve-Path $DevelopmentKit).Path
}

# no experiment run is allowed to own a shared fixed port.  The source
# SUT identity stays unchanged; scripts/run_flask_sut.py imports its Flask app
# and asks the OS for an isolated ephemeral listener.
$matrix = @{
    library = @{
        correct = @{ script="validation_only\suts\library\sut.py" }
        buggy   = @{ script="validation_only\suts\library\library_sut_buggy.py" }
    }
    garage = @{
        correct = @{ script="validation_only\suts\garage\garage_sut.py" }
        buggy   = @{ script="validation_only\suts\garage\garage_sut_buggy.py" }
    }
    pharmacy = @{
        correct = @{ script="validation_only\suts\pharmacy\app.py" }
        buggy   = @{ script="validation_only\suts\pharmacy\app_buggy.py" }
    }
    netbox = @{
        correct = @{ script="validation_only\suts\netbox\netbox_mock.py" }
        buggy   = @{ script="validation_only\suts\netbox\netbox_benchmark.py" }
    }
    todoist = @{
        correct = @{ script="holdout\sut\todoist_sut.py" }
        buggy   = @{ script="holdout\sut\todoist_sut_buggy.py" }
    }
}

if (-not (Get-Command provengo -ErrorAction SilentlyContinue)) {
    throw "provengo was not found on PATH. Verify with: provengo --version"
}
$python = if (Test-Path (Join-Path $ProjectRoot ".venv\Scripts\python.exe")) {
    Join-Path $ProjectRoot ".venv\Scripts\python.exe"
} else { (Get-Command python -ErrorAction Stop).Source }

function Wait-TextFile([string]$Path, [System.Diagnostics.Process]$Process, [int]$TimeoutSeconds, [string]$What) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if ($Process -and $Process.HasExited) { throw "$What exited during startup. Inspect its stderr log." }
        if (Test-Path $Path) {
            $text = (Get-Content $Path -Raw).Trim()
            if ($text) { return $text }
        }
        Start-Sleep -Milliseconds 100
    }
    throw "$What did not publish readiness metadata within $TimeoutSeconds seconds: $Path"
}

function Get-Sha256([string]$Path) {
    if (-not (Test-Path $Path)) { return $null }
    return (Get-FileHash -Algorithm SHA256 $Path).Hash.ToLowerInvariant()
}

New-Item -ItemType Directory -Force $ResultsRoot | Out-Null
$cfg = $matrix[$System][$Variant]
$sutScript = if ($System -eq "todoist") { Join-Path $ProjectRoot $cfg.script } else { Join-Path $DevelopmentKit $cfg.script }
if (-not (Test-Path $sutScript)) { throw "Required SUT file not found: $sutScript" }

# Fail fast before generation/startup. This catches the exact clean-install
# failure mode found by the external audit (missing Flask) and also validates
# the real Provengo/Java runtime rather than waiting for a 60-second timeout.
$preflight = Join-Path $PSScriptRoot "preflight_e2e.py"
& $python $preflight --mode provengo --development-kit $DevelopmentKit --system $System *> (Join-Path $ResultsRoot "preflight_latest.json")
if ($LASTEXITCODE -ne 0) {
    Get-Content (Join-Path $ResultsRoot "preflight_latest.json")
    throw "E2E preflight failed; install with pip install -e `".[dev,e2e]`" and verify Java/Node/Provengo on PATH."
}

# millisecond timestamp + random suffix prevents concurrent writers from
# sharing a results directory (the same class of defect as historical shared
# output.json failures).
$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$suffix = ([Guid]::NewGuid().ToString("N")).Substring(0,8)
$runId = "${System}_${Variant}_${stamp}_${suffix}"
$runDir = Join-Path $ResultsRoot $runId
$provengoProject = Join-Path $runDir "provengo_project"
$modelDir = Join-Path $runDir "generated_model"
New-Item -ItemType Directory -Force $runDir | Out-Null

$openapiSource = if ($System -eq "todoist") { Join-Path $ProjectRoot "holdout\todoist_rest_v2_openapi.yaml" } else { Join-Path $DevelopmentKit "examples\$System\openapi.json" }
$openapiSnapshot = Join-Path $runDir "openapi.json"
$canonicalBaseUrl = "http://127.0.0.1:5000"
$oldPythonPath = $env:PYTHONPATH
$env:PYTHONPATH = $ProjectRoot
try {
    if ($ReplayFrom) {
        $ReplayFrom = (Resolve-Path $ReplayFrom).Path
        $sourceMetadataPath = Join-Path $ReplayFrom "run_metadata.json"
        if (-not (Test-Path $sourceMetadataPath)) { throw "Replay source lacks run_metadata.json: $ReplayFrom" }
        $sourceMetadata = Get-Content $sourceMetadataPath -Raw | ConvertFrom-Json
        if ($sourceMetadata.system -ne $System -or $sourceMetadata.variant -ne $Variant) {
            throw "Replay source is $($sourceMetadata.system)/$($sourceMetadata.variant), not $System/$Variant"
        }
        $verify = Join-Path $PSScriptRoot "verify_evidence_manifest.py"
        if (Test-Path (Join-Path $ReplayFrom "evidence_manifest.json")) {
            & $python $verify $ReplayFrom *> (Join-Path $runDir "replay_source_verification.json")
            if ($LASTEXITCODE -ne 0) { throw "Replay source evidence manifest verification failed" }
        }
        Copy-Item (Join-Path $ReplayFrom "generated_model") $modelDir -Recurse
        Copy-Item (Join-Path $ReplayFrom "openapi.json") $openapiSnapshot
        "Replay: reused exact generated_model snapshot from $ReplayFrom" | Set-Content (Join-Path $runDir "generation.log") -Encoding UTF8
    } else {
        if (-not (Test-Path $openapiSource)) { throw "OpenAPI file not found: $openapiSource" }
        # Generate against a canonical logical port. Runtime port allocation is
        # applied only to the Provengo project copy below, keeping the generated
        # model and its fingerprint deterministic across repeated runs.
        & $python -m openapi_to_sbt generate --openapi $openapiSource --output $modelDir `
            --name $System --base-url $canonicalBaseUrl --seed $Seed `
            --instances-per-entity $InstancesPerEntity --instances-per-action $InstancesPerAction --force `
            *> (Join-Path $runDir "generation.log")
        if ($LASTEXITCODE -ne 0) { throw "OpenAPI-to-SBT generation failed; inspect generation.log" }
        Copy-Item $openapiSource $openapiSnapshot
    }
    & $python -m openapi_to_sbt validate --openapi $openapiSnapshot --generated $modelDir `
        *> (Join-Path $runDir "validation_report.json")
    if ($LASTEXITCODE -ne 0) { throw "Generated-model validation failed; inspect validation_report.json" }
} finally { $env:PYTHONPATH = $oldPythonPath }

$stories = Join-Path $modelDir "stories.$System.js"
$interfaces = Join-Path $modelDir "interfaces.$System.js"
foreach ($required in @($stories, $interfaces)) {
    if (-not (Test-Path $required)) { throw "Required generated file not found: $required" }
}

& provengo --batch-mode create $provengoProject *> (Join-Path $runDir "provengo_create.log")
if ($LASTEXITCODE -ne 0) { throw "provengo create failed with exit code $LASTEXITCODE" }
$specDir = Join-Path $provengoProject "spec\js"
$disabledDir = Join-Path $specDir "disabled"
New-Item -ItemType Directory -Force $disabledDir | Out-Null
$helloWorld = Join-Path $specDir "hello-world.js"
if (Test-Path $helloWorld) { Move-Item $helloWorld $disabledDir }
Copy-Item $stories $specDir
Copy-Item $interfaces $specDir

$sutOut = Join-Path $runDir "sut.stdout.log"
$sutErr = Join-Path $runDir "sut.stderr.log"
$sutPortFile = Join-Path $runDir "sut.port"
$proxyOut = Join-Path $runDir "proxy.stdout.log"
$proxyErr = Join-Path $runDir "proxy.stderr.log"
$proxyPortFile = Join-Path $runDir "proxy.port"
$traceLog = Join-Path $runDir "http_trace.jsonl"
$sut = $null
$proxy = $null
$provengoExit = $null
$sutPort = $null
$proxyPort = $null
$provengoVersion = ((& provengo --version 2>&1) | Out-String).Trim()
try {
    $sut = Start-Process -FilePath $python -ArgumentList @(
        (Join-Path $PSScriptRoot "run_flask_sut.py"), "--script", $sutScript,
        "--port", "0", "--port-file", $sutPortFile) `
        -WorkingDirectory (Split-Path $sutScript -Parent) `
        -RedirectStandardOutput $sutOut -RedirectStandardError $sutErr -PassThru
    $sutPort = [int](Wait-TextFile $sutPortFile $sut $StartupTimeoutSeconds "SUT")

    $proxy = Start-Process -FilePath $python -ArgumentList @(
        (Join-Path $PSScriptRoot "http_trace_proxy.py"), "--listen-port", "0",
        "--target-port", $sutPort, "--trace", $traceLog, "--port-file", $proxyPortFile) `
        -RedirectStandardOutput $proxyOut -RedirectStandardError $proxyErr -PassThru
    $proxyPort = [int](Wait-TextFile $proxyPortFile $proxy 15 "HTTP trace proxy")

    # Patch only the runtime copy. generated_model remains content-stable and
    # is the exact replay snapshot/fingerprint target.
    $runtimeInterface = Join-Path $specDir "interfaces.$System.js"
    $interfaceText = Get-Content $runtimeInterface -Raw
    $interfaceText = $interfaceText -replace 'var port = \(typeof port !== ''undefined''\) \? port : \d+;', `
        "var port = (typeof port !== 'undefined') ? port : $proxyPort;"
    Set-Content $runtimeInterface $interfaceText -Encoding UTF8

    $provengoLog = Join-Path $runDir "provengo_run.log"
    & provengo --no-color run --run-source :random --random-seed $Seed `
        --max-length $MaxLength $provengoProject *>&1 | Tee-Object $provengoLog
    $provengoExit = $LASTEXITCODE
}
finally {
    if ($proxy -and -not $proxy.HasExited) { Stop-Process -Id $proxy.Id -Force -ErrorAction SilentlyContinue }
    if ($sut -and -not $sut.HasExited) { Stop-Process -Id $sut.Id -Force -ErrorAction SilentlyContinue }
}

if (-not (Test-Path $traceLog)) { New-Item -ItemType File $traceLog | Out-Null }
$evaluator = switch ($System) {
    "library"  { "evaluate_library_trace.py" }
    "garage"   { "evaluate_garage_trace.py" }
    "pharmacy" { "evaluate_pharmacy_trace.py" }
    "netbox"   { "evaluate_netbox_trace.py" }
    "todoist"   { "evaluate_todoist_trace.py" }
}
$semanticPath = Join-Path $runDir "semantic_evaluation.json"
& $python (Join-Path $PSScriptRoot $evaluator) $traceLog | Set-Content $semanticPath -Encoding UTF8
if ($LASTEXITCODE -ne 0) { throw "$System semantic evaluator failed" }
Get-Content $semanticPath
$semantic = Get-Content $semanticPath -Raw | ConvertFrom-Json
if ([int]$semantic.event_count -le 0) {
    throw "$System semantic evaluation is invalid: event_count=0. Inspect SUT/proxy logs in $runDir"
}
if ($System -eq "todoist" -and -not [bool]$semantic.runtime_contract_confirmed) {
    throw "Todoist real-Provengo runtime contract was not confirmed (server-assigned ID reuse/create-update-delete). Inspect semantic_evaluation.json and provengo_run.log."
}

$generationReport = Get-Content (Join-Path $modelDir "generation_report.json") -Raw | ConvertFrom-Json
$expectedFaultCount = if ($System -eq "netbox" -and $Variant -eq "buggy") { 2 } else { $null }
$expectedFaultIds = if ($System -eq "netbox" -and $Variant -eq "buggy") {
    @("NB-DELETE-01", "NB-CIRCUIT-STATUS-02")
} else { @() }
$metadata = [ordered]@{
    schema_version = 3
    artifact_version = "v38"
    run_id = $runId
    system = $System
    variant = $Variant
    seed = $Seed
    max_length = $MaxLength
    instances_per_entity = $InstancesPerEntity
    instances_per_action = $InstancesPerAction
    sut_port = $sutPort
    proxy_port = $proxyPort
    port_allocation = "OS-assigned per-run ephemeral ports"
    sut_script_relative = $cfg.script
    sut_sha256 = Get-Sha256 $sutScript
    openapi_sha256 = Get-Sha256 $openapiSnapshot
    generated_model_content_fingerprint_sha256 = $generationReport.reproducibility.content_fingerprint_sha256
    generated_stories_sha256 = Get-Sha256 $stories
    generated_interfaces_sha256 = Get-Sha256 $interfaces
    runtime_interface_sha256 = Get-Sha256 (Join-Path $specDir "interfaces.$System.js")
    provengo_version = $provengoVersion
    provengo_exit_code = $provengoExit
    semantic_evaluator = $evaluator
    semantic_evaluation_sha256 = Get-Sha256 $semanticPath
    source_fault_inventory_count = $expectedFaultCount
    source_fault_ids = $expectedFaultIds
    replay_source = if ($ReplayFrom) { $ReplayFrom } else { $null }
    replay_policy = "Exact generated_model snapshot + fixed Provengo random seed; dynamic runtime ports are non-semantic and recorded separately."
    note = "A non-zero Provengo exit is not itself a semantic fault confirmation. Only the class-specific external evaluator is authoritative."
}
$metadata | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $runDir "run_metadata.json") -Encoding UTF8
& $python (Join-Path $PSScriptRoot "build_evidence_manifest.py") $runDir | Out-Null

Write-Host "PROVENGO RUN COMPLETE"
Write-Host "RunId: $runId; System: $System; Variant: $Variant; Exit: $provengoExit"
Write-Host "SUT port: $sutPort; Proxy port: $proxyPort"
Write-Host "Results: $runDir"
exit ([int]($provengoExit -ne 0))
