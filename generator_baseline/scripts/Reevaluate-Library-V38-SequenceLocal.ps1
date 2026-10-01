[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$RunDir,

    [Parameter(Mandatory=$true)]
    [ValidateSet('RESTler','EvoMaster','Provengo')]
    [string]$Tool,

    [string]$PythonCommand = 'python',
    [string]$CampaignTrace = '',
    [string]$OutputDir = '',
    [int]$ReplayTimeoutSeconds = 120,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$RunDir = (Resolve-Path $RunDir).Path

$Here = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($Here)) { $Here = (Get-Location).Path }
if (Test-Path (Join-Path $Here 'resources')) {
    $ProjectRoot = (Resolve-Path $Here).Path
} else {
    $ProjectRoot = (Resolve-Path (Join-Path $Here '..')).Path
}

$Preparer = Join-Path $ProjectRoot 'scripts\prepare_library_sequence_traces.py'
$Evaluator = Join-Path $ProjectRoot 'scripts\evaluate_library_sequences.py'
$Sut = Join-Path $ProjectRoot 'resources\development_kit\validation_only\suts\library\library_sut_buggy.py'
$SutLauncher = Join-Path $ProjectRoot 'scripts\run_flask_sut.py'
$Proxy = Join-Path $ProjectRoot 'scripts\http_trace_proxy.py'

foreach ($item in @($Preparer,$Evaluator,$Sut,$SutLauncher,$Proxy)) {
    if (-not (Test-Path $item)) { throw "Missing required file: $item" }
}

if ([string]::IsNullOrWhiteSpace($CampaignTrace)) {
    $CampaignTrace = Join-Path $RunDir 'http_trace.jsonl'
}
$CampaignTrace = (Resolve-Path $CampaignTrace).Path

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $RunDir 'sequence_local_v38'
} elseif (-not [System.IO.Path]::IsPathRooted($OutputDir)) {
    $OutputDir = [System.IO.Path]::GetFullPath((Join-Path $RunDir $OutputDir))
}

if (Test-Path $OutputDir) {
    if (-not $Force) {
        throw "Output already exists: $OutputDir. Preserve it or rerun with -Force to replace derived outputs only."
    }
    Remove-Item $OutputDir -Recurse -Force
}
New-Item -ItemType Directory -Force $OutputDir | Out-Null

function Invoke-NativeLogged {
    param([string]$Command,[object[]]$Arguments,[string]$LogPath)
    $saved = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        & $Command @Arguments *>&1 | Tee-Object -FilePath $LogPath | Out-Host
        $code = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $saved
    }
    return [int]$code
}

$toolKey = $Tool.ToLowerInvariant()
$prepareLog = Join-Path $OutputDir 'prepare_sequences.log'
$prepareArgs = @(
    $Preparer,
    '--tool',$toolKey,
    '--run-dir',$RunDir,
    '--campaign-trace',$CampaignTrace,
    '--output-dir',$OutputDir,
    '--python',$PythonCommand,
    '--sut',$Sut,
    '--sut-launcher',$SutLauncher,
    '--proxy',$Proxy,
    '--replay-timeout',("{0}" -f $ReplayTimeoutSeconds)
)

Write-Host "Preparing verified sequence-local evidence..." -ForegroundColor Cyan
$prepareExit = Invoke-NativeLogged $PythonCommand $prepareArgs $prepareLog
if ($prepareExit -ne 0) { throw "Sequence preparation failed with exit code $prepareExit. See $prepareLog" }

$semanticOut = Join-Path $OutputDir 'semantic_evaluation_sequence_local.json'
$evaluateLog = Join-Path $OutputDir 'evaluate_sequences.log'
$evaluateArgs = @(
    $Evaluator,
    '--sequence-dir',$OutputDir,
    '--campaign-trace',$CampaignTrace,
    '--tool',$Tool,
    '--output',$semanticOut
)

Write-Host "Evaluating official sequences and diagnostic campaign trace..." -ForegroundColor Cyan
$evaluateExit = Invoke-NativeLogged $PythonCommand $evaluateArgs $evaluateLog
if ($evaluateExit -ne 0) { throw "Sequence evaluator failed with exit code $evaluateExit. See $evaluateLog" }

