param(
    [int]$Seed = 1,
    [int]$MaxLength = 5000,
    [int]$ComplexInstancesPerEntity = 5,
    [int]$ComplexInstancesPerAction = 7
)

$ErrorActionPreference = "Stop"

# Resolve paths only after the script has started. This deliberately avoids
# using $PSScriptRoot inside a parameter default expression -- the exact issue
# that caused the direct V37 launcher invocation to fail on your machine.
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "..")).Path
$Launcher = Join-Path $ProjectRoot "scripts\Invoke-GeneratedModel-Provengo.ps1"
$DevelopmentKit = Join-Path $ProjectRoot "resources\development_kit"

$campaignStamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$ResultsRoot = Join-Path $ProjectRoot "results\three_old_systems_basic_complex_v37\campaign_$campaignStamp"

if (-not (Test-Path $Launcher)) {
    throw "Launcher not found: $Launcher"
}
if (-not (Test-Path $DevelopmentKit)) {
    throw "Development kit not found: $DevelopmentKit"
}

$WindowsPowerShell = (Get-Command powershell.exe -ErrorAction Stop).Source
New-Item -ItemType Directory -Force $ResultsRoot | Out-Null

# The two configurations agreed for the older three systems:
#   BASIC   = original single-instance generated model (1 entity / 1 action)
#   COMPLEX = multi-instance generated model (5 entities / 7 actions)
$systems = @("library", "garage", "pharmacy")
$configs = @(
    [pscustomobject]@{
        Mode = "basic"
        InstancesPerEntity = 1
        InstancesPerAction = 1
    },
    [pscustomobject]@{
        Mode = "complex"
        InstancesPerEntity = $ComplexInstancesPerEntity
        InstancesPerAction = $ComplexInstancesPerAction
    }
)

$summary = @()
$total = $systems.Count * $configs.Count
$index = 0

