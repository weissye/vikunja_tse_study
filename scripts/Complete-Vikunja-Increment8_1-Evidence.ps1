[CmdletBinding()]
param(
    [string]$RunDirectory
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$runsRoot = Join-Path $root "runs"
$evidenceRoot = Join-Path $root "evidence"

if ([string]::IsNullOrWhiteSpace($RunDirectory)) {
    $latest = Get-ChildItem $runsRoot -Directory -Filter "increment8_1-direct-confirmation-*" |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    if ($null -eq $latest) {
        throw "No Increment 8.1 run directory was found under $runsRoot"
    }
    $runDir = $latest.FullName
}
else {
    $runDir = (Resolve-Path $RunDirectory).Path
}

$required = @(
    "direct-witnesses.jsonl",
    "increment8_1-evaluation.json",
    "run-metadata.json",
    "invocation-summary.json"
)
foreach ($name in $required) {
    $path = Join-Path $runDir $name
    if (-not (Test-Path $path -PathType Leaf)) {
        throw "The selected run is incomplete; missing $path"
    }
}

$evaluationPath = Join-Path $runDir "increment8_1-evaluation.json"
$evaluation = Get-Content $evaluationPath -Raw | ConvertFrom-Json
if ($evaluation.trial_count -ne 20) {
    Write-Warning "The selected run contains $($evaluation.trial_count) trials rather than 20."
}

$hashRows = Get-ChildItem $runDir -File -Recurse |
    Where-Object { $_.Name -ne "SHA256SUMS.csv" } |
    Sort-Object FullName |
    ForEach-Object {
        if (-not $_.FullName.StartsWith($runDir, [StringComparison]::OrdinalIgnoreCase)) {
            throw "Evidence file is outside the run directory: $($_.FullName)"
        }
        $relativePath = $_.FullName.Substring($runDir.Length).TrimStart([char[]]"\/")
        [pscustomobject]@{
            path = $relativePath.Replace('\', '/')
            size_bytes = $_.Length
            sha256 = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        }
    }

$hashPath = Join-Path $runDir "SHA256SUMS.csv"
$hashRows | Export-Csv $hashPath -NoTypeInformation -Encoding UTF8

New-Item -ItemType Directory -Force $evidenceRoot | Out-Null
$zip = Join-Path $evidenceRoot "$((Get-Item $runDir).Name)-review.zip"
Compress-Archive -Path (Join-Path $runDir "*") -DestinationPath $zip -Force
$zipHash = Get-FileHash $zip -Algorithm SHA256

Write-Host ""
Write-Host "Recovered completed run: $runDir"
Write-Host "Run status:             $($evaluation.run_status)"
Write-Host "PASS:                   $($evaluation.counts.PASS)"
Write-Host "LOST_UPDATE:            $($evaluation.counts.LOST_UPDATE)"
Write-Host "SERVER_FAILURE:         $($evaluation.counts.SERVER_FAILURE)"
Write-Host "INCONCLUSIVE:           $($evaluation.counts.INCONCLUSIVE)"
Write-Host "Evidence ZIP:           $zip"
Write-Host "ZIP SHA256:             $($zipHash.Hash.ToLowerInvariant())"

exit 0
