param(
    [string]$StudyRoot = 'C:\work\temp\vikunja_tse_study',
    [string]$BaseUrl = 'http://127.0.0.1:9928'
)

$ErrorActionPreference = 'Stop'
$pilot = Join-Path $StudyRoot 'keycloak-pilot-v37'
$scenario = Join-Path $pilot 'runs\pilot-01\scenario.json'
$story = Join-Path $pilot 'provengo_project\spec\js\stories.keycloak_stage2.js'

if (Test-Path -LiteralPath $scenario -PathType Leaf) {
    if (-not (Test-Path -LiteralPath $story -PathType Leaf)) {
        throw "Cannot verify fixture realms without story: $story"
    }
    $realms = @([regex]::Matches((Get-Content -LiteralPath $story -Raw),
        '__args\.realm="(realm_[0-9]+)"') |
        ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
    if ($realms.Count -ne 16) {
        throw "Expected 16 generated realm names; found $($realms.Count)"
    }

    $secure = Read-Host 'Keycloak admin password' -AsSecureString
    $credential = New-Object System.Management.Automation.PSCredential('admin', $secure)
    $password = $credential.GetNetworkCredential().Password
    $token = (Invoke-RestMethod -Uri ($BaseUrl.TrimEnd('/') +
        '/realms/master/protocol/openid-connect/token') -Method Post -Body @{
            grant_type = 'password'; client_id = 'admin-cli'
            username = 'admin'; password = $password
        }).access_token
    $password = $null
    $status = @{}
    foreach ($realm in $realms) {
        $uri = $BaseUrl.TrimEnd('/') + '/admin/realms/' + $realm
        try {
            $response = Invoke-WebRequest -Uri $uri -UseBasicParsing -Method Get -Headers @{
                Authorization = "Bearer $token"
            } -ErrorAction Stop
            $status[$realm] = [int]$response.StatusCode
        } catch {
            if (-not $_.Exception.Response) { throw }
            $status[$realm] = [int]$_.Exception.Response.StatusCode
        }
    }
    $token = $null
    if (@($status.Values | Where-Object { $_ -ne 404 }).Count -eq 0) {
        $bytes = (Get-Item -LiteralPath $scenario).Length
        Remove-Item -LiteralPath $scenario -Force
        Write-Host ("REMOVED verified orphan scenario: {0:N3} GB" -f ($bytes / 1GB))
    } else {
        Write-Warning 'Scenario retained: some generated realms remain or could not be verified.'
        $status.GetEnumerator() | Where-Object { $_.Value -ne 404 } |
            Sort-Object Name | Format-Table Name, Value -AutoSize
    }
} else {
    Write-Host 'No expanded v37 scenario found.'
}

$drive = Get-PSDrive -Name ([System.IO.Path]::GetPathRoot($StudyRoot).Substring(0, 1))
Write-Host ("FREE_SPACE: {0:N3} GB" -f ($drive.Free / 1GB))
Write-Host 'Largest files under the study root (read-only report):'
Get-ChildItem -LiteralPath $StudyRoot -Recurse -File -ErrorAction SilentlyContinue |
    Sort-Object Length -Descending | Select-Object -First 12 |
    ForEach-Object { '{0:N3} GB  {1}' -f ($_.Length / 1GB), $_.FullName }

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host 'Docker disk usage (read-only report):'
    docker system df
}
