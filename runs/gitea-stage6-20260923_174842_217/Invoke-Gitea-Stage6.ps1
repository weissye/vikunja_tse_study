[CmdletBinding()]
param(
    [ValidateRange(1,30)][int]$Trials = 3,
    [ValidateRange(1,100)][int]$PrefixLength = 12,
    [string]$BaseUrl = 'http://127.0.0.1:3477/api/v1',
    [string]$OutputRoot = '.\runs',
    [string]$Container = 'gitea-stage1-server',
    [switch]$FreezeEvidence
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($env:GITEA_API_TOKEN)) {
    throw 'GITEA_API_TOKEN is missing. Set the Stage 1 research-user token in this PowerShell session.'
}
$driver = Join-Path $PSScriptRoot 'gitea_stage6.py'
if (-not (Test-Path -LiteralPath $driver -PathType Leaf)) { throw "Missing Stage 6 driver: $driver" }
$python = (Get-Command python -ErrorAction Stop).Source
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss_fff'
$runDir = Join-Path $OutputRoot "gitea-stage6-$stamp"
$runDir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($runDir)

$identity = Invoke-RestMethod -Uri "$($BaseUrl.TrimEnd('/'))/user" `
    -Headers @{ Authorization = "token $env:GITEA_API_TOKEN" } -TimeoutSec 15
if ([string]::IsNullOrWhiteSpace([string]$identity.login)) { throw 'Research token identity could not be verified.' }

& $python $driver --base $BaseUrl --trials $Trials --prefix $PrefixLength --out $runDir
if ($LASTEXITCODE -ne 0) { throw "Stage 6 driver failed with exit code $LASTEXITCODE" }

if ($FreezeEvidence) {
    # Docker writes normal container log lines to stderr. In Windows PowerShell 5.1,
    # piping that native stderr through 2>&1 under Stop becomes NativeCommandError.
    $stdoutLog = Join-Path $runDir 'gitea-container.stdout.log'
    $stderrLog = Join-Path $runDir 'gitea-container.stderr.log'
    try {
        $dockerRun = Start-Process -FilePath 'docker.exe' `
            -ArgumentList @('logs', '--timestamps', $Container) `
            -Wait -PassThru -NoNewWindow `
            -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog
        if ($dockerRun.ExitCode -ne 0) {
            "docker logs exited $($dockerRun.ExitCode)" |
                Set-Content -LiteralPath (Join-Path $runDir 'log-collection-error.txt') -Encoding utf8
        }
    } catch {
        "docker logs could not be collected: $($_.Exception.Message)" |
            Set-Content -LiteralPath (Join-Path $runDir 'log-collection-error.txt') -Encoding utf8
    }
    Copy-Item -LiteralPath $PSCommandPath -Destination (Join-Path $runDir 'Invoke-Gitea-Stage6.ps1')
    Copy-Item -LiteralPath $driver -Destination (Join-Path $runDir 'gitea_stage6.py')
    Get-ChildItem -LiteralPath $runDir -File | Sort-Object Name |
        Get-FileHash -Algorithm SHA256 |
        Select-Object Path, Hash |
        Export-Csv -LiteralPath (Join-Path $runDir 'checksums.csv') -NoTypeInformation -Encoding utf8
    $root = Split-Path -Parent $PSScriptRoot
    $evidenceDir = Join-Path $root 'evidence'
    New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null
    $zip = Join-Path $evidenceDir ((Split-Path $runDir -Leaf) + '-review.zip')
    if (Test-Path -LiteralPath $zip) { throw "Evidence archive already exists: $zip" }
    Compress-Archive -Path (Join-Path $runDir '*') -DestinationPath $zip
    Write-Host "STAGE6_EVIDENCE_SHA256 $((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant())"
    Write-Host "STAGE6_EVIDENCE_ZIP $zip"
}
Write-Host "STAGE6_SUMMARY $(Join-Path $runDir 'summary.json')"
