[CmdletBinding()]
param(
  [string]$PythonCommand = "python",
  [string]$ProvengoCommand = "provengo",
  [string]$ResultsRoot = "",
  [int]$Seed = 1,
  [int]$MaxLength = 100
)

$ErrorActionPreference = "Stop"
$Here = $PSScriptRoot
$ProjectRoot = (Resolve-Path (Join-Path $Here "..\..")).Path
$Sut = Join-Path $Here "netbox_b4_sut.py"
$Template = Join-Path $Here "netbox_b4_target.js"
$Evaluator = Join-Path $Here "evaluate_netbox_b4.py"
$ProxyScript = Join-Path $ProjectRoot "scripts\http_trace_proxy.py"
$SutLauncher = Join-Path $ProjectRoot "scripts\run_flask_sut.py"
$Targets = @("A_LOGIC","B_LIFECYCLE","C_UNIQUENESS","D_INTEGRITY","E_REFERENTIAL_INTEGRITY")

if ([string]::IsNullOrWhiteSpace($ResultsRoot)) {
  $ResultsRoot = Join-Path $ProjectRoot "results\netbox_b4"
} elseif (-not [System.IO.Path]::IsPathRooted($ResultsRoot)) {
  $ResultsRoot = [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot $ResultsRoot))
}
New-Item -ItemType Directory -Force $ResultsRoot | Out-Null

foreach($p in @($Sut,$Template,$Evaluator,$ProxyScript,$SutLauncher)) {
  if(-not (Test-Path $p)) { throw "Missing B4 prerequisite: $p" }
}
if(-not (Get-Command $PythonCommand -ErrorAction SilentlyContinue)) { throw "Python command not found: $PythonCommand" }
if(-not (Get-Command $ProvengoCommand -ErrorAction SilentlyContinue)) { throw "Provengo command not found: $ProvengoCommand" }

function Wait-TextFile([string]$Path, $Process, [int]$TimeoutSeconds, [string]$What) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while((Get-Date) -lt $deadline) {
    if($Process -and $Process.HasExited) { throw "$What exited during startup. Inspect its stderr log." }
    if(Test-Path $Path) {
      $text = (Get-Content $Path -Raw).Trim()
      if($text) { return $text }
    }
    Start-Sleep -Milliseconds 100
  }
  throw "$What did not publish readiness metadata: $Path"
}

function Stop-B4Process($Process) {
  if($Process -and -not $Process.HasExited) {
    Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
  }
}

