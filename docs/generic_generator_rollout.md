# OpenAPI-to-SBT generic campaign rollout

This overlay extends the existing 0.26.3 generator. It does not introduce
application-specific rules into the generator. It retains the existing
OpenAPI-derived entity graph, bindings, Provengo scripts, adapter and
contract/state/concurrency verifiers.

## Changes

- `verification_cli.py` schedules destructive update/delete oracles by
  transitive high-confidence edges in the existing `dependency_graph.json`.
  A cycle among executable oracles fails generation with an explicit message
  rather than silently deadlocking. Event latches in the existing JS renderer
  permit either order of prerequisite and instance-ready events.
- `--max-concurrency-width {2,3}` controls the number of operations in each
  oracle. The default 3 retains prior output. JSON disjoint generation remains
  controlled by `--json-disjoint` and `--max-field-pairs`.
- `scripts/Generate-OpenAPI-SBT.py` takes any OpenAPI path and forwards the
  existing story and verifier settings, including entity/action counts, story
  length, prefix rounds, field pairs and cross-method empirical controls. It
  runs offline and writes `generic_campaign.json` with parameters and counts.
- The Immich live wrapper can now pass `-MaxConcurrencyWidth 2` through to the
  generic verifier CLI without changing its existing default behavior.

## Verification performed

- The four paper development-kit contracts (Library, Garage, Pharmacy,
  NetBox) from the available v35_b4 archive, plus Vikunja, Gitea and Immich
  were generated with the previous and modified code in both default and
  expanded configurations. `generic_compatibility_matrix.json` records 14/14
  byte-identical outputs, including JS, generation reports and verifier plans.
- The available Python test suite passed 27/27, including transitive edges,
  cycle rejection, width control and an actual Immich generation.
- An archived Immich HTTP trace was evaluated with a newly generated manifest.
  `generic_immich_offline_replay.json` records the unchanged semantic
  INCONCLUSIVE result and the two separate 500 server-error candidates.
- The existing Immich generated runner was also executed in `--preflight-only`
  mode with a new seed, three instances per entity and width two: 265 story
  operations, 243 verifiers and two ready cross-method oracles. It made no API
  requests; overlap is correctly recorded as zero until a live run.
- No live SUT or Provengo is installed in this execution environment.
  Historical generator snapshots before the immediately preceding code and
  live environments for all seven contracts were unavailable here; their
  runtime compatibility has not been proven by the static matrix.

## Windows commands from the repository root

```powershell
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\openapi_sbt_generic_campaign_delta_regenerated.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_generic_campaign.py
python .\scripts\Generate-OpenAPI-SBT.py `
  --openapi .\model\immich\immich-v3.2.0-openapi.json `
  --output .\generated\immich-generic-check `
  --name immich --base-url http://127.0.0.1:9926/api `
  --instances-per-entity 3 --instances-per-action 1 `
  --story-profile concurrency-breadth --max-field-pairs 4 `
  --max-concurrency-width 2 --empirical-update-delete
```

The generic generation command uses the full input OpenAPI. The existing
Immich live runner applies its documented stable-session projection and
research identity checks before submitting generated requests. To test the
actual Provengo pipeline with a new seed, run:

```powershell
& .\scripts\Invoke-Immich-Generated-Pilot.ps1 `
  -Runs 1 -BaseSeed 20261701 -MaxLength 45000 `
  -InstancesPerEntity 3 -InstancesPerAction 1 -MaxFieldPairs 4 `
  -MaxConcurrencyWidth 2 -EmpiricalUpdateDelete `
  -StoryProfile concurrency-breadth -PreflightOnly -FreezeEvidence
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Pilot.ps1 `
  -Runs 1 -BaseSeed 20261701 -MaxLength 45000 `
  -InstancesPerEntity 3 -InstancesPerAction 1 -MaxFieldPairs 4 `
  -MaxConcurrencyWidth 2 -EmpiricalUpdateDelete `
  -StoryProfile concurrency-breadth -FreezeEvidence
```

Preserve the resulting review ZIP and report the epoch counts, coverage
matrix, semantic verdict and server-error candidates separately.
