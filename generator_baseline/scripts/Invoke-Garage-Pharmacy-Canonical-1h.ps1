[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$RestlerDll,
    [Parameter(Mandatory=$true)][string]$EvoMasterJar,
    [string]$ProjectRoot = '',
    [string]$PythonCommand = 'python',
    [double]$RestlerHours = 1.0,
    [ValidateRange(1,86400)][int]$RestlerWallClockSeconds = 3600,
    [ValidateRange(0,600)][int]$RestlerShutdownGraceSeconds = 30,
    [string]$EvoMasterTime = '1h',
    [ValidateRange(1,86400)][int]$EvoMasterWallClockSeconds = 3600,
    [ValidateRange(0,600)][int]$EvoMasterShutdownGraceSeconds = 120,
    [int]$Seed = 1,
    [string]$ResultsRoot = '',
    [string]$ResumeCampaignRoot = ''
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
} else {
    $ProjectRoot = (Resolve-Path $ProjectRoot).Path
}

$RestlerDll = (Resolve-Path $RestlerDll).Path
$EvoMasterJar = (Resolve-Path $EvoMasterJar).Path
$PythonCommand = (Get-Command $PythonCommand -ErrorAction Stop).Source

$ProxyScript = Join-Path $ProjectRoot 'scripts\http_trace_proxy.py'
$SutLauncher = Join-Path $ProjectRoot 'scripts\run_sequence_replay_sut.py'
$Reevaluate = Join-Path $ProjectRoot 'scripts\Reevaluate-Garage-Pharmacy-V35b4-SequenceLocal.ps1'
$Collector = Join-Path $ProjectRoot 'scripts\Collect-Garage-Pharmacy-Canonical-Campaign.ps1'

$systems = [ordered]@{
    Garage = [ordered]@{
        Key = 'garage'
        Spec = Join-Path $ProjectRoot 'resources\development_kit\examples\garage\openapi.json'
        Sut = Join-Path $ProjectRoot 'resources\development_kit\validation_only\suts\garage\garage_sut_buggy.py'
        HealthPath = '/repair-orders'
        ExpectedSpecHash = '464b760928b607da4d6cef46a6beff7fbcba6063e5de54617c8e49e2df7574a5'
        ExpectedSutHash = '426b8e1b376b19c280617e7ed7e76250840f6ba280a02f1c38565ed6345f9a8b'
    }
    Pharmacy = [ordered]@{
        Key = 'pharmacy'
        Spec = Join-Path $ProjectRoot 'resources\development_kit\examples\pharmacy\openapi.json'
        Sut = Join-Path $ProjectRoot 'resources\development_kit\validation_only\suts\pharmacy\app_buggy.py'
        HealthPath = '/drugs'
        ExpectedSpecHash = '778e135d44190b98a07b1d84c315cb6f0ef9b8e9ad78340c3d17a8cbe53dc5ba'
        ExpectedSutHash = 'eb7fcbcac34f792b25b7f8329fd579808523a630b86e814e5345879c65e21282'
    }
}

function Sha([string]$Path) {
    if (-not (Test-Path $Path)) { return $null }
    return (Get-FileHash $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Invoke-NativeLogged {
    param(
        [Parameter(Mandatory=$true)][string]$Command,
        [object[]]$Arguments = @(),
        [Parameter(Mandatory=$true)][string]$LogPath,
        [switch]$Show
    )
    $savedPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        if ($Show) {
            & $Command @Arguments *>&1 | Tee-Object -FilePath $LogPath | Out-Host
        } else {
            & $Command @Arguments *> $LogPath
        }
        $nativeExitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $savedPreference
    }
    return [int]$nativeExitCode
}

function Wait-TextFile {
    param([string]$Path, $Process, [int]$TimeoutSeconds, [string]$What)
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if ($Process -and $Process.HasExited) { throw "$What exited during startup." }
        if (Test-Path $Path) {
            $text = (Get-Content $Path -Raw).Trim()
            if ($text) { return $text }
        }
        Start-Sleep -Milliseconds 100
    }
    throw "$What did not publish readiness metadata: $Path"
}

