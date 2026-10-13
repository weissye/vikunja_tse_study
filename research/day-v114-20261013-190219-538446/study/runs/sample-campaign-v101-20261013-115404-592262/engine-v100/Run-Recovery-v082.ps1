param(
 [string]$StudyRoot='C:\work\temp\vikunja_tse_study',
 [string]$ProvengoJar=(Join-Path $StudyRoot 'Provengo-2026-01-10.uber.jar'),
 [string]$Username='SBT-tester',
 [ValidateSet(3)][int]$Seed=3,
 [switch]$RunLive
)
$ErrorActionPreference='Stop'
Write-Host 'VIKUNJA_UNIFIED_RECOVERY v082'
Get-Command python -ErrorAction Stop | Out-Null
$argsList=@((Join-Path $PSScriptRoot 'run_recovery_v082.py'),'--study-root',$StudyRoot,'--jar',$ProvengoJar,'--username',$Username,'--seed',"$Seed")
if ($RunLive) { $argsList+='--run-live' }
& python @argsList
if ($LASTEXITCODE -ne 0) { throw 'v082 acceptance incomplete. Preserve the review ZIP and private snapshots.' }
