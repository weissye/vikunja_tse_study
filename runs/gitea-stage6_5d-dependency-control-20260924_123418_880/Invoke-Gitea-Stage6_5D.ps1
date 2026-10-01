[CmdletBinding()]
param(
    [string]$BaseUrl = 'http://127.0.0.1:3477/api/v1',
    [string]$Token = $env:GITEA_API_TOKEN,
    [ValidateRange(1,10)][int]$Trials = 2,
    [string]$Container = 'gitea-stage1-server',
    [string]$OutputRoot = '.\runs',
    [switch]$FreezeEvidence
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($Token)) {
    throw 'GITEA_API_TOKEN is empty. Prepare Stage 1 in this PowerShell process.'
}
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss_fff'
$runName = "gitea-stage6_5d-dependency-control-$stamp"
$runDir = Join-Path $OutputRoot $runName
New-Item -ItemType Directory -Path $runDir -Force | Out-Null
$startedUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
$headers = @{ Authorization = "token $Token"; Accept = 'application/json'; 'Content-Type' = 'application/json' }
$trace = [System.Collections.Generic.List[object]]::new()
$results = [System.Collections.Generic.List[object]]::new()

function Redact-Json {
    param($Value)
    if ($null -eq $Value) { return $null }
    if ($Value -is [System.Collections.IDictionary]) {
        $result = [ordered]@{}
        foreach ($key in $Value.Keys) {
            if ([string]$key -match '(?i)(secret|token|password|authorization)') {
                $result[$key] = '[REDACTED]'
            } else { $result[$key] = Redact-Json $Value[$key] }
        }
        return $result
    }
    if ($Value -is [pscustomobject]) {
        $result = [ordered]@{}
        foreach ($prop in $Value.PSObject.Properties) {
            if ($prop.Name -match '(?i)(secret|token|password|authorization)') {
                $result[$prop.Name] = '[REDACTED]'
            } else { $result[$prop.Name] = Redact-Json $prop.Value }
        }
        return $result
    }
    if ($Value -is [array]) { return ,@($Value | ForEach-Object { Redact-Json $_ }) }
    return $Value
}

function Invoke-GiteaRequest {
    param([string]$Method, [string]$Path, $Body = $null, [string]$Label = '')
    $uri = "$($BaseUrl.TrimEnd('/'))/$($Path.TrimStart('/'))"
    $started = Get-Date
    $status = 0
    $responseText = ''
    try {
        $arguments = @{ Uri = $uri; Method = $Method; Headers = $headers; UseBasicParsing = $true }
        if ($null -ne $Body) { $arguments.Body = ($Body | ConvertTo-Json -Depth 30 -Compress) }
        $response = Invoke-WebRequest @arguments
        $status = [int]$response.StatusCode
        $responseText = [string]$response.Content
    }
    catch {
        $webResponse = $_.Exception.Response
        if ($null -eq $webResponse) { throw }
        $status = [int]$webResponse.StatusCode
        try {
            $stream = $webResponse.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $responseText = $reader.ReadToEnd()
            $reader.Dispose()
        }
        catch { $responseText = [string]$_.Exception.Message }
    }
    $parsed = $null
    if (-not [string]::IsNullOrWhiteSpace($responseText)) {
        try { $parsed = $responseText | ConvertFrom-Json } catch { $parsed = $responseText }
    }
    $trace.Add([pscustomobject][ordered]@{
        timestamp_utc = $started.ToUniversalTime().ToString('o')
        label = $Label; method = $Method; path = $Path
        request = (Redact-Json $Body); status = $status
        response = (Redact-Json $parsed)
        elapsed_ms = [math]::Round(((Get-Date) - $started).TotalMilliseconds, 3)
    })
    return [pscustomobject]@{ Status = $status; Body = $parsed }
}

