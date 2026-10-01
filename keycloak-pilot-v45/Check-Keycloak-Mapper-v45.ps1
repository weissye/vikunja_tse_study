$ErrorActionPreference = 'Stop'
python (Join-Path $PSScriptRoot 'probe_keycloak_mapper_update_v45.py')
if ($LASTEXITCODE -ne 0) { throw 'Mapper config precheck failed; do not run the full pilot' }
