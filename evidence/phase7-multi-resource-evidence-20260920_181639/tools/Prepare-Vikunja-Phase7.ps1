param([string]$Root="",[int]$Tasks=6,[int]$ProxyPort=3457)
$ErrorActionPreference="Stop";$ScriptDir=if($PSScriptRoot){$PSScriptRoot}else{Split-Path -Parent $MyInvocation.MyCommand.Path}
if([string]::IsNullOrWhiteSpace($Root)){$Root=(Resolve-Path(Join-Path $ScriptDir "..")).Path}else{$Root=(Resolve-Path $Root).Path}
$phase=Join-Path $Root "phase7";New-Item -ItemType Directory -Force $phase|Out-Null
& python (Join-Path $Root "scripts\build_vikunja_core_projection.py") --input (Join-Path $Root "vikunja-openapi-3.0.json") --output (Join-Path $phase "vikunja-multi-resource-openapi.json") --manifest (Join-Path $phase "multi-resource-projection-manifest.json") --boundary multi-resource
if($LASTEXITCODE -ne 0){throw "Projection failed."}
Push-Location(Join-Path $Root "generator_baseline");try{& python -m openapi_to_sbt generate --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $phase "generated-multi-resource-interleaving") --name vikunja --base-url "http://127.0.0.1:$ProxyPort" --seed 20261700 --instances-per-entity $Tasks --instances-per-action 1 --story-profile multi-resource-interleaving --force;if($LASTEXITCODE -ne 0){throw "Generation failed."}}finally{Pop-Location}
& node --check (Join-Path $phase "generated-multi-resource-interleaving\stories.vikunja.js");if($LASTEXITCODE -ne 0){throw "Story syntax failed."}
Write-Host "VIKUNJA_PHASE7_PREPARE_PASS"