function Stop-HttpStack($Stack) {
    if ($Stack.Proxy -and -not $Stack.Proxy.HasExited) {
        Stop-Process -Id $Stack.Proxy.Id -Force -ErrorAction SilentlyContinue
    }
    if ($Stack.Sut -and -not $Stack.Sut.HasExited) {
        Stop-Process -Id $Stack.Sut.Id -Force -ErrorAction SilentlyContinue
    }
}

function Stop-ProcessTree {
    param([int]$ProcessId, [string]$LogPath)
    if ($ProcessId -le 0) { return }
    $savedPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        & taskkill.exe /PID $ProcessId /T /F *>&1 | Tee-Object -FilePath $LogPath -Append | Out-Host
    } finally {
        $ErrorActionPreference = $savedPreference
    }
}

function Start-HttpStack {
    param([string]$RunDir, [System.Collections.IDictionary]$Config)

    $sutPortFile = Join-Path $RunDir 'sut.port'
    $proxyPortFile = Join-Path $RunDir 'proxy.port'
    $sutOut = Join-Path $RunDir 'sut.stdout.log'
    $sutErr = Join-Path $RunDir 'sut.stderr.log'
    $proxyOut = Join-Path $RunDir 'proxy.stdout.log'
    $proxyErr = Join-Path $RunDir 'proxy.stderr.log'
    $trace = Join-Path $RunDir 'http_trace.jsonl'

    $sutProc = Start-Process -FilePath $PythonCommand `
        -ArgumentList @($SutLauncher, '--script', $Config.Sut, '--port', '0', '--port-file', $sutPortFile) `
        -WorkingDirectory (Split-Path $Config.Sut -Parent) `
        -RedirectStandardOutput $sutOut -RedirectStandardError $sutErr -PassThru

    try {
        $sutPort = [int](Wait-TextFile $sutPortFile $sutProc 30 "$($Config.Key) SUT")
        $ready = $false
        for ($i = 0; $i -lt 30; $i++) {
            try {
                $response = Invoke-WebRequest -UseBasicParsing `
                    -Uri "http://127.0.0.1:$sutPort$($Config.HealthPath)" -TimeoutSec 2
                if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
                    $ready = $true
                    break
                }
            } catch {}
            Start-Sleep -Milliseconds 250
        }
        if (-not $ready) { throw "$($Config.Key) SUT health check failed." }

        $proxyProc = Start-Process -FilePath $PythonCommand `
            -ArgumentList @($ProxyScript, '--listen-port', '0', '--target-port', "$sutPort", '--trace', $trace, '--port-file', $proxyPortFile) `
            -RedirectStandardOutput $proxyOut -RedirectStandardError $proxyErr -PassThru
        $proxyPort = [int](Wait-TextFile $proxyPortFile $proxyProc 20 'HTTP trace proxy')
        return [pscustomobject]@{
            Sut = $sutProc
            Proxy = $proxyProc
            SutPort = $sutPort
            ProxyPort = $proxyPort
            Trace = $trace
        }
    } catch {
        if ($sutProc -and -not $sutProc.HasExited) {
            Stop-Process -Id $sutProc.Id -Force -ErrorAction SilentlyContinue
        }
        throw
    }
}

function Get-CommandText([object[]]$Arguments) {
    return ($Arguments | ForEach-Object {
        $value = [string]$_
        if ($value -match '\s') { '"' + $value.Replace('"','\"') + '"' } else { $value }
    }) -join ' '
}

