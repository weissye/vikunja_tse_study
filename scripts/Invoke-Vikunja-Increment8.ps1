param(
    [string]$Root = "",
    [string]$Target = "http://127.0.0.1:3456",
    [int]$ProxyPort = 3457,
    [int]$AdapterPort = 3458,
    [int]$Seed = 20262231,
    [int]$Tasks = 6,
    [int]$MaxLength = 110000,
    [string]$Model = ""
)
$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path } else { $Root = (Resolve-Path $Root).Path }
if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN)) { throw "Set VIKUNJA_API_TOKEN in this PowerShell window." }
foreach ($command in @("python", "provengo", "node")) { if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "$command was not found on PATH." } }

$labels = [Math]::Max(2, [Math]::Min(4, [Math]::Floor($Tasks / 2)))
$comments = [Math]::Max(2, [Math]::Min(4, $Tasks))
if ([string]::IsNullOrWhiteSpace($Model)) { $Model = Join-Path $Root "phase14-increment8-true-concurrent-epochs\generated-concurrent-epochs" }
elseif (-not [IO.Path]::IsPathRooted($Model)) { $Model = Join-Path $Root $Model }
$Model = (Resolve-Path $Model).Path

$files = [ordered]@{
    Interfaces = Join-Path $Model "interfaces.vikunja.js"
    Stories = Join-Path $Model "stories.vikunja.js"
    NegativeStories = Join-Path $Model "negative.vikunja.js"
    ConflictStories = Join-Path $Model "conflict.vikunja.js"
    DisjointStories = Join-Path $Model "disjoint-patch.vikunja.js"
    ConcurrentStories = Join-Path $Model "concurrent-epochs.vikunja.js"
    ResourceManifest = Join-Path $Model "resource-oracle-manifest.json"
    ActionManifest = Join-Path $Model "action-oracle-manifest.json"
    NegativeManifest = Join-Path $Model "negative-oracle-manifest.json"
    ConflictManifest = Join-Path $Model "conflict-oracle-manifest.json"
    DisjointManifest = Join-Path $Model "disjoint-patch-oracle-manifest.json"
    ConcurrentManifest = Join-Path $Model "concurrent-epoch-oracle-manifest.json"
}
$tools = [ordered]@{
    Proxy = Join-Path $Root "scripts\vikunja_research_proxy.py"
    Adapter = Join-Path $Root "scripts\vikunja_concurrent_epoch_adapter.py"
    Probe = Join-Path $Root "scripts\probe_vikunja_multi_resource_deletions.py"
    Evaluator = Join-Path $Root "scripts\evaluate_vikunja_multi_resource.py"
    ResourceVerifier = Join-Path $Root "scripts\validate_resource_verifiers.py"
    ActionVerifier = Join-Path $Root "scripts\validate_action_verifiers.py"
    NegativeVerifier = Join-Path $Root "scripts\validate_negative_verifiers.py"
    ConflictVerifier = Join-Path $Root "scripts\validate_conflict_verifiers.py"
    DisjointVerifier = Join-Path $Root "scripts\validate_disjoint_patch_verifiers.py"
    ConcurrentVerifier = Join-Path $Root "scripts\validate_concurrent_epoch_verifiers.py"
}
foreach ($path in @($files.Values) + @($tools.Values)) { if (-not (Test-Path $path)) { throw "Required file is missing: $path" } }
foreach ($path in @($files.Stories, $files.NegativeStories, $files.ConflictStories, $files.DisjointStories, $files.ConcurrentStories)) {
    & node --check $path
    if ($LASTEXITCODE -ne 0) { throw "JavaScript syntax validation failed: $path" }
}
try { $info = Invoke-RestMethod -Uri "$Target/api/v2/info" -TimeoutSec 10 } catch { throw "Vikunja is not reachable at $Target." }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$run = Join-Path $Root "runs\increment8-true-concurrent-epochs-seed-$Seed-$stamp"
$project = Join-Path $run "provengo_project"
$trace = Join-Path $run "http-trace.jsonl"
$epochs = Join-Path $run "concurrent-epochs.jsonl"
New-Item -ItemType Directory -Force $run | Out-Null
& provengo --batch-mode create $project *>&1 | Set-Content (Join-Path $run "provengo-create.log")
if ($LASTEXITCODE -ne 0) { throw "provengo create failed." }
$spec = Join-Path $project "spec\js"
$disabled = Join-Path $spec "disabled"
New-Item -ItemType Directory -Force $disabled | Out-Null
$hello = Join-Path $spec "hello-world.js"
if (Test-Path $hello) { Move-Item $hello $disabled -Force }
Copy-Item @($files.Interfaces, $files.Stories, $files.NegativeStories, $files.ConflictStories, $files.DisjointStories, $files.ConcurrentStories) $spec -Force

