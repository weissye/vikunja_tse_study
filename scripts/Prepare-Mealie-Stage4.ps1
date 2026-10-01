[CmdletBinding()]
param([int]$WaitSeconds = 240)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$compose = Join-Path $root 'deployment\mealie_stage4\compose.yaml'
$project = 'fse-mealie-stage4'
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker CLI is missing' }
& docker version --format '{{.Server.Version}}' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Start Docker Desktop before preparing Mealie' }
& docker compose -p $project -f $compose up -d
if ($LASTEXITCODE -ne 0) { throw 'Mealie Docker Compose startup failed' }
$endpoint = 'http://127.0.0.1:9927/openapi.json'
$spec = Join-Path $root 'model\mealie\openapi-stage4-v3.27.0.json'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $spec) | Out-Null
$deadline = (Get-Date).AddSeconds($WaitSeconds)
$ready = $false
while ((Get-Date) -lt $deadline) {
    try {
        Invoke-WebRequest -Uri $endpoint -OutFile $spec -UseBasicParsing -TimeoutSec 7 -ErrorAction Stop | Out-Null
        $data = Get-Content -LiteralPath $spec -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($data.paths -and $data.info.version -eq 'v3.27.0') { $ready = $true; break }
    } catch { }
    Start-Sleep -Seconds 3
}
if (-not $ready) { throw "Pinned Mealie v3.27.0 did not provide $endpoint within $WaitSeconds seconds; inspect docker compose -p $project -f $compose logs --tail 80" }
$actual = (Get-FileHash -LiteralPath $spec -Algorithm SHA256).Hash.ToLowerInvariant()
$old = Join-Path $root 'model\mealie\openapi.json'
$comparison = Join-Path $root 'model\mealie\stage4-spec-comparison.json'
& python (Join-Path $PSScriptRoot 'mealie_spec_gate.py') --old $old --new $spec --report $comparison
if ($LASTEXITCODE -ne 0) { throw "Mealie contract check blocked generation; inspect $comparison" }
Write-Host "MEALIE_STAGE4_READY http://127.0.0.1:9927 version=v3.27.0 openapi_sha256=$actual"
Write-Host "MEALIE_STAGE4_SPEC $spec"
