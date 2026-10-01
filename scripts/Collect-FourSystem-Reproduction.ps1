param(
    [string]$ProjectRoot = 'C:\work\temp\vikunja_tse_study',
    [string]$OutputDirectory = '',
    [string[]]$AdditionalRunDirectories = @()
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $ProjectRoot).Path
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $root 'evidence' }
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$stage = Join-Path ([IO.Path]::GetTempPath()) "fse-four-system-capture-$stamp"
New-Item -ItemType Directory -Path $stage -Force | Out-Null
$missing = New-Object System.Collections.Generic.List[string]
$copied = New-Object System.Collections.Generic.List[string]
$deny = '(?i)(^|[\\/])(\.git|__pycache__|node_modules|venv|\.venv|volumes|storage)([\\/]|$)|(^|[\\/])\.env($|\.)|(^|[\\/])[^\\/]*(password|secret|private.key|\.pem$|\.pfx$)[^\\/]*$'
function Copy-SafeTree([string]$relative, [string]$destination) {
    $origin = Join-Path $root $relative
    if (-not (Test-Path -LiteralPath $origin)) { $missing.Add($relative); return }
    $destRoot = Join-Path $stage $destination
    if (Test-Path -LiteralPath $origin -PathType Leaf) { $items = @((Get-Item -LiteralPath $origin)) }
    else { $items = @(Get-ChildItem -LiteralPath $origin -File -Recurse -Force) }
    foreach ($item in $items) {
        $suffix = if ($item.FullName -eq $origin) { $item.Name } else { $item.FullName.Substring($origin.Length).TrimStart('\','/') }
        $target = Join-Path $destRoot $suffix
        if ($item.FullName -match $deny -or $item.Length -gt 100MB) { continue }
        New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
        Copy-Item -LiteralPath $item.FullName -Destination $target -Force
        $copied.Add($item.FullName.Substring($root.Length).TrimStart('\','/'))
    }
}
foreach ($folder in @('generator_baseline','model','config','scripts','tests','docker','compose')) {
    Copy-SafeTree $folder (Join-Path 'project' $folder)
}
foreach ($file in @('requirements.txt','pyproject.toml','README.md','docker-compose.yml','docker-compose.yaml')) {
    if (Test-Path -LiteralPath (Join-Path $root $file)) { Copy-SafeTree $file 'project' }
}
$runNames = @(
 'increment8_1-direct-confirmation-20260922_164621',
 'increment8_2-postgresql-differential-20260922_172707',
 'vikunja-patch304-confirmation-20260923_082517_775',
 'gitea-stage3-live-acceptance-20260923_142522_402',
 'gitea-stage3-live-acceptance-20260923_142703_821',
 'gitea-stage3-live-acceptance-20260923_142832_674',
 'gitea-stage3-live-acceptance-20260923_143005_467',
 'gitea-stage3-live-acceptance-20260923_143205_942',
 'research-fit-immich-semantic-confirmation-20260924_142834_805051',
 'research-fit-immich-generated-20260926_191223_743',
 'research-fit-immich-generated-20260926_191733_041',
 'research-fit-immich-generated-20260926_191755_771',
 'research-fit-mealie-stage4-20260927_124625_208',
 'research-fit-mealie-stage4-20260927_125134_011'
) + $AdditionalRunDirectories
foreach ($name in $runNames) {
    $runDir = Join-Path (Join-Path $root 'runs') $name
    if (-not (Test-Path -LiteralPath $runDir -PathType Container)) { $missing.Add("runs/$name"); continue }
    # Generated sources and execution metadata, excluding large raw logs already in frozen result ZIPs.
    foreach ($item in @(Get-ChildItem -LiteralPath $runDir -File -Recurse)) {
        $rel = $item.FullName.Substring($runDir.Length).TrimStart('\','/')
        if ($item.FullName -match $deny -or $item.Length -gt 30MB) { continue }
        if ($rel -notmatch '(?i)(generated|provengo_project|project\\spec|project/spec|summary\.json|run-metadata\.json|campaign\.json|dependency_graph\.json|concurrency-plan|verification-manifest|scope\.json)') { continue }
        $target = Join-Path (Join-Path $stage (Join-Path 'runs' $name)) $rel
        New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
        Copy-Item -LiteralPath $item.FullName -Destination $target -Force
        $copied.Add("runs/$name/$rel")
    }
}
@('generator_baseline','model','config','scripts','tests','runs') | ForEach-Object {
    $folder = Join-Path $stage $_
    if (Test-Path -LiteralPath $folder) { Set-Content -LiteralPath (Join-Path $folder 'README_CAPTURE.txt') -Value "Historical project capture: $_. Compare all versions, dependencies and hashes with the frozen review ZIPs before replay." }
}
Set-Content -LiteralPath (Join-Path $stage 'README.txt') -Value 'Supplement to four_system_research_kit_20260927.zip. Inspect for sensitive content before uploading. Not a standalone Docker image or complete install. MISSING.txt lists unavailable paths.'
$missing | Set-Content -LiteralPath (Join-Path $stage 'MISSING.txt')
$copied | Set-Content -LiteralPath (Join-Path $stage 'COPIED.txt')
$versions = @()
foreach ($cmd in @('python','java','docker','provengo')) {
    try {
        $argsForVersion = if ($cmd -eq 'docker') { @('version','--format','{{json .}}') } else { @('--version') }
        $versions += "${cmd} : $((& $cmd @argsForVersion 2>&1 | Out-String).Trim())"
    } catch { $versions += "${cmd} : unavailable" }
}
$versions | Set-Content -LiteralPath (Join-Path $stage 'TOOL_VERSIONS.txt')
try {
    docker ps -a --format '{{json .}}' 2>$null | Set-Content -LiteralPath (Join-Path $stage 'DOCKER_CONTAINER_INVENTORY.jsonl')
} catch { Set-Content -LiteralPath (Join-Path $stage 'DOCKER_CONTAINER_INVENTORY.jsonl') -Value 'Docker inventory unavailable' }
$zip = Join-Path $OutputDirectory "four-system-environment-capture-$stamp.zip"
Compress-Archive -LiteralPath (Get-ChildItem -LiteralPath $stage -Force).FullName -DestinationPath $zip -Force
Write-Host "FSE_ENVIRONMENT_CAPTURE_READY $zip copied=$($copied.Count) missing=$($missing.Count)"
Write-Host "SHA256 $((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant())"
Write-Host 'Review the ZIP for secrets and upload it to complete the four-system kit.'