function Start-LoggedProcess([string]$FilePath, [object[]]$Arguments, [string]$WorkingDirectory, [string]$Stdout, [string]$Stderr, [switch]$Wait) {
  $params = @{
    FilePath = $FilePath
    ArgumentList = $Arguments
    WorkingDirectory = $WorkingDirectory
    RedirectStandardOutput = $Stdout
    RedirectStandardError = $Stderr
    PassThru = $true
  }
  if($Wait) { $params["Wait"] = $true }
  return Start-Process @params
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$campaign = Join-Path $ResultsRoot ("b4_" + $stamp)
New-Item -ItemType Directory -Force $campaign | Out-Null
$rows = @()
$Utf8NoBom = New-Object System.Text.UTF8Encoding -ArgumentList $false

foreach($target in $Targets) {
  Write-Host "`n=== B4 $target ==="
  $run = Join-Path $campaign $target
  $project = Join-Path $run "provengo_project"
  New-Item -ItemType Directory -Force $run | Out-Null

  $createOut = Join-Path $run "provengo_create.stdout.log"
  $createErr = Join-Path $run "provengo_create.stderr.log"
  $createProc = Start-LoggedProcess $ProvengoCommand @("--batch-mode","create",$project) $run $createOut $createErr -Wait
  if($createProc.ExitCode -ne 0) { throw "provengo create failed for $target. Inspect $createErr" }

  $specDir = Join-Path $project "spec\js"
  $disabled = Join-Path $specDir "disabled"
  New-Item -ItemType Directory -Force $disabled | Out-Null
  $hello = Join-Path $specDir "hello-world.js"
  if(Test-Path $hello) { Move-Item $hello $disabled -Force }

  $sutPortFile = Join-Path $run "sut.port"
  $proxyPortFile = Join-Path $run "proxy.port"
  $trace = Join-Path $run "http_trace.jsonl"
  $sutOut = Join-Path $run "sut.stdout.log"
  $sutErr = Join-Path $run "sut.stderr.log"
  $proxyOut = Join-Path $run "proxy.stdout.log"
  $proxyErr = Join-Path $run "proxy.stderr.log"
  $provOut = Join-Path $run "provengo.stdout.log"
  $provErr = Join-Path $run "provengo.stderr.log"

  $sutProc = $null
  $proxyProc = $null
  $provExit = -999
  try {
    $sutProc = Start-LoggedProcess $PythonCommand @($SutLauncher,"--script",$Sut,"--port","0","--port-file",$sutPortFile) $Here $sutOut $sutErr
    $sutPort = [int](Wait-TextFile $sutPortFile $sutProc 30 "B4 SUT")

    $proxyProc = Start-LoggedProcess $PythonCommand @($ProxyScript,"--listen-port","0","--target-port",$sutPort,"--trace",$trace,"--port-file",$proxyPortFile) $ProjectRoot $proxyOut $proxyErr
    $proxyPort = [int](Wait-TextFile $proxyPortFile $proxyProc 20 "B4 HTTP proxy")

    $text = (Get-Content $Template -Raw).Replace("__TARGET__",$target).Replace("__PORT__",[string]$proxyPort)
    [System.IO.File]::WriteAllText((Join-Path $specDir "netbox_b4_target.js"), $text, $Utf8NoBom)

    $provArgs = @("--no-color","run","--run-source",":random","--random-seed",$Seed,"--max-length",$MaxLength,$project)
    $provProc = Start-LoggedProcess $ProvengoCommand $provArgs $run $provOut $provErr -Wait
    $provExit = [int]$provProc.ExitCode
  }
  finally {
    Stop-B4Process $proxyProc
    Stop-B4Process $sutProc
  }

  if(-not (Test-Path $trace)) { New-Item -ItemType File $trace | Out-Null }
  $eval = Join-Path $run "semantic_evaluation.json"
  & $PythonCommand $Evaluator --target $target --trace $trace --output $eval
  $evalExit = $LASTEXITCODE
  if(-not (Test-Path $eval)) { throw "B4 evaluator produced no output for $target" }
  $obj = Get-Content $eval -Raw | ConvertFrom-Json

  $confirmed = ([bool]$obj.confirmed) -and ($provExit -eq 0) -and ($evalExit -eq 0)
  $rows += [pscustomobject]@{
    target = $target
    provengo_exit = $provExit
    confirmed = $confirmed
    http_records = [int]$obj.http_record_count
    evaluator_exit = $evalExit
    witness_lines = (@($obj.witness_trace_lines) -join ",")
  }
}

$confirmedCount = @($rows | Where-Object {$_.confirmed}).Count
$summary = [ordered]@{
  schema_version = 2
  checkpoint = "B4"
  purpose = "fourth incremental hardening checkpoint: A_LOGIC/B_LIFECYCLE/D_INTEGRITY retained, C_UNIQUENESS already V35-compliant, E_REFERENTIAL_INTEGRITY hardened to the V35 four-operation witness"
  scientific_role = "engineering regression checkpoint only; isolates the E_REFERENTIAL_INTEGRITY hardening step after B3; completes the V35 minimum witness-depth matrix but is not final A2A evidence"
  oracle = "external HTTP trace only"
  sequence_local = $true
  cross_run_stitching = $false
  seed = $Seed
  max_length = $MaxLength
  changed_from_b0 = [ordered]@{ A_LOGIC = [ordered]@{ b0_http_steps = 2; b1_http_steps = 5 }; B_LIFECYCLE = [ordered]@{ b0_http_steps = 3; b2_http_steps = 5 }; D_INTEGRITY = [ordered]@{ b0_http_steps = 3; b3_http_steps = 4 }; E_REFERENTIAL_INTEGRITY = [ordered]@{ b0_historical_class = "E_WORKFLOW"; b0_http_steps = 2; b4_http_steps = 4 } }
  changed_from_b3 = [ordered]@{ E_REFERENTIAL_INTEGRITY = [ordered]@{ b3_class = "E_WORKFLOW"; b3_http_steps = 2; b4_http_steps = 4 } }
  retained_hardened = @("A_LOGIC","B_LIFECYCLE","D_INTEGRITY")
  already_v35_compliant = @("C_UNIQUENESS")
  unchanged_from_b3 = @("A_LOGIC","B_LIFECYCLE","C_UNIQUENESS","D_INTEGRITY")
  targets = $rows
  confirmed_count = $confirmedCount
  expected_count = 5
  all_5_confirmed = ($confirmedCount -eq 5)
}
$summaryPath = Join-Path $campaign "B4_SUMMARY.json"
$summary | ConvertTo-Json -Depth 8 | Set-Content $summaryPath -Encoding UTF8

Write-Host "`n=============================="
Write-Host "B4 result: $confirmedCount/5"
$rows | Format-Table -AutoSize
Write-Host "Summary: $summaryPath"
if($confirmedCount -ne 5) { throw "B4 FAILED: expected 5/5 after hardening E_REFERENTIAL_INTEGRITY only." }
Write-Host "B4 PASS: A_LOGIC=5, B_LIFECYCLE=5, C_UNIQUENESS=2, D_INTEGRITY=4 retained; E_REFERENTIAL_INTEGRITY hardened to 4 (5/5)."
