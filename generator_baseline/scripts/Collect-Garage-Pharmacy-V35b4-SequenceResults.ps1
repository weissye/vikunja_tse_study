[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$GarageRestlerRun,
    [Parameter(Mandatory=$true)][string]$GarageEvoMasterRun,
    [Parameter(Mandatory=$true)][string]$PharmacyRestlerRun,
    [Parameter(Mandatory=$true)][string]$PharmacyEvoMasterRun,
    [string]$OutputZip = ''
)

$ErrorActionPreference = 'Stop'
$runs = [ordered]@{
    'garage_restler' = (Resolve-Path $GarageRestlerRun).Path
    'garage_evomaster' = (Resolve-Path $GarageEvoMasterRun).Path
    'pharmacy_restler' = (Resolve-Path $PharmacyRestlerRun).Path
    'pharmacy_evomaster' = (Resolve-Path $PharmacyEvoMasterRun).Path
}

if ([string]::IsNullOrWhiteSpace($OutputZip)) {
    $stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $OutputZip = Join-Path (Get-Location) "garage_pharmacy_v35b4_sequence_results_$stamp.zip"
} elseif (-not [System.IO.Path]::IsPathRooted($OutputZip)) {
    $OutputZip = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputZip))
}
if (Test-Path $OutputZip) { throw "Refusing to overwrite: $OutputZip" }

$stage = Join-Path ([System.IO.Path]::GetTempPath()) ("gp_v35b4_" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $stage | Out-Null
try {
    foreach ($entry in $runs.GetEnumerator()) {
        $source = Join-Path $entry.Value 'sequence_local_v35_b4'
        if (-not (Test-Path $source)) { throw "Missing sequence-local result: $source" }
        $destination = Join-Path $stage $entry.Key
        New-Item -ItemType Directory -Path $destination | Out-Null
        Copy-Item $source (Join-Path $destination 'sequence_local_v35_b4') -Recurse
        $meta = Join-Path $entry.Value 'run_metadata.json'
        if (Test-Path $meta) { Copy-Item $meta (Join-Path $destination 'run_metadata.json') }
    }
    Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $OutputZip -CompressionLevel Optimal
} finally {
    if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
}

$hash = (Get-FileHash $OutputZip -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Host "Results ZIP: $OutputZip" -ForegroundColor Green
Write-Host "SHA256    : $hash"
