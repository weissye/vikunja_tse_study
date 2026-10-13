param(
 [string]$StudyRoot='C:\work\temp\vikunja_tse_study',
 [string]$ProvengoJar=(Join-Path $StudyRoot 'Provengo-2026-01-10.uber.jar'),
 [string]$CampaignConfig=(Join-Path $PSScriptRoot 'campaign-config-v101.json'),
 [switch]$RunLive
)
$ErrorActionPreference='Stop'
Write-Host 'VIKUNJA_FROZEN_BASELINE_SAMPLES v101'
Get-Command python,java,docker -ErrorAction Stop | Out-Null
$argsList=@((Join-Path $PSScriptRoot 'run_campaign_v101.py'),'--study-root',$StudyRoot,'--jar',$ProvengoJar,'--campaign-config',$CampaignConfig)
if($RunLive){$argsList+='--run-live'}
& python @argsList
if($LASTEXITCODE -ne 0){throw 'Campaign incomplete; preserve the review ZIP and child run evidence.'}
