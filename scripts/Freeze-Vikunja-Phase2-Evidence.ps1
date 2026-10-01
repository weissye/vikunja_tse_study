param(
    [Parameter(Mandatory=$true)][string[]]$RunDirectories,
    [string]$Root = ""
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path }
if ($RunDirectories.Count -ne 4) { throw "Provide the pilot run and the three campaign runs (four directories total)." }

$resolved = foreach ($entry in $RunDirectories) {
    $path = if ([IO.Path]::IsPathRooted($entry)) { $entry } else { Join-Path $Root $entry }
    $directory = Get-Item $path
    $evaluation = Get-Content (Join-Path $directory.FullName "phase2-evaluation.json") -Raw | ConvertFrom-Json
    if (-not $evaluation.phase2_passed -or $evaluation.passed_count -ne 15) {
        throw "Run $($directory.FullName) is not a 15/15 PASS and cannot be frozen."
    }
    $directory
}
$seeds = foreach ($directory in $resolved) {
    (Get-Content (Join-Path $directory.FullName "run-metadata.json") -Raw | ConvertFrom-Json).seed
}
if (($seeds | Select-Object -Unique).Count -ne 4) { throw "The four evidence runs must use distinct seeds." }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$stage = Join-Path $Root "runs\phase2-evidence-$stamp"
New-Item -ItemType Directory -Force $stage | Out-Null
foreach ($directory in $resolved) { Copy-Item $directory.FullName $stage -Recurse }
Copy-Item (Join-Path $Root "phase2\generated-validated-lifecycle") $stage -Recurse
Copy-Item (Join-Path $Root "scripts\evaluate_vikunja_validated_lifecycle.py") $stage
Copy-Item (Join-Path $Root "scripts\probe_vikunja_deletions.py") $stage

$manifest = foreach ($file in Get-ChildItem $stage -Recurse -File | Where-Object Name -ne "SHA256SUMS.csv") {
    [pscustomobject]@{
        Path = $file.FullName.Substring($stage.Length + 1).Replace("\", "/")
        SHA256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        SizeBytes = $file.Length
    }
}
$manifest | Sort-Object Path | Export-Csv (Join-Path $stage "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8
$zip = "$stage.zip"
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip
Write-Host "VIKUNJA_PHASE2_EVIDENCE_FROZEN"
Write-Host "Evidence directory: $stage"
Write-Host "Evidence archive: $zip"
