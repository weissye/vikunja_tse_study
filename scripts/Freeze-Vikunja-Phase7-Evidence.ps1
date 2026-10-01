param(
 [string]$Root="",[int[]]$Seeds=@(20261701,20261702,20261703,20261704),
 [int]$Tasks=6,[int]$Labels=3,[int]$Comments=4
)
$ErrorActionPreference="Stop"
$ScriptDir=if($PSScriptRoot){$PSScriptRoot}else{Split-Path -Parent $MyInvocation.MyCommand.Path}
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path }
else { $Root = (Resolve-Path $Root).Path }

function Test-Manifest([IO.DirectoryInfo]$Run){
 $p = Join-Path $Run.FullName "SHA256SUMS.csv"; if (-not (Test-Path $p)) { return $false }
 foreach ($e in Import-Csv $p) {
  $f = Join-Path $Run.FullName ($e.Path -replace '/', '\')
  if (-not (Test-Path $f)) { return $false }
  if ((Get-FileHash $f -Algorithm SHA256).Hash.ToLowerInvariant() -ne $e.SHA256.ToLowerInvariant()) { return $false }
 }
 return $true
}
function Test-Run([IO.DirectoryInfo]$Run,[int]$Seed){
 $ep=Join-Path $Run.FullName "phase7-multi-resource-evaluation.json";$mp=Join-Path $Run.FullName "run-metadata.json";$pp=Join-Path $Run.FullName "post-delete-probe.json"
 foreach ($p in @($ep,$mp,$pp,(Join-Path $Run.FullName "http-trace.jsonl"),(Join-Path $Run.FullName "provengo-run.log"))) { if (-not (Test-Path $p)) { return $false } }
 try{$e=Get-Content $ep -Raw|ConvertFrom-Json;$m=Get-Content $mp -Raw|ConvertFrom-Json;$probe=Get-Content $pp -Raw|ConvertFrom-Json}catch{return $false}
 return ($e.profile -eq "multi-resource-interleaving" -and
  $e.phase7_passed -eq $true -and $e.passed_count -eq 16 -and $e.required_count -eq 16 -and
  @($e.anomalies).Count -eq 0 -and
  $e.trace_recovery.canonical_evidence_eligible -eq $true -and $e.trace_recovery.used -eq $false -and
  $m.profile -eq "multi-resource-interleaving" -and $m.seed -eq $Seed -and
  $m.tasks -eq $Tasks -and $m.labels -eq $Labels -and $m.comments -eq $Comments -and
  $m.provengo_exit_code -eq 0 -and $m.deletion_probe_exit_code -eq 0 -and $m.evaluation_exit_code -eq 0 -and
  $probe.all_deletions_observable -eq $true -and (Test-Manifest $Run))
}

$selected=@();$excluded=@()
foreach($seed in $Seeds){
 $candidates=@(Get-ChildItem(Join-Path $Root "runs") -Directory -Filter "phase7-multi-resource-seed-$seed-*"|Sort-Object LastWriteTime -Descending)
 $valid=@();foreach($c in $candidates){if(Test-Run $c $seed){$valid+=$c}else{$excluded+=$c.Name}}
 if ($valid.Count -lt 1) { throw "No valid canonical Phase 7 run found for seed $seed." }
 $selected += $valid[0]; if ($valid.Count -gt 1) { $excluded += @($valid | Select-Object -Skip 1 | ForEach-Object Name) }
}
$triples=foreach($r in $selected){$m=Get-Content(Join-Path $r.FullName "run-metadata.json") -Raw|ConvertFrom-Json;"$($m.openapi_sha256)|$($m.interfaces_sha256)|$($m.stories_sha256)"}
if (@($triples | Select-Object -Unique).Count -ne 1) { throw "Selected runs do not use one identical OpenAPI/interfaces/stories model." }

$stamp=Get-Date -Format "yyyyMMdd_HHmmss";$freeze=Join-Path $Root "evidence\phase7-multi-resource-evidence-$stamp";$runsTarget=Join-Path $freeze "runs";$modelTarget=Join-Path $freeze "model";$toolsTarget=Join-Path $freeze "tools"
New-Item -ItemType Directory -Force $runsTarget,$modelTarget,$toolsTarget|Out-Null
$runFiles=@("http-trace.jsonl","phase7-multi-resource-evaluation.json","post-delete-probe.json","provengo-create.log","provengo-run.log","proxy.stderr.log","proxy.stdout.log","run-metadata.json","SHA256SUMS.csv")
foreach ($r in $selected) {
 $t = Join-Path $runsTarget $r.Name; New-Item -ItemType Directory -Force $t | Out-Null
 foreach ($n in $runFiles) { $s = Join-Path $r.FullName $n; if (Test-Path $s) { $dn = if ($n -eq "SHA256SUMS.csv") { "source-run-SHA256SUMS.csv" } else { $n }; Copy-Item $s (Join-Path $t $dn) } }
}
Copy-Item (Join-Path $Root "phase7\vikunja-multi-resource-openapi.json") $modelTarget
Copy-Item (Join-Path $Root "phase7\multi-resource-projection-manifest.json") $modelTarget
Copy-Item (Join-Path $Root "phase7\static-validation.json") $modelTarget
Copy-Item (Join-Path $Root "phase7\generated-multi-resource-interleaving") (Join-Path $modelTarget "generated-multi-resource-interleaving") -Recurse
foreach ($n in @("Invoke-Vikunja-Phase7-MultiResource.ps1","Prepare-Vikunja-Phase7.ps1","evaluate_vikunja_multi_resource.py","probe_vikunja_multi_resource_deletions.py","analyze_vikunja_bp_schedules.py","vikunja_research_proxy.py","build_vikunja_core_projection.py")) { Copy-Item (Join-Path $Root "scripts\$n") $toolsTarget }

$comparison=Join-Path $freeze "schedule-comparison.json";$aa=@((Join-Path $Root "scripts\analyze_vikunja_bp_schedules.py"));foreach($r in $selected){$aa+=@("--run",$r.FullName)};$aa+=@("--output",$comparison,"--require-variation");& python @aa;if($LASTEXITCODE -ne 0){throw "Phase 7 schedule analysis failed."}
$sc=Get-Content $comparison -Raw|ConvertFrom-Json
if ($sc.distinct_intent_schedules -ne $selected.Count -or $sc.distinct_permit_schedules -ne $selected.Count) { throw "Expected four distinct Intent and Permit schedules." }
$summary=[ordered]@{evidence_type="Vikunja Phase 7 multi-resource OpenAPI-to-SBT/BP interleaving";profile="multi-resource-interleaving";created_utc=(Get-Date).ToUniversalTime().ToString("o");seeds=$Seeds;expected=@{tasks=$Tasks;labels=$Labels;comments=$Comments};run_count=$selected.Count;checks_per_run=16;all_runs_passed=$true;distinct_intent_schedules=$sc.distinct_intent_schedules;distinct_permit_schedules=$sc.distinct_permit_schedules;selected_run_directories=@($selected|ForEach-Object Name);excluded_run_directories=@($excluded|Select-Object -Unique);model_hash_triple=$triples[0];interpretation="Four passing executions of one generated multi-resource model exercised distinct BP schedules. No semantic anomaly was observed and no Vikunja product bug is claimed."}
$summary|ConvertTo-Json -Depth 7|Set-Content(Join-Path $freeze "evidence-summary.json") -Encoding UTF8
@" 
Vikunja Phase 7 multi-resource evidence.
Four canonical runs, each passing 16/16 external HTTP-trace checks.
The model is generated from a fixed 29-operation OpenAPI projection and uses
independent Project, Task, Label, Comment, and Relation BP stories.
Excluded runs are recorded in evidence-summary.json. No product bug is claimed.
"@|Set-Content(Join-Path $freeze "README.txt") -Encoding UTF8
$manifest = foreach ($f in Get-ChildItem $freeze -Recurse -File | Where-Object Name -ne "SHA256SUMS.csv") {
 [pscustomobject]@{
  Path = $f.FullName.Substring($freeze.Length + 1).Replace("\", "/")
  SHA256 = (Get-FileHash $f.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  SizeBytes = $f.Length
 }
}
$manifest|Sort-Object Path|Export-Csv(Join-Path $freeze "SHA256SUMS.csv") -NoTypeInformation -Encoding UTF8
$zip="$freeze.zip";Compress-Archive -Path(Join-Path $freeze "*") -DestinationPath $zip -CompressionLevel Optimal;$hash=(Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Host "PHASE7_EVIDENCE_FREEZE_PASS";Write-Host "Selected runs:";@($selected|ForEach-Object{"  $($_.Name)"})|Write-Host;Write-Host "Excluded runs:";@($excluded|Select-Object -Unique|ForEach-Object{"  $_"})|Write-Host;Write-Host "Distinct Intent schedules: $($sc.distinct_intent_schedules)/$($selected.Count)";Write-Host "Distinct Permit schedules: $($sc.distinct_permit_schedules)/$($selected.Count)";Write-Host "Evidence directory: $freeze";Write-Host "Evidence ZIP:       $zip";Write-Host "ZIP SHA256:         $hash"
