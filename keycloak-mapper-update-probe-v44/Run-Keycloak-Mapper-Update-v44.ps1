$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path $PSScriptRoot 'probe_keycloak_mapper_update_v44.py'
python $scriptPath
if ($LASTEXITCODE -ne 0) { throw "Mapper update probe failed with exit code $LASTEXITCODE" }
