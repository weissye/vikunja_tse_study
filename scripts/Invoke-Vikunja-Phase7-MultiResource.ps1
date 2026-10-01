param(
 [string]$Root="",[string]$Target="http://127.0.0.1:3456",[int]$ProxyPort=3457,
 [int]$Seed=20261701,[int]$Tasks=6,[int]$MaxLength=30000,[string]$Model=""
)
$ErrorActionPreference="Stop"
$ScriptDir=if($PSScriptRoot){$PSScriptRoot}else{Split-Path -Parent $MyInvocation.MyCommand.Path}
if([string]::IsNullOrWhiteSpace($Root)){$Root=(Resolve-Path(Join-Path $ScriptDir "..")).Path}else{$Root=(Resolve-Path $Root).Path}
if([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN)){throw "Set VIKUNJA_API_TOKEN in this PowerShell window."}
foreach($c in @("python","provengo","node")){if(-not (Get-Command $c -ErrorAction SilentlyContinue)){throw "$c was not found on PATH."}}
$labels=[Math]::Max(2,[Math]::Min(4,[Math]::Floor($Tasks/2)));$comments=[Math]::Max(2,[Math]::Min(4,$Tasks))
if([string]::IsNullOrWhiteSpace($Model)){$Model=Join-Path $Root "phase7\generated-multi-resource-interleaving"}elseif(-not [IO.Path]::IsPathRooted($Model)){$Model=Join-Path $Root $Model}
$Model=(Resolve-Path $Model).Path;$interfaces=Join-Path $Model "interfaces.vikunja.js";$stories=Join-Path $Model "stories.vikunja.js";$oracleManifest=Join-Path $Model "oracle-manifest.json"
$proxyScript=Join-Path $Root "scripts\vikunja_research_proxy.py";$probe=Join-Path $Root "scripts\probe_vikunja_multi_resource_deletions.py";$evaluator=Join-Path $Root "scripts\evaluate_vikunja_multi_resource.py"
$taskVerifier=Join-Path $Root "scripts\validate_task_verifiers.py"
foreach($p in @($interfaces,$stories,$oracleManifest,$proxyScript,$probe,$evaluator,$taskVerifier)){if(-not(Test-Path $p)){throw "Required file is missing: $p"}}
& node --check $stories;if($LASTEXITCODE -ne 0){throw "Generated stories failed JavaScript syntax validation."}
try{$info=Invoke-RestMethod -Uri "$Target/api/v2/info" -TimeoutSec 10}catch{throw "Vikunja is not reachable at $Target."}
$stamp=Get-Date -Format "yyyyMMdd_HHmmss_fff";$run=Join-Path $Root "runs\phase7-multi-resource-seed-$Seed-$stamp";$project=Join-Path $run "provengo_project";$trace=Join-Path $run "http-trace.jsonl"
New-Item -ItemType Directory -Force $run|Out-Null
& provengo --batch-mode create $project *>&1|Set-Content(Join-Path $run "provengo-create.log");if($LASTEXITCODE -ne 0){throw "provengo create failed."}
$spec=Join-Path $project "spec\js";$disabled=Join-Path $spec "disabled";New-Item -ItemType Directory -Force $disabled|Out-Null
$hello=Join-Path $spec "hello-world.js";if(Test-Path $hello){Move-Item $hello $disabled -Force};Copy-Item $interfaces,$stories $spec -Force
$proxyOut=Join-Path $run "proxy.stdout.log";$proxyErr=Join-Path $run "proxy.stderr.log";$px=$null;$provengoExit=$null;$probeExit=$null
try{
 $px=Start-Process python -ArgumentList @($proxyScript,"--target",$Target,"--listen-port",$ProxyPort,"--trace",$trace) -WorkingDirectory $Root -RedirectStandardOutput $proxyOut -RedirectStandardError $proxyErr -PassThru
 $ready=$false;$deadline=(Get-Date).AddSeconds(20);while((Get-Date) -lt $deadline){if($px.HasExited){throw "Proxy exited."};try{Invoke-RestMethod -Uri "http://127.0.0.1:$ProxyPort/info" -TimeoutSec 2|Out-Null;$ready=$true;break}catch{Start-Sleep -Milliseconds 250}}
 if(-not $ready){throw "Proxy did not become ready."}
 & provengo --no-color run --run-source :random --random-seed $Seed --max-length $MaxLength $project *>&1|Tee-Object(Join-Path $run "provengo-run.log");$provengoExit=$LASTEXITCODE
 if($provengoExit -eq 0){& python $probe --trace $trace --base-url "http://127.0.0.1:$ProxyPort" --output(Join-Path $run "post-delete-probe.json");$probeExit=$LASTEXITCODE}
}finally{if($px -and -not $px.HasExited){Stop-Process -Id $px.Id -Force -ErrorAction SilentlyContinue}}
$evaluation=Join-Path $run "phase7-multi-resource-evaluation.json";& python $evaluator --trace $trace --tasks $Tasks --labels $labels --comments $comments --output $evaluation;$evaluationExit=$LASTEXITCODE
$taskVerification=Join-Path $run "task-verifier-evaluation.json";& python $taskVerifier --trace $trace --manifest $oracleManifest --output $taskVerification;$taskVerifierExit=$LASTEXITCODE
Copy-Item $oracleManifest (Join-Path $run "oracle-manifest.json") -Force
$meta=[ordered]@{experiment="vikunja-phase7-multi-resource";profile="multi-resource-interleaving";created_utc=(Get-Date).ToUniversalTime().ToString("o");vikunja_version=$info.version;seed=$Seed;tasks=$Tasks;labels=$labels;comments=$comments;max_length=$MaxLength;provengo_exit_code=$provengoExit;deletion_probe_exit_code=$probeExit;evaluation_exit_code=$evaluationExit;task_verifier_exit_code=$taskVerifierExit;openapi_sha256=(Get-FileHash(Join-Path $Root "phase7\vikunja-multi-resource-openapi.json") -Algorithm SHA256).Hash.ToLowerInvariant();interfaces_sha256=(Get-FileHash $interfaces -Algorithm SHA256).Hash.ToLowerInvariant();stories_sha256=(Get-FileHash $stories -Algorithm SHA256).Hash.ToLowerInvariant();oracle_manifest_sha256=(Get-FileHash $oracleManifest -Algorithm SHA256).Hash.ToLowerInvariant()}
$meta|ConvertTo-Json -Depth 5|Set-Content(Join-Path $run "run-metadata.json") -Encoding UTF8
$manifest=foreach($f in Get-ChildItem $run -Recurse -File|Where-Object Name -ne "SHA256SUMS.csv"){[pscustomobject]@{Path=$f.FullName.Substring($run.Length+1).Replace("\","/");SHA256=(Get-FileHash $f.FullName -Algorithm SHA256).Hash.ToLowerInvariant();SizeBytes=$f.Length}}
$manifest|Sort-Object Path|Export-Csv(Join-Path $run "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8
Write-Host "Run directory: $run";if(Test-Path $evaluation){Get-Content $evaluation}
if($provengoExit -ne 0 -or $probeExit -ne 0 -or $evaluationExit -ne 0 -or $taskVerifierExit -ne 0){throw "Phase 7 or Increment-1 Task verification failed. Preserve the run directory."}
Write-Host "VIKUNJA_PHASE7_MULTI_RESOURCE_PASS"
