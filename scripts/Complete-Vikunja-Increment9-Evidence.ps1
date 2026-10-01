[CmdletBinding()]
param(
    [string]$Root = "",
    [string]$RunDirectory = "",
    [string]$VikunjaContainer = "vikunja-increment8-2-postgres",
    [string]$PostgresContainer = "vikunja-increment8-2-db"
)

$ErrorActionPreference = "Stop"
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $scriptDir "..")).Path } else { $Root = (Resolve-Path $Root).Path }
if ([string]::IsNullOrWhiteSpace($RunDirectory)) {
    $selected = Get-ChildItem (Join-Path $Root "runs") -Directory -Filter "increment9-provengo-concurrency-search-*" |
        Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
    if (-not $selected) { throw "No Increment 9 run directory was found." }
    $RunDirectory = $selected.FullName
} else {
    $RunDirectory = (Resolve-Path $RunDirectory).Path
}

$evaluation = Join-Path $RunDirectory "increment9-evaluation.json"
if (-not (Test-Path $evaluation -PathType Leaf)) { throw "The selected run has no Increment 9 evaluation: $RunDirectory" }

function Save-DockerLogs([string]$container, [string]$output) {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { return }
    $stdout = "$output.stdout.tmp"
    $stderr = "$output.stderr.tmp"
    $process = Start-Process docker -ArgumentList @("logs", $container) `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -Wait -PassThru -NoNewWindow
    $content = @()
    if (Test-Path $stdout) { $content += Get-Content $stdout }
    if (Test-Path $stderr) { $content += Get-Content $stderr }
    $content | Set-Content $output -Encoding UTF8
    Remove-Item $stdout, $stderr -Force -ErrorAction SilentlyContinue
    if ($process.ExitCode -ne 0) { Add-Content $output "docker logs exited with code $($process.ExitCode)" -Encoding UTF8 }
}

Save-DockerLogs $VikunjaContainer (Join-Path $RunDirectory "vikunja-container.log")
Save-DockerLogs $PostgresContainer (Join-Path $RunDirectory "postgres-container.log")

$model = Join-Path $Root "phase15-increment9-concurrency-search\generated-campaign"
foreach ($name in @("increment9-campaign-manifest.json", "increment9-campaign.vikunja.js")) {
    $source = Join-Path $model $name
    if ((Test-Path $source) -and -not (Test-Path (Join-Path $RunDirectory $name))) { Copy-Item $source $RunDirectory -Force }
}

$result = Get-Content $evaluation -Raw | ConvertFrom-Json
$summary = [ordered]@{
    experiment = "vikunja-increment9-provengo-concurrency-search"
    evidence_completed_utc = (Get-Date).ToUniversalTime().ToString("o")
    recovered_after_log_collection_warning = $true
    original_run_reused = $true
    run_status = $result.run_status
    candidate_count = $result.candidate_count
    counts = $result.counts
    token_recorded = $false
}
$summary | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $RunDirectory "evidence-completion-summary.json") -Encoding UTF8

$hashes = foreach ($file in Get-ChildItem $RunDirectory -Recurse -File | Where-Object { $_.Name -ne "SHA256SUMS.csv" }) {
    [pscustomobject]@{ path = $file.FullName.Substring($RunDirectory.Length + 1).Replace("\", "/"); size_bytes = $file.Length; sha256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
}
$hashes | Sort-Object path | Export-Csv (Join-Path $RunDirectory "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8

$evidence = Join-Path $Root "evidence"
New-Item -ItemType Directory -Force $evidence | Out-Null
$zip = Join-Path $evidence ((Split-Path $RunDirectory -Leaf) + "-review.zip")
Compress-Archive -Path (Join-Path $RunDirectory "*") -DestinationPath $zip -Force
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()

Write-Host "INCREMENT9_EVIDENCE_RECOVERED"
Write-Host "Original run: $RunDirectory"
Write-Host "Evidence ZIP: $zip"
Write-Host "ZIP SHA256:   $zipHash"
Write-Host "Run status:   $($result.run_status)"
Write-Host "Candidates:   $($result.candidate_count)"
