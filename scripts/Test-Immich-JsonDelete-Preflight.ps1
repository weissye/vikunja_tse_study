[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$spec = Join-Path $root 'model\immich\immich-v3.2.0-openapi.json'
$generator = Join-Path $root 'generator_baseline'
if (-not (Test-Path -LiteralPath $spec)) { throw "Pinned Immich OpenAPI missing: $spec" }
$specHash = (Get-FileHash -LiteralPath $spec -Algorithm SHA256).Hash.ToLowerInvariant()
if ($specHash -ne '51719f0b6573ca75eb51834b01a7fdb9e963c9d60fcce813f10c1463a987b866') {
    throw 'Pinned Immich OpenAPI checksum changed'
}
$generated = Join-Path $root ('generated\immich-json-delete-preflight-' + (Get-Date -Format 'yyyyMMdd_HHmmss_fff'))
$oldPythonPath = $env:PYTHONPATH
try {
    if ($oldPythonPath) { $env:PYTHONPATH = "$generator$([IO.Path]::PathSeparator)$oldPythonPath" }
    else { $env:PYTHONPATH = $generator }
    & python -m openapi_to_sbt generate --openapi $spec --output $generated `
        --name immich --base-url http://127.0.0.1:9926/api --seed 20261421 `
        --story-profile minimal-smoke --json-delete-bodies
    if ($LASTEXITCODE -ne 0) { throw "Generator preflight failed: $LASTEXITCODE" }
} finally { $env:PYTHONPATH = $oldPythonPath }
$source = Get-Content -LiteralPath (Join-Path $generated 'interfaces.immich.js') -Raw
$begin = $source.IndexOf('function removeAssetFromAlbum(')
if ($begin -lt 0) { throw 'Generated removal operation missing' }
$end = $source.IndexOf('function addAssetsToAlbum(', $begin)
if ($end -lt 0) { throw 'Generated add operation missing' }
$snippet = $source.Substring($begin, $end - $begin)
if (-not $snippet.Contains('body: JSON.stringify(__body)') -or
    -not $snippet.Contains('__body["ids"] = ids') -or
    -not $snippet.Contains('__headers["Content-Type"] = "application/json"')) {
    throw 'Generated album DELETE JSON body is incomplete'
}
Write-Output "IMMICH_JSON_DELETE_PREFLIGHT_PASS generated=$generated"
