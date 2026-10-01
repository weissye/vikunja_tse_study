[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('Garage','Pharmacy')]
    [string]$System,

    [Parameter(Mandatory=$true)]
    [ValidateSet('RESTler','EvoMaster')]
    [string]$Tool,

    [Parameter(Mandatory=$true)]
    [string]$RunDir,

    [string]$PythonCommand = 'python',
    [string]$SutPath = '',
    [string]$CampaignTrace = '',
    [string]$OutputDir = '',
    [int]$ReplayTimeoutSeconds = 120,
    [switch]$AllowSutHashMismatch,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$RunDir = (Resolve-Path $RunDir).Path
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$systemKey = $System.ToLowerInvariant()
$toolKey = $Tool.ToLowerInvariant()

$Common = Join-Path $ProjectRoot 'scripts\prepare_library_sequence_traces.py'
$Preparer = Join-Path $ProjectRoot 'scripts\prepare_garage_pharmacy_sequence_traces.py'
$Evaluator = Join-Path $ProjectRoot 'scripts\evaluate_garage_pharmacy_sequences.py'
$SutLauncher = Join-Path $ProjectRoot 'scripts\run_sequence_replay_sut.py'
$Proxy = Join-Path $ProjectRoot 'scripts\http_trace_proxy.py'

if ([string]::IsNullOrWhiteSpace($SutPath)) {
    if ($systemKey -eq 'garage') {
        $SutPath = Join-Path $ProjectRoot 'resources\development_kit\validation_only\suts\garage\garage_sut_buggy.py'
    } else {
        $SutPath = Join-Path $ProjectRoot 'resources\development_kit\validation_only\suts\pharmacy\app_buggy.py'
    }
}

foreach ($item in @($Common,$Preparer,$Evaluator,$SutLauncher,$Proxy,$SutPath)) {
    if (-not (Test-Path $item)) { throw "Missing required file: $item" }
}
$SutPath = (Resolve-Path $SutPath).Path

if ([string]::IsNullOrWhiteSpace($CampaignTrace)) {
    $CampaignTrace = Join-Path $RunDir 'http_trace.jsonl'
} elseif (-not [System.IO.Path]::IsPathRooted($CampaignTrace)) {
    $CampaignTrace = [System.IO.Path]::GetFullPath((Join-Path $RunDir $CampaignTrace))
}

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $RunDir 'sequence_local_v35_b4'
} elseif (-not [System.IO.Path]::IsPathRooted($OutputDir)) {
    $OutputDir = [System.IO.Path]::GetFullPath((Join-Path $RunDir $OutputDir))
}

$oldMetaPath = Join-Path $RunDir 'run_metadata.json'
$oldMeta = $null
if (Test-Path $oldMetaPath) {
    $oldMeta = Get-Content $oldMetaPath -Raw | ConvertFrom-Json
    $recordedSutHash = [string]$oldMeta.sut_sha256
    if ([string]::IsNullOrWhiteSpace($recordedSutHash)) { $recordedSutHash = [string]$oldMeta.original_sut_sha256 }
    if (-not [string]::IsNullOrWhiteSpace($recordedSutHash)) {
        $actualSutHash = (Get-FileHash $SutPath -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actualSutHash -ne $recordedSutHash.ToLowerInvariant()) {
            $message = "SUT hash mismatch. Recorded=$recordedSutHash Current=$actualSutHash Path=$SutPath"
            if (-not $AllowSutHashMismatch) { throw $message }
            Write-Warning $message
        }
    }
}

if ((Test-Path $OutputDir) -and -not $Force) {
    throw "Output already exists: $OutputDir. Use -Force to replace derived output only."
}

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

$tempLog = Join-Path $RunDir ("prepare_{0}_{1}_sequence_local.log" -f $systemKey,$toolKey)
$prepareArgs = @(
    $Preparer,
    '--system',$systemKey,
    '--tool',$toolKey,
    '--run-dir',$RunDir,
    '--campaign-trace',$CampaignTrace,
    '--output-dir',$OutputDir,
    '--common-engine',$Common,
    '--artifact-version','v35_b4',
    '--python',$PythonCommand,
    '--sut',$SutPath,
    '--sut-launcher',$SutLauncher,
    '--proxy',$Proxy,
    '--replay-timeout',("{0}" -f $ReplayTimeoutSeconds)
)

