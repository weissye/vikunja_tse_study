[CmdletBinding()]
param(
    [ValidateSet('Both','RESTler','EvoMaster')]
    [string]$Mode = 'Both',

    [string]$RestlerDll = '',
    [string]$EvoMasterJar = '',
    [double]$RestlerHours = 1.0,
    [string]$EvoMasterTime = '1h',
    [int]$Seed = 1,
    [string]$PythonCommand = 'python',
    [string]$ResultsRoot = ''
)

$ErrorActionPreference = 'Stop'

# IMPORTANT: compute paths after param binding. This avoids the PowerShell
# $PSScriptRoot/Join-Path default-argument issue seen in earlier runners.
$Here = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($Here)) {
    $Here = (Get-Location).Path
}
# Allow the runner to live either under .\scripts or directly at project root.
if (Test-Path (Join-Path $Here 'resources')) {
    $ProjectRoot = (Resolve-Path $Here).Path
} else {
    $ProjectRoot = (Resolve-Path (Join-Path $Here '..')).Path
}

$OpenApi = Join-Path $ProjectRoot 'resources\development_kit\examples\library\openapi.json'
$Sut = Join-Path $ProjectRoot 'resources\development_kit\validation_only\suts\library\library_sut_buggy.py'
$SutLauncher = Join-Path $ProjectRoot 'scripts\run_flask_sut.py'
$ProxyScript = Join-Path $ProjectRoot 'scripts\http_trace_proxy.py'
$Evaluator = Join-Path $ProjectRoot 'scripts\evaluate_library_trace.py'

$ExpectedOpenApiSha = '965b2c8aac14485b8fa7bafb139e507c918240e71315246e1b817d8590089448'
$ExpectedSutSha = '849aae98751d84f15689caa35d7e80e9774638f90d84ece0f3143fbae1365196'
$ExpectedEvaluatorSha = '22addb3e4ae0af0e532ace15f40321e870373a9c016010dd503363ed538a960f'

if ([string]::IsNullOrWhiteSpace($ResultsRoot)) {
    $ResultsRoot = Join-Path $ProjectRoot 'results\library_baselines_v38'
} elseif (-not [System.IO.Path]::IsPathRooted($ResultsRoot)) {
    $ResultsRoot = [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot $ResultsRoot))
}
New-Item -ItemType Directory -Force $ResultsRoot | Out-Null

function Get-Sha256([string]$Path) {
    if (-not (Test-Path $Path)) { return $null }
    return (Get-FileHash -Algorithm SHA256 $Path).Hash.ToLowerInvariant()
}

function Assert-File([string]$Path, [string]$Label) {
    if (-not (Test-Path $Path)) { throw "Missing ${Label}: $Path" }
}

function Assert-FrozenLibraryV38 {
    Assert-File $OpenApi 'Library OpenAPI'
    Assert-File $Sut 'Library buggy SUT'
    Assert-File $SutLauncher 'SUT launcher'
    Assert-File $ProxyScript 'HTTP trace proxy'
    Assert-File $Evaluator 'Library evaluator'

    $oa = Get-Sha256 $OpenApi
    $su = Get-Sha256 $Sut
    $ev = Get-Sha256 $Evaluator

    if ($oa -ne $ExpectedOpenApiSha) {
        throw "V38 FREEZE GUARD FAILED: Library OpenAPI hash changed.`nExpected: $ExpectedOpenApiSha`nActual:   $oa"
    }
    if ($su -ne $ExpectedSutSha) {
        throw "V38 FREEZE GUARD FAILED: Library buggy SUT hash changed.`nExpected: $ExpectedSutSha`nActual:   $su"
    }
    if ($ev -ne $ExpectedEvaluatorSha) {
        throw "V38 FREEZE GUARD FAILED: Library evaluator hash changed.`nExpected: $ExpectedEvaluatorSha`nActual:   $ev"
    }

    Write-Host 'V38 FREEZE GUARD: PASS' -ForegroundColor Green
    Write-Host "OpenAPI : $oa"
    Write-Host "SUT     : $su"
    Write-Host "Evaluator: $ev"
}

