[CmdletBinding()]
param(
    [string]$BaseUrl = "http://127.0.0.1:3477/api/v1",
    [string]$Token = $env:GITEA_API_TOKEN,
    [int]$Trials = 10,
    [string]$Container = "gitea-stage1-server",
    [string]$OutputRoot = ".\runs",
    [switch]$FreezeEvidence
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($Token)) {
    throw "GITEA_API_TOKEN is not set. Reuse the token created by the Gitea environment preparation step."
}
if ($Trials -lt 1) { throw "Trials must be at least 1." }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$runName = "gitea-stage5_2-merge-upstream-valid-request-$stamp"
$runDir = Join-Path $OutputRoot $runName
New-Item -ItemType Directory -Force $runDir | Out-Null

$headers = @{
    Authorization = "token $Token"
    Accept = "application/json"
    "Content-Type" = "application/json"
}
$trace = [System.Collections.Generic.List[object]]::new()
$results = [System.Collections.Generic.List[object]]::new()

function Convert-BodyToText {
    param($Body)
    if ($null -eq $Body) { return $null }
    if ($Body -is [string]) { return $Body }
    return ($Body | ConvertTo-Json -Depth 30 -Compress)
}

function Invoke-GiteaRequest {
    param(
        [Parameter(Mandatory)][string]$Method,
        [Parameter(Mandatory)][string]$Path,
        $Body = $null,
        [string]$Label = ""
    )
    $uri = "$($BaseUrl.TrimEnd('/'))/$($Path.TrimStart('/'))"
    $bodyText = Convert-BodyToText $Body
    $started = Get-Date
    $status = 0
    $responseText = ""
    try {
        $args = @{
            Uri = $uri
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        if ($null -ne $bodyText) { $args.Body = $bodyText }
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
        catch { $responseText = [string]$_.Exception.Message }
    }
    $parsed = $null
    if (-not [string]::IsNullOrWhiteSpace($responseText)) {
        try { $parsed = $responseText | ConvertFrom-Json } catch { $parsed = $responseText }
    }
    $entry = [ordered]@{
        timestamp_utc = $started.ToUniversalTime().ToString("o")
        label = $Label
        method = $Method
        path = $Path
        request = $Body
        status = $status
        response = $parsed
        elapsed_ms = [math]::Round(((Get-Date) - $started).TotalMilliseconds, 3)
    }
    $trace.Add([pscustomobject]$entry)
    return [pscustomobject]@{ Status = $status; Body = $parsed; Text = $responseText }
}

function Wait-Repository {
    param([string]$Owner, [string]$Repo, [int]$Seconds = 30)
    $deadline = (Get-Date).AddSeconds($Seconds)
    do {
        $r = Invoke-GiteaRequest GET "/repos/$Owner/$Repo" $null "wait-repository"
        if ($r.Status -eq 200) { return $r }
        Start-Sleep -Milliseconds 500
    } while ((Get-Date) -lt $deadline)
    return $r
}

function Get-BranchSha {
    param([string]$Owner, [string]$Repo, [string]$Branch)
    $r = Invoke-GiteaRequest GET "/repos/$Owner/$Repo/branches/$Branch" $null "observe-branch"
    if ($r.Status -ne 200) { return $null }
    return [string]$r.Body.commit.id
}

$identity = Invoke-GiteaRequest GET "/user" $null "authenticated-user"
if ($identity.Status -ne 200 -or [string]::IsNullOrWhiteSpace([string]$identity.Body.login)) {
    throw "Could not resolve the authenticated Gitea user. HTTP $($identity.Status)."
}
$owner = [string]$identity.Body.login

for ($trial = 1; $trial -le $Trials; $trial++) {
    $suffix = (Get-Date -Format "HHmmssfff") + "-$trial"
    $upstream = "s51-upstream-$suffix".ToLowerInvariant()
    $org = "s51-org-$suffix".ToLowerInvariant()
    $fork = "s51-fork-$suffix".ToLowerInvariant()
    $verdict = "INCONCLUSIVE"
    $reason = "setup-not-complete"
    $nonForkStatus = $null
    $validForkStatus = $null
    $upstreamSha = $null
    $forkBeforeSha = $null
    $forkAfterSha = $null
    $preconditionsVerified = $false

    try {
        $create = Invoke-GiteaRequest POST "/user/repos" @{
            name = $upstream
            auto_init = $true
            default_branch = "main"
            description = "Stage 5.2 upstream control"
        } "create-upstream"
        if ($create.Status -notin 201, 202) { throw "create-upstream-http-$($create.Status)" }

        $upstreamRepo = Wait-Repository $owner $upstream
        if ($upstreamRepo.Status -ne 200) { throw "upstream-not-readable" }
        $branch = [string]$upstreamRepo.Body.default_branch
        if ([string]::IsNullOrWhiteSpace($branch)) { $branch = "main" }

        # Negative control: the same schema-valid request against a verified non-fork.
        $nonFork = Invoke-GiteaRequest POST "/repos/$owner/$upstream/merge-upstream" @{
            branch = $branch
            ff_only = $true
        } "non-fork-control"
        $nonForkStatus = $nonFork.Status

        $createOrg = Invoke-GiteaRequest POST "/orgs" @{
            username = $org
            full_name = "Stage 5.2 trial $trial"
            visibility = "private"
        } "create-target-organization"
        if ($createOrg.Status -notin 201, 202) { throw "create-org-http-$($createOrg.Status)" }

        $forkResponse = Invoke-GiteaRequest POST "/repos/$owner/$upstream/forks" @{
            organization = $org
            name = $fork
        } "create-real-fork"
        if ($forkResponse.Status -notin 201, 202) { throw "create-fork-http-$($forkResponse.Status)" }

        $forkRepo = Wait-Repository $org $fork 45
        if ($forkRepo.Status -ne 200) { throw "fork-not-readable" }
        $parentFullName = [string]$forkRepo.Body.parent.full_name
        $isFork = [bool]$forkRepo.Body.fork
        if (-not $isFork -or $parentFullName -ne "$owner/$upstream") {
            throw "fork-precondition-not-verified"
        }

        $forkBeforeSha = Get-BranchSha $org $fork $branch
        if ([string]::IsNullOrWhiteSpace($forkBeforeSha)) { throw "fork-head-not-observed" }

        $content = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("stage5.1 trial $trial $stamp`n"))
        $commit = Invoke-GiteaRequest POST "/repos/$owner/$upstream/contents/stage5_2_$trial.txt" @{
            branch = $branch
            content = $content
            message = "Stage 5.2 upstream divergence trial $trial"
        } "advance-upstream"
        if ($commit.Status -notin 200, 201) { throw "advance-upstream-http-$($commit.Status)" }

        $upstreamSha = Get-BranchSha $owner $upstream $branch
        if ([string]::IsNullOrWhiteSpace($upstreamSha)) { throw "upstream-head-not-observed" }
        if ($upstreamSha -eq $forkBeforeSha) { throw "divergence-not-established" }
        $preconditionsVerified = $true

        $merge = Invoke-GiteaRequest POST "/repos/$org/$fork/merge-upstream" @{
            branch = $branch
            ff_only = $true
        } "verified-fork-merge-upstream"
        $validForkStatus = $merge.Status
        $forkAfterSha = Get-BranchSha $org $fork $branch

        if ($merge.Status -eq 500) {
            $verdict = "CONFIRMED_VALID_FORK_SERVER_FAILURE"
            $reason = "verified-fork-and-divergence-returned-500"
        }
        elseif ($merge.Status -eq 200 -and $forkAfterSha -eq $upstreamSha) {
            $verdict = "PASS"
            $reason = "verified-fork-fast-forwarded-to-upstream"
        }
        elseif ($merge.Status -eq 200) {
            $verdict = "STATE_VIOLATION"
            $reason = "merge-returned-200-but-fork-head-did-not-match-upstream"
        }
        elseif ($merge.Status -in 400, 404, 409, 422) {
            $verdict = "CONTRACT_REJECTION"
            $reason = "verified-fork-request-rejected"
        }
        else {
            $verdict = "INCONCLUSIVE"
            $reason = "unexpected-status-$($merge.Status)"
        }
    }
    catch {
        $verdict = "INCONCLUSIVE"
        $reason = [string]$_.Exception.Message
    }
    finally {
        $results.Add([pscustomobject][ordered]@{
            trial = $trial
            upstream = "$owner/$upstream"
            fork = "$org/$fork"
            preconditions_verified = $preconditionsVerified
            non_fork_control_status = $nonForkStatus
            valid_fork_status = $validForkStatus
            upstream_sha = $upstreamSha
            fork_before_sha = $forkBeforeSha
            fork_after_sha = $forkAfterSha
            verdict = $verdict
            reason = $reason
        })
    }
}

