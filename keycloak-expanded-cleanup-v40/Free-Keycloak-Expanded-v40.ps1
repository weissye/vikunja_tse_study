param(
    [string]$StudyRoot = 'C:\work\temp\vikunja_tse_study',
    [switch]$Preview
)
$ErrorActionPreference = 'Stop'
$root = Join-Path $StudyRoot 'keycloak-150-to-15'
$script = Join-Path $PSScriptRoot 'Clear-Keycloak-Expanded15-v40.py'
if ($Preview) { python $script --root $root --preview }
else { python $script --root $root }
if ($LASTEXITCODE -ne 0) { throw "Cleanup stopped with code $LASTEXITCODE; review SKIPPED entries" }
$drive = Get-PSDrive -Name ([System.IO.Path]::GetPathRoot($StudyRoot).Substring(0, 1))
Write-Host ("FREE_SPACE: {0:N3} GB" -f ($drive.Free / 1GB))
