[CmdletBinding()]
param(
    [int]$Trials = 20,
    [int]$QuiescenceMs = 100,
    [string]$BaseUrl = "http://127.0.0.1:3456/api/v2",
    [string]$Container = "vikunja-research-sut",
    [switch]$KeepResources
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$evidenceRoot = Join-Path $root "evidence"
$runsRoot = Join-Path $root "runs"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$runDir = Join-Path $runsRoot "increment8_1-direct-confirmation-$stamp"

if ($Trials -lt 1) { throw "Trials must be at least 1." }
if ($QuiescenceMs -lt 0) { throw "QuiescenceMs must be non-negative." }
if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN)) {
    throw "VIKUNJA_API_TOKEN is not set in the current PowerShell process."
}

New-Item -ItemType Directory -Force $evidenceRoot, $runsRoot, $runDir | Out-Null

$startUtc = (Get-Date).ToUniversalTime().ToString("o")
$stdoutLog = Join-Path $runDir "harness.stdout.log"
$stderrLog = Join-Path $runDir "harness.stderr.log"

try {
    docker inspect $Container | Set-Content (Join-Path $runDir "docker-container-before.json") -Encoding UTF8
    if ($LASTEXITCODE -ne 0) { throw "docker inspect failed for container '$Container'." }

    $imageId = docker inspect $Container --format '{{.Image}}'
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($imageId)) {
        throw "Could not resolve Docker image ID for '$Container'."
    }
    docker image inspect $imageId | Set-Content (Join-Path $runDir "docker-image.json") -Encoding UTF8
    if ($LASTEXITCODE -ne 0) { throw "docker image inspect failed for '$imageId'." }

    $pythonArgs = @(
        (Join-Path $PSScriptRoot "confirm_vikunja_increment8_1.py"),
        "--base-url", $BaseUrl,
        "--trials", $Trials,
        "--quiescence-ms", $QuiescenceMs,
        "--output-dir", $runDir
    )
    if ($KeepResources) { $pythonArgs += "--keep-resources" }

    & python @pythonArgs 1> $stdoutLog 2> $stderrLog
    $harnessExit = $LASTEXITCODE

    $witnesses = Join-Path $runDir "direct-witnesses.jsonl"
    $evaluation = Join-Path $runDir "increment8_1-evaluation.json"
    $evaluationExit = 3
    if (Test-Path $witnesses) {
        & python (Join-Path $PSScriptRoot "evaluate_vikunja_increment8_1.py") `
            $witnesses `
            --output $evaluation `
            2>&1 | Tee-Object (Join-Path $runDir "evaluator.log")
        $evaluationExit = $LASTEXITCODE
    }

    docker logs $Container --since $startUtc --timestamps 2>&1 |
        Set-Content (Join-Path $runDir "docker-container-during-run.log") -Encoding UTF8
    docker inspect $Container | Set-Content (Join-Path $runDir "docker-container-after.json") -Encoding UTF8

    $summary = [ordered]@{
        experiment = "vikunja-increment8.1-direct-confirmation"
        created_utc = (Get-Date).ToUniversalTime().ToString("o")
        harness_exit_code = $harnessExit
        evaluator_exit_code = $evaluationExit
        trials_requested = $Trials
        quiescence_ms = $QuiescenceMs
        base_url = $BaseUrl
        docker_container = $Container
        docker_image_id = $imageId.Trim()
        token_recorded = $false
        provengo_used = $false
        research_proxy_used = $false
        increment8_adapter_used = $false
    }
    $summary | ConvertTo-Json -Depth 5 |
        Set-Content (Join-Path $runDir "invocation-summary.json") -Encoding UTF8

    $hashRows = Get-ChildItem $runDir -File -Recurse |
        Where-Object { $_.Name -ne "SHA256SUMS.csv" } |
        Sort-Object FullName |
        ForEach-Object {
            # Windows PowerShell 5.1 runs on .NET Framework, which does not
            # provide System.IO.Path.GetRelativePath.  All selected files are
            # descendants of $runDir, so a checked prefix removal is portable.
            if (-not $_.FullName.StartsWith($runDir, [StringComparison]::OrdinalIgnoreCase)) {
                throw "Evidence file is outside the run directory: $($_.FullName)"
            }
            $relativePath = $_.FullName.Substring($runDir.Length).TrimStart([char[]]"\/")
            [pscustomobject]@{
                path = $relativePath.Replace('\', '/')
                size_bytes = $_.Length
                sha256 = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
            }
        }
    $hashRows | Export-Csv (Join-Path $runDir "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8

    $zip = Join-Path $evidenceRoot "increment8_1-direct-confirmation-$stamp.zip"
    Compress-Archive -Path (Join-Path $runDir "*") -DestinationPath $zip -Force
    $zipHash = Get-FileHash $zip -Algorithm SHA256

    Write-Host ""
    Write-Host "Run directory: $runDir"
    Write-Host "Evidence ZIP:  $zip"
    Write-Host "ZIP SHA256:    $($zipHash.Hash.ToLowerInvariant())"
    Write-Host "Harness exit:  $harnessExit"
    Write-Host "Evaluator exit: $evaluationExit"

    if ($harnessExit -ne 0) { exit 3 }
    exit $evaluationExit
}
catch {
    try {
        docker logs $Container --since $startUtc --timestamps 2>&1 |
            Set-Content (Join-Path $runDir "docker-container-during-run.log") -Encoding UTF8
    } catch { }
    $_ | Out-String | Set-Content (Join-Path $runDir "invoke-error.log") -Encoding UTF8
    Write-Error $_
    exit 3
}
