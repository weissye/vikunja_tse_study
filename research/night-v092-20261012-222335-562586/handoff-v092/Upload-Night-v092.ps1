param(
 [string]$StudyRoot='D:\Yeshayahu\Temp\vikunja_tse_study',
 [string]$WorkBase='D:\Yeshayahu\Temp',
 [Parameter(Mandatory=$true)][string]$PackageRoot
)
$ErrorActionPreference='Stop'
Write-Host 'VIKUNJA_PRE_NIGHT_MAIN_UPLOAD v092'
Get-Command python,git -ErrorAction Stop | Out-Null
& python (Join-Path $PSScriptRoot 'upload_night_v092.py') `
 --study-root $StudyRoot --work-base $WorkBase `
 --downloads (Join-Path $env:USERPROFILE 'Downloads') --package-root $PackageRoot
if($LASTEXITCODE -ne 0){throw 'Upload incomplete; night run has not been authorized by upload verification. Preserve the workspace.'}
