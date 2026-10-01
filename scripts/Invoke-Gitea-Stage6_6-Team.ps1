[CmdletBinding()]
param(
    [ValidateRange(1,50)][int]$Trials = 8,
    [ValidateRange(1,10)][int]$PrefixRounds = 4,
    [ValidateRange(0,60000)][int]$QuiescenceMs = 150,
    [int]$Seed = 20261004,
    [string]$Target = 'http://127.0.0.1:3477',
    [switch]$FreezeEvidence
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$generator = Join-Path $root 'generator_baseline'
$runner = Join-Path $PSScriptRoot 'run_gitea_stage6_6_team.py'
if ([string]::IsNullOrWhiteSpace($env:GITEA_API_TOKEN)) {
    throw 'GITEA_API_TOKEN is empty. Run Prepare-Gitea-Stage1.ps1 in this PowerShell process.'
}
foreach ($path in @($generator, $runner, (Join-Path $root 'model/gitea/gitea-1.27.3-swagger.json'))) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Required project path missing: $path" }
}
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'python is not on PATH.' }

$oldPythonPath = $env:PYTHONPATH
try {
    if ($oldPythonPath) { $env:PYTHONPATH = "$generator$([IO.Path]::PathSeparator)$oldPythonPath" }
    else { $env:PYTHONPATH = $generator }
    $runnerArgs = @($runner, '--root', $root, '--target', $Target,
        '--trials', $Trials, '--prefix-rounds', $PrefixRounds,
        '--quiescence-ms', $QuiescenceMs, '--seed', $Seed)
    if ($FreezeEvidence) { $runnerArgs += '--freeze-evidence' }
    & python @runnerArgs
    if ($LASTEXITCODE -ne 0) { throw "GITEA_STAGE6_6_INCOMPLETE: runner exit $LASTEXITCODE" }
}
finally { $env:PYTHONPATH = $oldPythonPath }