$counts = [ordered]@{}
foreach ($group in ($results | Group-Object verdict | Sort-Object Name)) { $counts[$group.Name] = $group.Count }
$validTrials = @($results | Where-Object preconditions_verified).Count
$confirmed = @($results | Where-Object verdict -eq "CONFIRMED_VALID_FORK_SERVER_FAILURE").Count
$passes = @($results | Where-Object verdict -eq "PASS").Count
$status = if ($validTrials -eq $Trials -and $confirmed -eq $Trials) {
    "CONFIRMED_PRODUCT_DEFECT"
} elseif ($validTrials -eq $Trials -and $passes -eq $Trials) {
    "NOT_REPRODUCED_UNDER_VALID_PRECONDITIONS"
} elseif ($validTrials -eq 0) {
    "INCONCLUSIVE_SETUP_FAILURE"
} else {
    "MIXED_OR_INCONCLUSIVE"
}

$summary = [ordered]@{
    schema_version = 1
    stage = "gitea-stage5.2-valid-request-semantic-confirmation"
    status = $status
    claim_rule = "Only HTTP 500 after fork identity and upstream divergence are independently verified is a confirmed valid-operation defect. Non-fork 500 is retained only as a robustness control."
    environment = [ordered]@{
        base_url = $BaseUrl
        container = $Container
        authenticated_user = $owner
        trials_requested = $Trials
    }
    counts = $counts
    valid_precondition_trials = $validTrials
    results = $results
}

