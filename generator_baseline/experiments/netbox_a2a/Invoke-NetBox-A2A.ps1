[CmdletBinding()]
param(
  [ValidateSet("Validate","ProvengoBasic","ProvengoComplex","RESTler","EvoMaster","Collect","All")]
  [string]$Mode = "Validate",
  [string]$PythonCommand = "python",
  [string]$RestlerDll = "",
  [string]$EvoMasterJar = "",
  [double]$RestlerHours = 1.0,
  [string]$EvoMasterTime = "1h",
  [int]$Seed = 1,
  [int]$MaxLength = 5000,
  [int]$InstancesPerEntity = 5,
  [int]$InstancesPerAction = 7,
  [string]$ResultsRoot = ""
)
$ErrorActionPreference = "Stop"
$Here = $PSScriptRoot
$ProjectRoot = (Resolve-Path (Join-Path $Here "..\..")).Path
$SpecBase = Join-Path $Here "spec\netbox_uc2_runtime_openapi.json"
$Sut = Join-Path $ProjectRoot "resources\development_kit\validation_only\suts\netbox\netbox_sut_buggy.py"
$BuildScript = Join-Path $Here "build_netbox_a2a.py"
$Evaluator = Join-Path $Here "evaluate_netbox_a2a_trace.py"
$SequencePrep = Join-Path $Here "prepare_sequence_traces.py"
$ReleaseCheck = Join-Path $Here "check_v36_release.py"
$ProxyScript = Join-Path $ProjectRoot "scripts\http_trace_proxy.py"
$SutLauncher = Join-Path $ProjectRoot "scripts\run_flask_sut.py"
if ([string]::IsNullOrWhiteSpace($ResultsRoot)) {
  $ResultsRoot = Join-Path $ProjectRoot "results\netbox_a2a_v36"
} elseif (-not [System.IO.Path]::IsPathRooted($ResultsRoot)) {
  $ResultsRoot = [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot $ResultsRoot))
}
New-Item -ItemType Directory -Force $ResultsRoot | Out-Null


# Windows PowerShell 5.1 turns native stderr into non-terminating ErrorRecord objects.
# With $ErrorActionPreference="Stop", normal progress/warning output from Python,
# Provengo, RESTler, etc. can therefore abort the script before $LASTEXITCODE is
# inspected. Run native tools with Continue locally, preserve cmdlet Stop behavior,
# and decide success exclusively from the native process exit code.
function Invoke-NativeLogged {
  param(
    [Parameter(Mandatory=$true)][string]$Command,
    [Parameter(Mandatory=$false)][object[]]$Arguments=@(),
    [Parameter(Mandatory=$true)][string]$LogPath,
    [switch]$Show
  )
  $savedPreference=$ErrorActionPreference
  try {
    $ErrorActionPreference="Continue"
    if($Show){
      & $Command @Arguments *>&1 | Tee-Object -FilePath $LogPath | Out-Host
    } else {
      & $Command @Arguments *> $LogPath
    }
    $nativeExitCode=$LASTEXITCODE
  } finally {
    $ErrorActionPreference=$savedPreference
  }
  return [int]$nativeExitCode
}

