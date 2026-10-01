[CmdletBinding()]
param(
    [string]$Root = "",
    [string]$Target = "http://127.0.0.1:3466",
    [int]$ProxyPort = 3457,
    [int]$AdapterPort = 3459,
    [int]$Seed = 20262241,
    [int]$MaxLength = 20000,
    [string]$VikunjaContainer = "vikunja-increment8-2-postgres",
    [string]$PostgresContainer = "vikunja-increment8-2-db"
)

$ErrorActionPreference = "Stop"
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $scriptDir "..")).Path } else { $Root = (Resolve-Path $Root).Path }
if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN)) { throw "VIKUNJA_API_TOKEN is not set. Run Prepare-Vikunja-Increment8_2.ps1 in this PowerShell process first." }
foreach ($command in @("python", "provengo")) { if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "$command was not found on PATH." } }

$model = Join-Path $Root "phase15-increment9-concurrency-search\generated-campaign"
$story = Join-Path $model "increment9-campaign.vikunja.js"
$manifest = Join-Path $model "increment9-campaign-manifest.json"
$proxyTool = Join-Path $Root "scripts\vikunja_research_proxy.py"
$adapterTool = Join-Path $Root "scripts\vikunja_increment9_concurrency_adapter.py"
$evaluatorTool = Join-Path $Root "scripts\evaluate_vikunja_increment9_campaign.py"
foreach ($path in @($story, $manifest, $proxyTool, $adapterTool, $evaluatorTool)) { if (-not (Test-Path $path -PathType Leaf)) { throw "Required Increment 9 file is missing: $path" } }

try { $info = Invoke-RestMethod -Uri "$Target/api/v2/info" -TimeoutSec 10 } catch { throw "Vikunja is not reachable at $Target." }
$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$run = Join-Path $Root "runs\increment9-provengo-concurrency-search-seed-$Seed-$stamp"
$project = Join-Path $run "provengo_project"
$trace = Join-Path $run "http-trace.jsonl"
$epochs = Join-Path $run "concurrent-epochs.jsonl"
$evaluation = Join-Path $run "increment9-evaluation.json"
New-Item -ItemType Directory -Force $run | Out-Null

& provengo --batch-mode create $project *>&1 | Set-Content (Join-Path $run "provengo-create.log")
if ($LASTEXITCODE -ne 0) { throw "provengo create failed." }
$spec = Join-Path $project "spec\js"
$disabled = Join-Path $spec "disabled"
New-Item -ItemType Directory -Force $disabled | Out-Null
$hello = Join-Path $spec "hello-world.js"
if (Test-Path $hello) { Move-Item $hello $disabled -Force }
Copy-Item $story (Join-Path $spec "increment9-campaign.vikunja.js") -Force

$proxyOut = Join-Path $run "proxy.stdout.log"
$proxyErr = Join-Path $run "proxy.stderr.log"
$adapterOut = Join-Path $run "adapter.stdout.log"
$adapterErr = Join-Path $run "adapter.stderr.log"
$proxy = $null
$adapter = $null
$provengoExit = $null
try {
    $proxy = Start-Process python -ArgumentList @($proxyTool, "--target", $Target, "--listen-port", $ProxyPort, "--trace", $trace) -WorkingDirectory $Root -RedirectStandardOutput $proxyOut -RedirectStandardError $proxyErr -PassThru
    $deadline = (Get-Date).AddSeconds(20)
    $ready = $false
    while ((Get-Date) -lt $deadline) {
        if ($proxy.HasExited) { throw "Proxy exited before readiness." }
        try { Invoke-RestMethod -Uri "http://127.0.0.1:$ProxyPort/info" -TimeoutSec 2 | Out-Null; $ready = $true; break } catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $ready) { throw "Proxy did not become ready." }

    $adapter = Start-Process python -ArgumentList @($adapterTool, "--listen-port", $AdapterPort, "--upstream", "http://127.0.0.1:$ProxyPort", "--epoch-log", $epochs) -WorkingDirectory $Root -RedirectStandardOutput $adapterOut -RedirectStandardError $adapterErr -PassThru
    $deadline = (Get-Date).AddSeconds(20)
    $ready = $false
    while ((Get-Date) -lt $deadline) {
        if ($adapter.HasExited) { throw "Adapter exited before readiness." }
        try { Invoke-RestMethod -Uri "http://127.0.0.1:$AdapterPort/health" -TimeoutSec 2 | Out-Null; $ready = $true; break } catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $ready) { throw "Adapter did not become ready." }

    & provengo --no-color run --run-source :random --random-seed $Seed --max-length $MaxLength $project *>&1 | Tee-Object (Join-Path $run "provengo-run.log")
    $provengoExit = $LASTEXITCODE
} finally {
    if ($adapter -and -not $adapter.HasExited) { Stop-Process -Id $adapter.Id -Force -ErrorAction SilentlyContinue }
    if ($proxy -and -not $proxy.HasExited) { Stop-Process -Id $proxy.Id -Force -ErrorAction SilentlyContinue }
}

