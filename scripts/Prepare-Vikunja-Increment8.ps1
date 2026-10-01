param(
    [string]$Root = "",
    [int]$Tasks = 6,
    [int]$ProxyPort = 3457,
    [int]$AdapterPort = 3458
)
$ErrorActionPreference = "Stop"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path } else { $Root = (Resolve-Path $Root).Path }

$phase = Join-Path $Root "phase14-increment8-true-concurrent-epochs"
New-Item -ItemType Directory -Force $phase | Out-Null
& python (Join-Path $Root "scripts\build_vikunja_core_projection.py") --input (Join-Path $Root "vikunja-openapi-3.0.json") --output (Join-Path $phase "vikunja-multi-resource-openapi.json") --manifest (Join-Path $phase "multi-resource-projection-manifest.json") --boundary multi-resource
if ($LASTEXITCODE -ne 0) { throw "Projection failed." }

$generated = Join-Path $phase "generated-concurrent-epochs"
Push-Location (Join-Path $Root "generator_baseline")
try {
    & python -m openapi_to_sbt generate --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output $generated --name vikunja --base-url "http://127.0.0.1:$ProxyPort" --seed 20262200 --instances-per-entity $Tasks --instances-per-action 1 --story-profile multi-resource-verified-actions --force
    if ($LASTEXITCODE -ne 0) { throw "Generation failed." }
} finally { Pop-Location }

& python (Join-Path $Root "scripts\generate_resource_oracle_manifest.py") --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $generated "resource-oracle-manifest.json")
if ($LASTEXITCODE -ne 0) { throw "Resource oracle generation failed." }
& python (Join-Path $Root "scripts\generate_action_oracle_manifest.py") --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $generated "action-oracle-manifest.json")
if ($LASTEXITCODE -ne 0) { throw "Action oracle generation failed." }
& python (Join-Path $Root "scripts\generate_negative_bp_stories.py") --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $generated "negative.vikunja.js") --manifest (Join-Path $generated "negative-oracle-manifest.json") --tasks $Tasks
if ($LASTEXITCODE -ne 0) { throw "Negative-story generation failed." }
& python (Join-Path $Root "scripts\generate_conflict_bp_stories.py") --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $generated "conflict.vikunja.js") --manifest (Join-Path $generated "conflict-oracle-manifest.json") --tasks $Tasks
if ($LASTEXITCODE -ne 0) { throw "Conflict-story generation failed." }
& python (Join-Path $Root "scripts\generate_disjoint_patch_bp_stories.py") --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $generated "disjoint-patch.vikunja.js") --manifest (Join-Path $generated "disjoint-patch-oracle-manifest.json") --tasks $Tasks
if ($LASTEXITCODE -ne 0) { throw "Disjoint-patch generation failed." }
& python (Join-Path $Root "scripts\generate_concurrent_epoch_bp_stories.py") --openapi (Join-Path $phase "vikunja-multi-resource-openapi.json") --output (Join-Path $generated "concurrent-epochs.vikunja.js") --manifest (Join-Path $generated "concurrent-epoch-oracle-manifest.json") --tasks $Tasks --adapter-port $AdapterPort
if ($LASTEXITCODE -ne 0) { throw "Concurrent-epoch generation failed." }

foreach ($name in @("stories.vikunja.js", "negative.vikunja.js", "conflict.vikunja.js", "disjoint-patch.vikunja.js", "concurrent-epochs.vikunja.js")) {
    & node --check (Join-Path $generated $name)
    if ($LASTEXITCODE -ne 0) { throw "JavaScript syntax validation failed: $name" }
}
Write-Host "VIKUNJA_INCREMENT8_PREPARE_PASS"