$proxyOut = Join-Path $run "proxy.stdout.log"
$proxyErr = Join-Path $run "proxy.stderr.log"
$adapterOut = Join-Path $run "concurrent-adapter.stdout.log"
$adapterErr = Join-Path $run "concurrent-adapter.stderr.log"
$proxy = $null
$adapter = $null
$provengoExit = $null
$probeExit = $null
try {
    $proxy = Start-Process python -ArgumentList @($tools.Proxy, "--target", $Target, "--listen-port", $ProxyPort, "--trace", $trace) -WorkingDirectory $Root -RedirectStandardOutput $proxyOut -RedirectStandardError $proxyErr -PassThru
    $proxyReady = $false
    $deadline = (Get-Date).AddSeconds(20)
    while ((Get-Date) -lt $deadline) {
        if ($proxy.HasExited) { throw "Proxy exited before readiness." }
        try { Invoke-RestMethod -Uri "http://127.0.0.1:$ProxyPort/info" -TimeoutSec 2 | Out-Null; $proxyReady = $true; break } catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $proxyReady) { throw "Proxy did not become ready." }

    $adapter = Start-Process python -ArgumentList @($tools.Adapter, "--listen-port", $AdapterPort, "--upstream", "http://127.0.0.1:$ProxyPort", "--epoch-log", $epochs) -WorkingDirectory $Root -RedirectStandardOutput $adapterOut -RedirectStandardError $adapterErr -PassThru
    $adapterReady = $false
    $deadline = (Get-Date).AddSeconds(20)
    while ((Get-Date) -lt $deadline) {
        if ($adapter.HasExited) { throw "Concurrent adapter exited before readiness." }
        try { Invoke-RestMethod -Uri "http://127.0.0.1:$AdapterPort/health" -TimeoutSec 2 | Out-Null; $adapterReady = $true; break } catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $adapterReady) { throw "Concurrent adapter did not become ready." }

    & provengo --no-color run --run-source :random --random-seed $Seed --max-length $MaxLength $project *>&1 | Tee-Object (Join-Path $run "provengo-run.log")
    $provengoExit = $LASTEXITCODE
    if ($provengoExit -eq 0) {
        & python $tools.Probe --trace $trace --base-url "http://127.0.0.1:$ProxyPort" --output (Join-Path $run "post-delete-probe.json")
        $probeExit = $LASTEXITCODE
    }
} finally {
    if ($adapter -and -not $adapter.HasExited) { Stop-Process -Id $adapter.Id -Force -ErrorAction SilentlyContinue }
    if ($proxy -and -not $proxy.HasExited) { Stop-Process -Id $proxy.Id -Force -ErrorAction SilentlyContinue }
}

$results = [ordered]@{}
function Run-Evaluator([string]$Name, [string]$Program, [string[]]$Arguments) {
    & python $Program @Arguments
    $script:results[$Name] = $LASTEXITCODE
}
$phaseEvaluation = Join-Path $run "phase7-multi-resource-evaluation.json"
Run-Evaluator "evaluation" $tools.Evaluator @("--trace", $trace, "--tasks", "$Tasks", "--labels", "$labels", "--comments", "$comments", "--output", $phaseEvaluation)
$resourceEvaluation = Join-Path $run "resource-verifier-evaluation.json"
Run-Evaluator "resource" $tools.ResourceVerifier @("--trace", $trace, "--manifest", $files.ResourceManifest, "--expected-tasks", "$Tasks", "--expected-projects", "1", "--expected-labels", "$labels", "--output", $resourceEvaluation)
$actionEvaluation = Join-Path $run "action-verifier-evaluation.json"
Run-Evaluator "action" $tools.ActionVerifier @("--trace", $trace, "--manifest", $files.ActionManifest, "--expected-labels", "$labels", "--expected-comments", "$comments", "--expected-relations", "$($Tasks - 1)", "--output", $actionEvaluation)
$negativeEvaluation = Join-Path $run "negative-verifier-evaluation.json"
Run-Evaluator "negative" $tools.NegativeVerifier @("--trace", $trace, "--manifest", $files.NegativeManifest, "--output", $negativeEvaluation)
$conflictEvaluation = Join-Path $run "conflict-verifier-evaluation.json"
Run-Evaluator "conflict" $tools.ConflictVerifier @("--trace", $trace, "--manifest", $files.ConflictManifest, "--output", $conflictEvaluation)
$disjointEvaluation = Join-Path $run "disjoint-patch-verifier-evaluation.json"
Run-Evaluator "disjoint" $tools.DisjointVerifier @("--trace", $trace, "--manifest", $files.DisjointManifest, "--output", $disjointEvaluation)
$concurrentEvaluation = Join-Path $run "concurrent-epoch-verifier-evaluation.json"
Run-Evaluator "concurrent" $tools.ConcurrentVerifier @("--trace", $trace, "--epochs", $epochs, "--manifest", $files.ConcurrentManifest, "--output", $concurrentEvaluation)

