[CmdletBinding()]
param(
    [ValidateSet('baseline','coverage','depth','parallel','combined','discovery','shared_link_branch','album_asset_branch','concurrency_breadth','cross_method')][string]$Profile = 'baseline',
    [switch]$PreflightOnly
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$profilesPath = Join-Path $root 'config/immich_campaign_profiles.json'
$config = Get-Content -LiteralPath $profilesPath -Raw | ConvertFrom-Json
if ($config.schema_version -ne 1) { throw 'Unknown profile schema version' }
$p = $config.profiles.$Profile
if (-not $p) { throw "Missing profile $Profile" }
$params = @{
    Runs = [int]$p.runs
    BaseSeed = [int]$p.base_seed
    MaxLength = [int]$p.max_length
    InstancesPerEntity = [int]$p.instances_per_entity
    InstancesPerAction = [int]$p.instances_per_action
    MaxFieldPairs = [int]$p.max_field_pairs
    MaxConcurrencyWidth = if ($p.max_concurrency_width) { [int]$p.max_concurrency_width } else { 3 }
    LongStoryMinRounds = [int]$p.long_story_min_rounds
    LongStoryMaxRounds = [int]$p.long_story_max_rounds
    PrefixBeforeConcurrency = [int]$p.prefix_before_concurrency
    JsonDisjoint = [bool]$p.json_disjoint
    JsonDeleteBodies = [bool]$p.json_delete_bodies
    OptionalEnumDependencyBranch = [bool]$p.optional_enum_dependency_branch
    VerifiedAlbumAssetFixture = [bool]$p.verified_album_asset_fixture
    EmpiricalUpdateDelete = [bool]$p.empirical_update_delete
    StoryProfile = if ($p.story_profile) { [string]$p.story_profile } else { 'long-interleaving' }
    ExcludeConcurrencyOperations = @($p.exclude_concurrency_operations | Where-Object { $_ })
    RequireNewOverlap = [bool]$p.require_new_overlap
    PreflightOnly = [bool]$PreflightOnly
    FreezeEvidence = $true
}
Write-Host "IMMICH_CAMPAIGN_PROFILE name=$Profile config=$profilesPath"
& (Join-Path $PSScriptRoot 'Invoke-Immich-Generated-Pilot.ps1') @params
