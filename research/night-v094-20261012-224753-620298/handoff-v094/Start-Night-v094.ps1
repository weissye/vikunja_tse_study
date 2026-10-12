param(
 [string]$StudyRoot='D:\Yeshayahu\Temp\vikunja_tse_study',
 [string]$WorkBase='D:\Yeshayahu\Temp'
)
$ErrorActionPreference='Stop'
Write-Host 'VIKUNJA_UPLOAD_THEN_OVERNIGHT v094 - model v093'
$zip=Join-Path "$env:USERPROFILE\Downloads" 'Vikunja_Overnight_v093.zip'
$expected='fab18100d7a6857a62e4c62c2247d8eb76808ad972b1482788751b6cb4ac45f5'
if((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash -ne $expected){throw 'Night model package SHA256 mismatch.'}
$package=Join-Path $WorkBase ('vikunja-night-v093-'+(Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
Expand-Archive -LiteralPath $zip -DestinationPath $package
Get-ChildItem -LiteralPath $package -Recurse -File | Unblock-File
$launcher=Join-Path $package 'Run-Model-v093.ps1'
# Static generation first; include the exact generated model in the Git snapshot.
& $launcher -StudyRoot $StudyRoot
& (Join-Path $PSScriptRoot 'Upload-Night-v094.ps1') `
 -StudyRoot $StudyRoot -WorkBase $WorkBase -PackageRoot $package
if($LASTEXITCODE -ne 0){throw 'Git upload failed; overnight run not started.'}
Write-Host 'V094_MAIN_VERIFIED_STARTING_OVERNIGHT_MODEL_V093'
& $launcher -StudyRoot $StudyRoot -RunLive