foreach ($system in $systems) {
    foreach ($cfg in $configs) {
        $index++
        $invocationRoot = Join-Path $ResultsRoot ("{0:00}_{1}_{2}" -f $index, $system, $cfg.Mode)
        New-Item -ItemType Directory -Force $invocationRoot | Out-Null

        Write-Host ""
        Write-Host "====================================================================" -ForegroundColor Cyan
        Write-Host "[$index/$total] $system / $($cfg.Mode.ToUpper())" -ForegroundColor Cyan
        Write-Host "InstancesPerEntity=$($cfg.InstancesPerEntity), InstancesPerAction=$($cfg.InstancesPerAction)" -ForegroundColor Cyan
        Write-Host "====================================================================" -ForegroundColor Cyan

        # Run the existing launcher in a CHILD PowerShell process. This is
        # intentional: Invoke-GeneratedModel-Provengo.ps1 ends with 'exit',
        # and a child process guarantees that one run cannot terminate this
        # six-run orchestrator. Explicit DevelopmentKit/ResultsRoot values also
        # bypass the V37 parameter-default $PSScriptRoot problem.
        & $WindowsPowerShell -NoProfile -ExecutionPolicy Bypass -File $Launcher `
            -System $system `
            -Variant buggy `
            -DevelopmentKit $DevelopmentKit `
            -ResultsRoot $invocationRoot `
            -Seed $Seed `
            -MaxLength $MaxLength `
            -InstancesPerEntity $cfg.InstancesPerEntity `
            -InstancesPerAction $cfg.InstancesPerAction

        $launcherExit = $LASTEXITCODE

        $latestRun = Get-ChildItem $invocationRoot -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like "${system}_buggy_*" } |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1

        $runDir = if ($latestRun) { $latestRun.FullName } else { $null }
        $provengoExit = $null
        $semanticFile = $null
        $semanticSummary = $null
        $harnessError = $null

        if ($runDir) {
            $metadataPath = Join-Path $runDir "run_metadata.json"
            $semanticPath = Join-Path $runDir "semantic_evaluation.json"

            if (Test-Path $metadataPath) {
                try {
                    $metadata = Get-Content $metadataPath -Raw | ConvertFrom-Json
                    $provengoExit = $metadata.provengo_exit_code
                }
                catch {
                    $harnessError = "run_metadata.json parse failed: $($_.Exception.Message)"
                }
            }

            if (Test-Path $semanticPath) {
                $semanticFile = $semanticPath
                try {
                    $semantic = Get-Content $semanticPath -Raw | ConvertFrom-Json
                    if ($null -ne $semantic.confirmed_classes) {
                        $semanticSummary = (@($semantic.confirmed_classes) -join ",")
                    }
                    elseif ($null -ne $semantic.semantic_class_count) {
                        $semanticSummary = "semantic_class_count=$($semantic.semantic_class_count)"
                    }
                    elseif ($null -ne $semantic.confirmed_fault_count) {
                        $semanticSummary = "confirmed_fault_count=$($semantic.confirmed_fault_count)"
                    }
                    elseif ($null -ne $semantic.all_seeded_faults_confirmed) {
                        $semanticSummary = "all_seeded_faults_confirmed=$($semantic.all_seeded_faults_confirmed)"
                    }
                    else {
                        $semanticSummary = "semantic_evaluation.json written"
                    }
                }
                catch {
                    $harnessError = "semantic_evaluation.json parse failed: $($_.Exception.Message)"
                }
            }
            elseif ($launcherExit -ne 0) {
                $harnessError = "Launcher returned $launcherExit before producing semantic_evaluation.json"
            }
        }
        else {
            $harnessError = "No run directory was produced (launcher exit=$launcherExit)"
        }

        $summary += [pscustomobject]@{
            Sequence = $index
            System = $system
            Mode = $cfg.Mode
            InstancesPerEntity = $cfg.InstancesPerEntity
            InstancesPerAction = $cfg.InstancesPerAction
            LauncherExit = $launcherExit
            ProvengoExit = $provengoExit
            SemanticSummary = $semanticSummary
            RunDir = $runDir
            SemanticEvaluation = $semanticFile
            HarnessError = $harnessError
        }

        Write-Host "Completed $system / $($cfg.Mode). LauncherExit=$launcherExit" -ForegroundColor Yellow
        if ($runDir) {
            Write-Host "Run directory: $runDir"
        }
        if ($harnessError) {
            Write-Host "HARNESS NOTE: $harnessError" -ForegroundColor Red
        }
        Write-Host "NOTE: non-zero Provengo/launcher exit is NOT itself a semantic confirmation; semantic_evaluation.json is authoritative." -ForegroundColor DarkYellow
    }
}

$csv = Join-Path $ResultsRoot "summary.csv"
$json = Join-Path $ResultsRoot "summary.json"
$summary | Export-Csv -Path $csv -NoTypeInformation -Encoding UTF8
$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $json -Encoding UTF8

Write-Host ""
Write-Host "================ FINAL SUMMARY ================" -ForegroundColor Green
$summary | Format-Table Sequence,System,Mode,InstancesPerEntity,InstancesPerAction,LauncherExit,ProvengoExit,SemanticSummary -AutoSize
Write-Host ""
Write-Host "Summary CSV : $csv" -ForegroundColor Green
Write-Host "Summary JSON: $json" -ForegroundColor Green
Write-Host "Results root : $ResultsRoot" -ForegroundColor Green

$hardFailures = @($summary | Where-Object { $_.HarnessError })
if ($hardFailures.Count -gt 0) {
    Write-Host ""
    Write-Host "The six-run sequence finished, but at least one harness/infrastructure issue was recorded. Inspect summary.csv and the indicated run directories." -ForegroundColor Red
    exit 2
}

# A semantic target can legitimately make Provengo return non-zero, so the
# orchestrator itself succeeds when all six runs produced evaluable evidence.
exit 0
