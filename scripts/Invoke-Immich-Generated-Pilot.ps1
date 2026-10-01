[CmdletBinding()]
param(
    [ValidateRange(1,3)][int]$Runs = 2,
    [int]$BaseSeed = 20261007,
    [ValidateRange(3000,60000)][int]$MaxLength = 20000,
    [ValidateRange(1,4)][int]$InstancesPerEntity = 2,
    [ValidateRange(1,3)][int]$InstancesPerAction = 1,
    [ValidateRange(1,24)][int]$MaxFieldPairs = 4,
    [ValidateSet(2,3)][int]$MaxConcurrencyWidth = 3,
    [switch]$JsonDisjoint,
    [switch]$JsonDeleteBodies,
    [switch]$OptionalEnumDependencyBranch,
    [switch]$VerifiedAlbumAssetFixture,
    [switch]$EmpiricalUpdateDelete,
    [ValidateSet('long-interleaving','concurrency-breadth')][string]$StoryProfile = 'long-interleaving',
    [string[]]$ExcludeConcurrencyOperations = @(),
    [switch]$RequireNewOverlap,
    [ValidateRange(1,16)][int]$LongStoryMinRounds = 3,
    [ValidateRange(1,16)][int]$LongStoryMaxRounds = 6,
    [ValidateRange(0,16)][int]$PrefixBeforeConcurrency = 0,
    [switch]$PreflightOnly,
    [switch]$FreezeEvidence
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runner = Join-Path $PSScriptRoot 'run_immich_generated_pilot.py'
if (-not (Test-Path -LiteralPath $runner)) { throw "Missing $runner" }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'python is not on PATH' }
$params = @($runner, '--root', $root, '--runs', $Runs, '--base-seed', $BaseSeed,
    '--max-length', $MaxLength, '--instances-per-entity', $InstancesPerEntity,
    '--instances-per-action', $InstancesPerAction, '--max-field-pairs', $MaxFieldPairs)
if ($MaxConcurrencyWidth -ne 3) { $params += @('--max-concurrency-width', $MaxConcurrencyWidth) }
if ($JsonDisjoint) { $params += '--json-disjoint' }
if ($JsonDeleteBodies) { $params += '--json-delete-bodies' }
if ($OptionalEnumDependencyBranch) { $params += '--optional-enum-dependency-branch' }
if ($VerifiedAlbumAssetFixture) { $params += '--verified-album-asset-fixture' }
if ($EmpiricalUpdateDelete) { $params += '--empirical-update-delete' }
$params += @('--story-profile', $StoryProfile)
foreach ($operationId in $ExcludeConcurrencyOperations) { $params += @('--exclude-concurrency-operation', $operationId) }
if ($RequireNewOverlap) { $params += '--require-new-overlap' }
if ($LongStoryMinRounds -gt $LongStoryMaxRounds) { throw 'LongStoryMinRounds must be <= LongStoryMaxRounds' }
$params += @('--long-story-min-rounds', $LongStoryMinRounds,
    '--long-story-max-rounds', $LongStoryMaxRounds)
if ($PrefixBeforeConcurrency -gt $LongStoryMinRounds) { throw 'PrefixBeforeConcurrency must be <= LongStoryMinRounds' }
$params += @('--prefix-before-concurrency', $PrefixBeforeConcurrency)
if ($PreflightOnly) { $params += '--preflight-only' }
if ($FreezeEvidence) { $params += '--freeze-evidence' }
& python @params
if ($LASTEXITCODE -ne 0) { throw "IMMICH_GENERATED_PILOT_INCOMPLETE exit=$LASTEXITCODE; inspect the preserved run directory" }
