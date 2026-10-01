[CmdletBinding()]
param(
    [string]$BaseUrl = 'http://127.0.0.1:3477/api/v1',
    [string]$Token = $env:GITEA_API_TOKEN,
    [ValidateRange(1,20)][int]$Trials = 2,
    [string]$Container = 'gitea-stage1-server',
    [string]$OutputRoot = '.\runs',
    [switch]$FreezeEvidence
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($Token)) {
    throw 'GITEA_API_TOKEN is empty. Run Prepare-Gitea-Stage1.ps1 in this PowerShell session.'
}

# Same request/evidence format as Invoke-Gitea-Stage5_2.ps1. No token is
# included in the saved HTTP trace or in the frozen evidence.
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss_fff'
$runName = "gitea-stage6_5-serial-confirmation-$stamp"
$runDir = Join-Path $OutputRoot $runName
New-Item -ItemType Directory -Force -Path $runDir | Out-Null
$startedUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
$headers = @{
    Authorization = "token $Token"
    Accept = 'application/json'
    'Content-Type' = 'application/json'
}
$trace = [System.Collections.Generic.List[object]]::new()
$results = [System.Collections.Generic.List[object]]::new()

function Invoke-GiteaRequest {
    param([string]$Method, [string]$Path, $Body = $null, [string]$Label = '')
    $uri = "$($BaseUrl.TrimEnd('/'))/$($Path.TrimStart('/'))"
    $started = Get-Date
    $status = 0
    $responseText = ''
    try {
        $args = @{ Uri = $uri; Method = $Method; Headers = $headers; UseBasicParsing = $true }
        if ($null -ne $Body) { $args.Body = ($Body | ConvertTo-Json -Depth 30 -Compress) }
        $response = Invoke-WebRequest @args
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
        catch {
            $responseText = [string]$_.ErrorDetails.Message
            if ([string]::IsNullOrWhiteSpace($responseText)) {
                $responseText = [string]$_.Exception.Message
            }
        }
    }
    $parsed = $null
    if (-not [string]::IsNullOrWhiteSpace($responseText)) {
        try { $parsed = $responseText | ConvertFrom-Json } catch { $parsed = $responseText }
    }
    $trace.Add([pscustomobject][ordered]@{
        timestamp_utc = $started.ToUniversalTime().ToString('o')
        trial_label = $Label
        method = $Method
        path = $Path
        request = $Body
        status = $status
        response = $parsed
        elapsed_ms = [math]::Round(((Get-Date) - $started).TotalMilliseconds, 3)
    })
    return [pscustomobject]@{ Status = $status; Body = $parsed }
}

function New-Finding {
    param([int]$Trial, [string]$Family, [string]$Name, [string]$Verdict,
          [string]$Reason, $Statuses, $Observations)
    $results.Add([pscustomobject][ordered]@{
        trial = $Trial
        family = $Family
        resource = $Name
        verdict = $Verdict
        reason = $Reason
        statuses = $Statuses
        observations = $Observations
    })
}

$identity = Invoke-GiteaRequest GET '/user' $null 'authenticated-user'
if ($identity.Status -ne 200 -or [string]::IsNullOrWhiteSpace([string]$identity.Body.login)) {
    throw "Research identity not readable (HTTP $($identity.Status))."
}
$owner = [string]$identity.Body.login

