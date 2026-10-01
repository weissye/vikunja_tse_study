Stage 6.4 — generic long-story identity ordering

Apply on top of Stage 6.3 (gitea-stage6-3-generic-story-repair.zip).
Change: long-interleaving profile waits for long update story completion before scheduling contract-derived /rename actions. All update branches publish StoryPhaseComplete on success, skip, and failure. No server-specific operation names or paths are hardcoded. Ordinary profile is unchanged.

Verified offline: Node syntax on generated Gitea story, phase labels matched all generated long stories; six historical real OpenAPI specifications and six synthetic profiles generated, including verifier generation. Ordinary output remained byte-identical to frozen baseline. No live Stage 6.4 server run has been performed.

Windows PowerShell (inside C:\work\temp\vikunja_tse_study):
$patch = Join-Path $env:USERPROFILE 'Downloads\gitea-stage6-4-identity-ordering-patch.zip'
if (-not (Test-Path -LiteralPath $patch -PathType Leaf)) { throw "ZIP missing: $patch" }
Expand-Archive -LiteralPath $patch -DestinationPath . -Force
if (-not $env:GITEA_API_TOKEN) { throw 'GITEA_API_TOKEN missing' }
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 -Runs 1 -BaseSeed 20261004 -MaxLength 120000 -InstancesPerEntity 2 -InstancesPerAction 1

Compare results to seed 20261003: 30 generated, six full-round stories, 29 long-story steps, 24 skipped, 27 real overlap epochs. Look at Long stories with all rounds observed; skipped; Long story steps; Real overlap; and contract/concurrency verdicts. A reported violation remains a candidate until reproduced with valid preconditions. POST /orgs/{org}/teams HTTP500 in seed 20261003 is unverified.
