param(
    [string]$StudyRoot = 'C:\work\temp\vikunja_tse_study'
)
$ErrorActionPreference = 'Stop'
$script = Join-Path $StudyRoot 'keycloak-role-field-probe-v41\probe_keycloak_role_fields_v41.py'
python $script
if ($LASTEXITCODE -ne 0) { throw "Role field probe failed with exit code $LASTEXITCODE" }
