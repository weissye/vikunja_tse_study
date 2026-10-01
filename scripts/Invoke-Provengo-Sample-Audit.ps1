param(
    [Parameter(Mandatory=$true)][string]$Project,
    [string]$Plan,
    [int]$Size=1000,
    [int]$MaxDepth=2000,
    [int]$NotGrowingThreshold=500,
    [int]$TimeoutSeconds=900,
    [int]$EnsembleSize=0,
    [int]$BatchSize=50,
    [int]$JavaHeapMb=4096
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMdd_HHmmss_fff')
$out = Join-Path (Get-Location) "evidence\provengo-sample-audit-$stamp"
$arguments = @((Join-Path $PSScriptRoot 'provengo_sample_audit.py'),
    '--project', $Project, '--out', $out, '--size', $Size,
    '--max-depth', $MaxDepth, '--not-growing-threshold', $NotGrowingThreshold,
    '--timeout-seconds', $TimeoutSeconds, '--batch-size', $BatchSize,
    '--java-heap-mb', $JavaHeapMb)
if ($Plan) { $arguments += @('--plan', $Plan) }
if ($EnsembleSize -gt 0) { $arguments += @('--ensemble-size', $EnsembleSize) }
try {
    & python @arguments
    $code = $LASTEXITCODE
    if (Test-Path -LiteralPath $out) {
        $zip = "$out.zip"
        Compress-Archive -LiteralPath $out -DestinationPath $zip -Force
        Write-Host "SAMPLE_AUDIT_EVIDENCE $zip"
        Get-FileHash -LiteralPath $zip -Algorithm SHA256 | Format-List
    }
    if ($code -ne 0) { throw "Sampling/audit incomplete (exit $code); inspect evidence at $out" }
} finally {
    # No credentials are set by this script.
}
