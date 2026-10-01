Immich generated Provengo pilot, version-pinned to isolated Immich v3.2.0.

Copy the two scripts/ files into the existing project's scripts/ directory.
The ZIP contains paths relative to C:\work\temp\vikunja_tse_study.
It does not replace or edit the generator, Gitea scripts, or deployment.

From the project root in PowerShell:
  Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_generated_provengo_pilot_delta.zip" -DestinationPath . -Force
  & .\scripts\Prepare-Immich-Album-Pilot.ps1
  & .\scripts\Invoke-Immich-Generated-Pilot.ps1 -Runs 2 -BaseSeed 20261007 -MaxLength 20000 -InstancesPerEntity 2 -InstancesPerAction 1 -FreezeEvidence

The local pilot is limited to http://127.0.0.1:9926 and checks Immich v3.2.0
and the pinned local OpenAPI SHA256. Requires installed Provengo and Python,
and the generator and serial pilot already installed in this project.

Optional generation-only check (does not send HTTP or run Provengo):
  & .\scripts\Invoke-Immich-Generated-Pilot.ps1 -Runs 1 -PreflightOnly -FreezeEvidence

How to read results:
  generated_operations and verifier_operations are static counts, not live coverage.
  The spec contains 275 operations: 252 active + 23 marked deprecated.
  Verifiers cover the 252 active operations. Report unverified_active_operations
  separately; the generator also emits the deprecated endpoints.
  http_events, distinct_paths_observed and real_overlap_epochs are live witnesses.
  oracle_status is the preserved trace evaluator's result.
  NO_REAL_OVERLAP / NO_HTTP_WITNESS do not prove the application passed.
  A candidate requires independent reproduction; contract deviations are separate.

Full run artifacts remain under runs/research-fit-immich-generated-*/seed-*/.
The optional evidence ZIP contains a key-redacted trace, runtime counts,
generator reports and checksums, and excludes Provengo's large internal DB.
Raw run logs and raw trace stay local; review them there only if needed.
This is the full OpenAPI generation profile: unsupported multipart upload can
block dependent stories; the report keeps that failure visible.
