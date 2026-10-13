param(
 [string]$StudyRoot='D:\Yeshayahu\Temp\vikunja_tse_study',
 [string]$ProvengoJar=(Join-Path $StudyRoot 'Provengo-2026-01-10.uber.jar'),
 [string]$RunConfig=(Join-Path $PSScriptRoot 'run-config.local.json'),
 [switch]$RunLive
)
$ErrorActionPreference='Stop'
Write-Host 'VIKUNJA_NATIVE_TWO_SESSIONS v093'
Get-Command python,java,docker -ErrorAction Stop | Out-Null
$argsList=@((Join-Path $PSScriptRoot 'run_recovery_v093.py'),'--study-root',$StudyRoot,'--jar',$ProvengoJar,'--run-config',$RunConfig)
if($RunLive){$argsList+='--run-live'}
& python @argsList
if($LASTEXITCODE -ne 0){throw 'v093 acceptance incomplete; preserve the review ZIP and private snapshots.'}