for ($trial = 1; $trial -le $Trials; $trial++) {
    $suffix = (Get-Date -Format 'HHmmssfff') + "-$trial"
    $org = "s65-org-$suffix".ToLowerInvariant()
    $repo = "s65-repo-$suffix".ToLowerInvariant()
    $teamStatuses = [ordered]@{}
    $releaseStatuses = [ordered]@{}

    # Team: verify the org, try only contract-required fields, then try
    # documented optional fields on a differently named team in that org.
    try {
        $created = Invoke-GiteaRequest POST '/orgs' @{ username = $org } "trial-$trial-create-org"
        $teamStatuses.org_create = $created.Status
        if ($created.Status -ne 201) { throw "org-create-http-$($created.Status)" }
        $orgRead = Invoke-GiteaRequest GET "/orgs/$org" $null "trial-$trial-observe-org"
        $teamStatuses.org_read = $orgRead.Status
        if ($orgRead.Status -ne 200 -or [string]$orgRead.Body.username -ne $org) {
            throw 'org-not-independently-verified'
        }

        $minimalName = ("s65-min-$suffix").ToLowerInvariant()
        $richName = ("s65-full-$suffix").ToLowerInvariant()
        $minimal = Invoke-GiteaRequest POST "/orgs/$org/teams" `
            @{ name = $minimalName } "trial-$trial-team-minimal"
        $teamStatuses.minimal = $minimal.Status
        $rich = Invoke-GiteaRequest POST "/orgs/$org/teams" `
            @{ name = $richName; permission = 'read';
               description = 'Stage 6.5 serial control'; visibility = 'private' } `
            "trial-$trial-team-documented-optionals"
        $teamStatuses.documented_optionals = $rich.Status

        $minimalRead = $null
        if ($minimal.Status -eq 201 -and $null -ne $minimal.Body.id) {
            $minimalRead = Invoke-GiteaRequest GET "/teams/$($minimal.Body.id)" $null "trial-$trial-observe-minimal-team"
            $teamStatuses.minimal_read = $minimalRead.Status
        }
        $richRead = $null
        if ($rich.Status -eq 201 -and $null -ne $rich.Body.id) {
            $richRead = Invoke-GiteaRequest GET "/teams/$($rich.Body.id)" $null "trial-$trial-observe-documented-team"
            $teamStatuses.documented_read = $richRead.Status
        }
        $minimalVisible = $null -ne $minimalRead -and $minimalRead.Status -eq 200
        $richVisible = $null -ne $richRead -and $richRead.Status -eq 200
        $teamVerdict = 'INCONCLUSIVE'
        $teamReason = 'controls-did-not-establish-valid-visible-team'
        if ($minimalVisible -and $richVisible) {
            $teamVerdict = 'PASS'; $teamReason = 'both-schema-valid-team-creations-visible'
        }
        elseif ($minimal.Status -eq 500 -and $richVisible) {
            $teamVerdict = 'MINIMAL_REQUEST_SERVER_FAILURE'
            $teamReason = 'required-only-request-500-while-documented-optionals-work'
        }
        elseif ($minimal.Status -eq 500 -and $rich.Status -eq 500) {
            $teamVerdict = 'SERVER_ERROR_CANDIDATE'
            $teamReason = 'verified-org-and-two-schema-valid-team-requests-500'
        }
        New-Finding $trial 'team' $org $teamVerdict $teamReason $teamStatuses `
            @{ minimal_readable = $minimalVisible; documented_readable = $richVisible }
    }
    catch {
        New-Finding $trial 'team' $org 'INCONCLUSIVE' ([string]$_.Exception.Message) $teamStatuses @{}
    }

    # Release: verify the initialized repository, its branch, and the newly
    # created release. Compare a one-field PATCH with a full documented PATCH.
    try {
        $repoCreated = Invoke-GiteaRequest POST '/user/repos' `
            @{ name = $repo; auto_init = $true; default_branch = 'main' } "trial-$trial-create-repo"
        $releaseStatuses.repo_create = $repoCreated.Status
        if ($repoCreated.Status -notin @(201, 202)) { throw "repo-create-http-$($repoCreated.Status)" }
        $repoRead = Invoke-GiteaRequest GET "/repos/$owner/$repo" $null "trial-$trial-observe-repo"
        $releaseStatuses.repo_read = $repoRead.Status
        if ($repoRead.Status -ne 200 -or [string]$repoRead.Body.full_name -ne "$owner/$repo") {
            throw 'repo-not-independently-verified'
        }
        $branch = [string]$repoRead.Body.default_branch
        if ([string]::IsNullOrWhiteSpace($branch)) { throw 'repo-default-branch-unavailable' }
        $branchPath = [System.Uri]::EscapeDataString($branch)
        $branchRead = Invoke-GiteaRequest GET "/repos/$owner/$repo/branches/$branchPath" $null "trial-$trial-observe-branch"
        $releaseStatuses.branch_read = $branchRead.Status
        if ($branchRead.Status -ne 200) { throw 'repo-branch-not-independently-verified' }

        $tag = "s65-v1-$suffix".ToLowerInvariant()
        $releaseCreated = Invoke-GiteaRequest POST "/repos/$owner/$repo/releases" `
            @{ tag_name = $tag; name = $tag; target_commitish = $branch;
               draft = $false; prerelease = $false; body = 'Stage 6.5 baseline' } `
            "trial-$trial-create-release"
        $releaseStatuses.release_create = $releaseCreated.Status
        if ($releaseCreated.Status -ne 201 -or $null -eq $releaseCreated.Body.id) {
            throw 'release-not-created-with-id'
        }
        $itemPath = "/repos/$owner/$repo/releases/$($releaseCreated.Body.id)"
        $before = Invoke-GiteaRequest GET $itemPath $null "trial-$trial-observe-release-before"
        $releaseStatuses.release_read_before = $before.Status
        if ($before.Status -ne 200 -or [string]$before.Body.tag_name -ne $tag) {
            throw 'release-identity-not-independently-verified'
        }

        $partialBody = "Stage 6.5 partial update $trial"
        $partial = Invoke-GiteaRequest PATCH $itemPath @{ body = $partialBody } "trial-$trial-release-one-field-patch"
        $releaseStatuses.one_field_patch = $partial.Status
        $afterPartial = Invoke-GiteaRequest GET $itemPath $null "trial-$trial-observe-release-after-one-field"
        $releaseStatuses.read_after_one_field = $afterPartial.Status

        $fullBody = "Stage 6.5 full update $trial"
        $full = Invoke-GiteaRequest PATCH $itemPath `
            @{ tag_name = $tag; name = $tag; target_commitish = $branch;
               draft = $false; prerelease = $false; body = $fullBody } `
            "trial-$trial-release-full-documented-patch"
        $releaseStatuses.full_patch = $full.Status
        $afterFull = Invoke-GiteaRequest GET $itemPath $null "trial-$trial-observe-release-after-full"
        $releaseStatuses.read_after_full = $afterFull.Status

        $partialPersisted = $partial.Status -eq 200 -and $afterPartial.Status -eq 200 -and
            [string]$afterPartial.Body.body -eq $partialBody
        $fullPersisted = $full.Status -eq 200 -and $afterFull.Status -eq 200 -and
            [string]$afterFull.Body.body -eq $fullBody
        $releaseVerdict = 'INCONCLUSIVE'
        $releaseReason = 'success-and-independent-read-did-not-agree'
        if ($partialPersisted -and $fullPersisted) {
            $releaseVerdict = 'PASS'; $releaseReason = 'both-patches-persisted'
        }
        elseif ($partial.Status -eq 500 -and $fullPersisted) {
            $releaseVerdict = 'PARTIAL_REQUEST_SERVER_FAILURE'
            $releaseReason = 'one-field-request-500-while-full-documented-request-persists'
        }
        elseif ($partial.Status -eq 500 -and $full.Status -eq 500 -and
                $afterPartial.Status -eq 200 -and $afterFull.Status -eq 200) {
            $releaseVerdict = 'SERVER_ERROR_CANDIDATE'
            $releaseReason = 'independently-verified-release-and-two-schema-valid-patches-500'
        }
        New-Finding $trial 'release' "$owner/$repo/$tag" $releaseVerdict $releaseReason $releaseStatuses `
            @{ branch = $branch; release_id = $releaseCreated.Body.id;
               partial_persisted = $partialPersisted; full_persisted = $fullPersisted }
    }
    catch {
        New-Finding $trial 'release' "$owner/$repo" 'INCONCLUSIVE' ([string]$_.Exception.Message) $releaseStatuses @{}
    }
}