function Write-RunMetadata {
    param(
        [string]$RunDir,
        [string]$System,
        [string]$Tool,
        [System.Collections.IDictionary]$Config,
        [datetime]$StartedUtc,
        [datetime]$EndedUtc,
        [double]$ElapsedSeconds,
        [int]$ExitCode,
        [object[]]$NativeArguments,
        $Stack,
        [string]$Status,
        [string]$TerminationReason = 'process_exited',
        [Nullable[datetime]]$TrafficCutoffUtc = $null
    )
    $metadata = [ordered]@{
        schema_version = 2
        artifact_version = 'v35_b4_frozen_inputs_v38_harness'
        experiment = 'garage_pharmacy_canonical_one_hour_baselines'
        campaign_id = (Split-Path $CampaignRoot -Leaf)
        system = $Config.Key
        tool = $Tool
        seed = $Seed
        status = $Status
        input_mode = 'openapi_only_black_box'
        started_utc = $StartedUtc.ToString('o')
        ended_utc = $EndedUtc.ToString('o')
        observed_elapsed_seconds = [math]::Round($ElapsedSeconds, 3)
        requested_restler_time_budget_hours = $(if ($Tool -eq 'RESTler') { $RestlerHours } else { $null })
        requested_restler_wall_clock_seconds = $(if ($Tool -eq 'RESTler') { $RestlerWallClockSeconds } else { $null })
        requested_evomaster_wall_clock_seconds = $(if ($Tool -eq 'EvoMaster') { $EvoMasterWallClockSeconds } else { $null })
        post_budget_shutdown_grace_seconds = $(if ($Tool -eq 'RESTler') { $RestlerShutdownGraceSeconds } else { $EvoMasterShutdownGraceSeconds })
        external_wall_clock_enforced = $true
        termination_reason = $TerminationReason
        traffic_cutoff_utc = $(if ($TrafficCutoffUtc.HasValue) { $TrafficCutoffUtc.Value.ToString('o') } else { $null })
        traffic_cutoff_elapsed_seconds = $(if ($TrafficCutoffUtc.HasValue) { [math]::Round(($TrafficCutoffUtc.Value - $StartedUtc).TotalSeconds, 3) } else { $null })
        requested_evomaster_max_time = $(if ($Tool -eq 'EvoMaster') { $EvoMasterTime } else { $null })
        native_exit_code = $ExitCode
        native_arguments = $NativeArguments
        native_command_display = (Get-CommandText $NativeArguments)
        openapi_path = $Config.Spec
        openapi_sha256 = (Sha $Config.Spec)
        sut_path = $Config.Sut
        sut_sha256 = (Sha $Config.Sut)
        restler_dll_path = $(if ($Tool -eq 'RESTler') { $RestlerDll } else { $null })
        restler_dll_sha256 = $(if ($Tool -eq 'RESTler') { (Sha $RestlerDll) } else { $null })
        evomaster_jar_path = $(if ($Tool -eq 'EvoMaster') { $EvoMasterJar } else { $null })
        evomaster_jar_sha256 = $(if ($Tool -eq 'EvoMaster') { (Sha $EvoMasterJar) } else { $null })
        python_executable = $PythonCommand
        computer_name = $env:COMPUTERNAME
        os_version = [Environment]::OSVersion.VersionString
        sut_port = $Stack.SutPort
        proxy_port = $Stack.ProxyPort
        campaign_trace = $Stack.Trace
        campaign_trace_last_write_utc = $(if (Test-Path $Stack.Trace) { (Get-Item $Stack.Trace).LastWriteTimeUtc.ToString('o') } else { $null })
        campaign_trace_is_diagnostic_only = $true
        official_oracle = 'external HTTP evidence; one native tool test/sequence per fresh SUT; no cross-test stitching'
    }
    $metadata | ConvertTo-Json -Depth 20 | Set-Content (Join-Path $RunDir 'run_metadata.json') -Encoding UTF8
}

