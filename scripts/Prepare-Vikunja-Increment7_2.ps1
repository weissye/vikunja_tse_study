param([string]$Root="",[int]$Tasks=6,[int]$ProxyPort=3457)
$ErrorActionPreference="Stop"
$ScriptDir=if($PSScriptRoot){$PSScriptRoot}else{Split-Path -Parent $MyInvocation.MyCommand.Path}
if([string]::IsNullOrWhiteSpace($Root)){$Root=(Resolve-Path(Join-Path $ScriptDir "..")).Path}else{$Root=(Resolve-Path $Root).Path}
$phase=Join-Path $Root "phase13-increment7_2-disjoint-patch-commutativity";New-Item -ItemType Directory -Force $phase|Out-Null
& python (Join-Path $Root "scripts\build_vikunja_core_projection.py") --input (Join-Path $Root "vikunja-openapi-3.0.json") --output (Join-Path $phase "vikunja-multi-resource-openapi.json") --manifest (Join-Path $phase "multi-resource-projection-manifest.json") --boundary multi-resource
if($LASTEXITCODE -ne 0){throw "Projection failed."}
$generated=Join-Path $phase "generated-disjoint-patch-commutativity"
Push-Location(Join-Path $Root "generator_baseline")
try{
 & python -m openapi_to_sbt generate --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output $generated --name vikunja --base-url "http://127.0.0.1:$ProxyPort" --seed 20262200 --instances-per-entity $Tasks --instances-per-action 1 --story-profile multi-resource-verified-actions --force
 if($LASTEXITCODE -ne 0){throw "Generation failed."}
}finally{Pop-Location}
& node --check (Join-Path $generated "stories.vikunja.js")
if($LASTEXITCODE -ne 0){throw "Story syntax failed."}
& python (Join-Path $Root "scripts\generate_resource_oracle_manifest.py") --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $generated "resource-oracle-manifest.json")
if($LASTEXITCODE -ne 0){throw "Resource oracle-manifest generation failed."}
& python (Join-Path $Root "scripts\generate_action_oracle_manifest.py") --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $generated "action-oracle-manifest.json")
if($LASTEXITCODE -ne 0){throw "Action oracle-manifest generation failed."}
& python (Join-Path $Root "scripts\generate_negative_bp_stories.py") --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $generated "negative.vikunja.js") --manifest (Join-Path $generated "negative-oracle-manifest.json") --tasks $Tasks
if($LASTEXITCODE -ne 0){throw "Negative BP story generation failed."}
& node --check (Join-Path $generated "negative.vikunja.js")
if($LASTEXITCODE -ne 0){throw "Negative story syntax failed."}
& python (Join-Path $Root "scripts\generate_conflict_bp_stories.py") --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $generated "conflict.vikunja.js") --manifest (Join-Path $generated "conflict-oracle-manifest.json") --tasks $Tasks
if($LASTEXITCODE -ne 0){throw "Conflict BP story generation failed."}
& node --check (Join-Path $generated "conflict.vikunja.js")
if($LASTEXITCODE -ne 0){throw "Conflict story syntax failed."}
& python (Join-Path $Root "scripts\generate_disjoint_patch_bp_stories.py") --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $generated "disjoint-patch.vikunja.js") --manifest (Join-Path $generated "disjoint-patch-oracle-manifest.json") --tasks $Tasks
if($LASTEXITCODE -ne 0){throw "Disjoint-patch BP story generation failed."}
& node --check (Join-Path $generated "disjoint-patch.vikunja.js")
if($LASTEXITCODE -ne 0){throw "Disjoint-patch story syntax failed."}
Write-Host "VIKUNJA_INCREMENT7_2_PREPARE_PASS"
