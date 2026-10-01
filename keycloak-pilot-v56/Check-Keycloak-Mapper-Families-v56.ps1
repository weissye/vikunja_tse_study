$ErrorActionPreference = 'Stop'
python (Join-Path $PSScriptRoot 'probe_keycloak_mapper_families_v56.py')
if ($LASTEXITCODE -ne 0) { throw 'Mapper families precheck failed; do not run the full pilot' }
