param(
    [string]$StudyRoot = 'C:\work\temp\vikunja_tse_study',
    [switch]$Preview
)

$ErrorActionPreference = 'Stop'
$removed = 0
$bytes = [long]0
$candidates = New-Object System.Collections.Generic.List[object]

function Test-VerifiedCleanup($report) {
    if (-not $report -or -not $report.cleanup) { return $false }
    $states = @($report.cleanup.PSObject.Properties.Value)
    return ($states.Count -eq 16 -and
        @($states | Where-Object { [int]$_ -ne 204 }).Count -eq 0)
}

$roots = @(
    (Join-Path $StudyRoot 'keycloak-150-to-15\runs\keycloak-preflight')
)
foreach ($directory in @(Get-ChildItem -LiteralPath $StudyRoot -Directory -Filter 'keycloak-pilot-v*' -ErrorAction SilentlyContinue)) {
    $roots += (Join-Path $directory.FullName 'runs')
}

foreach ($root in $roots) {
    if (-not (Test-Path -LiteralPath $root -PathType Container)) { continue }
    foreach ($folder in @(Get-ChildItem -LiteralPath $root -Directory -Recurse -ErrorAction SilentlyContinue)) {
        $scenario = Join-Path $folder.FullName 'scenario.json'
        if (-not (Test-Path -LiteralPath $scenario -PathType Leaf)) { continue }

        $reports = @()
        $preflight = Join-Path $folder.FullName 'preflight-report.json'
        if (Test-Path -LiteralPath $preflight -PathType Leaf) { $reports += $preflight }
        $reports += @(Get-ChildItem -LiteralPath $folder.FullName -File -Filter 'pilot-summary-v*.json' -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty FullName)
        $verified = $false
        foreach ($reportFile in $reports) {
            try {
                $report = Get-Content -LiteralPath $reportFile -Raw | ConvertFrom-Json
                if (Test-VerifiedCleanup $report) { $verified = $true; break }
            } catch {
                Write-Warning "Cannot read cleanup report: $reportFile"
            }
        }
        if (-not $verified) { continue }
        $file = Get-Item -LiteralPath $scenario
        $candidates.Add([pscustomobject]@{ Path = $file.FullName; Bytes = [long]$file.Length })
    }
}

foreach ($candidate in $candidates) {
    $sizeGB = [math]::Round($candidate.Bytes / 1GB, 3)
    if ($Preview) {
        Write-Host "WOULD_REMOVE $sizeGB GB $($candidate.Path)"
    } else {
        Remove-Item -LiteralPath $candidate.Path -Force
        $removed++
        $bytes += $candidate.Bytes
        Write-Host "REMOVED $sizeGB GB $($candidate.Path)"
    }
}

if ($Preview) {
    $possible = [long](($candidates | Measure-Object -Property Bytes -Sum).Sum)
    Write-Host ("PREVIEW: {0} files, {1:N3} GB available to reclaim" -f
        $candidates.Count, ($possible / 1GB))
} else {
    Write-Host ("DONE: {0} files removed, {1:N3} GB reclaimed" -f
        $removed, ($bytes / 1GB))
}

$drive = Get-PSDrive -Name ([System.IO.Path]::GetPathRoot($StudyRoot).Substring(0, 1)) -ErrorAction SilentlyContinue
if ($drive) { Write-Host ("FREE_SPACE: {0:N3} GB" -f ($drive.Free / 1GB)) }
