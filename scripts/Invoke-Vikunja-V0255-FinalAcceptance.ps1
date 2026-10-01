[CmdletBinding()]
param(
    [string]$Root = "",
    [string]$OpenApi = "",
    [string]$Generated = "",
    [string]$Name = "vikunja_verified",
    [string]$Target = "http://127.0.0.1:3466",
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
if ([string]::IsNullOrWhiteSpace($Generated)) {
    $Generated = Join-Path $Root "generated\vikunja-verified"
}
New-Item -ItemType Directory -Force $Generated | Out-Null
$Generated = (Resolve-Path $Generated).Path

if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN)) {
    throw "VIKUNJA_API_TOKEN is empty. Run Prepare-Vikunja-Increment8_2.ps1 in this PowerShell process."
}
try {
    Invoke-RestMethod -Uri "$Target/api/v2/user" `
        -Headers @{ Authorization = "Bearer $env:VIKUNJA_API_TOKEN" } `
        -TimeoutSec 10 | Out-Null
}
catch { throw "The current VIKUNJA_API_TOKEN was rejected by $Target." }

if ([string]::IsNullOrWhiteSpace($OpenApi)) {
    $preferred = Join-Path $Root "evidence\increment6-linearizable-conflicts-evidence-20260922_001635\model\vikunja-multi-resource-openapi.json"
    if (Test-Path $preferred -PathType Leaf) {
        $OpenApi = $preferred
    } else {
        $candidate = Get-ChildItem $Root -Recurse -File `
            -Filter "vikunja-multi-resource-openapi.json" -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -notmatch "\\generated\\" -and $_.FullName -notmatch "\\runs\\" } |
            Sort-Object FullName | Select-Object -First 1
        if ($null -eq $candidate) { throw "Vikunja OpenAPI was not found. Pass -OpenApi explicitly." }
        $OpenApi = $candidate.FullName
    }
}
$OpenApi = (Resolve-Path $OpenApi).Path

$generatorScript = Join-Path $Root "scripts\Invoke-OpenApi-Verified-Generator.ps1"
$acceptanceScript = Join-Path $Root "scripts\Invoke-OpenApi-Verified-Vikunja-Acceptance.ps1"
foreach ($required in @($generatorScript, $acceptanceScript)) {
    if (-not (Test-Path $required -PathType Leaf)) { throw "Required script is missing: $required" }
}

Write-Host "Regenerating Vikunja artifacts from the OpenAPI..."
& $generatorScript -OpenApi $OpenApi -Output $Generated -Name $Name `
    -BaseUrl "http://127.0.0.1:3457"
if ($LASTEXITCODE -notin @(0, 3)) { throw "Verified generation failed with exit code $LASTEXITCODE." }

$verification = Join-Path $Generated "verification.$Name.js"
if (-not (Test-Path $verification -PathType Leaf)) { throw "Generated verifier is missing: $verification" }
$verificationText = Get-Content $verification -Raw
foreach ($marker in @(
    "__sbtAnyConcurrencyReady",
    "__readyIndex",
    'request:Event("SBT:ConcurrencyPermit:"+__readyIndex)',
    "__sbtAnyHttpDelete",
    "block:__sbtConcurrencyBusyBlock()",
    "__sbtNamedEvent"
)) {
    if ($verificationText -notmatch [regex]::Escape($marker)) {
        throw "Concurrency-controller hotfix marker is missing: $marker. Do not run acceptance."
    }
}
Write-Host "V0255_CONCURRENCY_CONTROLLER_PREFLIGHT_PASS"
$evaluatorSource = Join-Path $Root "generator_baseline\openapi_to_sbt\evaluate_verifiers.py"
if (-not (Test-Path $evaluatorSource -PathType Leaf) -or
    (Get-Content $evaluatorSource -Raw) -notmatch "concurrency_epochs_evaluated") {
    throw "Hotfix 4 evaluator marker is missing. Do not run acceptance."
}
Write-Host "V0255_HOTFIX4_EVALUATOR_PREFLIGHT_PASS"

$startedUtc = (Get-Date).ToUniversalTime()
& $acceptanceScript -Root $Root -Generated $Generated -Name $Name `
    -Target $Target -Seed $Seed -MaxLength $MaxLength -QuiescenceMs $QuiescenceMs
$acceptanceExit = $LASTEXITCODE

$run = Get-ChildItem (Join-Path $Root "runs") -Directory `
    -Filter "openapi-verified-vikunja-*" -ErrorAction SilentlyContinue |
    Where-Object { $_.CreationTimeUtc -ge $startedUtc.AddSeconds(-2) } |
    Sort-Object CreationTimeUtc -Descending | Select-Object -First 1
if ($null -eq $run) { throw "The final acceptance run directory was not found." }

$metadataPath = Join-Path $run.FullName "run-metadata.json"
$evaluationPath = Join-Path $run.FullName "generated-verifier-evaluation.json"
if (-not (Test-Path $metadataPath -PathType Leaf)) { throw "Run metadata is missing: $metadataPath" }
if (-not (Test-Path $evaluationPath -PathType Leaf)) { throw "Verifier evaluation is missing: $evaluationPath" }
$metadata = Get-Content $metadataPath -Raw | ConvertFrom-Json
$evaluation = Get-Content $evaluationPath -Raw | ConvertFrom-Json

$epochs = [int]$metadata.concurrency_epoch_count
$provengoLogPath = Join-Path $run.FullName "provengo-run.log"
if (-not (Test-Path $provengoLogPath -PathType Leaf)) { throw "Provengo run log is missing: $provengoLogPath" }
$provengoLog = Get-Content $provengoLogPath -Raw
$runtimeReady = @([regex]::Matches($provengoLog, 'Selected: \[SBT:ConcurrencyReady:(\d+)') |
    ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique).Count
$runtimePermits = @([regex]::Matches($provengoLog, 'Selected: \[SBT:ConcurrencyPermit:(\d+)') |
    ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique).Count
$runtimeClosed = @([regex]::Matches($provengoLog, 'Selected: \[SBT:ConcurrencyClosed:(\d+)') |
    ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique).Count
$generatedReady = [int]$evaluation.concurrency_oracles_ready
if ($null -eq $evaluation.concurrency_epochs_evaluated) {
    throw "FINAL ACCEPTANCE FAILED: Hotfix 4 evaluator coverage is missing."
}
$semanticEpochs = [int]$evaluation.concurrency_epochs_evaluated
if ($epochs -lt 1) { throw "FINAL ACCEPTANCE FAILED: no concurrency epoch was recorded." }
if ($runtimeReady -lt 1) { throw "FINAL ACCEPTANCE FAILED: no runtime Ready event was selected." }
if ($runtimePermits -ne $runtimeReady -or $runtimeClosed -ne $runtimeReady -or $epochs -ne $runtimeReady) {
    throw "FINAL ACCEPTANCE INCOMPLETE: Ready=$runtimeReady Permit=$runtimePermits Closed=$runtimeClosed Epochs=$epochs."
}
if ($acceptanceExit -notin @(0, 2)) {
    throw "Acceptance infrastructure was inconclusive (exit $acceptanceExit)."
}

$evidenceZip = Join-Path (Join-Path $Root "evidence") ($run.Name + "-review.zip")
if (-not (Test-Path $evidenceZip -PathType Leaf)) { throw "Evidence ZIP is missing: $evidenceZip" }
$zipHash = (Get-FileHash $evidenceZip -Algorithm SHA256).Hash.ToLowerInvariant()

Write-Host ""
Write-Host "VIKUNJA_V0255_FINAL_ACCEPTANCE_COMPLETE"
Write-Host "Generated plans:      $generatedReady"
Write-Host "Runtime Ready:        $runtimeReady"
Write-Host "Runtime Permit:       $runtimePermits"
Write-Host "Runtime Closed:       $runtimeClosed"
Write-Host "Concurrency epochs:  $epochs"
Write-Host "Semantic evaluations: $semanticEpochs"
Write-Host "Evaluation status:    $($evaluation.run_status)"
Write-Host "Evidence ZIP:         $evidenceZip"
Write-Host "ZIP SHA256:           $zipHash"
exit 0