function Wait-TextFile([string]$Path, $Process, [int]$TimeoutSeconds, [string]$What) {
  $deadline=(Get-Date).AddSeconds($TimeoutSeconds)
  while((Get-Date)-lt $deadline) {
    if($Process -and $Process.HasExited){ throw "$What exited during startup; inspect stderr." }
    if(Test-Path $Path){ $t=(Get-Content $Path -Raw).Trim(); if($t){ return $t } }
    Start-Sleep -Milliseconds 100
  }
  throw "$What did not publish readiness metadata: $Path"
}
function Sha([string]$Path) {
  if(-not(Test-Path $Path)){ return $null }
  return (Get-FileHash -Algorithm SHA256 $Path).Hash.ToLowerInvariant()
}
function New-RunDir([string]$Tool) {
  $stamp=Get-Date -Format "yyyyMMdd_HHmmss_fff"
  $suffix=([Guid]::NewGuid().ToString("N")).Substring(0,8)
  $dir=Join-Path $ResultsRoot "${Tool}_${stamp}_${suffix}"
  New-Item -ItemType Directory -Force $dir | Out-Null
  return $dir
}
function Start-HttpStack([string]$RunDir) {
  $sutPortFile=Join-Path $RunDir "sut.port"
  $proxyPortFile=Join-Path $RunDir "proxy.port"
  $sutOut=Join-Path $RunDir "sut.stdout.log"
  $sutErr=Join-Path $RunDir "sut.stderr.log"
  $proxyOut=Join-Path $RunDir "proxy.stdout.log"
  $proxyErr=Join-Path $RunDir "proxy.stderr.log"
  $trace=Join-Path $RunDir "http_trace.jsonl"
  $groundTruth=Join-Path $RunDir "sut_ground_truth.jsonl"

  $gtName="NETBOX_V35_GROUND_TRUTH_LOG"
  $hadOldGt=Test-Path ("Env:" + $gtName)
  $oldGt=[Environment]::GetEnvironmentVariable($gtName,"Process")
  try {
    [Environment]::SetEnvironmentVariable($gtName,$groundTruth,"Process")
    $sutProc=Start-Process -FilePath $PythonCommand -ArgumentList @($SutLauncher,"--script",$Sut,"--port","0","--port-file",$sutPortFile) `
      -WorkingDirectory (Split-Path $Sut -Parent) -RedirectStandardOutput $sutOut -RedirectStandardError $sutErr -PassThru
  } finally {
    if($hadOldGt){
      [Environment]::SetEnvironmentVariable($gtName,$oldGt,"Process")
    } else {
      [Environment]::SetEnvironmentVariable($gtName,$null,"Process")
    }
  }

  $sutPort=[int](Wait-TextFile $sutPortFile $sutProc 30 "NetBox SUT")
  $proxyProc=Start-Process -FilePath $PythonCommand -ArgumentList @($ProxyScript,"--listen-port","0","--target-port",$sutPort,"--trace",$trace,"--port-file",$proxyPortFile) `
    -RedirectStandardOutput $proxyOut -RedirectStandardError $proxyErr -PassThru
  $proxyPort=[int](Wait-TextFile $proxyPortFile $proxyProc 20 "HTTP trace proxy")
  return [pscustomobject]@{Sut=$sutProc;Proxy=$proxyProc;SutPort=$sutPort;ProxyPort=$proxyPort;Trace=$trace;GroundTruth=$groundTruth}
}
function Stop-HttpStack($Stack) {
  if($Stack.Proxy -and -not $Stack.Proxy.HasExited){ Stop-Process -Id $Stack.Proxy.Id -Force -ErrorAction SilentlyContinue }
  if($Stack.Sut -and -not $Stack.Sut.HasExited){ Stop-Process -Id $Stack.Sut.Id -Force -ErrorAction SilentlyContinue }
}
function Prepare-Sequences([string]$RunDir,[string]$Trace,[string]$Tool) {
  if(-not(Test-Path $Trace)){ New-Item -ItemType File $Trace | Out-Null }
  $seqDir=Join-Path $RunDir "sequence_traces"
  $args=@($SequencePrep,"--tool",$Tool.ToLowerInvariant(),"--run-dir",$RunDir,"--campaign-trace",$Trace,"--output-dir",$seqDir,"--python",$PythonCommand)
  if($Tool -eq "EvoMaster") {
    $args += @("--sut",$Sut,"--sut-launcher",$SutLauncher,"--proxy",$ProxyScript)
  }
  $nativeExit=Invoke-NativeLogged -Command $PythonCommand -Arguments $args -LogPath (Join-Path $RunDir "sequence_preparation.log")
  if($nativeExit-ne 0){ throw "V36 sequence preparation failed: $RunDir" }
  return $seqDir
}
function Evaluate([string]$RunDir,[string]$Trace,[string]$SequenceDir,[string]$GroundTruth,[string]$Tool,[string]$NativeLog) {
  $out=Join-Path $RunDir "semantic_evaluation.json"
  $args=@($Evaluator,"--sequence-dir",$SequenceDir,"--campaign-trace",$Trace,"--tool",$Tool,"--run-dir",$RunDir,"--output",$out)
  if($GroundTruth){ $args += @("--ground-truth-log",$GroundTruth) }
  if($NativeLog -and (Test-Path $NativeLog)){ $args += @("--native-log",$NativeLog) }
  $nativeExit=Invoke-NativeLogged -Command $PythonCommand -Arguments $args -LogPath (Join-Path $RunDir "evaluator.log")
  if($nativeExit-ne 0){ throw "A2A evaluator failed: $RunDir" }
  return (Get-Content $out -Raw | ConvertFrom-Json)
}
function Write-Metadata([string]$RunDir,[string]$Tool,[string]$InputMode,$Stack,$Semantic,[hashtable]$Extra) {
  $meta=[ordered]@{
    schema_version=2; artifact_version="v36"; experiment="netbox_a2a";
    tool=$Tool; input_mode=$InputMode; seed=$Seed;
    api_projection_operation_count=12;
    sut_sha256=Sha $Sut; openapi_sha256=$Extra.openapi_sha256;
    sut_port=$Stack.SutPort; proxy_port=$Stack.ProxyPort;
    oracle="sequence-local external HTTP evidence; hidden SUT activation markers diagnostic only; campaign trace diagnostic only";
    internal_sut_events_used_as_evidence=$false;
    hidden_ground_truth_used_for_official_score=$false;
    hidden_ground_truth_exposed_to_tool=$false;
    hidden_triggered_classes=$Semantic.hidden_ground_truth.triggered_classes;
    hidden_triggered_score=$Semantic.hidden_ground_truth.triggered_score;
    ground_truth_consistency=$Semantic.ground_truth_consistency;
    analyst_authored_scenario_input=$false;
    native_tool_faults=$Semantic.native_tool_faults;
    sequence_confirmed_semantic_classes=$Semantic.sequence_confirmed_semantic_classes;
    sequence_confirmed_semantic_class_count=$Semantic.sequence_confirmed_semantic_class_count;
    sequence_confirmed_score=$Semantic.sequence_confirmed_score;
    campaign_reachability_classes=$Semantic.campaign_reachability_classes;
    campaign_reachability_class_count=$Semantic.campaign_reachability_class_count;
    evaluated_sequence_count=$Semantic.evaluated_sequence_count;
    confirmed_classes=$Semantic.sequence_confirmed_semantic_classes;
    semantic_class_count=$Semantic.sequence_confirmed_semantic_class_count;
    all_A_to_E_confirmed=$Semantic.all_A_to_E_sequence_confirmed;
    note="V36 keeps the V35 NetBox fault semantics and V29 OpenAPI unchanged, while fixing generator/runtime semantic binding for nested reference objects and same-entity concurrent creation. Hidden markers remain diagnostic only and never affect official scoring or tool search."
  }
  foreach($k in $Extra.Keys){$meta[$k]=$Extra[$k]}
  $meta|ConvertTo-Json -Depth 10|Set-Content (Join-Path $RunDir "run_metadata.json") -Encoding UTF8
}
function Validate-A2A {
  foreach($p in @($SpecBase,$Sut,$BuildScript,$Evaluator,$ProxyScript,$SutLauncher,(Join-Path $Here "derive_complex_stories.py"),(Join-Path $Here "validate_structural_projection.py"),$SequencePrep,$ReleaseCheck)){if(-not(Test-Path $p)){throw "Missing: $p"}}
  $temp=Join-Path $ResultsRoot "validation_build"
  if(Test-Path $temp){Remove-Item $temp -Recurse -Force}
  New-Item -ItemType Directory -Force $temp | Out-Null
  $old=$env:PYTHONPATH; $env:PYTHONPATH=$ProjectRoot
  try {
    $buildArgs=@($BuildScript,"--output",$temp,"--seed",$Seed,"--instances-per-entity",$InstancesPerEntity,"--instances-per-action",$InstancesPerAction)
    $buildExit=Invoke-NativeLogged -Command $PythonCommand -Arguments $buildArgs -LogPath (Join-Path $temp "build_validation.log")
  } finally { $env:PYTHONPATH=$old }
  if($buildExit-ne 0){throw "A2A build/validation failed; inspect $temp\build_validation.log"}
  foreach($f in @("netbox_a2a_openapi.json","interfaces.netbox_a2a.js","stories.netbox_a2a.js","complex_stories.netbox_a2a.js")){ if(-not(Test-Path (Join-Path $temp $f))){throw "Missing generated A2A file: $f"} }
  $testArgs=@("-m","unittest","discover","-s",(Join-Path $Here "tests"))
  $testExit=Invoke-NativeLogged -Command $PythonCommand -Arguments $testArgs -LogPath (Join-Path $temp "v36_unit_tests.log")
  if($testExit-ne 0){throw "V36 unit tests failed; inspect $temp\v36_unit_tests.log"}
  $specHash=Sha $SpecBase
  if($specHash -ne "dae055dc0eac76045389286820719f4a8b1fbd3be7d7897c50ba87cdd01d2060"){throw "V31 OpenAPI hash guard failed: $specHash"}
  $releaseExit=Invoke-NativeLogged -Command $PythonCommand -Arguments @($ReleaseCheck) -LogPath (Join-Path $temp "v36_release_selftest.log")
  if($releaseExit-ne 0){throw "V36 release self-test failed; inspect $temp\v36_release_selftest.log"}
  Write-Host "V36 VALIDATION PASS: OpenAPI and V35 benchmark semantics frozen; nested-reference binding, per-story runtime-ID propagation, intermediate 5/5/2/4/4 oracle, hidden-ground-truth consistency and deterministic rebuild PASS"
}
function Run-Provengo([bool]$Complex) {
  $label=if($Complex){"provengo_complex"}else{"provengo_basic"}
  $runDir=New-RunDir $label
  $model=Join-Path $runDir "model"; $project=Join-Path $runDir "provengo_project"
  $old=$env:PYTHONPATH; $env:PYTHONPATH=$ProjectRoot
  try {
    $buildArgs=@($BuildScript,"--output",$model,"--seed",$Seed,"--instances-per-entity",$InstancesPerEntity,"--instances-per-action",$InstancesPerAction)
    $buildExit=Invoke-NativeLogged -Command $PythonCommand -Arguments $buildArgs -LogPath (Join-Path $runDir "build.log")
  } finally { $env:PYTHONPATH=$old }
  if($buildExit-ne 0){throw "A2A build failed"}
  $createExit=Invoke-NativeLogged -Command "provengo" -Arguments @("--batch-mode","create",$project) -LogPath (Join-Path $runDir "provengo_create.log")
  if($createExit-ne 0){throw "provengo create failed"}
  $specDir=Join-Path $project "spec\js"; $disabled=Join-Path $specDir "disabled"; New-Item -ItemType Directory -Force $disabled|Out-Null
  $hello=Join-Path $specDir "hello-world.js"; if(Test-Path $hello){Move-Item $hello $disabled}
  Copy-Item (Join-Path $model "interfaces.netbox_a2a.js") $specDir
  if($Complex){Copy-Item (Join-Path $model "complex_stories.netbox_a2a.js") $specDir}
  else {Copy-Item (Join-Path $model "stories.netbox_a2a.js") $specDir}
  $stack=Start-HttpStack $runDir
  try {
    $runtime=Join-Path $specDir "interfaces.netbox_a2a.js"
    $txt=Get-Content $runtime -Raw
    $txt=$txt -replace "var port = \(typeof port !== 'undefined'\) \? port : \d+;", "var port = (typeof port !== 'undefined') ? port : $($stack.ProxyPort);"
    Set-Content $runtime $txt -Encoding UTF8
    $runArgs=@("--no-color","run","--run-source",":random","--random-seed",$Seed,"--max-length",$MaxLength,$project)
    $exit=Invoke-NativeLogged -Command "provengo" -Arguments $runArgs -LogPath (Join-Path $runDir "provengo_run.log") -Show
  } finally { Stop-HttpStack $stack }
  $seqDir=Prepare-Sequences $runDir $stack.Trace "Provengo"
  $sem=Evaluate $runDir $stack.Trace $seqDir $stack.GroundTruth "Provengo" (Join-Path $runDir "provengo_run.log")
  $inputMode = if($Complex){"openapi_only_complex_derived"}else{"openapi_only_basic_generated"}
  Write-Metadata $runDir "Provengo" $inputMode $stack $sem @{openapi_sha256=Sha (Join-Path $model "netbox_a2a_openapi.json");provengo_exit_code=$exit;max_length=$MaxLength;instances_per_entity=$InstancesPerEntity;instances_per_action=$InstancesPerAction}
  Write-Host "$label complete: $runDir; official A-E=$($sem.sequence_confirmed_score); hidden triggered=$($sem.hidden_ground_truth.triggered_score); campaign diagnostic=$($sem.campaign_reachability_class_count)/5"
}
function Run-RESTler {
  if(-not $RestlerDll){throw "Pass -RestlerDll <path-to-Restler.dll>"}; if(-not(Test-Path $RestlerDll)){throw "RESTler DLL not found"}
  $runDir=New-RunDir "restler"; $model=Join-Path $runDir "model"; $compile=Join-Path $runDir "compile"; $fuzz=Join-Path $runDir "fuzz"; New-Item -ItemType Directory -Force $compile,$fuzz|Out-Null
  $old=$env:PYTHONPATH; $env:PYTHONPATH=$ProjectRoot; try { $buildArgs=@($BuildScript,"--output",$model,"--seed",$Seed,"--instances-per-entity",$InstancesPerEntity,"--instances-per-action",$InstancesPerAction); $buildExit=Invoke-NativeLogged -Command $PythonCommand -Arguments $buildArgs -LogPath (Join-Path $runDir "build.log") } finally { $env:PYTHONPATH=$old }; if($buildExit-ne 0){throw "A2A build failed"}; $spec=Join-Path $model "netbox_a2a_openapi.json"
  Push-Location $compile
  try { $compileExit=Invoke-NativeLogged -Command "dotnet" -Arguments @($RestlerDll,"compile","--api_spec",$spec) -LogPath (Join-Path $runDir "restler_compile.log") -Show; if($compileExit-ne 0){throw "RESTler compile failed"} }
  finally {Pop-Location}
  $c=Join-Path $compile "Compile"; $stack=Start-HttpStack $runDir
  try {
    Push-Location $fuzz
    try { $fuzzArgs=@($RestlerDll,"fuzz","--grammar_file",(Join-Path $c "grammar.py"),"--dictionary_file",(Join-Path $c "dict.json"),"--settings",(Join-Path $c "engine_settings.json"),"--target_ip","127.0.0.1","--target_port",$stack.ProxyPort,"--no_ssl","--time_budget",$RestlerHours); $exit=Invoke-NativeLogged -Command "dotnet" -Arguments $fuzzArgs -LogPath (Join-Path $runDir "restler_fuzz.log") -Show }
    finally {Pop-Location}
  } finally {Stop-HttpStack $stack}
  $seqDir=Prepare-Sequences $runDir $stack.Trace "RESTler"
  $sem=Evaluate $runDir $stack.Trace $seqDir $stack.GroundTruth "RESTler" (Join-Path $runDir "restler_fuzz.log")
  Write-Metadata $runDir "RESTler" "openapi_only" $stack $sem @{openapi_sha256=Sha $spec;restler_exit_code=$exit;time_budget_hours=$RestlerHours;restler_dll_sha256=Sha $RestlerDll}
  Write-Host "RESTler complete: $runDir; official A-E=$($sem.sequence_confirmed_score); hidden triggered=$($sem.hidden_ground_truth.triggered_score); campaign diagnostic=$($sem.campaign_reachability_class_count)/5"
}
function Run-EvoMaster {
  if(-not $EvoMasterJar){throw "Pass -EvoMasterJar <path-to-evomaster.jar>"}; if(-not(Test-Path $EvoMasterJar)){throw "EvoMaster JAR not found"}
  $runDir=New-RunDir "evomaster"; $model=Join-Path $runDir "model"; $old=$env:PYTHONPATH; $env:PYTHONPATH=$ProjectRoot; try { $buildArgs=@($BuildScript,"--output",$model,"--seed",$Seed,"--instances-per-entity",$InstancesPerEntity,"--instances-per-action",$InstancesPerAction); $buildExit=Invoke-NativeLogged -Command $PythonCommand -Arguments $buildArgs -LogPath (Join-Path $runDir "build.log") } finally { $env:PYTHONPATH=$old }; if($buildExit-ne 0){throw "A2A build failed"}; $spec=Join-Path $model "netbox_a2a_openapi.json"; $stack=Start-HttpStack $runDir
  try {
    $args=@("-jar",$EvoMasterJar,"--blackBox","true","--problemType","REST","--schema",$spec,"--base","http://127.0.0.1:$($stack.ProxyPort)","--maxTime",$EvoMasterTime,"--seed","$Seed","--outputFolder",$runDir,"--outputFormat","PYTHON_UNITTEST","--outputFilePrefix","EvoMaster","--outputFileSuffix","Test","--writeWFCReport","true","--ratePerMinute","1200","--showProgress","false")
    $p=Start-Process java -WorkingDirectory $runDir -ArgumentList $args -RedirectStandardOutput (Join-Path $runDir "evomaster.stdout.log") -RedirectStandardError (Join-Path $runDir "evomaster.stderr.log") -Wait -PassThru
    $exit=$p.ExitCode
  } finally {Stop-HttpStack $stack}
  $seqDir=Prepare-Sequences $runDir $stack.Trace "EvoMaster"
  $sem=Evaluate $runDir $stack.Trace $seqDir $stack.GroundTruth "EvoMaster" (Join-Path $runDir "evomaster.stdout.log")
  Write-Metadata $runDir "EvoMaster" "openapi_only" $stack $sem @{openapi_sha256=Sha $spec;evomaster_exit_code=$exit;max_time=$EvoMasterTime;evomaster_jar_sha256=Sha $EvoMasterJar;evomaster_config_sha256=Sha (Join-Path $runDir "em.yaml") }
  Write-Host "EvoMaster complete: $runDir; official A-E=$($sem.sequence_confirmed_score); hidden triggered=$($sem.hidden_ground_truth.triggered_score); campaign diagnostic=$($sem.campaign_reachability_class_count)/5"
}
function Collect-A2A {
  $collectArgs=@((Join-Path $Here "collect_a2a_results.py"),"--results-root",$ResultsRoot,"--output",(Join-Path $ResultsRoot "a2a_summary.json"))
  $collectExit=Invoke-NativeLogged -Command $PythonCommand -Arguments $collectArgs -LogPath (Join-Path $ResultsRoot "collection.log") -Show
  if($collectExit-ne 0){throw "A2A collection failed"}
}

switch($Mode){
  "Validate" {Validate-A2A}
  "ProvengoComplex" {Validate-A2A;Run-Provengo $true;Collect-A2A}
  "ProvengoBasic" {Validate-A2A;Run-Provengo $false;Collect-A2A}
  "RESTler" {Validate-A2A;Run-RESTler;Collect-A2A}
  "EvoMaster" {Validate-A2A;Run-EvoMaster;Collect-A2A}
  "Collect" {Collect-A2A}
  "All" {Validate-A2A;Run-Provengo $false;Run-Provengo $true;Run-RESTler;Run-EvoMaster;Collect-A2A}
}
