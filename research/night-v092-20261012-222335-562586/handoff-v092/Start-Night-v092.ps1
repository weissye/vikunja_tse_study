param(
 [string]$StudyRoot='D:\Yeshayahu\Temp\vikunja_tse_study',
 [string]$WorkBase='D:\Yeshayahu\Temp'
)
$ErrorActionPreference='Stop'
Write-Host 'VIKUNJA_UPLOAD_THEN_OVERNIGHT v092 - model v091'
$zip=Join-Path "$env:USERPROFILE\Downloads" 'Vikunja_Overnight_v091.zip'
$expected='1abfbe782b6bb144eff21dfa089521b2582aaf4b1981a76c220038d82bfe1d21'
if((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash -ne $expected){throw 'Night model package SHA256 mismatch.'}
$package=Join-Path $WorkBase ('vikunja-night-v091-'+(Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
Expand-Archive -LiteralPath $zip -DestinationPath $package
Get-ChildItem -LiteralPath $package -Recurse -File | Unblock-File
$launcher=Join-Path $package 'Run-Model-v091.ps1'
# Static generation first; include the exact generated model in the Git snapshot.
& $launcher -StudyRoot $StudyRoot
& (Join-Path $PSScriptRoot 'Upload-Night-v092.ps1') `
 -StudyRoot $StudyRoot -WorkBase $WorkBase -PackageRoot $package
if($LASTEXITCODE -ne 0){throw 'Git upload failed; overnight run not started.'}
Write-Host 'V092_MAIN_VERIFIED_STARTING_OVERNIGHT_MODEL_V091'
& $launcher -StudyRoot $StudyRoot -RunLive