function Find-RestlerDll([string]$Explicit) {
    if ($Explicit -and (Test-Path $Explicit)) { return (Resolve-Path $Explicit).Path }
    if ($env:RESTLER_DLL -and (Test-Path $env:RESTLER_DLL)) { return (Resolve-Path $env:RESTLER_DLL).Path }

    $candidates = @(
        'C:\FSETools\RESTler\restler\Restler.dll',
        'C:\work\temp\RestEvo\FSE2027_artifact_v1\external_tools\restler\restler\Restler.dll',
        'C:\work\temp\RestEvo\FSE2027_artifact\external_tools\restler\restler\Restler.dll'
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { return (Resolve-Path $c).Path }
    }
    return $null
}

function Find-EvoMasterJar([string]$Explicit) {
    if ($Explicit -and (Test-Path $Explicit)) { return (Resolve-Path $Explicit).Path }
    if ($env:EVOMASTER_JAR -and (Test-Path $env:EVOMASTER_JAR)) { return (Resolve-Path $env:EVOMASTER_JAR).Path }

    $direct = @(
        'C:\FSETools\EvoMaster\evomaster.jar',
        'C:\FSETools\EvoMaster\evomaster-standalone.jar',
        'C:\work\temp\RestEvo\FSE2027_artifact_v1\external_tools\evomaster\evomaster.jar',
        'C:\work\temp\RestEvo\FSE2027_artifact\external_tools\evomaster\evomaster.jar'
    )
    foreach ($c in $direct) {
        if (Test-Path $c) { return (Resolve-Path $c).Path }
    }

    $roots = @(
        'C:\FSETools\EvoMaster',
        'C:\work\temp\RestEvo\FSE2027_artifact_v1\external_tools\evomaster',
        'C:\work\temp\RestEvo\FSE2027_artifact\external_tools\evomaster'
    )
    foreach ($r in $roots) {
        if (Test-Path $r) {
            $jar = Get-ChildItem $r -Recurse -File -Filter '*.jar' -ErrorAction SilentlyContinue |
                Where-Object { $_.Name -match 'evomaster' } |
                Sort-Object FullName |
                Select-Object -First 1
            if ($jar) { return $jar.FullName }
        }
    }
    return $null
}

# Windows PowerShell 5.1 may surface native stderr as ErrorRecord objects.
# Keep cmdlet errors strict, but judge native tools by their exit code.
function Invoke-NativeLogged {
    param(
        [Parameter(Mandatory=$true)][string]$Command,
        [Parameter(Mandatory=$false)][object[]]$Arguments=@(),
        [Parameter(Mandatory=$true)][string]$LogPath,
        [switch]$Show
    )
    $saved = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        if ($Show) {
            & $Command @Arguments *>&1 | Tee-Object -FilePath $LogPath | Out-Host
        } else {
            & $Command @Arguments *> $LogPath
        }
        $code = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $saved
    }
    return [int]$code
}

function Wait-TextFile([string]$Path, $Process, [int]$TimeoutSeconds, [string]$What) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if ($Process -and $Process.HasExited) {
            throw "$What exited during startup. Inspect its stderr log."
        }
        if (Test-Path $Path) {
            $txt = (Get-Content $Path -Raw).Trim()
            if ($txt) { return $txt }
        }
        Start-Sleep -Milliseconds 100
    }
    throw "$What did not publish readiness metadata: $Path"
}

function New-RunDir([string]$Tool) {
    $stamp = Get-Date -Format 'yyyyMMdd_HHmmss_fff'
    $suffix = ([Guid]::NewGuid().ToString('N')).Substring(0,8)
    $dir = Join-Path $CampaignDir ("{0}_{1}_{2}" -f $Tool.ToLowerInvariant(), $stamp, $suffix)
    New-Item -ItemType Directory -Force $dir | Out-Null
    return $dir
}

