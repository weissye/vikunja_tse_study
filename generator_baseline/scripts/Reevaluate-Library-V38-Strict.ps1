[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$RunDir,

    [string]$PythonCommand = 'python',

    [string]$Evaluator = ''
)

$ErrorActionPreference = 'Stop'

$RunDir = (Resolve-Path $RunDir).Path
$Trace = Join-Path $RunDir 'http_trace.jsonl'
$OldMeta = Join-Path $RunDir 'run_metadata.json'

if (-not (Test-Path $Trace)) {
    throw "Missing preserved trace: $Trace"
}

if ([string]::IsNullOrWhiteSpace($Evaluator)) {
    $projectCandidate = Join-Path (Split-Path -Parent $PSScriptRoot) 'scripts\evaluate_library_trace_strict.py'
    $sameDirCandidate = Join-Path $PSScriptRoot 'evaluate_library_trace_strict.py'

    if (Test-Path $projectCandidate) {
        $Evaluator = $projectCandidate
    } elseif (Test-Path $sameDirCandidate) {
        $Evaluator = $sameDirCandidate
    } else {
        throw "Strict evaluator not found. Pass -Evaluator explicitly."
    }
}

$Evaluator = (Resolve-Path $Evaluator).Path
$StrictOut = Join-Path $RunDir 'semantic_evaluation_strict.json'
$StrictMeta = Join-Path $RunDir 'run_metadata_strict.json'

Write-Host "RunDir    : $RunDir" -ForegroundColor Cyan
Write-Host "Trace     : $Trace"
Write-Host "Evaluator : $Evaluator"

$raw = & $PythonCommand $Evaluator $Trace
if ($LASTEXITCODE -ne 0) {
    throw "Strict evaluator failed with exit code $LASTEXITCODE"
}

$rawText = ($raw -join [Environment]::NewLine)
$rawText | Set-Content $StrictOut -Encoding UTF8
$sem = $rawText | ConvertFrom-Json

$classes = @($sem.confirmed_classes)

if (Test-Path $OldMeta) {
    $meta = Get-Content $OldMeta -Raw | ConvertFrom-Json
} else {
    $meta = [pscustomobject]@{
        schema_version = 2
        artifact_version = 'v38'
        experiment = 'library_frozen_baseline_rerun'
        system = 'library'
        tool = 'UNKNOWN'
        input_mode = 'openapi_only'
    }
}

# Build a new ordered object instead of mutating the preserved historical metadata.
$ordered = [ordered]@{}
$meta.PSObject.Properties | ForEach-Object {
    $ordered[$_.Name] = $_.Value
}

$ordered['strict_re_evaluation'] = $true
$ordered['strict_evaluator_sha256'] = (Get-FileHash $Evaluator -Algorithm SHA256).Hash.ToLowerInvariant()
$ordered['oracle'] = 'strict preserved external HTTP trace; active-state reconstruction with hold/loan deletion handling'
$ordered['confirmed_classes'] = $classes
$ordered['semantic_class_count'] = $classes.Count
$ordered['semantic_score'] = ("{0}/2" -f $classes.Count)
$ordered['event_count'] = [int]$sem.event_count
$ordered['hold_ownership_confirmed'] = [bool]$sem.hold_ownership_confirmed
$ordered['loan_limit_confirmed'] = [bool]$sem.loan_limit_confirmed
$ordered['strict_witness_file'] = (Split-Path -Leaf $StrictOut)
$ordered['note_strict'] = 'Post-hoc correction/audit of the preserved V38 trace only. The tool run, OpenAPI, SUT, seed, and request campaign are unchanged.'

$ordered | ConvertTo-Json -Depth 20 | Set-Content $StrictMeta -Encoding UTF8

Write-Host ""
Write-Host "STRICT RESULT: $($classes.Count)/2 [$([string]::Join(',', $classes))]" -ForegroundColor Yellow
Write-Host "Wrote: $StrictOut" -ForegroundColor Green
Write-Host "Wrote: $StrictMeta" -ForegroundColor Green

if ($sem.hold_ownership_witness) {
    Write-Host ("HOLD witness: hold event #{0}, violating loan event #{1}" -f `
        $sem.hold_ownership_witness.hold_create.event_index, `
        $sem.hold_ownership_witness.violating_loan.event_index)
}
if ($sem.loan_limit_witness) {
    Write-Host ("LIMIT witness: user {0}, books [{1}], third-loan event #{2}" -f `
        $sem.loan_limit_witness.user, `
        ([string]::Join(',', @($sem.loan_limit_witness.distinct_active_books))), `
        $sem.loan_limit_witness.third_active_loan.event_index)
}
