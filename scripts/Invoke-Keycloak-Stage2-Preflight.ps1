param(
  [string]$FreezeZip = "$env:USERPROFILE\Downloads\research-stage1-freeze-20260927.zip",
  [string]$OutputDirectory = ".\evidence\keycloak-stage2-preflight",
  [string]$SpecUrl = 'https://www.keycloak.org/docs-api/26.7.4/rest-api/openapi.json'
)
$ErrorActionPreference = 'Stop'
$folder = $PSScriptRoot
if (-not (Test-Path -LiteralPath $FreezeZip -PathType Leaf)) { throw "Missing Stage 1 freeze: $FreezeZip" }
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$destination = (Resolve-Path -LiteralPath $OutputDirectory).Path
$spec = Join-Path $destination 'official-openapi-download.json'
Invoke-WebRequest -Uri $SpecUrl -OutFile $spec -UseBasicParsing
python (Join-Path $folder 'stage2_preflight.py') --spec $spec --freeze $FreezeZip --out $destination
if ($LASTEXITCODE -ne 0) { throw "STAGE2_PREFLIGHT_INCOMPLETE exit=$LASTEXITCODE; inspect $destination" }
Write-Host "STAGE2_OPENAPI_SHA256 $((Get-FileHash -LiteralPath $spec -Algorithm SHA256).Hash.ToLowerInvariant())"
Write-Host "STAGE2_PREFLIGHT_READY $destination"