function Start-LibraryStack([string]$RunDir) {
    $sutPortFile = Join-Path $RunDir 'sut.port'
    $proxyPortFile = Join-Path $RunDir 'proxy.port'
    $sutOut = Join-Path $RunDir 'sut.stdout.log'
    $sutErr = Join-Path $RunDir 'sut.stderr.log'
    $proxyOut = Join-Path $RunDir 'proxy.stdout.log'
    $proxyErr = Join-Path $RunDir 'proxy.stderr.log'
    $trace = Join-Path $RunDir 'http_trace.jsonl'

    $sutProc = Start-Process -FilePath $PythonCommand `
        -ArgumentList @($SutLauncher,'--script',$Sut,'--port','0','--port-file',$sutPortFile) `
        -WorkingDirectory (Split-Path $Sut -Parent) `
        -RedirectStandardOutput $sutOut -RedirectStandardError $sutErr -PassThru

    $sutPort = [int](Wait-TextFile $sutPortFile $sutProc 30 'Library SUT')

    $proxyProc = Start-Process -FilePath $PythonCommand `
        -ArgumentList @($ProxyScript,'--listen-port','0','--target-port',$sutPort,'--trace',$trace,'--port-file',$proxyPortFile) `
        -WorkingDirectory $ProjectRoot `
        -RedirectStandardOutput $proxyOut -RedirectStandardError $proxyErr -PassThru

    $proxyPort = [int](Wait-TextFile $proxyPortFile $proxyProc 20 'HTTP trace proxy')

    return [pscustomobject]@{
        Sut=$sutProc; Proxy=$proxyProc; SutPort=$sutPort; ProxyPort=$proxyPort; Trace=$trace
    }
}

function Stop-LibraryStack($Stack) {
    if ($Stack.Proxy -and -not $Stack.Proxy.HasExited) {
        Stop-Process -Id $Stack.Proxy.Id -Force -ErrorAction SilentlyContinue
    }
    if ($Stack.Sut -and -not $Stack.Sut.HasExited) {
        Stop-Process -Id $Stack.Sut.Id -Force -ErrorAction SilentlyContinue
    }
}

function Evaluate-Library([string]$RunDir, [string]$Trace) {
    if (-not (Test-Path $Trace)) { New-Item -ItemType File $Trace | Out-Null }
    $out = Join-Path $RunDir 'semantic_evaluation.json'
    $log = Join-Path $RunDir 'evaluator.log'
    $exit = Invoke-NativeLogged -Command $PythonCommand -Arguments @($Evaluator,$Trace) -LogPath $log
    if ($exit -ne 0) { throw "Library evaluator failed. Inspect: $log" }
    $jsonText = Get-Content $log -Raw
    Set-Content $out $jsonText -Encoding UTF8
    return (Get-Content $out -Raw | ConvertFrom-Json)
}

function Semantic-Classes($Sem) {
    $classes = @()
    if ($Sem.hold_ownership_confirmed) { $classes += 'HOLD_OWNERSHIP' }
    if ($Sem.loan_limit_confirmed) { $classes += 'LOAN_LIMIT' }
    return ,$classes
}

function Write-Metadata([string]$RunDir, [string]$Tool, $Stack, $Sem, [hashtable]$Extra) {
    $classes = @(Semantic-Classes $Sem)
    $meta = [ordered]@{
        schema_version = 2
        artifact_version = 'v38'
        experiment = 'library_frozen_baseline_rerun'
        system = 'library'
        tool = $Tool
        input_mode = 'openapi_only'
        seed = $Seed
        operation_count = 13
        openapi_sha256 = (Get-Sha256 $OpenApi)
        sut_sha256 = (Get-Sha256 $Sut)
        evaluator_sha256 = (Get-Sha256 $Evaluator)
        sut_port = $Stack.SutPort
        proxy_port = $Stack.ProxyPort
        oracle = 'external HTTP/SUT event trace; same evaluator used for frozen V38 Library comparison'
        confirmed_classes = $classes
        semantic_class_count = $classes.Count
        semantic_score = ("{0}/2" -f $classes.Count)
        event_count = $Sem.event_count
        hold_ownership_confirmed = [bool]$Sem.hold_ownership_confirmed
        loan_limit_confirmed = [bool]$Sem.loan_limit_confirmed
        native_tool_faults_kept_separate = $true
        note = 'V38 Library rerun after contract-conformance fix only: successful DELETE responses in the buggy SUT now match the unchanged OpenAPI contract. Semantic bug logic is unchanged.'
    }
    foreach ($k in $Extra.Keys) { $meta[$k] = $Extra[$k] }
    $meta | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $RunDir 'run_metadata.json') -Encoding UTF8
    return [pscustomobject]$meta
}

