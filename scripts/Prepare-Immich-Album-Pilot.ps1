[CmdletBinding()]
param([ValidateRange(30,900)][int]$WaitSeconds = 360)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$folder = Join-Path $root 'deployment\immich_album_pilot'
$compose = Join-Path $folder 'docker-compose.yml'
$envPath = Join-Path $folder '.env'
$project = 'fse-immich-album-pilot'
$version = 'v3.2.0'
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker is not on PATH' }
New-Item -ItemType Directory -Path $folder -Force | Out-Null
if (-not (Test-Path -LiteralPath $compose)) {
    $url = "https://github.com/immich-app/immich/releases/download/$version/docker-compose.yml"
    $temp = $compose + '.download'
    try {
        try { Invoke-WebRequest -Uri $url -OutFile $temp -UseBasicParsing -TimeoutSec 90 -ErrorAction Stop }
        catch {
            $url = "https://raw.githubusercontent.com/immich-app/immich/$version/docker/docker-compose.yml"
            Invoke-WebRequest -Uri $url -OutFile $temp -UseBasicParsing -TimeoutSec 90 -ErrorAction Stop
        }
        $source = Get-Content -LiteralPath $temp -Raw
        $portPattern = '(?m)^(\s*-\s*)[''\"]2283:2283[''\"]\s*$'
        if ([regex]::Matches($source, $portPattern).Count -ne 1) {
            throw 'Unexpected upstream Immich compose port shape; refused to start'
        }
        $patched = [regex]::Replace($source, $portPattern, '${1}''127.0.0.1:9926:2283''')
        $names = '(?m)^(\s*container_name:\s*)([a-zA-Z0-9_-]+)\s*$'
        if ([regex]::Matches($patched, $names).Count -lt 3) {
            throw 'Unexpected upstream compose container names; refused to use unisolated names'
        }
        $patched = [regex]::Replace($patched, $names, '${1}fse_album_${2}')
        [IO.File]::WriteAllText($compose, $patched, (New-Object System.Text.UTF8Encoding($false)))
    } finally { if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force } }
}
if (-not (Test-Path -LiteralPath $envPath)) {
    $password = [guid]::NewGuid().ToString('N')
    $settings = @(
        'UPLOAD_LOCATION=./library'
        'DB_DATA_LOCATION=./postgres'
        'IMMICH_VERSION=v3.2.0'
        "DB_PASSWORD=$password"
        'DB_USERNAME=postgres'
        'DB_DATABASE_NAME=immich'
    )
    [IO.File]::WriteAllText($envPath, (($settings -join "`n") + "`n"),
        (New-Object System.Text.UTF8Encoding($false)))
}
& docker compose -p $project --project-directory $folder --env-file $envPath -f $compose config --quiet
if ($LASTEXITCODE -ne 0) { throw 'Isolated Immich compose validation failed' }
& docker compose -p $project --project-directory $folder --env-file $envPath -f $compose up -d immich-server redis database
if ($LASTEXITCODE -ne 0) { throw 'Isolated Immich startup failed; inspect Docker output' }
$endpoint = 'http://127.0.0.1:9926/api/server/ping'
$deadline = (Get-Date).AddSeconds($WaitSeconds)
while ((Get-Date) -lt $deadline) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "IMMICH_ALBUM_PILOT_READY $endpoint version=$version project=$project"
            Write-Host ('Pinned compose SHA256: ' + (Get-FileHash -LiteralPath $compose -Algorithm SHA256).Hash.ToLowerInvariant())
            return
        }
    } catch { Start-Sleep -Seconds 3 }
}
& docker compose -p $project --project-directory $folder --env-file $envPath -f $compose ps
throw "Immich server was not ready within $WaitSeconds seconds; inspect: docker compose -p $project --project-directory $folder -f $compose logs --tail 80 immich-server"