Write-Host "Preparing $System/$Tool sequence-local evidence..." -ForegroundColor Cyan
$prepareExit = Invoke-NativeLogged $PythonCommand $prepareArgs $tempLog
if ($prepareExit -ne 0) { throw "Sequence preparation failed: $prepareExit; see $tempLog" }
Move-Item $tempLog (Join-Path $OutputDir 'prepare_sequences.log') -Force

$semanticOut = Join-Path $OutputDir 'semantic_evaluation_sequence_local.json'
$evaluateLog = Join-Path $OutputDir 'evaluate_sequences.log'
$evaluateArgs = @(
    $Evaluator,
    '--system',$systemKey,
    '--sequence-dir',$OutputDir,
    '--tool',$Tool,
    '--artifact-version','v35_b4',
    '--output',$semanticOut
)
if (Test-Path $CampaignTrace) { $evaluateArgs += @('--campaign-trace',$CampaignTrace) }

$evaluateExit = Invoke-NativeLogged $PythonCommand $evaluateArgs $evaluateLog
if ($evaluateExit -ne 0) { throw "Sequence evaluation failed: $evaluateExit; see $evaluateLog" }

$sem = Get-Content $semanticOut -Raw | ConvertFrom-Json
$manifest = Get-Content (Join-Path $OutputDir 'sequence_manifest.json') -Raw | ConvertFrom-Json
$classes = @($sem.sequence_confirmed_semantic_classes | ForEach-Object { [string]$_ })
$campaignScore = if ($sem.campaign_global_diagnostic) { $sem.campaign_global_diagnostic.semantic_score } else { $null }

$meta = [ordered]@{
    schema_version = 1
    artifact_version = 'v35_b4'
    experiment = 'garage_pharmacy_sequence_local_re_evaluation'
    system = $systemKey
    tool = $Tool
    original_run_dir = $RunDir
    original_metadata_file = $(if ($oldMeta) { 'run_metadata.json' } else { $null })
    original_openapi_sha256 = $(if ($oldMeta) { $oldMeta.openapi_sha256 } else { $null })
    original_sut_sha256 = $(if ($oldMeta) { $oldMeta.sut_sha256 } else { $null })
    replay_sut_sha256 = (Get-FileHash $SutPath -Algorithm SHA256).Hash.ToLowerInvariant()
    replay_sut_path = $SutPath
    oracle = 'external HTTP evidence; one native tool test per fresh SUT; no cross-test stitching'
    official_status = [string]$sem.official_status
    official_evaluation_complete = [bool]$sem.official_evaluation_complete
    confirmed_classes = $classes
    semantic_class_count = [int]$sem.sequence_confirmed_semantic_class_count
    semantic_score = $sem.sequence_confirmed_score
    semantic_lower_bound = [string]$sem.sequence_confirmed_lower_bound
    campaign_global_diagnostic_score = $campaignScore
    campaign_global_used_for_official_score = $false
    native_tool_faults_used_for_official_score = $false
    boundary_source = $manifest.boundary_source
    boundary_verified = [bool]$manifest.boundary_verified
    parsed_sequence_count = $manifest.parsed_sequence_count
    candidate_sequence_count = [int]$manifest.candidate_sequence_count
    replayed_sequence_count = [int]$manifest.replayed_sequence_count
    replay_error_count = [int]$manifest.replay_error_count
}
$metadataOut = Join-Path $OutputDir 'run_metadata_sequence_local.json'
$meta | ConvertTo-Json -Depth 20 | Set-Content $metadataOut -Encoding UTF8

Write-Host ''
if ($sem.official_evaluation_complete) {
    Write-Host ("OFFICIAL RESULT: {0} [{1}]" -f $sem.sequence_confirmed_score,([string]::Join(',',$classes))) -ForegroundColor Green
} else {
    Write-Host ("OFFICIAL RESULT: UNDETERMINED; lower bound {0}" -f $sem.sequence_confirmed_lower_bound) -ForegroundColor Yellow
}
Write-Host ("Campaign-global diagnostic: {0}" -f $campaignScore)
Write-Host "Output: $OutputDir"
