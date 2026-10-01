[CmdletBinding()]
param(
    [int]$Trials = 20,
    [int]$QuiescenceMs = 100,
    [string]$BaseUrl = "http://127.0.0.1:3466/api/v2"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$runsRoot = Join-Path $root "runs"
$evidenceRoot = Join-Path $root "evidence"
$deployment = Join-Path $root "deployment\increment8_2"
$sessionFile = Join-Path $deployment "increment8_2-session.json"
$vikunjaContainer = "vikunja-increment8-2-postgres"
$postgresContainer = "vikunja-increment8-2-db"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$runDir = Join-Path $runsRoot "increment8_2-postgresql-differential-$stamp"

if ($Trials -lt 1) { throw "Trials must be at least 1." }
if ($QuiescenceMs -lt 0) { throw "QuiescenceMs must be non-negative." }
if (-not (Test-Path $sessionFile -PathType Leaf)) {
    throw "Increment 8.2 is not prepared. Run .\scripts\Prepare-Vikunja-Increment8_2.ps1 first."
}
if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN)) {
    throw "VIKUNJA_API_TOKEN is empty. Run Prepare-Vikunja-Increment8_2.ps1 in this PowerShell window."
}

$sqliteRun = Get-ChildItem $runsRoot -Directory -Filter "increment8_1-direct-confirmation-*" |
    Where-Object { Test-Path (Join-Path $_.FullName "increment8_1-evaluation.json") } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
if ($null -eq $sqliteRun) {
    throw "Canonical Increment 8.1 SQLite evaluation was not found under $runsRoot"
}

New-Item -ItemType Directory -Force $runsRoot, $evidenceRoot, $runDir | Out-Null
$sqliteEvaluation = Join-Path $runDir "sqlite-baseline-evaluation.json"
Copy-Item (Join-Path $sqliteRun.FullName "increment8_1-evaluation.json") $sqliteEvaluation
Copy-Item $sessionFile (Join-Path $runDir "postgres-session.json")

$startUtc = (Get-Date).ToUniversalTime().ToString("o")
$harnessExit = 3
$evaluationExit = 3
$comparisonExit = 3

try {
    docker inspect $vikunjaContainer | Set-Content (Join-Path $runDir "vikunja-container-before.json") -Encoding UTF8
    if ($LASTEXITCODE -ne 0) { throw "Could not inspect $vikunjaContainer" }
    docker inspect $postgresContainer | Set-Content (Join-Path $runDir "postgres-container-before.json") -Encoding UTF8
    if ($LASTEXITCODE -ne 0) { throw "Could not inspect $postgresContainer" }

    $vikunjaImageId = docker inspect $vikunjaContainer --format '{{.Image}}'
    $postgresImageId = docker inspect $postgresContainer --format '{{.Image}}'
    docker image inspect $vikunjaImageId | Set-Content (Join-Path $runDir "vikunja-image.json") -Encoding UTF8
    docker image inspect $postgresImageId | Set-Content (Join-Path $runDir "postgres-image.json") -Encoding UTF8

    $pythonArgs = @(
        (Join-Path $PSScriptRoot "confirm_vikunja_increment8_1.py"),
        "--base-url", $BaseUrl,
        "--trials", $Trials,
        "--quiescence-ms", $QuiescenceMs,
        "--output-dir", $runDir
    )
    & python @pythonArgs `
        1> (Join-Path $runDir "harness.stdout.log") `
        2> (Join-Path $runDir "harness.stderr.log")
    $harnessExit = $LASTEXITCODE

    $witnesses = Join-Path $runDir "direct-witnesses.jsonl"
    $postgresEvaluation = Join-Path $runDir "postgres-evaluation.json"
    if (-not (Test-Path $witnesses -PathType Leaf)) {
        throw "The PostgreSQL harness produced no witness file."
    }

    & python (Join-Path $PSScriptRoot "evaluate_vikunja_increment8_1.py") `
        $witnesses `
        --output $postgresEvaluation `
        2>&1 | Tee-Object (Join-Path $runDir "postgres-evaluator.log")
    $evaluationExit = $LASTEXITCODE

    $comparison = Join-Path $runDir "increment8_2-differential-evaluation.json"
    & python (Join-Path $PSScriptRoot "compare_vikunja_increment8_2_backends.py") `
        --sqlite $sqliteEvaluation `
        --postgres $postgresEvaluation `
        --output $comparison `
        2>&1 | Tee-Object (Join-Path $runDir "differential-evaluator.log")
    $comparisonExit = $LASTEXITCODE

    docker logs $vikunjaContainer --since $startUtc --timestamps 2>&1 |
        Set-Content (Join-Path $runDir "vikunja-container-during-run.log") -Encoding UTF8
    docker logs $postgresContainer --since $startUtc --timestamps 2>&1 |
        Set-Content (Join-Path $runDir "postgres-container-during-run.log") -Encoding UTF8
    docker inspect $vikunjaContainer | Set-Content (Join-Path $runDir "vikunja-container-after.json") -Encoding UTF8
    docker inspect $postgresContainer | Set-Content (Join-Path $runDir "postgres-container-after.json") -Encoding UTF8

    $postgresVersion = docker exec $postgresContainer postgres --version
    $summary = [ordered]@{
        experiment = "vikunja-increment8.2-postgresql-differential"
        created_utc = (Get-Date).ToUniversalTime().ToString("o")
        harness_implementation = "scripts/confirm_vikunja_increment8_1.py (unchanged)"
        evaluator_implementation = "scripts/evaluate_vikunja_increment8_1.py (unchanged)"
        sqlite_baseline_run = $sqliteRun.Name
        harness_exit_code = $harnessExit
        evaluator_exit_code = $evaluationExit
        comparison_exit_code = $comparisonExit
        trials_requested = $Trials
        quiescence_ms = $QuiescenceMs
        base_url = $BaseUrl
        database_backend = "postgres"
        postgres_version = ($postgresVersion -join " ").Trim()
        vikunja_image_id = $vikunjaImageId.Trim()
        postgres_image_id = $postgresImageId.Trim()
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

    $zip = Join-Path $evidenceRoot "increment8_2-postgresql-differential-$stamp-review.zip"
    Compress-Archive -Path (Join-Path $runDir "*") -DestinationPath $zip -Force
    $zipHash = Get-FileHash $zip -Algorithm SHA256

    Write-Host ""
    Write-Host "INCREMENT8_2_EVIDENCE_READY"
    Write-Host "Run directory: $runDir"
    Write-Host "Evidence ZIP:  $zip"
    Write-Host "ZIP SHA256:    $($zipHash.Hash.ToLowerInvariant())"
    Write-Host "Harness exit:  $harnessExit"
    Write-Host "Evaluator exit: $evaluationExit"
    Write-Host "Comparison exit: $comparisonExit"

    if ($harnessExit -ne 0 -or $evaluationExit -eq 3 -or $comparisonExit -ne 0) { exit 3 }
    exit 0
}
catch {
    try {
        docker logs $vikunjaContainer --since $startUtc --timestamps 2>&1 |
            Set-Content (Join-Path $runDir "vikunja-container-during-run.log") -Encoding UTF8
        docker logs $postgresContainer --since $startUtc --timestamps 2>&1 |
            Set-Content (Join-Path $runDir "postgres-container-during-run.log") -Encoding UTF8
    } catch { }
    $_ | Out-String | Set-Content (Join-Path $runDir "invoke-error.log") -Encoding UTF8
    Write-Error $_
    exit 3
}
