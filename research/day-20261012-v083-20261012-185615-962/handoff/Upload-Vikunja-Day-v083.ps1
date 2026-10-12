param(
    [string]$StudyRoot = 'C:\work\temp\vikunja_tse_study',
    [string]$WorkBase = 'C:\work\temp',
    [string]$Downloads = (Join-Path $env:USERPROFILE 'Downloads')
)
$ErrorActionPreference = 'Stop'
Write-Host 'VIKUNJA_DAY_MAIN_UPLOAD v083'
Get-Command git -ErrorAction Stop | Out-Null
$remote = 'https://github.com/weissye/vikunja_tse_study.git'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$workspace = Join-Path $WorkBase ('vikunja-upload-v083-' + $stamp)
$repo = Join-Path $workspace 'repo'
$relative = 'research/day-20261012-v083-' + $stamp
$target = Join-Path $repo $relative
$since = [datetime]'2026-10-12T00:00:00'

function Git-Checked([string[]]$Arguments) {
    $previous = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = @(& git @Arguments 2>&1)
        $code = $LASTEXITCODE
    }
    finally { $ErrorActionPreference = $previous }
    if ($code -ne 0) {
        $output | Select-Object -Last 12 | Out-Host
        throw 'Git operation failed. No complete upload is claimed.'
    }
    return ($output | ForEach-Object { "$_" })
}

