[CmdletBinding()]
param(
    [string]$Root = "",
    [string]$Generated = "",
    [string]$Name = "vikunja_verified",
    [string]$Target = "http://127.0.0.1:3466",
    [string]$ApiPrefix = "/api/v2",
    [string]$BearerTokenEnv = "VIKUNJA_API_TOKEN",
    [int]$Trials = 5,
    [string]$Container = "vikunja-increment8-2-postgres",
    [string]$DiscoveryEvidence = ""
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
$Generated = (Resolve-Path $Generated).Path
$generatorRoot = Join-Path $Root "generator_baseline"
$manifest = Join-Path $Generated "verification-manifest.$Name.json"
if (-not (Test-Path $manifest -PathType Leaf)) { throw "Verifier manifest was not found: $manifest" }
if ($Trials -lt 1) { throw "Trials must be at least 1." }
if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($BearerTokenEnv))) {
    throw "Bearer token environment variable '$BearerTokenEnv' is empty."
}

try {
    Invoke-RestMethod -Uri "$Target$ApiPrefix/user" `
        -Headers @{ Authorization = "Bearer $([Environment]::GetEnvironmentVariable($BearerTokenEnv))" } `
        -TimeoutSec 10 | Out-Null
}
catch { throw "The configured token was rejected by $Target." }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$run = Join-Path $Root "runs\vikunja-patch304-confirmation-$stamp"
New-Item -ItemType Directory -Force $run | Out-Null
$log = Join-Path $run "confirmation.log"
$createBodyFile = Join-Path $run "confirmation-create-body.json"
[ordered]@{ title = "sbt_304_confirmation_{trial}" } |
    ConvertTo-Json -Compress |
    Set-Content $createBodyFile -Encoding UTF8
$argsList = @(
    "-m", "openapi_to_sbt.confirm_noop_candidate",
    "--base-url", "$Target$ApiPrefix",
    "--manifest", $manifest,
    "--create-operation", "projects-create",
    "--read-operation", "projects-read",
    "--mutation-operation", "patch-projects-read",
    "--delete-operation", "projects-delete",
    "--create-body-file", $createBodyFile,
    "--field", "is_archived",
    "--token-env", $BearerTokenEnv,
    "--trials", "$Trials",
    "--output", $run
)
Push-Location $generatorRoot
try {
    # Windows PowerShell converts native stderr into NativeCommandError when
    # ErrorActionPreference is Stop, truncating Python's traceback at its first
    # line. Capture the complete native result before restoring strict mode.
    $savedErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $pythonOutput = & python @argsList 2>&1
    $pythonExit = $LASTEXITCODE
    $ErrorActionPreference = $savedErrorActionPreference
    $pythonOutput | Tee-Object $log
}
finally { Pop-Location }

Copy-Item $manifest (Join-Path $run (Split-Path $manifest -Leaf)) -Force
$summaryPath = Join-Path $run "confirmation-summary.json"
if ($pythonExit -ne 0 -and -not (Test-Path $summaryPath -PathType Leaf)) {
    [ordered]@{
        schema_version = 1
        analysis_role = "post-discovery-confirmation-not-generator-input"
        confirmation_status = "INCONCLUSIVE"
        counts = [ordered]@{ CONFIRMED = 0; STATE_VIOLATION = 0; PARTIAL = 0; NOT_REPRODUCED = 0; INCONCLUSIVE = $Trials }
        reason = "confirmation-harness-failed"
        python_exit_code = $pythonExit
        full_error_log = "confirmation.log"
        token_recorded = $false
    } | ConvertTo-Json -Depth 8 | Set-Content $summaryPath -Encoding UTF8
}
$summary = Get-Content $summaryPath -Raw | ConvertFrom-Json
$metadata = [ordered]@{
    experiment = "post-discovery-vikunja-patch304-confirmation"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    target = $Target
    api_prefix = $ApiPrefix
    trials = $Trials
    confirmation_status = $summary.confirmation_status
    python_exit_code = $pythonExit
    generator_input = $false
    application_specific_follow_up = $true
    token_recorded = $false
}

if ([string]::IsNullOrWhiteSpace($DiscoveryEvidence)) {
    $latestDiscovery = Get-ChildItem (Join-Path $Root "evidence") `
        -Filter "openapi-verified-vikunja-*-review.zip" -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
    if ($null -ne $latestDiscovery) { $DiscoveryEvidence = $latestDiscovery.FullName }
}
if (-not [string]::IsNullOrWhiteSpace($DiscoveryEvidence) -and
    (Test-Path $DiscoveryEvidence -PathType Leaf)) {
    $resolvedDiscovery = (Resolve-Path $DiscoveryEvidence).Path
    $metadata.discovery_evidence_file = Split-Path $resolvedDiscovery -Leaf
    $metadata.discovery_evidence_sha256 = `
        (Get-FileHash $resolvedDiscovery -Algorithm SHA256).Hash.ToLowerInvariant()
}

if (-not [string]::IsNullOrWhiteSpace($Container)) {
    $inspectOut = Join-Path $run "sut-container-inspect.json"
    $inspectErr = Join-Path $run "sut-container-inspect.stderr.log"
    $inspectProcess = Start-Process docker -ArgumentList @("inspect", $Container) `
        -Wait -PassThru -NoNewWindow -RedirectStandardOutput $inspectOut `
        -RedirectStandardError $inspectErr
    $metadata.container = $Container
    $metadata.container_inspect_exit = $inspectProcess.ExitCode
}
$metadata | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $run "run-metadata.json") -Encoding UTF8

$hashes = foreach ($file in Get-ChildItem $run -Recurse -File | Where-Object { $_.Name -ne "SHA256SUMS.csv" }) {
    $relative = $file.FullName.Substring($run.Length + 1).Replace("\", "/")
    [pscustomobject]@{
        path = $relative
        size_bytes = $file.Length
        sha256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    }
}
$hashes | Sort-Object path | Export-Csv (Join-Path $run "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8

$evidence = Join-Path $Root "evidence"
New-Item -ItemType Directory -Force $evidence | Out-Null
$zip = Join-Path $evidence ((Split-Path $run -Leaf) + "-review.zip")
Compress-Archive -Path (Join-Path $run "*") -DestinationPath $zip -Force
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()

Write-Host ""
Write-Host "VIKUNJA_PATCH304_CONFIRMATION_EVIDENCE_READY"
Write-Host "Status:       $($summary.confirmation_status)"
Write-Host "Confirmed:    $($summary.counts.CONFIRMED)/$Trials"
Write-Host "Run directory: $run"
Write-Host "Evidence ZIP:  $zip"
Write-Host "ZIP SHA256:    $zipHash"
exit 0