function Record-Finding {
    param([int]$Trial, [string]$Family, [string]$Verdict, [string]$Reason, $Statuses)
    $results.Add([pscustomobject][ordered]@{
        trial = $Trial; family = $Family; verdict = $Verdict
        reason = $Reason; statuses = $Statuses
    })
}

$identity = Invoke-GiteaRequest GET '/user' $null 'authenticated-user'
if ($identity.Status -ne 200 -or [string]::IsNullOrWhiteSpace([string]$identity.Body.login)) {
    throw "Research user not readable, HTTP $($identity.Status)."
}

for ($trial = 1; $trial -le $Trials; $trial++) {
    $suffix = (Get-Date -Format 'HHmmssfff') + "-$trial"
    $hookStatus = [ordered]@{}
    try {
        # The missing URL came from Gitea's prior 422 response. Both
        # variants use the same documented CreateHookOption shape.
        $baseline = Invoke-GiteaRequest POST '/user/hooks' `
            @{ type = 'gitea'; config = @{}; active = $false } "trial-$trial-hook-empty-config"
        $hookStatus.empty_config = $baseline.Status
        $valid = Invoke-GiteaRequest POST '/user/hooks' `
            @{ type = 'gitea'; config = @{ url = "$($BaseUrl.TrimEnd('/'))/version"; content_type = 'json' };
               active = $false; events = @('push') } "trial-$trial-hook-with-local-url"
        $hookStatus.local_url = $valid.Status
        $read = $null
        if ($valid.Status -eq 201 -and $null -ne $valid.Body.id) {
            $read = Invoke-GiteaRequest GET "/user/hooks/$($valid.Body.id)" $null "trial-$trial-hook-read"
            $hookStatus.read = $read.Status
        }
        $verdict = 'INCONCLUSIVE'; $reason = 'hook-not-independently-verified'
        if ($valid.Status -eq 201 -and $null -ne $read -and $read.Status -eq 200) {
            $verdict = 'DEPENDENCY_AVAILABLE'; $reason = 'documented-config-url-creates-readable-hook'
        } elseif ($valid.Status -eq 422) {
            $reason = 'hook-config-rejected-inspect-422-response'
        }
        Record-Finding $trial 'user-hook' $verdict $reason $hookStatus
    }
    catch { Record-Finding $trial 'user-hook' 'INCONCLUSIVE' ([string]$_.Exception.Message) $hookStatus }

    $oauthStatus = [ordered]@{}
    try {
        $empty = Invoke-GiteaRequest POST '/user/applications/oauth2' @{} "trial-$trial-oauth-empty"
        $oauthStatus.empty = $empty.Status
        $name = ("s65d-app-$suffix").ToLowerInvariant()
        $named = Invoke-GiteaRequest POST '/user/applications/oauth2' `
            @{ name = $name } "trial-$trial-oauth-name"
        $oauthStatus.name = $named.Status
        $redirectName = ("s65d-redirect-$suffix").ToLowerInvariant()
        $redirected = Invoke-GiteaRequest POST '/user/applications/oauth2' `
            @{ name = $redirectName; redirect_uris = @('http://127.0.0.1:3477/') } `
            "trial-$trial-oauth-name-and-redirect"
        $oauthStatus.name_and_redirect = $redirected.Status
        $nameRead = $null
        if ($named.Status -eq 201 -and $null -ne $named.Body.id) {
            $nameRead = Invoke-GiteaRequest GET "/user/applications/oauth2/$($named.Body.id)" `
                $null "trial-$trial-oauth-name-read"
            $oauthStatus.name_read = $nameRead.Status
        }
        $redirectRead = $null
        if ($redirected.Status -eq 201 -and $null -ne $redirected.Body.id) {
            $redirectRead = Invoke-GiteaRequest GET "/user/applications/oauth2/$($redirected.Body.id)" `
                $null "trial-$trial-oauth-redirect-read"
            $oauthStatus.redirect_read = $redirectRead.Status
        }
        $verdict = 'INCONCLUSIVE'; $reason = 'application-not-independently-verified'
        if ($named.Status -eq 201 -and $null -ne $nameRead -and $nameRead.Status -eq 200) {
            $verdict = 'DEPENDENCY_AVAILABLE'; $reason = 'name-only-creates-readable-application'
        } elseif ($redirected.Status -eq 201 -and $null -ne $redirectRead -and $redirectRead.Status -eq 200) {
            $verdict = 'DEPENDENCY_AVAILABLE'; $reason = 'name-and-redirect-create-readable-application'
        }
        Record-Finding $trial 'oauth2-application' $verdict $reason $oauthStatus
    }
    catch { Record-Finding $trial 'oauth2-application' 'INCONCLUSIVE' ([string]$_.Exception.Message) $oauthStatus }
}

$summary = [ordered]@{
    schema_version = 1
    stage = 'gitea-stage6.5d-serial-dependency-control'
    source_spec_sha256 = 'a0baa9a766c22492bd8c45744157c611d3e95cfc0dc73d6f5d14f294cdddce38'
    environment = @{ base_url = $BaseUrl; container = $Container;
                     authenticated_user = [string]$identity.Body.login; trials = $Trials }
    claim_rule = 'A readable 201 producer is eligible for a later story fix; a rejected producer remains unavailable.'
    results = $results
}
$summary | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath (Join-Path $runDir 'stage6_5d-summary.json') -Encoding utf8
$trace | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath (Join-Path $runDir 'stage6_5d-http-trace.json') -Encoding utf8
$results | Export-Csv -LiteralPath (Join-Path $runDir 'stage6_5d-trials.csv') -NoTypeInformation -Encoding utf8
$savedPreference = $ErrorActionPreference
try {
    $ErrorActionPreference = 'Continue'
    & docker logs --since $startedUtc $Container *>&1 |
        Out-File -LiteralPath (Join-Path $runDir 'gitea-container.log') -Encoding utf8
}
catch { $_ | Out-File -LiteralPath (Join-Path $runDir 'gitea-container.log') -Encoding utf8 }
finally { $ErrorActionPreference = $savedPreference }
Copy-Item -LiteralPath $PSCommandPath -Destination (Join-Path $runDir 'Invoke-Gitea-Stage6_5D.ps1')
@{ created_utc = (Get-Date).ToUniversalTime().ToString('o');
   script = $MyInvocation.MyCommand.Name; powershell = $PSVersionTable.PSVersion.ToString() } |
    ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runDir 'run-metadata.json') -Encoding utf8
Get-ChildItem -LiteralPath $runDir -File |
    Where-Object { $_.Name -ne 'checksums.csv' } | Sort-Object Name |
    Get-FileHash -Algorithm SHA256 |
    Select-Object @{n='file';e={Split-Path $_.Path -Leaf}},
                  @{n='sha256';e={$_.Hash.ToLowerInvariant()}} |
    Export-Csv -LiteralPath (Join-Path $runDir 'checksums.csv') -NoTypeInformation -Encoding utf8
if ($FreezeEvidence) {
    $evidenceDir = Join-Path (Split-Path $OutputRoot -Parent) 'evidence'
    if ([string]::IsNullOrWhiteSpace($evidenceDir)) { $evidenceDir = '.\evidence' }
    New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null
    $zip = Join-Path $evidenceDir "$runName-review.zip"
    Compress-Archive -Path (Join-Path $runDir '*') -DestinationPath $zip
    Write-Host "Evidence ZIP: $zip"
    Write-Host "ZIP SHA256: $((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant())"
}
Write-Host "GITEA_STAGE6_5D_COMPLETE run=$runDir trials=$Trials"
foreach ($row in $results) {
    Write-Host "GITEA_STAGE6_5D_RESULT trial=$($row.trial) family=$($row.family) verdict=$($row.verdict) reason=$($row.reason)"
}