$evaluationExit = $null
if ((Test-Path $trace) -and (Test-Path $epochs)) {
    & python $evaluatorTool --trace $trace --epochs $epochs --manifest $manifest --output $evaluation 2>&1 | Tee-Object (Join-Path $run "evaluator.log")
    $evaluationExit = $LASTEXITCODE
}

function Save-RedactedInspect([string]$container, [string]$output) {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { return }
    $raw = docker inspect $container 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $raw) { return }
    $data = $raw | ConvertFrom-Json
    foreach ($item in $data) {
        if ($item.Config -and $item.Config.Env) {
            $item.Config.Env = @($item.Config.Env | ForEach-Object {
                $name = ($_ -split "=", 2)[0]
                if ($name -match "(?i)(PASSWORD|SECRET|TOKEN|KEY)") { "$name=<redacted>" } else { $_ }
            })
        }
    }
    $data | ConvertTo-Json -Depth 100 | Set-Content $output -Encoding UTF8
}

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
    if ($process.ExitCode -ne 0) {
        Add-Content $output "docker logs exited with code $($process.ExitCode)" -Encoding UTF8
    }
}

Save-RedactedInspect $VikunjaContainer (Join-Path $run "vikunja-container-redacted.json")
Save-RedactedInspect $PostgresContainer (Join-Path $run "postgres-container-redacted.json")
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Save-DockerLogs $VikunjaContainer (Join-Path $run "vikunja-container.log")
    Save-DockerLogs $PostgresContainer (Join-Path $run "postgres-container.log")
}
Copy-Item $manifest (Join-Path $run "increment9-campaign-manifest.json") -Force
Copy-Item $story (Join-Path $run "increment9-campaign.vikunja.js") -Force

$metadata = [ordered]@{
    experiment = "vikunja-increment9-provengo-concurrency-search"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    target = $Target
    backend = "postgresql"
    vikunja_version = $info.version
    seed = $Seed
    max_length = $MaxLength
    scenario_count = 6
    provengo_exit_code = $provengoExit
    evaluator_exit_code = $evaluationExit
    decision_owner = "Provengo BP model"
    adapter_role = "validated barrier release and HTTP transport only"
    direct_confirmation_required = $true
    token_recorded = $false
}
$metadata | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $run "run-metadata.json") -Encoding UTF8
$hashes = foreach ($file in Get-ChildItem $run -Recurse -File | Where-Object { $_.Name -ne "SHA256SUMS.csv" }) {
    [pscustomobject]@{ path = $file.FullName.Substring($run.Length + 1).Replace("\", "/"); size_bytes = $file.Length; sha256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
}
$hashes | Sort-Object path | Export-Csv (Join-Path $run "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8

$evidence = Join-Path $Root "evidence"
New-Item -ItemType Directory -Force $evidence | Out-Null
$zip = Join-Path $evidence ((Split-Path $run -Leaf) + "-review.zip")
Compress-Archive -Path (Join-Path $run "*") -DestinationPath $zip -Force
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()

Write-Host ""
Write-Host "INCREMENT9_EVIDENCE_READY"
Write-Host "Run directory: $run"
Write-Host "Evidence ZIP:  $zip"
Write-Host "ZIP SHA256:    $zipHash"
Write-Host "Provengo exit: $provengoExit"
Write-Host "Evaluator exit: $evaluationExit"

if ($provengoExit -ne 0 -or $null -eq $evaluationExit -or $evaluationExit -eq 3) { exit 3 }
if ($evaluationExit -eq 2) { Write-Host "INCREMENT9_CANDIDATES_REQUIRE_DIRECT_CONFIRMATION" }
else { Write-Host "INCREMENT9_SEARCH_PASS" }
exit 0
