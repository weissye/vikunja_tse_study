param(
    [int]$Seed = 1,
    [int]$MaxLength = 5000,
    [int]$ComplexInstancesPerEntity = 5,
    [int]$ComplexInstancesPerAction = 7
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "..")).Path
$Launcher = Join-Path $ProjectRoot "scripts\Invoke-GeneratedModel-Provengo.ps1"
$DevelopmentKit = Join-Path $ProjectRoot "resources\development_kit"
$campaignStamp = Get-Date -Format "yyyyMMdd_HHmmss_fff"
$ResultsRoot = Join-Path $ProjectRoot "results\library_basic_complex_contractfix\campaign_$campaignStamp"

if (-not (Test-Path $Launcher)) { throw "Launcher not found: $Launcher" }
if (-not (Test-Path $DevelopmentKit)) { throw "Development kit not found: $DevelopmentKit" }

$WindowsPowerShell = (Get-Command powershell.exe -ErrorAction Stop).Source
New-Item -ItemType Directory -Force $ResultsRoot | Out-Null

$configs = @(
    [pscustomobject]@{ Mode="basic"; InstancesPerEntity=1; InstancesPerAction=1 },
    [pscustomobject]@{ Mode="complex"; InstancesPerEntity=$ComplexInstancesPerEntity; InstancesPerAction=$ComplexInstancesPerAction }
)

$summary=@()
$index=0
foreach ($cfg in $configs) {
    $index++
    $invocationRoot = Join-Path $ResultsRoot ("{0:00}_library_{1}" -f $index,$cfg.Mode)
    New-Item -ItemType Directory -Force $invocationRoot | Out-Null

    Write-Host ""
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "[$index/2] library / $($cfg.Mode.ToUpper())" -ForegroundColor Cyan
    Write-Host "InstancesPerEntity=$($cfg.InstancesPerEntity), InstancesPerAction=$($cfg.InstancesPerAction)" -ForegroundColor Cyan
    Write-Host "====================================================================" -ForegroundColor Cyan

    & $WindowsPowerShell -NoProfile -ExecutionPolicy Bypass -File $Launcher `
        -System library `
        -Variant buggy `
        -DevelopmentKit $DevelopmentKit `
        -ResultsRoot $invocationRoot `
        -Seed $Seed `
        -MaxLength $MaxLength `
        -InstancesPerEntity $cfg.InstancesPerEntity `
        -InstancesPerAction $cfg.InstancesPerAction

    $launcherExit=$LASTEXITCODE
    $latestRun=Get-ChildItem $invocationRoot -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like "library_buggy_*" } |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1

    $runDir=if($latestRun){$latestRun.FullName}else{$null}
    $provengoExit=$null
    $semanticSummary=$null
    $semanticFile=$null
    $harnessError=$null

    if($runDir){
        $metadataPath=Join-Path $runDir "run_metadata.json"
        $semanticPath=Join-Path $runDir "semantic_evaluation.json"
        if(Test-Path $metadataPath){
            try{$provengoExit=(Get-Content $metadataPath -Raw|ConvertFrom-Json).provengo_exit_code}catch{$harnessError="metadata parse failed: $($_.Exception.Message)"}
        }
        if(Test-Path $semanticPath){
            $semanticFile=$semanticPath
            try{
                $s=Get-Content $semanticPath -Raw|ConvertFrom-Json
                $classes=@()
                if($s.hold_ownership_confirmed){$classes += "HOLD_OWNERSHIP"}
                if($s.loan_limit_confirmed){$classes += "LOAN_LIMIT"}
                $semanticSummary=if($classes.Count){$classes -join ","}else{"0/2"}
            }catch{$harnessError="semantic parse failed: $($_.Exception.Message)"}
        } else {$harnessError="No semantic_evaluation.json"}
    } else {$harnessError="No run directory produced"}

    $summary += [pscustomobject]@{
        Mode=$cfg.Mode; InstancesPerEntity=$cfg.InstancesPerEntity; InstancesPerAction=$cfg.InstancesPerAction;
        LauncherExit=$launcherExit; ProvengoExit=$provengoExit; SemanticSummary=$semanticSummary;
        RunDir=$runDir; SemanticEvaluation=$semanticFile; HarnessError=$harnessError
    }
}

$csv=Join-Path $ResultsRoot "summary.csv"
$json=Join-Path $ResultsRoot "summary.json"
$summary|Export-Csv $csv -NoTypeInformation -Encoding UTF8
$summary|ConvertTo-Json -Depth 6|Set-Content $json -Encoding UTF8

Write-Host ""
Write-Host "================ LIBRARY FINAL SUMMARY ================" -ForegroundColor Green
$summary|Format-Table Mode,InstancesPerEntity,InstancesPerAction,LauncherExit,ProvengoExit,SemanticSummary -AutoSize
Write-Host "Summary CSV : $csv" -ForegroundColor Green
Write-Host "Summary JSON: $json" -ForegroundColor Green
Write-Host "Results root : $ResultsRoot" -ForegroundColor Green

if(@($summary|Where-Object{$_.HarnessError}).Count -gt 0){exit 2}
exit 0
