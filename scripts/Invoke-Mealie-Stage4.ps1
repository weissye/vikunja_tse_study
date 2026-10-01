[CmdletBinding()]
param(
    [int]$Runs = 2,
    [int]$BaseSeed = 20261801,
    [int]$MaxLength = 25000,
    [int]$InstancesPerEntity = 2,
    [int]$InstancesPerAction = 1,
    [int]$MaxFieldPairs = 3,
    [int]$MaxConcurrencyWidth = 2,
    [int]$PrefixRounds = 6,
    [ValidateSet('concurrency-breadth', 'long-interleaving')]
    [string]$StoryProfile = 'concurrency-breadth',
    [int]$PrefixBeforeConcurrency = 0,
    [switch]$CombinedCampaign,
    [switch]$PreflightOnly,
    [switch]$FreezeEvidence
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$arguments = @((Join-Path $PSScriptRoot 'run_mealie_stage4.py'), '--root', $root,
    '--runs', $Runs, '--base-seed', $BaseSeed, '--max-length', $MaxLength,
    '--instances-per-entity', $InstancesPerEntity,
    '--instances-per-action', $InstancesPerAction,
    '--max-field-pairs', $MaxFieldPairs, '--max-concurrency-width', $MaxConcurrencyWidth,
    '--prefix-rounds', $PrefixRounds,
    '--story-profile', $StoryProfile,
    '--prefix-before-concurrency', $PrefixBeforeConcurrency)
if ($PreflightOnly) { $arguments += '--preflight-only' }
if ($CombinedCampaign) { $arguments += '--combined-campaign' }
if ($FreezeEvidence) { $arguments += '--freeze-evidence' }
& python @arguments
if ($LASTEXITCODE -ne 0) { throw "MEALIE_STAGE4_INCOMPLETE exit=$LASTEXITCODE; evidence was preserved if requested" }