function Add-SequenceEvaluationToMetadata {
    param([string]$RunDir)
    $metaPath = Join-Path $RunDir 'run_metadata.json'
    $semanticPath = Join-Path $RunDir 'sequence_local_v35_b4\semantic_evaluation_sequence_local.json'
    $manifestPath = Join-Path $RunDir 'sequence_local_v35_b4\sequence_manifest.json'
    $meta = Get-Content $metaPath -Raw | ConvertFrom-Json
    $semantic = Get-Content $semanticPath -Raw | ConvertFrom-Json
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    $meta | Add-Member -Force NoteProperty official_evaluation_complete ([bool]$semantic.official_evaluation_complete)
    $meta | Add-Member -Force NoteProperty official_status ([string]$semantic.official_status)
    $meta | Add-Member -Force NoteProperty sequence_confirmed_score $semantic.sequence_confirmed_score
    $meta | Add-Member -Force NoteProperty sequence_confirmed_lower_bound ([string]$semantic.sequence_confirmed_lower_bound)
    $meta | Add-Member -Force NoteProperty sequence_confirmed_semantic_classes @($semantic.sequence_confirmed_semantic_classes)
    $meta | Add-Member -Force NoteProperty parsed_sequence_count $manifest.parsed_sequence_count
    $meta | Add-Member -Force NoteProperty candidate_sequence_count ([int]$manifest.candidate_sequence_count)
    $meta | Add-Member -Force NoteProperty replayed_sequence_count ([int]$manifest.replayed_sequence_count)
    $meta | Add-Member -Force NoteProperty replay_error_count ([int]$manifest.replay_error_count)
    $meta | ConvertTo-Json -Depth 20 | Set-Content $metaPath -Encoding UTF8
}