$counts = [ordered]@{}
foreach ($group in ($results | Group-Object family, verdict | Sort-Object Name)) {
    $counts[$group.Name] = $group.Count
}
$summary = [ordered]@{
    schema_version = 1
    stage = 'gitea-stage6.5-serial-precondition-confirmation'
    spec = 'model/gitea/gitea-1.27.3-swagger.json'
    spec_sha256 = 'a0baa9a766c22492bd8c45744157c611d3e95cfc0dc73d6f5d14f294cdddce38'
    claim_rule = 'A 500 after verified creation/read is a candidate. Server logs and reproduction are required before product-bug attribution.'
    environment = @{ base_url = $BaseUrl; container = $Container; authenticated_user = $owner; trials = $Trials }
    counts = $counts
    results = $results
}
$summary | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath (Join-Path $runDir 'stage6_5-summary.json') -Encoding utf8
$trace | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath (Join-Path $runDir 'stage6_5-http-trace.json') -Encoding utf8
$results | Export-Csv -LiteralPath (Join-Path $runDir 'stage6_5-trials.csv') -NoTypeInformation -Encoding utf8

$logPath = Join-Path $runDir 'gitea-container.log'
$savedPreference = $ErrorActionPreference
try {
    $ErrorActionPreference = 'Continue'
    & docker logs --since $startedUtc $Container *>&1 | Out-File -LiteralPath $logPath -Encoding utf8
}
catch { $_ | Out-File -LiteralPath $logPath -Encoding utf8 }
finally { $ErrorActionPreference = $savedPreference }

Copy-Item -LiteralPath $PSCommandPath -Destination (Join-Path $runDir 'Invoke-Gitea-Stage6_5.ps1')
@{ created_utc = (Get-Date).ToUniversalTime().ToString('o'); script = $MyInvocation.MyCommand.Name;
   powershell = $PSVersionTable.PSVersion.ToString(); source_pattern = 'Invoke-Gitea-Stage5_2.ps1' } |
    ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $runDir 'run-metadata.json') -Encoding utf8
Get-ChildItem -LiteralPath $runDir -File |
    Where-Object { $_.Name -ne 'checksums.csv' } |
    Sort-Object Name | Get-FileHash -Algorithm SHA256 |
    Select-Object @{n='file';e={Split-Path $_.Path -Leaf}}, @{n='sha256';e={$_.Hash.ToLowerInvariant()}} |
    Export-Csv -LiteralPath (Join-Path $runDir 'checksums.csv') -NoTypeInformation -Encoding utf8

if ($FreezeEvidence) {
    $evidenceDir = Join-Path (Split-Path $OutputRoot -Parent) 'evidence'
    if ([string]::IsNullOrWhiteSpace($evidenceDir)) { $evidenceDir = '.\evidence' }
    New-Item -ItemType Directory -Force -Path $evidenceDir | Out-Null
    $zip = Join-Path $evidenceDir "$runName-review.zip"
    Compress-Archive -Path (Join-Path $runDir '*') -DestinationPath $zip
    Write-Host "Evidence ZIP: $zip"
    Write-Host "ZIP SHA256: $((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant())"
}
Write-Host "GITEA_STAGE6_5_COMPLETE run=$runDir trials=$Trials"
foreach ($row in $results) {
    Write-Host "GITEA_STAGE6_5_RESULT trial=$($row.trial) family=$($row.family) verdict=$($row.verdict) reason=$($row.reason)"
}