$sem = Get-Content $semanticOut -Raw | ConvertFrom-Json
$manifest = Get-Content (Join-Path $OutputDir 'sequence_manifest.json') -Raw | ConvertFrom-Json
$classes = @($sem.sequence_confirmed_semantic_classes | ForEach-Object { [string]$_ })
$campaignClasses = @($sem.campaign_reachability_classes | ForEach-Object { [string]$_ })

$oldMetaPath = Join-Path $RunDir 'run_metadata.json'
$oldMeta = $null
if (Test-Path $oldMetaPath) { $oldMeta = Get-Content $oldMetaPath -Raw | ConvertFrom-Json }

$meta = [ordered]@{
    schema_version = 1
    artifact_version = 'v38'
    experiment = 'library_sequence_local_re_evaluation'
    system = 'library'
    tool = $Tool
    original_run_dir = $RunDir
    original_metadata_file = $(if ($oldMeta) { 'run_metadata.json' } else { $null })
    original_openapi_sha256 = $(if ($oldMeta) { $oldMeta.openapi_sha256 } else { $null })
    original_sut_sha256 = $(if ($oldMeta) { $oldMeta.sut_sha256 } else { $null })
    original_seed = $(if ($oldMeta) { $oldMeta.seed } else { $null })
    campaign_trace_sha256 = (Get-FileHash $CampaignTrace -Algorithm SHA256).Hash.ToLowerInvariant()
    sequence_preparer_sha256 = (Get-FileHash $Preparer -Algorithm SHA256).Hash.ToLowerInvariant()
    sequence_evaluator_sha256 = (Get-FileHash $Evaluator -Algorithm SHA256).Hash.ToLowerInvariant()
    oracle = 'external HTTP evidence; one tool-generated test per fresh SUT; no cross-test stitching'
    official_status = [string]$sem.official_status
    official_evaluation_complete = [bool]$sem.official_evaluation_complete
    confirmed_classes = $classes
    semantic_class_count = [int]$sem.sequence_confirmed_semantic_class_count
    semantic_score = $sem.sequence_confirmed_score
    semantic_lower_bound = [string]$sem.sequence_confirmed_lower_bound
    campaign_global_diagnostic_classes = $campaignClasses
    campaign_global_diagnostic_score = $(if ($sem.campaign_global_diagnostic) { $sem.campaign_global_diagnostic.semantic_score } else { $null })
    campaign_global_used_for_official_score = $false
    native_tool_faults_used_for_official_score = $false
    boundary_source = $manifest.boundary_source
    boundary_verified = [bool]$manifest.boundary_verified
    candidate_sequence_count = [int]$manifest.candidate_sequence_count
    replayed_sequence_count = [int]$manifest.replayed_sequence_count
    replay_error_count = [int]$manifest.replay_error_count
    semantic_evaluation_file = 'semantic_evaluation_sequence_local.json'
    sequence_manifest_file = 'sequence_manifest.json'
    note = 'Derived audit only. The preserved tool run and its original metadata are unchanged.'
}

$metadataOut = Join-Path $OutputDir 'run_metadata_sequence_local.json'
$meta | ConvertTo-Json -Depth 20 | Set-Content $metadataOut -Encoding UTF8

Write-Host ""
if ($sem.official_evaluation_complete) {
    Write-Host ("OFFICIAL SEQUENCE-LOCAL RESULT: {0} [{1}]" -f $sem.sequence_confirmed_score, ([string]::Join(',', $classes))) -ForegroundColor Green
} else {
    Write-Host ("OFFICIAL RESULT: UNDETERMINED; confirmed lower bound {0} [{1}]" -f $sem.sequence_confirmed_lower_bound, ([string]::Join(',', $classes))) -ForegroundColor Yellow
}
Write-Host ("Campaign-global diagnostic: {0} [{1}]" -f $meta.campaign_global_diagnostic_score, ([string]::Join(',', $campaignClasses)))
Write-Host "Wrote: $semanticOut"
Write-Host "Wrote: $metadataOut"
Write-Host "Preserved original run: $RunDir"
