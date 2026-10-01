[CmdletBinding()]
param(
    [ValidateRange(1,3)][int]$Runs = 2,
    [int]$BaseSeed = 20261830,
    [ValidateRange(4,16)][int]$PrefixRounds = 10,
    [ValidateRange(1,16)][int]$PrefixBeforeConcurrency = 8,
    [ValidateRange(2,6)][int]$InstancesPerEntity = 3,
    [ValidateRange(1,12)][int]$MaxFieldPairs = 6,
    [ValidateSet(2,3)][int]$MaxConcurrencyWidth = 3,
    [switch]$PreflightOnly
)
$ErrorActionPreference = 'Stop'
if ($PrefixBeforeConcurrency -gt $PrefixRounds) { throw 'PrefixBeforeConcurrency must not exceed PrefixRounds' }
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$stage = Join-Path $PSScriptRoot 'Invoke-Mealie-Stage4.ps1'
$audit = Join-Path $PSScriptRoot 'coverage_matrix.py'
if (-not (Test-Path -LiteralPath $stage) -or -not (Test-Path -LiteralPath $audit)) {
    throw 'Existing Mealie Stage4 runner or coverage audit is missing'
}
$stageParams = @{
    Runs = $Runs; BaseSeed = $BaseSeed; MaxLength = 35000
    InstancesPerEntity = $InstancesPerEntity; InstancesPerAction = 1
    MaxFieldPairs = $MaxFieldPairs; MaxConcurrencyWidth = $MaxConcurrencyWidth
    StoryProfile = 'long-interleaving'; PrefixRounds = $PrefixRounds
    PrefixBeforeConcurrency = $PrefixBeforeConcurrency; FreezeEvidence = $true
    CombinedCampaign = $true
}
if ($PreflightOnly) { $stageParams.PreflightOnly = $true }
else { & (Join-Path $PSScriptRoot 'Prepare-Mealie-Stage4.ps1') }
$stageOutput = @(& $stage @stageParams)
$stageOutput | ForEach-Object { Write-Host $_ }
$runMarkers = @($stageOutput | Where-Object { $_ -match '^MEALIE_STAGE4_RUN\s+(.+)$' })
if ($runMarkers.Count -ne 1) { throw 'Could not locate unique Mealie Stage4 run directory in output' }
$runDir = $runMarkers[0] -replace '^MEALIE_STAGE4_RUN\s+', ''
$report = Join-Path $runDir 'coverage-matrix.json'
& python $audit --input $runDir --output $report
if ($LASTEXITCODE -ne 0) { throw 'Coverage audit failed' }
$data = Get-Content -LiteralPath $report -Raw | ConvertFrom-Json
$uncovered = @()
foreach ($seed in $data.seeds.PSObject.Properties) {
    foreach ($family in $seed.Value.PSObject.Properties | Where-Object { $_.Name -in @('same_record_same_field','same_record_disjoint_fields','cross_entity','noop') }) {
        if ($family.Value.prefix_and_evaluated -lt 1) { $uncovered += "$($seed.Name):$($family.Name)" }
    }
}
Write-Host "MEALIE_COMBINED_COVERAGE_REPORT $report"
if ($uncovered.Count) {
    Write-Host "MEALIE_COMBINED_SCOPE_INCOMPLETE missing=$($uncovered -join ',')"
} else {
    Write-Host 'MEALIE_COMBINED_SCOPE_VERIFIED'
}