function Run-RESTlerV38([string]$Dll) {
    Write-Host "`n================ RESTLER / LIBRARY V38 ================" -ForegroundColor Cyan
    $runDir = New-RunDir 'RESTler'
    $compileRoot = Join-Path $runDir 'compile'
    $fuzzRoot = Join-Path $runDir 'fuzz'
    New-Item -ItemType Directory -Force $compileRoot,$fuzzRoot | Out-Null

    Write-Host "RESTler DLL: $Dll"
    Write-Host "Run dir    : $runDir"

    Push-Location $compileRoot
    try {
        $compileExit = Invoke-NativeLogged -Command 'dotnet' `
            -Arguments @($Dll,'compile','--api_spec',$OpenApi) `
            -LogPath (Join-Path $runDir 'restler_compile.log') -Show
    } finally { Pop-Location }
    if ($compileExit -ne 0) { throw "RESTler compile failed with exit $compileExit" }

    $compiled = Join-Path $compileRoot 'Compile'
    foreach ($required in @('grammar.py','dict.json','engine_settings.json')) {
        Assert-File (Join-Path $compiled $required) "RESTler compiled $required"
    }

    $stack = Start-LibraryStack $runDir
    try {
        Push-Location $fuzzRoot
        try {
            $args = @(
                $Dll,'fuzz',
                '--grammar_file',(Join-Path $compiled 'grammar.py'),
                '--dictionary_file',(Join-Path $compiled 'dict.json'),
                '--settings',(Join-Path $compiled 'engine_settings.json'),
                '--target_ip','127.0.0.1',
                '--target_port',$stack.ProxyPort,
                '--no_ssl',
                '--time_budget',$RestlerHours
            )
            $fuzzExit = Invoke-NativeLogged -Command 'dotnet' -Arguments $args `
                -LogPath (Join-Path $runDir 'restler_fuzz.log') -Show
        } finally { Pop-Location }
    } finally {
        Stop-LibraryStack $stack
    }

    $sem = Evaluate-Library $runDir $stack.Trace
    $bugBucketCount = @(Get-ChildItem $fuzzRoot -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match 'bug_buckets' }).Count

    $meta = Write-Metadata $runDir 'RESTler' $stack $sem @{
        restler_exit_code = $fuzzExit
        restler_compile_exit_code = $compileExit
        time_budget_hours = $RestlerHours
        restler_dll_sha256 = (Get-Sha256 $Dll)
        native_bug_bucket_file_count = $bugBucketCount
    }

    Write-Host "RESTler semantic result: $($meta.semantic_score) [$([string]::Join(',', $meta.confirmed_classes))]" -ForegroundColor Yellow
    return [pscustomobject]@{
        Tool='RESTler'; Exit=$fuzzExit; SemanticScore=$meta.semantic_score;
        Confirmed=([string]::Join(',', $meta.confirmed_classes)); Events=$meta.event_count; RunDir=$runDir
    }
}

function Run-EvoMasterV38([string]$Jar) {
    Write-Host "`n================ EVOMASTER / LIBRARY V38 ================" -ForegroundColor Cyan
    $runDir = New-RunDir 'EvoMaster'
    Write-Host "EvoMaster JAR: $Jar"
    Write-Host "Run dir       : $runDir"

    $stack = Start-LibraryStack $runDir
    try {
        $stdout = Join-Path $runDir 'evomaster.stdout.log'
        $stderr = Join-Path $runDir 'evomaster.stderr.log'
        $args = @(
            '-jar',$Jar,
            '--blackBox','true',
            '--problemType','REST',
            '--schema',$OpenApi,
            '--base',("http://127.0.0.1:{0}" -f $stack.ProxyPort),
            '--maxTime',$EvoMasterTime,
            '--seed',("{0}" -f $Seed),
            '--outputFolder',$runDir,
            '--outputFormat','PYTHON_UNITTEST',
            '--outputFilePrefix','EvoMaster',
            '--outputFileSuffix','Test',
            '--writeWFCReport','true',
            '--ratePerMinute','1200',
            '--showProgress','false'
        )

        $p = Start-Process -FilePath 'java' -ArgumentList $args -WorkingDirectory $runDir `
            -RedirectStandardOutput $stdout -RedirectStandardError $stderr -Wait -PassThru
        $exit = [int]$p.ExitCode
    } finally {
        Stop-LibraryStack $stack
    }

    $sem = Evaluate-Library $runDir $stack.Trace

    $potentialFaults = $null
    $stdoutText = ''
    $stdoutPath = Join-Path $runDir 'evomaster.stdout.log'
    if (Test-Path $stdoutPath) {
        $stdoutText = Get-Content $stdoutPath -Raw
        $m = [regex]::Matches($stdoutText, '(?im)potential\s+faults?[^0-9]*(\d+)')
        if ($m.Count -gt 0) { $potentialFaults = [int]$m[$m.Count-1].Groups[1].Value }
    }

    $meta = Write-Metadata $runDir 'EvoMaster' $stack $sem @{
        evomaster_exit_code = $exit
        max_time = $EvoMasterTime
        evomaster_jar_sha256 = (Get-Sha256 $Jar)
        native_potential_fault_count = $potentialFaults
    }

    Write-Host "EvoMaster semantic result: $($meta.semantic_score) [$([string]::Join(',', $meta.confirmed_classes))]" -ForegroundColor Yellow
    return [pscustomobject]@{
        Tool='EvoMaster'; Exit=$exit; SemanticScore=$meta.semantic_score;
        Confirmed=([string]::Join(',', $meta.confirmed_classes)); Events=$meta.event_count; RunDir=$runDir
    }
}

Assert-FrozenLibraryV38

$stamp = Get-Date -Format 'yyyyMMdd_HHmmss_fff'
$CampaignDir = Join-Path $ResultsRoot ("campaign_{0}" -f $stamp)
New-Item -ItemType Directory -Force $CampaignDir | Out-Null

$resolvedRestler = $null
$resolvedEvo = $null
if ($Mode -eq 'Both' -or $Mode -eq 'RESTler') {
    $resolvedRestler = Find-RestlerDll $RestlerDll
    if (-not $resolvedRestler) {
        throw "RESTler.dll not found. Pass -RestlerDll <path>, or set RESTLER_DLL."
    }
}
if ($Mode -eq 'Both' -or $Mode -eq 'EvoMaster') {
    $resolvedEvo = Find-EvoMasterJar $EvoMasterJar
    if (-not $resolvedEvo) {
        throw "EvoMaster JAR not found. Pass -EvoMasterJar <path>, or set EVOMASTER_JAR."
    }
}

$results = @()
if ($Mode -eq 'Both' -or $Mode -eq 'RESTler') {
    $results += Run-RESTlerV38 $resolvedRestler
}
if ($Mode -eq 'Both' -or $Mode -eq 'EvoMaster') {
    $results += Run-EvoMasterV38 $resolvedEvo
}

$csv = Join-Path $CampaignDir 'summary.csv'
$json = Join-Path $CampaignDir 'summary.json'
$results | Export-Csv $csv -NoTypeInformation -Encoding UTF8
$results | ConvertTo-Json -Depth 6 | Set-Content $json -Encoding UTF8

Write-Host "`n================ LIBRARY V38 BASELINE SUMMARY ================" -ForegroundColor Cyan
$results | Format-Table -AutoSize
Write-Host ""
Write-Host "Summary CSV : $csv"
Write-Host "Summary JSON: $json"
Write-Host "Results root : $CampaignDir"
