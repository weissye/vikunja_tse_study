param(
    [string]$RunDir = '.\runs\research-fit-mealie-stage4-20260927_092033_456',
    [switch]$FreezeEvidence
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
    $trace = Join-Path $RunDir 'seed-20261815\http-trace.jsonl'
    if (-not (Test-Path -LiteralPath $trace -PathType Leaf)) {
        throw "Original local trace missing: $trace. Do not use the redacted evidence ZIP."
    }
    $out = Join-Path $root 'evidence\mealie-mealplan-update-20261815-control.json'
    & python (Join-Path $PSScriptRoot 'diagnose_mealie_mealplan_update.py') --trace $trace --output $out
    if ($LASTEXITCODE -ne 0) { throw "Serial PUT control failed: $LASTEXITCODE" }
    if ($FreezeEvidence) {
        $archive = Join-Path $root 'evidence\mealie-mealplan-update-20261815-control.zip'
        Compress-Archive -LiteralPath $out -DestinationPath $archive -Force
        $hash = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
        Write-Output "MEALIE_PUT_EVIDENCE_READY $archive"
        Write-Output "ZIP SHA256: $hash"
    }
} finally { Pop-Location }
