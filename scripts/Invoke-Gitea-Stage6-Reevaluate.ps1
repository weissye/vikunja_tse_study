[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$EvidenceZip,
    [string]$Root = ''
)
$ErrorActionPreference = 'Stop'
$studyRoot = if ($Root) { (Resolve-Path $Root).Path } else { (Resolve-Path (Join-Path $PSScriptRoot '..')).Path }
$evaluator = Join-Path $studyRoot 'generator_baseline\openapi_to_sbt\evaluate_verifiers.py'
if (!(Test-Path $evaluator)) { throw "Missing evaluator: $evaluator" }
$zipPath = (Resolve-Path $EvidenceZip).Path
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ('gitea-reevaluation-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempDir | Out-Null
try {
    Expand-Archive -LiteralPath $zipPath -DestinationPath $tempDir
    $trace = Join-Path $tempDir 'http-trace.jsonl'
    $manifest = Join-Path $tempDir 'verification-manifest.gitea.json'
    if (!(Test-Path $trace) -or !(Test-Path $manifest)) { throw 'Evidence ZIP lacks trace or manifest.' }
    $name = [IO.Path]::GetFileNameWithoutExtension($zipPath)
    $output = Join-Path (Split-Path $zipPath -Parent) ($name + '-reevaluated.json')
    & python $evaluator --trace $trace --manifest $manifest --output $output
    $code = $LASTEXITCODE
    if ($code -notin @(0,2,3)) { throw "Evaluator failed with exit code $code" }
    Write-Host "Result: $output; evaluator exit: $code"
} finally { Remove-Item -LiteralPath $tempDir -Recurse -Force }