function Invoke-SequenceEvaluation {
    param([string]$System, [string]$Tool, [string]$RunDir, [System.Collections.IDictionary]$Config)
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $Reevaluate `
        -System $System -Tool $Tool -RunDir $RunDir -SutPath $Config.Sut `
        -CampaignTrace (Join-Path $RunDir 'http_trace.jsonl') `
        -PythonCommand $PythonCommand -Force
    if ($LASTEXITCODE -ne 0) {
        throw "Sequence-local evaluation failed: $System/$Tool; exit=$LASTEXITCODE"
    }
    Add-SequenceEvaluationToMetadata $RunDir
}

function Run-RESTler {
    param([string]$System, [System.Collections.IDictionary]$Config, [string]$RunDir)

    $compileRoot = Join-Path $RunDir 'compile'
    $fuzzRoot = Join-Path $RunDir 'fuzz'
    New-Item -ItemType Directory -Force -Path $compileRoot, $fuzzRoot | Out-Null

    Push-Location $compileRoot
    try {
        $compileExit = Invoke-NativeLogged -Command 'dotnet' `
            -Arguments @($RestlerDll, 'compile', '--api_spec', $Config.Spec) `
            -LogPath (Join-Path $RunDir 'restler_compile.log') -Show
    } finally {
        Pop-Location
    }
    if ($compileExit -ne 0) { throw "RESTler compile failed: $System" }

    $compiled = Join-Path $compileRoot 'Compile'
    $grammar = Join-Path $compiled 'grammar.py'
    $dictionary = Join-Path $compiled 'dict.json'
    $settings = Join-Path $compiled 'engine_settings.json'
    foreach ($path in @($grammar, $dictionary, $settings)) {
        if (-not (Test-Path $path)) { throw "RESTler compile output missing: $path" }
    }

    $stack = Start-HttpStack $RunDir $Config
    $arguments = @(
        $RestlerDll, 'fuzz',
        '--grammar_file', $grammar,
        '--dictionary_file', $dictionary,
        '--settings', $settings,
        '--target_ip', '127.0.0.1',
        '--target_port', "$($stack.ProxyPort)",
        '--no_ssl',
        '--time_budget', "$RestlerHours"
    )
    $started = [datetime]::UtcNow
    $watch = [Diagnostics.Stopwatch]::StartNew()
    $exit = -1
    $wallClockCapped = $false
    $trafficCutoffUtc = $null
    $fuzzProcess = $null
    $fuzzStdout = Join-Path $RunDir 'restler_fuzz.log'
    $fuzzStderr = Join-Path $RunDir 'restler_fuzz.stderr.log'
    $terminationLog = Join-Path $RunDir 'restler_wall_clock_termination.log'
    try {
        $fuzzProcess = Start-Process -FilePath 'dotnet' -WorkingDirectory $fuzzRoot -ArgumentList $arguments `
            -RedirectStandardOutput $fuzzStdout -RedirectStandardError $fuzzStderr -PassThru
        $deadline = $started.AddSeconds($RestlerWallClockSeconds)
        while (-not $fuzzProcess.HasExited -and [datetime]::UtcNow -lt $deadline) {
            Start-Sleep -Milliseconds 500
            $fuzzProcess.Refresh()
        }
        if (-not $fuzzProcess.HasExited) {
            $wallClockCapped = $true
            Write-Host "RESTler reached the externally enforced $RestlerWallClockSeconds-second wall-clock limit." -ForegroundColor Yellow

            # The proxy is the experiment boundary.  Stop it first so that no
            # RESTler child or post-processing phase can send post-budget HTTP.
            if ($stack.Proxy -and -not $stack.Proxy.HasExited) {
                Stop-Process -Id $stack.Proxy.Id -Force -ErrorAction SilentlyContinue
                Wait-Process -Id $stack.Proxy.Id -Timeout 10 -ErrorAction SilentlyContinue
            }
            $trafficCutoffUtc = [datetime]::UtcNow
            $graceDeadline = [datetime]::UtcNow.AddSeconds($RestlerShutdownGraceSeconds)
            while (-not $fuzzProcess.HasExited -and [datetime]::UtcNow -lt $graceDeadline) {
                Start-Sleep -Milliseconds 250
                $fuzzProcess.Refresh()
            }
            if (-not $fuzzProcess.HasExited) {
                Stop-ProcessTree -ProcessId $fuzzProcess.Id -LogPath $terminationLog
                try { $fuzzProcess.WaitForExit(15000) | Out-Null } catch {}
            }
            $fuzzProcess.Refresh()
            $exit = $(if ($fuzzProcess.HasExited) { $fuzzProcess.ExitCode } else { -9 })
        } else {
            $exit = $fuzzProcess.ExitCode
        }
    } finally {
        $watch.Stop()
        $ended = [datetime]::UtcNow
        Stop-HttpStack $stack
        $status = $(if ($wallClockCapped) { 'native_complete_wall_clock_capped' } elseif ($exit -eq 0) { 'native_complete_early' } else { 'native_failed' })
        $terminationReason = $(if ($wallClockCapped -and $fuzzProcess -and $fuzzProcess.HasExited -and $exit -eq 0) { 'external_http_wall_clock_budget_reached_process_exited_during_grace' } elseif ($wallClockCapped) { 'external_http_wall_clock_budget_reached_process_tree_forced' } else { 'process_exited' })
        Write-RunMetadata $RunDir $System 'RESTler' $Config $started $ended $watch.Elapsed.TotalSeconds $exit $arguments $stack `
            $status $terminationReason $trafficCutoffUtc
    }
    if (-not $wallClockCapped -and $exit -ne 0) { throw "RESTler fuzz failed: $System; exit=$exit" }
    Invoke-SequenceEvaluation $System 'RESTler' $RunDir $Config
}

function Run-EvoMaster {
    param([string]$System, [System.Collections.IDictionary]$Config, [string]$RunDir)

    $stack = Start-HttpStack $RunDir $Config
    $arguments = @(
        '-jar', $EvoMasterJar,
        '--blackBox', 'true',
        '--problemType', 'REST',
        '--schema', $Config.Spec,
        '--base', "http://127.0.0.1:$($stack.ProxyPort)",
        '--maxTime', $EvoMasterTime,
        '--seed', "$Seed",
        '--outputFolder', $RunDir,
        '--outputFormat', 'PYTHON_UNITTEST',
        '--outputFilePrefix', 'EvoMaster',
        '--outputFileSuffix', 'Test',
        '--writeWFCReport', 'true',
        '--ratePerMinute', '1200',
        '--showProgress', 'false'
    )
    $started = [datetime]::UtcNow
    $watch = [Diagnostics.Stopwatch]::StartNew()
    $exit = -1
    $wallClockCapped = $false
    $trafficCutoffUtc = $null
    $process = $null
    $terminationLog = Join-Path $RunDir 'evomaster_wall_clock_termination.log'
    try {
        $process = Start-Process -FilePath 'java' -WorkingDirectory $RunDir -ArgumentList $arguments `
            -RedirectStandardOutput (Join-Path $RunDir 'evomaster.stdout.log') `
            -RedirectStandardError (Join-Path $RunDir 'evomaster.stderr.log') -PassThru
        $deadline = $started.AddSeconds($EvoMasterWallClockSeconds)
        while (-not $process.HasExited -and [datetime]::UtcNow -lt $deadline) {
            Start-Sleep -Milliseconds 500
            $process.Refresh()
        }
        if (-not $process.HasExited) {
            $wallClockCapped = $true
            Write-Host "EvoMaster reached the externally enforced $EvoMasterWallClockSeconds-second wall-clock limit." -ForegroundColor Yellow
            if ($stack.Proxy -and -not $stack.Proxy.HasExited) {
                Stop-Process -Id $stack.Proxy.Id -Force -ErrorAction SilentlyContinue
                Wait-Process -Id $stack.Proxy.Id -Timeout 10 -ErrorAction SilentlyContinue
            }
            $trafficCutoffUtc = [datetime]::UtcNow
            $graceDeadline = [datetime]::UtcNow.AddSeconds($EvoMasterShutdownGraceSeconds)
            while (-not $process.HasExited -and [datetime]::UtcNow -lt $graceDeadline) {
                Start-Sleep -Milliseconds 250
                $process.Refresh()
            }
            if (-not $process.HasExited) {
                Stop-ProcessTree -ProcessId $process.Id -LogPath $terminationLog
                try { $process.WaitForExit(15000) | Out-Null } catch {}
            }
            $process.Refresh()
            $exit = $(if ($process.HasExited) { $process.ExitCode } else { -9 })
        } else {
            $exit = $process.ExitCode
        }
    } finally {
        $watch.Stop()
        $ended = [datetime]::UtcNow
        Stop-HttpStack $stack
        $status = $(if ($wallClockCapped) { 'native_complete_wall_clock_capped' } elseif ($exit -eq 0) { 'native_complete_early' } else { 'native_failed' })
        $terminationReason = $(if ($wallClockCapped -and $process -and $process.HasExited -and $exit -eq 0) { 'external_http_wall_clock_budget_reached_process_exited_during_grace' } elseif ($wallClockCapped) { 'external_http_wall_clock_budget_reached_process_tree_forced' } else { 'process_exited' })
        Write-RunMetadata $RunDir $System 'EvoMaster' $Config $started $ended $watch.Elapsed.TotalSeconds $exit $arguments $stack `
            $status $terminationReason $trafficCutoffUtc
    }
    if (-not $wallClockCapped -and $exit -ne 0) { throw "EvoMaster failed: $System; exit=$exit" }
    Invoke-SequenceEvaluation $System 'EvoMaster' $RunDir $Config
}

