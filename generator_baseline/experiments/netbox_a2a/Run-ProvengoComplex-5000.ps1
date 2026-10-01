[CmdletBinding()]
param(
  [string]$ProjectRoot = ""
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($ProjectRoot)) { $ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path }
$runner = Join-Path $ProjectRoot "experiments\netbox_a2a\Invoke-NetBox-A2A.ps1"
$resultsRoot = Join-Path $ProjectRoot "results\netbox_a2a_5000"

& $runner `
  -Mode ProvengoComplex `
  -Seed 1 `
  -MaxLength 5000 `
  -InstancesPerEntity 5 `
  -InstancesPerAction 7 `
  -ResultsRoot $resultsRoot

$run = Get-ChildItem $resultsRoot -Directory |
  Where-Object { $_.Name -like "provengo_complex_*" } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
if (-not $run) { throw "No ProvengoComplex result directory found." }

$sem = Get-Content (Join-Path $run.FullName "semantic_evaluation.json") -Raw | ConvertFrom-Json
$meta = Get-Content (Join-Path $run.FullName "run_metadata.json") -Raw | ConvertFrom-Json
$result = [ordered]@{
  run_dir = $run.FullName
  seed = $meta.seed
  max_length = $meta.max_length
  confirmed_primary_classes = $sem.confirmed_primary_classes
  missing_primary_classes = @($sem.primary_openapi_reachable_classes | Where-Object { $_ -notin $sem.confirmed_primary_classes })
  primary_class_count = $sem.primary_class_count
  all_primary_confirmed = $sem.all_primary_confirmed
  event_count = $sem.event_count
  witness_counts = [ordered]@{
    A_LOGIC = @($sem.witnesses.A_LOGIC).Count
    B_LIFECYCLE = @($sem.witnesses.B_LIFECYCLE).Count
    C_UNIQUENESS = @($sem.witnesses.C_UNIQUENESS).Count
    D_INTEGRITY = @($sem.witnesses.D_INTEGRITY).Count
    E_REFERENTIAL_INTEGRITY = @($sem.witnesses.E_REFERENTIAL_INTEGRITY).Count
  }
}
$out = Join-Path $resultsRoot "NETBOX_COMPLEX_5000_RESULT.json"
$result | ConvertTo-Json -Depth 10 | Set-Content $out -Encoding UTF8
$result | Format-List
Write-Host "Summary JSON: $out"
