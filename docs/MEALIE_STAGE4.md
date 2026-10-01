# Fourth real-system experiment: Mealie

This package overlays new files onto the existing project tree. It does not change
`generator_baseline` or any previously classified findings. Mealie v3.27.0 was
previously generated statically (266 OpenAPI operations); this stage runs the same
generator and its JavaScript verifiers under Provengo on a separate PostgreSQL
research deployment. Port 9927, Compose project `fse-mealie-stage4`, and its
volumes are separate from the earlier SQLite research-fit pilot on port 9925.

The experiment projects the downloaded pinned OpenAPI to recipe, organizer,
shopping and meal-plan paths. The projection excludes authentication, identity,
admin, external imports and media. Both full-spec hash and all excluded
operations are recorded in `scope.json`. Reporting must use *projected*
operation coverage, not claim full 266-operation live coverage. No overrides,
hard-coded stories, or changes to the generator are supplied.

From Windows PowerShell, in the existing project root:

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\mealie_stage4_full_environment_tree_overlay.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_mealie_stage4.py
& .\scripts\Prepare-Mealie-Stage4.ps1
& .\scripts\Invoke-Mealie-Stage4.ps1 -PreflightOnly -FreezeEvidence
& .\scripts\Invoke-Mealie-Stage4.ps1 -Runs 2 -BaseSeed 20261801 -MaxLength 25000 -InstancesPerEntity 2 -InstancesPerAction 1 -MaxFieldPairs 3 -MaxConcurrencyWidth 2 -PrefixRounds 6 -FreezeEvidence
```

The live runner first checks the pinned OpenAPI SHA-256 and a readable authenticated
identity. It obtains a short-lived login token for the default account *only* on
the isolated local deployment. If you changed its password or retained a volume,
create a token in the local profile and set `$env:MEALIE_RESEARCH_TOKEN` in the
same PowerShell process before running. Never include that token in an uploaded log.

The runner prints `MEALIE_STAGE4_RESULT` with observed HTTP requests, epochs,
real overlap, runtime-ready oracles and generated evaluator status. A review
ZIP is produced for preflight and live runs; it contains only an allow-list of
JSON artifacts and HTTP metadata without request/response bodies. A zero
overlap run is successful execution but *not* proof of concurrency coverage.
Compare ready/observed/evaluated before making a bug claim. `CONTRACT_DEVIATION`
alone is not evidence of a semantic state defect.

The previous SQLite Mealie study produced `model/mealie/openapi.json` with SHA-256
`0528428e...`. PostgreSQL may yield a different *raw* OpenAPI hash. The gate
now verifies the old pinned file, version v3.27.0, then compares all paths,
components and authentication requirements after ignoring documentation-only
metadata. It saves `model/mealie/stage4-spec-comparison.json` and refuses to
generate when an operation or schema changed. Send that report for inspection
if `MEALIE_STAGE4_SPEC_GATE state=BLOCKED` appears.

Stop this isolated environment without deleting its data:

```powershell
docker compose -p fse-mealie-stage4 -f .\deployment\mealie_stage4\compose.yaml stop
```

Keep the evidence ZIP and its SHA-256 after every run. Do not reset or remove
any Gitea, Vikunja or Immich resources.