foreach ($path in @($ProxyScript, $SutLauncher, $Reevaluate, $Collector, $RestlerDll, $EvoMasterJar)) {
    if (-not (Test-Path $path)) { throw "Missing required path: $path" }
}
$null = Get-Command 'dotnet' -ErrorAction Stop
$null = Get-Command 'java' -ErrorAction Stop
& $PythonCommand -c 'import flask, flask_cors, requests, rfc3986'
if ($LASTEXITCODE -ne 0) { throw 'Python replay/runtime dependencies are missing.' }

foreach ($entry in $systems.GetEnumerator()) {
    $config = $entry.Value
    foreach ($path in @($config.Spec, $config.Sut)) {
        if (-not (Test-Path $path)) { throw "Missing frozen input: $path" }
    }
    $specHash = Sha $config.Spec
    $sutHash = Sha $config.Sut
    if ($specHash -ne $config.ExpectedSpecHash) {
        throw "$($entry.Key) OpenAPI hash mismatch: expected=$($config.ExpectedSpecHash) actual=$specHash"
    }
    if ($sutHash -ne $config.ExpectedSutHash) {
        throw "$($entry.Key) SUT hash mismatch: expected=$($config.ExpectedSutHash) actual=$sutHash"
    }
}

if ([string]::IsNullOrWhiteSpace($ResumeCampaignRoot)) {
    if ([string]::IsNullOrWhiteSpace($ResultsRoot)) {
        $ResultsRoot = Join-Path $ProjectRoot 'results\garage_pharmacy_canonical_1h'
    } elseif (-not [IO.Path]::IsPathRooted($ResultsRoot)) {
        $ResultsRoot = [IO.Path]::GetFullPath((Join-Path $ProjectRoot $ResultsRoot))
    }
    New-Item -ItemType Directory -Force $ResultsRoot | Out-Null
    $campaignStamp = Get-Date -Format 'yyyyMMdd_HHmmss_fff'
    $CampaignRoot = Join-Path $ResultsRoot "campaign_$campaignStamp"
    New-Item -ItemType Directory $CampaignRoot | Out-Null

    $campaignMetadata = [ordered]@{
        schema_version = 1
        campaign_id = (Split-Path $CampaignRoot -Leaf)
        artifact_version = 'v35_b4_frozen_inputs_v38_harness'
        experiment = 'garage_pharmacy_canonical_one_hour_baselines'
        started_utc = [datetime]::UtcNow.ToString('o')
        requested_restler_hours_per_system = $RestlerHours
        requested_restler_wall_clock_seconds_per_system = $RestlerWallClockSeconds
        requested_restler_shutdown_grace_seconds = $RestlerShutdownGraceSeconds
        budget_enforcement = 'external_hard_cutoff_proxy_first_then_process_tree'
        requested_evomaster_time_per_system = $EvoMasterTime
        requested_evomaster_wall_clock_seconds_per_system = $EvoMasterWallClockSeconds
        requested_evomaster_shutdown_grace_seconds = $EvoMasterShutdownGraceSeconds
        seed = $Seed
        execution_order = @('garage_restler','garage_evomaster','pharmacy_restler','pharmacy_evomaster')
        garage_openapi_sha256 = (Sha $systems.Garage.Spec)
        garage_sut_sha256 = (Sha $systems.Garage.Sut)
        pharmacy_openapi_sha256 = (Sha $systems.Pharmacy.Spec)
        pharmacy_sut_sha256 = (Sha $systems.Pharmacy.Sut)
        restler_dll_sha256 = (Sha $RestlerDll)
        evomaster_jar_sha256 = (Sha $EvoMasterJar)
        python_executable = $PythonCommand
        computer_name = $env:COMPUTERNAME
    }
    $campaignMetadata | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $CampaignRoot 'campaign_metadata.json') -Encoding UTF8
} else {
    $CampaignRoot = (Resolve-Path $ResumeCampaignRoot).Path
    $campaignMetadataPath = Join-Path $CampaignRoot 'campaign_metadata.json'
    if (-not (Test-Path $campaignMetadataPath)) {
        throw "Cannot resume: missing campaign metadata: $campaignMetadataPath"
    }
    $loadedCampaignMetadata = Get-Content $campaignMetadataPath -Raw | ConvertFrom-Json
    if ([string]$loadedCampaignMetadata.experiment -ne 'garage_pharmacy_canonical_one_hour_baselines') {
        throw "Cannot resume unrelated campaign: $CampaignRoot"
    }
    if ([int]$loadedCampaignMetadata.seed -ne $Seed) {
        throw "Resume seed mismatch: recorded=$($loadedCampaignMetadata.seed) requested=$Seed"
    }
    if ([double]$loadedCampaignMetadata.requested_restler_hours_per_system -ne $RestlerHours) {
        throw "Resume RESTler budget mismatch."
    }
    if ([int]$loadedCampaignMetadata.requested_restler_wall_clock_seconds_per_system -ne $RestlerWallClockSeconds) {
        throw "Resume RESTler wall-clock cutoff mismatch."
    }
    if ([int]$loadedCampaignMetadata.requested_restler_shutdown_grace_seconds -ne $RestlerShutdownGraceSeconds) {
        throw "Resume RESTler shutdown grace mismatch."
    }
    if ([string]$loadedCampaignMetadata.requested_evomaster_time_per_system -ne $EvoMasterTime) {
        throw "Resume EvoMaster budget mismatch."
    }
    if ([int]$loadedCampaignMetadata.requested_evomaster_wall_clock_seconds_per_system -ne $EvoMasterWallClockSeconds) {
        throw "Resume EvoMaster wall-clock cutoff mismatch."
    }
    if ([int]$loadedCampaignMetadata.requested_evomaster_shutdown_grace_seconds -ne $EvoMasterShutdownGraceSeconds) {
        throw "Resume EvoMaster shutdown grace mismatch."
    }
    $campaignMetadata = [ordered]@{}
    foreach ($property in $loadedCampaignMetadata.PSObject.Properties) {
        $campaignMetadata[$property.Name] = $property.Value
    }
    $campaignMetadata['resumed_utc'] = [datetime]::UtcNow.ToString('o')
}

