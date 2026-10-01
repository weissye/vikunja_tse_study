param(
    [string]$StudyRoot = 'C:\work\temp\vikunja_tse_study',
    [string]$ProvengoJar,
    [int]$JavaHeapGb = 16
)
$ErrorActionPreference = 'Stop'
$pilot = Join-Path $StudyRoot 'keycloak-pilot-v30'
$generator = Join-Path $pilot 'generator_v30'
$spec = Join-Path $pilot 'keycloak-stage2-openapi.json'
$rules = Join-Path $pilot 'keycloak-stage2-observed-rules-v30.json'
$project = Join-Path $pilot 'provengo_project'
$sample = Join-Path $pilot 'sample.json'
$jar = $ProvengoJar
if (-not $jar) {
    $jar = Get-ChildItem -LiteralPath $StudyRoot -Filter '*Provengo*.jar' -File |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1 -ExpandProperty FullName
}
if (-not $jar -or -not (Test-Path -LiteralPath $jar)) { throw 'Provengo JAR not found' }
$physicalGb = [math]::Floor((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
if ($physicalGb -lt ($JavaHeapGb + 2)) {
    throw "Insufficient physical RAM for -JavaHeapGb $JavaHeapGb (installed: $physicalGb GB)"
}
if (-not (Test-Path -LiteralPath $spec) -or -not (Test-Path -LiteralPath $rules)) {
    throw 'Extract the v30 ZIP into the study root first'
}
if (-not (Test-Path -LiteralPath (Join-Path $generator 'openapi_to_sbt\__main__.py'))) {
    throw 'The isolated v30 generator is missing from the ZIP'
}
if (Test-Path -LiteralPath $sample) { throw "Sample already exists: $sample" }
if (Test-Path -LiteralPath (Join-Path $pilot 'sample.json.zst')) {
    throw 'A compressed pilot already exists; use another work directory'
}
$expected = (Get-Content -LiteralPath $rules -Raw | ConvertFrom-Json).source_openapi_sha256
$actual = (Get-FileHash -LiteralPath $spec -Algorithm SHA256).Hash.ToLowerInvariant()
if ($expected -ne $actual) { throw 'OpenAPI digest differs from reviewed request rules' }
$generated = Join-Path $pilot 'generated'
New-Item -ItemType Directory -Path $generated -Force | Out-Null
Push-Location $generator
try {
    python -m openapi_to_sbt generate `
        --openapi $spec --output $generated `
        --name keycloak_stage2 --base-url 'http://127.0.0.1:9938' `
        --seed 20261902 --instances-per-entity 8 `
        --story-profile parallel-crud --logical-processes 2 `
        --auth-token-env KC_STAGE2_ACCESS_TOKEN --overrides $rules
    if ($LASTEXITCODE -ne 0) { throw 'OpenAPI generation failed' }
}
finally { Pop-Location }
Copy-Item -LiteralPath (Join-Path $generated 'stories.keycloak_stage2.js') `
    -Destination (Join-Path $project 'spec\js\stories.keycloak_stage2.js')
$samplingLog = Join-Path $pilot 'sampling-v30.log'
& java "-Xmx${JavaHeapGb}g" -jar $jar sample --size 1 --max-length 13000 `
    --overwrite -o $sample $project *> $samplingLog
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $sample)) {
    if ((Test-Path -LiteralPath $sample) -and (Get-Item -LiteralPath $sample).Length -eq 0) {
        Remove-Item -LiteralPath $sample
    }
    throw "Provengo sampling failed; inspect $samplingLog"
}
python (Join-Path $pilot 'audit_keycloak_pilot_v30.py') $sample |
    Tee-Object -FilePath (Join-Path $pilot 'static-audit-v30.json')
$auditCode = $LASTEXITCODE
python (Join-Path $pilot 'compress_pilot_v30.py') $sample
if ($LASTEXITCODE -ne 0) { throw 'Sample compression failed' }
if ($auditCode -ne 0) { throw 'Static audit failed; do not run this pilot against Keycloak' }
Write-Host "PILOT_READY $pilot"