foreach ($key in @("ResourceManifest", "ActionManifest", "NegativeManifest", "ConflictManifest", "DisjointManifest", "ConcurrentManifest")) {
    Copy-Item $files[$key] (Join-Path $run (Split-Path $files[$key] -Leaf)) -Force
}
$meta = [ordered]@{
    experiment = "vikunja-increment8-true-concurrent-epochs"
    profile = "provengo-native-true-concurrent-disjoint-patches"
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    vikunja_version = $info.version
    seed = $Seed
    tasks = $Tasks
    projects = 1
    labels = $labels
    comments = $comments
    relations = ($Tasks - 1)
    concurrent_epochs = $Tasks
    epoch_width = 2
    proxy_port = $ProxyPort
    adapter_port = $AdapterPort
    max_length = $MaxLength
    provengo_exit_code = $provengoExit
    deletion_probe_exit_code = $probeExit
    evaluation_exit_code = $results.evaluation
    resource_verifier_exit_code = $results.resource
    action_verifier_exit_code = $results.action
    negative_verifier_exit_code = $results.negative
    conflict_verifier_exit_code = $results.conflict
    disjoint_patch_verifier_exit_code = $results.disjoint
    concurrent_epoch_verifier_exit_code = $results.concurrent
    openapi_sha256 = (Get-FileHash (Join-Path $Root "phase14-increment8-true-concurrent-epochs\vikunja-multi-resource-openapi.json") -Algorithm SHA256).Hash.ToLowerInvariant()
    interfaces_sha256 = (Get-FileHash $files.Interfaces -Algorithm SHA256).Hash.ToLowerInvariant()
    stories_sha256 = (Get-FileHash $files.Stories -Algorithm SHA256).Hash.ToLowerInvariant()
    concurrent_stories_sha256 = (Get-FileHash $files.ConcurrentStories -Algorithm SHA256).Hash.ToLowerInvariant()
    concurrent_oracle_manifest_sha256 = (Get-FileHash $files.ConcurrentManifest -Algorithm SHA256).Hash.ToLowerInvariant()
    concurrency_decision_owner = "Provengo BP model"
    adapter_role = "barrier release and HTTP transport only"
}
$meta | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $run "run-metadata.json") -Encoding UTF8
$hashes = foreach ($file in Get-ChildItem $run -Recurse -File | Where-Object { $_.Name -ne "SHA256SUMS.csv" }) {
    [pscustomobject]@{ Path = $file.FullName.Substring($run.Length + 1).Replace("\", "/"); SHA256 = (Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant(); SizeBytes = $file.Length }
}
$hashes | Sort-Object Path | Export-Csv (Join-Path $run "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8

Write-Host "Run directory: $run"
foreach ($output in @($phaseEvaluation, $resourceEvaluation, $actionEvaluation, $negativeEvaluation, $conflictEvaluation, $disjointEvaluation, $concurrentEvaluation)) { if (Test-Path $output) { Get-Content $output } }
$failed = ($provengoExit -ne 0) -or ($probeExit -ne 0) -or (@($results.Values | Where-Object { $_ -ne 0 }).Count -gt 0)
if ($failed) { throw "Increment 8 failed, was inconclusive, or exposed a bug candidate. Preserve the run directory." }
Write-Host "VIKUNJA_INCREMENT8_TRUE_CONCURRENCY_PASS"