if (-not (Test-Path -LiteralPath $StudyRoot -PathType Container)) { throw 'StudyRoot missing.' }
New-Item -ItemType Directory -Path $workspace | Out-Null
$oldLfs = $env:GIT_LFS_SKIP_SMUDGE
try {
    $env:GIT_LFS_SKIP_SMUDGE = '1'
    Write-Host 'Preparing isolated MAIN checkout; existing study tree is preserved.'
    Git-Checked @('-c','core.longpaths=true','-c','core.autocrlf=false','clone','--filter=blob:none','--depth','1','--single-branch','--branch','main','--no-checkout',$remote,$repo) | Out-Null
    Git-Checked @('-C',$repo,'config','core.longpaths','true') | Out-Null
    Git-Checked @('-C',$repo,'config','core.autocrlf','false') | Out-Null
    # Keep the complete existing MAIN tree in the index without downloading its file contents.
    Git-Checked @('-C',$repo,'read-tree','HEAD') | Out-Null
    $baseCommit = (@(Git-Checked @('-C',$repo,'rev-parse','HEAD'))[-1]).Trim()
    Git-Checked @('-C',$repo,'var','GIT_AUTHOR_IDENT') | Out-Null
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    [IO.File]::WriteAllText((Join-Path $target '.gitattributes'), "* -filter -text`n", (New-Object System.Text.UTF8Encoding($false)))
    $inventory = New-Object 'System.Collections.Generic.List[object]'
    $deduplicated = @{}
    function Save-Artifact([string]$Source, [string]$RelativePath, [string]$Kind) {
        $item = Get-Item -LiteralPath $Source
        if ($item.Length -ge 90MB) { throw "File exceeds this upload's Git size bound: $Source" }
        $hash = (Get-FileHash -LiteralPath $Source -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($Kind -eq 'package' -and $deduplicated.ContainsKey($hash)) { return }
        $destination = Join-Path $target $RelativePath
        New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $Source -Destination $destination
        if ((Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hash) { throw "Copy verification failed: $Source" }
        $inventory.Add([PSCustomObject]@{ Path=$RelativePath.Replace('\','/'); SHA256=$hash; Bytes=$item.Length; Kind=$Kind; OriginalPath=$Source })
        if ($Kind -eq 'package') { $deduplicated[$hash]=$true }
    }

    $packages = @(Get-ChildItem -LiteralPath $Downloads -File -Filter 'Vikunja*.zip' |
        Where-Object { $_.Name -match 'v0(69|7[0-9]|8[0-2])(?:[^0-9]|$)' -and $_.Name -notmatch 'Review|review' })
    if (-not ($packages | Where-Object Name -Match 'v082')) { throw 'The v082 delivery ZIP is missing from Downloads; preserve/download it before upload.' }
    foreach ($file in $packages) { Save-Artifact $file.FullName ('packages/' + $file.Name) 'package' }

    $runRoots = @((Join-Path $StudyRoot 'runs'))
    foreach ($folder in @(Get-ChildItem -LiteralPath $WorkBase -Directory -Filter 'work-v011-*' -ErrorAction SilentlyContinue)) {
        $runRoots += Join-Path $folder.FullName 'v\runs'
    }
    $reviewNumber = 0
    foreach ($runRoot in $runRoots) {
        if (-not (Test-Path -LiteralPath $runRoot)) { continue }
        $candidates = @(Get-ChildItem -LiteralPath $runRoot -File -Filter 'review_v*.zip')
        $candidates += @(Get-ChildItem -LiteralPath $runRoot -Directory | ForEach-Object {
            Get-ChildItem -LiteralPath $_.FullName -File -Filter 'review_v*.zip'
        })
        $reviews = @($candidates | Where-Object { $_.Name -match '^review_v0(69|7[0-9]|8[0-2])\.zip$' -and $_.LastWriteTime -ge $since })
        foreach ($file in $reviews) {
            $reviewNumber++
            $name = ('{0:D3}-' -f $reviewNumber) + $file.Directory.Name + '-' + $file.Name
            Save-Artifact $file.FullName ('evidence/' + $name) 'review'
        }
    }
    if ($reviewNumber -eq 0) { throw 'No dated review ZIPs found. No push performed.' }
    if (-not ($inventory | Where-Object { $_.Kind -eq 'review' -and $_.Path -match 'review_v082\.zip$' })) { throw 'The final v082 review is missing. No push performed.' }

    $generated = Join-Path $StudyRoot 'generated'
    $generatedCount = 0
    if (Test-Path -LiteralPath $generated) {
        foreach ($folder in @(Get-ChildItem -LiteralPath $generated -Directory | Where-Object { $_.Name -match 'v0(69|7[0-9]|8[0-2])-' })) {
            foreach ($file in @(Get-ChildItem -LiteralPath $folder.FullName -Recurse -File | Where-Object {
                $_.FullName -notmatch '\\(products|\.private-snapshots|__pycache__|\.git)\\' -and
                $_.Extension -in @('.js','.json','.yml','.yaml','.md','.py','.ps1')
            })) {
                $suffix = $file.FullName.Substring($generated.TrimEnd('\').Length + 1)
                Save-Artifact $file.FullName ('generated/' + $suffix) 'generated'
                $generatedCount++
            }
        }
    }
    # Include the analysis and exact uploader used today.
    foreach ($name in @('ANALYSIS_v082.md','README_v083.md','Upload-Vikunja-Day-v083.ps1')) {
        Save-Artifact (Join-Path $PSScriptRoot $name) ('handoff/' + $name) 'handoff'
    }
    $summary = [PSCustomObject]@{
        Version='v083'; Date='2026-10-12'; Repository=$remote; BaseCommit=$baseCommit;
        Snapshot=$relative; FileCount=$inventory.Count; ReviewCount=$reviewNumber;
        GeneratedFileCount=$generatedCount; PackageVersions=@($packages.Name);
        PreservedEvidence='Includes accepted and failed/partial reviews without rewriting historical manifests';
        Excluded='Docker storage, private snapshots, passwords, runtime databases, products and JAR binaries';
        Continuation='Code/input/JS/evidence continuation; no live JVM or private checkpoint migration'
    }
    $inventory | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $target 'SHA256_v083.json') -Encoding UTF8
    $summary | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $target 'SUMMARY_v083.json') -Encoding UTF8
    Write-Host "Verified files: $($inventory.Count); reviews: $reviewNumber; generated files: $generatedCount"
    Git-Checked @('-C',$repo,'add','-f','--',$relative) | Out-Null
    Git-Checked @('-C',$repo,'commit','-m','Preserve Vikunja 2026-10-12 generator, JS and evidence through v082') | Out-Null
    $commit = (@(Git-Checked @('-C',$repo,'rev-parse','HEAD'))[-1]).Trim()
    # Non-forced push. If MAIN advanced concurrently, preserve this workspace and report failure.
    Git-Checked @('-C',$repo,'push','origin','HEAD:refs/heads/main') | Out-Null
    $published = @(Git-Checked @('ls-remote','--exit-code',$remote,'refs/heads/main'))
    $actual = ($published[-1] -split '\s+')[0]
    if ($actual -ne $commit) { throw 'Remote MAIN verification differs. Preserve the workspace and inspect the server commit.' }
    $receipt = Join-Path $Downloads ('Vikunja_UPLOAD_RECEIPT_v083-' + $stamp + '.json')
    [PSCustomObject]@{Status='V083_MAIN_UPLOAD_VERIFIED';Commit=$commit;Snapshot=$relative;Workspace=$workspace;Repository=$remote} |
        ConvertTo-Json | Set-Content -LiteralPath $receipt -Encoding UTF8
    Write-Host 'V083_MAIN_UPLOAD_VERIFIED'
    Write-Host "Commit: $commit"
    Write-Host "Snapshot: $relative"
    Write-Host "Receipt: $receipt"
}
finally { $env:GIT_LFS_SKIP_SMUDGE = $oldLfs }
