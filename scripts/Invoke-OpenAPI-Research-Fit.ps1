param(
    [Parameter(Mandatory=$true)][ValidateSet('openproject','immich','mealie')][string]$Candidate,
    [Parameter(Mandatory=$true)][string]$SpecPath,
    [int]$TimeoutSeconds = 180
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$spec = (Resolve-Path -LiteralPath $SpecPath).Path
$gen = Join-Path $root 'generator_baseline'
if (-not (Test-Path -LiteralPath (Join-Path $gen 'openapi_to_sbt\__main__.py'))) {
    throw 'Missing existing generator_baseline\openapi_to_sbt; restore the project generator, do not use a substitute.'
}
$output = Join-Path $root ('runs\research-fit-' + $Candidate + '-' + (Get-Date -Format 'yyyyMMdd_HHmmss_fff'))
New-Item -ItemType Directory -Force -Path $output | Out-Null
& python (Join-Path $PSScriptRoot 'Check-OpenAPI-Research-Fit.py') `
    --candidate $Candidate --spec $spec --generator-root $gen --output $output --timeout $TimeoutSeconds
$code = $LASTEXITCODE
Write-Host ('Evidence directory: ' + $output)
Write-Host ('Exit code: ' + $code)
if ($code -ne 0) { throw ('Research-fit preflight did not pass; see research_fit.json and generator.log in ' + $output) }
