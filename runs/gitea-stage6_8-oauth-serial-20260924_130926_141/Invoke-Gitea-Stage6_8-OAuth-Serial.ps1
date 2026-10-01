[CmdletBinding()]
param(
    [string]$BaseUrl = 'http://127.0.0.1:3477/api/v1',
    [string]$Token = $env:GITEA_API_TOKEN,
    [ValidateRange(1,10)][int]$Trials = 2,
    [string]$OutputRoot = '.\runs',
    [switch]$FreezeEvidence
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($Token)) {
    throw 'GITEA_API_TOKEN is empty; prepare Stage 1 in this PowerShell process.'
}
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$spec = Join-Path $root 'model/gitea/gitea-1.27.3-swagger.json'
$expectedHash = 'a0baa9a766c22492bd8c45744157c611d3e95cfc0dc73d6f5d14f294cdddce38'
if (-not (Test-Path -LiteralPath $spec) -or
    (Get-FileHash -LiteralPath $spec -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expectedHash) {
    throw 'Frozen Gitea OpenAPI missing or hash mismatch.'
}
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss_fff'
$runName = "gitea-stage6_8-oauth-serial-$stamp"
$runDir = Join-Path $OutputRoot $runName
New-Item -ItemType Directory -Path $runDir -Force | Out-Null
$headers = @{ Authorization = "token $Token"; Accept = 'application/json'; 'Content-Type' = 'application/json' }
$trace = [System.Collections.Generic.List[object]]::new()
$results = [System.Collections.Generic.List[object]]::new()

function Invoke-RecordedRequest {
    param([string]$Method, [string]$Path, $Body = $null, [string]$Label = '')
    $url = "$($BaseUrl.TrimEnd('/'))/$($Path.TrimStart('/'))"
    $started = (Get-Date).ToUniversalTime().ToString('o')
    $responseText = ''; $status = 0
    try {
        $arguments = @{ Uri = $url; Method = $Method; Headers = $headers; UseBasicParsing = $true }
        if ($null -ne $Body) { $arguments.Body = ($Body | ConvertTo-Json -Depth 10 -Compress) }
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
        } catch { $responseText = '' }
    }
    $parsed = $null
    if (-not [string]::IsNullOrWhiteSpace($responseText)) {
        try { $parsed = $responseText | ConvertFrom-Json } catch { $parsed = $null }
    }
    # Allowlist evidence fields. The in-memory response is returned unchanged
    # for validation, but OAuth client_secret never reaches a file or stdout.
    $safeRequest = $null
    if ($null -ne $Body) {
        $safeRequest = [ordered]@{}
        foreach ($field in @('name', 'redirect_uris', 'confidential_client', 'skip_secondary_authorization')) {
            if ($Body.ContainsKey($field)) { $safeRequest[$field] = $Body[$field] }
        }
    }
    $safeResponse = [ordered]@{}
    if ($null -ne $parsed) {
        foreach ($field in @('id', 'name', 'redirect_uris', 'message')) {
            if ($null -ne $parsed.PSObject.Properties[$field]) { $safeResponse[$field] = $parsed.$field }
        }
    }
    $trace.Add([pscustomobject][ordered]@{ timestamp_utc = $started; label = $Label;
        method = $Method; path = $Path; request = $safeRequest; status = $status;
        response = $safeResponse })
    return [pscustomobject]@{ Status = $status; Body = $parsed }
}

$me = Invoke-RecordedRequest GET '/user' $null 'research-user'
if ($me.Status -ne 200) { throw "Research user unavailable: HTTP $($me.Status)" }

for ($trial = 1; $trial -le $Trials; $trial++) {
    $name = "s68-$stamp-$trial".ToLowerInvariant()
    $redirect = "https://example.test/$name"
    try {
        $created = Invoke-RecordedRequest POST '/user/applications/oauth2' `
            @{ name = $name; redirect_uris = @($redirect) } "trial-$trial-create"
        if ($created.Status -ne 201 -or $null -eq $created.Body.id) {
            throw "Create failed: HTTP $($created.Status)"
        }
        $path = "/user/applications/oauth2/$($created.Body.id)"
        $before = Invoke-RecordedRequest GET $path $null "trial-$trial-before"
        $renamed = "${name}-new"
        $partial = Invoke-RecordedRequest PATCH $path @{ name = $renamed } "trial-$trial-partial"
        $afterPartial = Invoke-RecordedRequest GET $path $null "trial-$trial-after-partial"
        # Control: carry the documented fields from the independently read
        # resource, then change only the selected name.
        $full = Invoke-RecordedRequest PATCH $path `
            @{ name = $renamed; redirect_uris = @($before.Body.redirect_uris) } `
            "trial-$trial-full"
        $afterFull = Invoke-RecordedRequest GET $path $null "trial-$trial-after-full"
        $fullPersists = $full.Status -eq 200 -and $afterFull.Status -eq 200 -and
            $afterFull.Body.name -eq $renamed -and
            @($afterFull.Body.redirect_uris).Count -eq 1 -and
            @($afterFull.Body.redirect_uris)[0] -eq $redirect
        $partialUnchanged = $afterPartial.Status -eq 200 -and $afterPartial.Body.name -eq $name
        $verdict = if ($before.Status -eq 200 -and $partial.Status -eq 422 -and
                       $partialUnchanged -and $fullPersists) {
            'FULL_PATCH_PERSISTS_PARTIAL_422'
        } else { 'INCONCLUSIVE' }
        $results.Add([pscustomobject][ordered]@{ trial = $trial; verdict = $verdict;
            create = $created.Status; before = $before.Status; partial = $partial.Status;
            after_partial = $afterPartial.Status; full = $full.Status;
            after_full = $afterFull.Status; partial_unchanged = $partialUnchanged;
            full_persists = $fullPersists })
    }
    catch {
        $results.Add([pscustomobject][ordered]@{ trial = $trial; verdict = 'INCONCLUSIVE';
            reason = [string]$_.Exception.Message })
    }
}

[pscustomobject][ordered]@{ schema_version = 1; stage = 'gitea-stage6.8-oauth-serial';
    spec_sha256 = $expectedHash; trials = $Trials; results = $results } |
    ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $runDir 'stage6_8-summary.json') -Encoding UTF8
$trace | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $runDir 'stage6_8-http-trace.json') -Encoding UTF8
Copy-Item -LiteralPath $PSCommandPath -Destination (Join-Path $runDir 'Invoke-Gitea-Stage6_8-OAuth-Serial.ps1')
Get-ChildItem -LiteralPath $runDir -File | Sort-Object Name |
    Get-FileHash -Algorithm SHA256 |
    Select-Object @{n='file';e={Split-Path $_.Path -Leaf}},
                  @{n='sha256';e={$_.Hash.ToLowerInvariant()}} |
    Export-Csv -LiteralPath (Join-Path $runDir 'checksums.csv') -NoTypeInformation -Encoding UTF8
if ($FreezeEvidence) {
    $evidenceDir = Join-Path $root 'evidence'
    New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null
    $zip = Join-Path $evidenceDir "$runName-review.zip"
    Compress-Archive -Path (Join-Path $runDir '*') -DestinationPath $zip
    Write-Host "Evidence ZIP: $zip"
    Write-Host "ZIP SHA256: $((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant())"
}
Write-Host "GITEA_STAGE6_8_COMPLETE run=$runDir trials=$Trials"
foreach ($row in $results) {
    Write-Host "GITEA_STAGE6_8_RESULT trial=$($row.trial) verdict=$($row.verdict) partial=$($row.partial) full=$($row.full)"
}
