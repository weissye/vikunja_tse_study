param([int]$Seed=1,[int]$MaxLength=1200)
$ErrorActionPreference="Stop"
$root=(Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$stamp=Get-Date -Format "yyyyMMdd_HHmmss"
$out=Join-Path $root "results\provengo_runtime_smoke_$stamp"
New-Item -ItemType Directory -Force $out | Out-Null
$summary=@()
foreach($sys in @("library","todoist")) {
  $script=if($sys -eq "library") { Join-Path $PSScriptRoot "run_library_provengo.ps1" } else { Join-Path $PSScriptRoot "run_todoist_provengo.ps1" }
  & $script -Variant correct -Seed $Seed -MaxLength $MaxLength 2>&1 | Tee-Object (Join-Path $out "$sys.log")
  $summary += [ordered]@{ system=$sys; exit_code=$LASTEXITCODE; log=(Join-Path $out "$sys.log") }
  if($LASTEXITCODE -ne 0) { break }
}
$summary | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $out "summary.json") -Encoding UTF8
Write-Host "Runtime smoke results: $out"
if(@($summary | Where-Object { $_.exit_code -ne 0 }).Count -gt 0) { exit 1 }
exit 0
