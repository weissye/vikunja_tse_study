param(
    [Parameter(Mandatory=$true)][string]$RunDirectory,
    [string]$ResultsRoot = (Join-Path $PSScriptRoot "..\results\provengo_four_systems")
)
$ErrorActionPreference = "Stop"
$source = (Resolve-Path $RunDirectory).Path
$meta = Get-Content (Join-Path $source "run_metadata.json") -Raw | ConvertFrom-Json
& (Join-Path $PSScriptRoot "Invoke-GeneratedModel-Provengo.ps1") `
    -System $meta.system -Variant $meta.variant -Seed ([int]$meta.seed) `
    -MaxLength ([int]$meta.max_length) `
    -InstancesPerEntity ([int]$meta.instances_per_entity) `
    -InstancesPerAction ([int]$meta.instances_per_action) `
    -ResultsRoot $ResultsRoot -ReplayFrom $source
exit $LASTEXITCODE
