param(
    [string]$DevelopmentKit = (Join-Path $PSScriptRoot "..\resources\development_kit"),
    [ValidateSet("correct", "buggy", "both")][string]$Variant = "both",
    [int]$Seed = 1,
    [int]$MaxLength = 500
)

$ErrorActionPreference = "Continue"
$variants = if ($Variant -eq "both") { @("correct", "buggy") } else { @($Variant) }
$rows = @()
foreach ($system in @("library", "garage", "pharmacy", "netbox")) {
    foreach ($v in $variants) {
        Write-Host "`n=== $system / $v ==="
        & (Join-Path $PSScriptRoot "Invoke-GeneratedModel-Provengo.ps1") `
            -System $system -Variant $v -DevelopmentKit $DevelopmentKit `
            -Seed $Seed -MaxLength $MaxLength
        $rows += [pscustomobject]@{ System=$system; Variant=$v; LauncherExit=$LASTEXITCODE }
    }
}
$rows | Format-Table -AutoSize
if (($rows | Where-Object LauncherExit -ne 0).Count -gt 0) {
    Write-Host "Some Provengo runs returned non-zero. This may be an observed failure; inspect their logs."
}
