param([string]$StudyRoot='C:\work\temp\vikunja_tse_study')
$ErrorActionPreference='Stop'
Write-Host 'VIKUNJA_GENERIC_INTERACTIONS_STATIC v102'
Get-Command python -ErrorAction Stop | Out-Null
& python (Join-Path $PSScriptRoot 'Verify-v102.py')
if($LASTEXITCODE -ne 0){throw 'Package integrity failed.'}
$destination=Join-Path $StudyRoot ('generated\interactions-v102-'+(Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
& python (Join-Path $PSScriptRoot 'Build-Model-v102.py') --output $destination
if($LASTEXITCODE -ne 0){throw 'Static generation failed.'}
Write-Host 'V102_STATIC_INTERACTION_GENERATION_COMPLETE'
Write-Host "One project: $(Join-Path $destination 'project')"
Write-Host "All JS: $(Join-Path $destination 'project\spec\js')"
Write-Host "Catalog: $(Join-Path $destination 'project\interaction-catalog.json')"
Write-Host 'STATIC ONLY: native/live interaction execution is blocked pending Context/recovery acceptance.'