Write-Host 'CANONICAL INPUT HASH GUARD: PASS' -ForegroundColor Green
Write-Host "Campaign root: $CampaignRoot"
Write-Host 'Expected native search time: approximately four hours, plus compile and sequence-local replay.'

$runs = [ordered]@{}
foreach ($cell in @(
    [pscustomobject]@{ System='Garage'; Tool='RESTler' },
    [pscustomobject]@{ System='Garage'; Tool='EvoMaster' },
    [pscustomobject]@{ System='Pharmacy'; Tool='RESTler' },
    [pscustomobject]@{ System='Pharmacy'; Tool='EvoMaster' }
)) {
    $config = $systems[$cell.System]
    $key = "$($config.Key)_$($cell.Tool.ToLowerInvariant())"
    $runDir = Join-Path $CampaignRoot $key
    if (-not (Test-Path $runDir)) {
        New-Item -ItemType Directory $runDir | Out-Null
    }
    $runs[$key] = $runDir
    Write-Host ''
    Write-Host "===== CANONICAL 1H: $($cell.System) / $($cell.Tool) =====" -ForegroundColor Cyan

    $runMetadataPath = Join-Path $runDir 'run_metadata.json'
    $semanticPath = Join-Path $runDir 'sequence_local_v35_b4\semantic_evaluation_sequence_local.json'
    $nativeComplete = $false
    $evaluationComplete = $false
    if (Test-Path $runMetadataPath) {
        $existingMetadata = Get-Content $runMetadataPath -Raw | ConvertFrom-Json
        $acceptedNativeStatuses = @('native_complete', 'native_complete_early', 'native_complete_wall_clock_capped')
        $nativeComplete = ($acceptedNativeStatuses -contains [string]$existingMetadata.status)
    }
    if (Test-Path $semanticPath) {
        $existingSemantic = Get-Content $semanticPath -Raw | ConvertFrom-Json
        $evaluationComplete = [bool]$existingSemantic.official_evaluation_complete
    }

    if ($nativeComplete -and $evaluationComplete) {
        Write-Host "RESUME: native campaign and official evaluation already complete; skipping $key." -ForegroundColor Green
    } elseif ($nativeComplete) {
        Write-Host "RESUME: preserving completed one-hour native campaign; rerunning evaluation only for $key." -ForegroundColor Yellow
        Invoke-SequenceEvaluation $cell.System $cell.Tool $runDir $config
    } elseif ($cell.Tool -eq 'RESTler') {
        Run-RESTler $cell.System $config $runDir
    } else {
        Run-EvoMaster $cell.System $config $runDir
    }
}

$campaignMetadata['ended_utc'] = [datetime]::UtcNow.ToString('o')
$campaignMetadata['run_directories'] = $runs
$campaignMetadata | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $CampaignRoot 'campaign_metadata.json') -Encoding UTF8

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $Collector -CampaignRoot $CampaignRoot
if ($LASTEXITCODE -ne 0) { throw "Canonical collection failed; exit=$LASTEXITCODE" }

Write-Host ''
Write-Host 'ALL FOUR CANONICAL CAMPAIGNS AND SEQUENCE-LOCAL EVALUATIONS COMPLETED.' -ForegroundColor Green
Write-Host "Campaign root: $CampaignRoot" -ForegroundColor Green
