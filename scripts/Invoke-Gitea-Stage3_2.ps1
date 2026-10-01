[CmdletBinding()]
param(
    [string]$Root = "",
    [string]$Target = "http://127.0.0.1:3477",
    [int]$Seed = 20260926,
    [int]$MaxLength = 120000,
    [int]$QuiescenceMs = 100,
    [int]$MaxFieldPairs = 6
)

$ErrorActionPreference = "Stop"
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) {
    $Root = (Resolve-Path (Join-Path $scriptDir "..")).Path
} else {
    $Root = (Resolve-Path $Root).Path
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$generated = Join-Path $Root "generated\gitea-stage3_2-$stamp"

& (Join-Path $scriptDir "Invoke-Gitea-Stage2-Preflight.ps1") `
    -Output $generated -Seed $Seed -MaxFieldPairs $MaxFieldPairs
if ($LASTEXITCODE -ne 0) { throw "Stage 3.2 regeneration/preflight failed with exit code $LASTEXITCODE." }

& (Join-Path $scriptDir "Invoke-Gitea-Stage3.ps1") `
    -Root $Root -Generated $generated -Target $Target -Seed $Seed `
    -MaxLength $MaxLength -QuiescenceMs $QuiescenceMs -RequireConcurrency
if ($LASTEXITCODE -ne 0) { throw "Stage 3.2 live acceptance failed with exit code $LASTEXITCODE." }

Write-Host ""
Write-Host "GITEA_STAGE3_2_COMPLETE"
Write-Host "Generated input: $generated"
Write-Host "Taxonomy, reset isolation, concurrency evidence, and immutable ZIP policy accepted."
