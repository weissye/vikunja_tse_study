param(
 [string]$Root="",[int[]]$Seeds=@(20261901,20261902,20261903,20261904),
 [int]$Tasks=6
)
$ErrorActionPreference="Stop"
$ScriptDir=if($PSScriptRoot){$PSScriptRoot}else{Split-Path -Parent $MyInvocation.MyCommand.Path}
if([string]::IsNullOrWhiteSpace($Root)){$Root=(Resolve-Path(Join-Path $ScriptDir "..")).Path}else{$Root=(Resolve-Path $Root).Path}
$Labels=[Math]::Max(2,[Math]::Min(4,[Math]::Floor($Tasks/2)));$Comments=[Math]::Max(2,[Math]::Min(4,$Tasks))
$RunsRoot=Join-Path $Root "runs";$ModelRoot=Join-Path $Root "phase9-verified-resources";$GeneratedRoot=Join-Path $ModelRoot "generated-multi-resource-verified-resources"

function Test-Manifest([IO.DirectoryInfo]$Run){
 $p=Join-Path $Run.FullName "SHA256SUMS.csv";if(-not(Test-Path $p)){return $false}
 try{foreach($e in Import-Csv $p){$f=Join-Path $Run.FullName($e.Path-replace'/','\');if(-not(Test-Path $f)){return $false};if((Get-FileHash $f -Algorithm SHA256).Hash.ToLowerInvariant() -ne $e.SHA256.ToLowerInvariant()){return $false}}}catch{return $false};return $true
}
function Test-Oracle($Summary,[int]$Expected){
 return($null -ne $Summary -and $Summary.status -eq "PASS" -and $Summary.witness_count -eq $Expected -and $Summary.expected_witness_count -eq $Expected -and $Summary.missing_witness_count -eq 0 -and $Summary.counts.PASS -eq $Expected -and $Summary.counts.VIOLATED -eq 0 -and $Summary.counts.INCONCLUSIVE -eq 0)
}
function Test-Run([IO.DirectoryInfo]$Run,[int]$Seed){
 $required=@("http-trace.jsonl","phase7-multi-resource-evaluation.json","resource-verifier-evaluation.json","post-delete-probe.json","provengo-run.log","run-metadata.json","oracle-manifest.json","SHA256SUMS.csv")
 foreach($n in $required){if(-not(Test-Path(Join-Path $Run.FullName $n))){return $false}}
 try{$phase=Get-Content(Join-Path $Run.FullName "phase7-multi-resource-evaluation.json")-Raw|ConvertFrom-Json;$oracle=Get-Content(Join-Path $Run.FullName "resource-verifier-evaluation.json")-Raw|ConvertFrom-Json;$probe=Get-Content(Join-Path $Run.FullName "post-delete-probe.json")-Raw|ConvertFrom-Json;$meta=Get-Content(Join-Path $Run.FullName "run-metadata.json")-Raw|ConvertFrom-Json}catch{return $false}
 $ok=$meta.experiment -eq "vikunja-increment3-verified-resources" -and $meta.profile -eq "multi-resource-verified-resources" -and $meta.seed -eq $Seed -and $meta.tasks -eq $Tasks -and $meta.projects -eq 1 -and $meta.labels -eq $Labels -and $meta.comments -eq $Comments -and $meta.provengo_exit_code -eq 0 -and $meta.deletion_probe_exit_code -eq 0 -and $meta.evaluation_exit_code -eq 0 -and $meta.resource_verifier_exit_code -eq 0
 $ok=$ok -and $phase.phase7_passed -eq $true -and $phase.passed_count -eq 16 -and $phase.required_count -eq 16 -and @($phase.anomalies).Count -eq 0 -and $phase.trace_recovery.canonical_evidence_eligible -eq $true -and $phase.trace_recovery.used -eq $false -and $probe.all_deletions_observable -eq $true
 $ok=$ok -and $oracle.profile -eq "verified-resource-lifecycles" -and $oracle.run_status -eq "PASS" -and $oracle.confirmed_product_bug -eq $false -and @($oracle.witnesses).Count -eq (3*$Tasks+3+3*$Labels)
 foreach($resource in @("task","project","label")){$expected=if($resource -eq "task"){$Tasks}elseif($resource -eq "project"){1}else{$Labels};foreach($phaseName in @("create-visibility","update-persistence","delete-absence")){$name="$resource-$phaseName";$ok=$ok -and (Test-Oracle $oracle.oracle_summary.$name $expected)}}
 return($ok -and (Test-Manifest $Run))
}

$selected=@();$excluded=@()
foreach($seed in $Seeds){$candidates=@(Get-ChildItem $RunsRoot -Directory -Filter "increment3-verified-resources-seed-$seed-*"|Sort-Object LastWriteTime -Descending);$valid=@();foreach($c in $candidates){if(Test-Run $c $seed){$valid+=$c}else{$excluded+=$c.Name}};if($valid.Count -lt 1){throw "No canonical Increment 3 PASS run found for seed $seed."};$selected+=$valid[0];if($valid.Count -gt 1){$excluded+=@($valid|Select-Object -Skip 1|ForEach-Object Name)}}
$hashes=foreach($r in $selected){$m=Get-Content(Join-Path $r.FullName "run-metadata.json")-Raw|ConvertFrom-Json;"$($m.openapi_sha256)|$($m.interfaces_sha256)|$($m.stories_sha256)|$($m.oracle_manifest_sha256)"}
if(@($hashes|Select-Object -Unique).Count -ne 1){throw "Selected runs do not use one identical OpenAPI/interfaces/stories/oracle model."}

$stamp=Get-Date -Format "yyyyMMdd_HHmmss";$freeze=Join-Path $Root "evidence\increment3-verified-resources-evidence-$stamp";$runsTarget=Join-Path $freeze "runs";$modelTarget=Join-Path $freeze "model";$toolsTarget=Join-Path $freeze "tools";$generatorTarget=Join-Path $freeze "generator"
New-Item -ItemType Directory -Force $runsTarget,$modelTarget,$toolsTarget,$generatorTarget|Out-Null
$runFiles=@("http-trace.jsonl","phase7-multi-resource-evaluation.json","resource-verifier-evaluation.json","post-delete-probe.json","oracle-manifest.json","provengo-create.log","provengo-run.log","proxy.stderr.log","proxy.stdout.log","run-metadata.json","SHA256SUMS.csv")
foreach($r in $selected){$t=Join-Path $runsTarget $r.Name;New-Item -ItemType Directory -Force $t|Out-Null;foreach($n in $runFiles){$s=Join-Path $r.FullName $n;if(Test-Path $s){$dn=if($n -eq "SHA256SUMS.csv"){"source-run-SHA256SUMS.csv"}else{$n};Copy-Item $s (Join-Path $t $dn)}}}
foreach($n in @("vikunja-multi-resource-openapi.json","multi-resource-projection-manifest.json")){$s=Join-Path $ModelRoot $n;if(-not(Test-Path $s)){throw "Required model file missing: $s"};Copy-Item $s $modelTarget}
Copy-Item $GeneratedRoot (Join-Path $modelTarget "generated-multi-resource-verified-resources") -Recurse
$toolNames=@("Prepare-Vikunja-Increment3.ps1","Invoke-Vikunja-Increment3.ps1","validate_resource_verifiers.py","generate_resource_oracle_manifest.py","evaluate_vikunja_multi_resource.py","probe_vikunja_multi_resource_deletions.py","analyze_vikunja_bp_schedules.py","vikunja_research_proxy.py","build_vikunja_core_projection.py")
foreach($n in $toolNames){$s=Join-Path $Root "scripts\$n";if(-not(Test-Path $s)){throw "Required tool missing: $s"};Copy-Item $s $toolsTarget}
foreach($rel in @("openapi_to_sbt\cli.py","openapi_to_sbt\render\stories_js.py")){$s=Join-Path $Root "generator_baseline\$rel";$d=Join-Path $generatorTarget $rel;New-Item -ItemType Directory -Force (Split-Path -Parent $d)|Out-Null;Copy-Item $s $d}
foreach($n in @("test_increment3_verified_resources.py","test_resource_verifiers.py")){$s=Join-Path $Root "tests\$n";if(Test-Path $s){Copy-Item $s $toolsTarget}}

$comparison=Join-Path $freeze "schedule-comparison.json";$args=@((Join-Path $Root "scripts\analyze_vikunja_bp_schedules.py"));foreach($r in $selected){$args+=@("--run",$r.FullName)};$args+=@("--output",$comparison,"--require-variation");& python @args;if($LASTEXITCODE -ne 0){throw "Increment 3 schedule analysis failed."}
$sc=Get-Content $comparison -Raw|ConvertFrom-Json;if($sc.distinct_intent_schedules -ne $selected.Count -or $sc.distinct_permit_schedules -ne $selected.Count){throw "Expected four distinct Intent and Permit schedules. Evidence was not frozen."}
$summary=[ordered]@{evidence_type="Vikunja Increment 3 generated Project, Task and Label verifier obligations";profile="multi-resource-verified-resources";created_utc=(Get-Date).ToUniversalTime().ToString("o");seeds=$Seeds;expected=@{projects=1;tasks=$Tasks;labels=$Labels;comments=$Comments};run_count=$selected.Count;phase_checks_per_run=16;verifier_oracles_per_run=9;verifier_witnesses_per_run=(3*$Tasks+3+3*$Labels);all_runs_passed=$true;all_oracle_counts_complete=$true;distinct_intent_schedules=$sc.distinct_intent_schedules;distinct_permit_schedules=$sc.distinct_permit_schedules;selected_run_directories=@($selected|ForEach-Object Name);excluded_run_directories=@($excluded|Select-Object -Unique);model_hash_quadruple=$hashes[0];product_bug_claimed=$false;interpretation="Four canonical runs passed 16/16 lifecycle checks and 30/30 external Project, Task and Label verifier witnesses under distinct BP schedules. No product bug was found or claimed."}
$summary|ConvertTo-Json -Depth 8|Set-Content(Join-Path $freeze "evidence-summary.json")-Encoding UTF8
@"
Vikunja Increment 3 verified-resources evidence.
Each selected run passed 16/16 lifecycle checks and 30/30 external verifier
witnesses: Task 18, Project 3, Label 9. No witness was violated, inconclusive,
or missing. The external HTTP trace is authoritative. No product bug is claimed.
"@|Set-Content(Join-Path $freeze "README.txt")-Encoding UTF8
$manifest=foreach($f in Get-ChildItem $freeze -Recurse -File|Where-Object{$_.Name -ne "SHA256SUMS.csv"}){[pscustomobject]@{Path=$f.FullName.Substring($freeze.Length+1).Replace("\","/");SHA256=(Get-FileHash $f.FullName -Algorithm SHA256).Hash.ToLowerInvariant();SizeBytes=$f.Length}}
$manifest|Sort-Object Path|Export-Csv(Join-Path $freeze "SHA256SUMS.csv")-NoTypeInformation -Encoding UTF8
$zip="$freeze.zip";Compress-Archive -Path(Join-Path $freeze "*")-DestinationPath $zip -CompressionLevel Optimal;$hash=(Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Host "INCREMENT3_VERIFIED_RESOURCES_EVIDENCE_FREEZE_PASS";Write-Host "Selected runs:";@($selected|ForEach-Object{"  $($_.Name)"})|Write-Host;Write-Host "Excluded runs:";@($excluded|Select-Object -Unique|ForEach-Object{"  $_"})|Write-Host;Write-Host "Phase checks: 16/16 per run";Write-Host "Resource verifier witnesses: 30/30 per run";Write-Host "Distinct Intent schedules: $($sc.distinct_intent_schedules)/$($selected.Count)";Write-Host "Distinct Permit schedules: $($sc.distinct_permit_schedules)/$($selected.Count)";Write-Host "Evidence directory: $freeze";Write-Host "Evidence ZIP:       $zip";Write-Host "ZIP SHA256:         $hash"