$summaryPath = Join-Path $runDir "stage5_2-summary.json"
$tracePath = Join-Path $runDir "stage5_2-http-trace.json"
$csvPath = Join-Path $runDir "stage5_2-trials.csv"
$logPath = Join-Path $runDir "gitea-container.log"
$summary | ConvertTo-Json -Depth 30 | Set-Content $summaryPath -Encoding utf8
$trace | ConvertTo-Json -Depth 30 | Set-Content $tracePath -Encoding utf8
$results | Export-Csv $csvPath -NoTypeInformation -Encoding utf8

try {
    $savedErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    & docker logs $Container *>&1 | Out-File $logPath -Encoding utf8
    $ErrorActionPreference = $savedErrorActionPreference
}
catch {
    $ErrorActionPreference = $savedErrorActionPreference
    $_ | Out-File $logPath -Encoding utf8
}

$metadata = [ordered]@{
    created_utc = (Get-Date).ToUniversalTime().ToString("o")
    script = $MyInvocation.MyCommand.Name
    powershell = $PSVersionTable.PSVersion.ToString()
    input_stage5_sha256 = "38832e7e87cbccef2e9234ff094a86a01f4e697bfd7968f140895057207b8039"
    input_stage5_1_sha256 = "0b04610b7ad6bccdb3779ae058450081bb6d089f63f5f404e1bb533157108e69"
    revision_reason = "Stage 5.1 omitted required MergeUpstreamRequest.branch, causing deterministic HTTP 404 before the intended semantic confirmation. Stage 5.2 supplies the independently observed default branch."
}
$metadata | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $runDir "run-metadata.json") -Encoding utf8

$hashes = Get-ChildItem $runDir -File | Sort-Object Name | Get-FileHash -Algorithm SHA256 |
    Select-Object @{n="file";e={Split-Path $_.Path -Leaf}}, @{n="sha256";e={$_.Hash.ToLowerInvariant()}}
$hashes | Export-Csv (Join-Path $runDir "checksums.csv") -NoTypeInformation -Encoding utf8

if ($FreezeEvidence) {
    $evidenceDir = Join-Path (Split-Path $OutputRoot -Parent) "evidence"
    if ([string]::IsNullOrWhiteSpace($evidenceDir)) { $evidenceDir = ".\evidence" }
    New-Item -ItemType Directory -Force $evidenceDir | Out-Null
    $zip = Join-Path $evidenceDir "$runName-review.zip"
    Compress-Archive -Path (Join-Path $runDir "*") -DestinationPath $zip -Force
    Write-Host "Evidence ZIP: $zip"
    Write-Host "ZIP SHA256: $((Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant())"
}

$summary.counts | ConvertTo-Json -Compress
Write-Host "GITEA_STAGE5_2_$status"
Write-Host "Run directory: $runDir"
if ($status -eq "CONFIRMED_PRODUCT_DEFECT") { exit 2 }
if ($status -eq "NOT_REPRODUCED_UNDER_VALID_PRECONDITIONS") { exit 0 }
exit 3
