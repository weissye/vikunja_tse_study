param(
 [string]$StudyRoot='C:\work\temp\vikunja_tse_study',
 [string]$ProvengoJar=(Join-Path $StudyRoot 'Provengo-2026-01-10.uber.jar'),
 [string]$RunConfig=(Join-Path $PSScriptRoot 'run-config.local.json'),
 [string]$ResearchConfig=(Join-Path $PSScriptRoot 'input-source\research-config-v100.json'),
 [int]$SampleSeed=1,
 [switch]$RunLive
)
$ErrorActionPreference='Stop'
Write-Host 'VIKUNJA_NATIVE_TWO_SESSIONS v100'
Get-Command python,java,docker -ErrorAction Stop | Out-Null
$argsList=@((Join-Path $PSScriptRoot 'run_recovery_v100.py'),'--study-root',$StudyRoot,'--jar',$ProvengoJar,'--run-config',$RunConfig,'--research-config',$ResearchConfig,'--sample-seed',$SampleSeed)
if($RunLive){$argsList+='--run-live'}
& python @argsList
if($LASTEXITCODE -ne 0){throw 'v100 acceptance incomplete; preserve the review ZIP and private snapshots.'}
