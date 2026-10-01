Immich generated pilot: maintenance boundary and proxy transport evidence

Project-relative changed files:
  scripts/run_immich_generated_pilot.py
  generator_baseline/openapi_to_sbt/trace_proxy.py
  generator_baseline/openapi_to_sbt/evaluate_verifiers.py
  docs/immich_generated_maintenance_README.txt

Install from C:\work\temp\vikunja_tse_study (previous deltas stay installed):
  Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_generated_maintenance_delta.zip" -DestinationPath . -Force
  & .\scripts\Prepare-Immich-Album-Pilot.ps1
  & .\scripts\Invoke-Immich-Generated-Pilot.ps1 -Runs 2 -BaseSeed 20261011 -MaxLength 20000 -InstancesPerEntity 2 -InstancesPerAction 1 -FreezeEvidence

The previous seed had 132 HTTP events and zero epochs. POST /admin/maintenance
with action select_database_restore returned 201, immediately followed by an
upstream connection closure during POST /activities. This is strong temporal
evidence of a maintenance transition, not proof of a semantic /activities bug.
The already-observed GET /oauth/mobile-redirect 307 vs documented 200 remains
a contract mismatch. A POST /libraries 500 had an unproven ownerId precondition.

The explicit Immich OpenAPI projection now excludes ten session/identity and
maintenance/restore operations. This is a documented experiment boundary,
not a generic generator rule or a claim that the excluded operations passed.
The remaining 265 operations include 243 active and 22 deprecated. All 243
active operations receive contract verifiers in offline preflight.

The general-purpose trace proxy now returns a recorded 502 with
transport_error when the upstream closes its connection. The evaluator treats
such observations as INCONCLUSIVE, distinct from a real SUT HTTP response.
The pilot flags UPSTREAM_TRANSPORT_FAILURE and remains incomplete. A local
HTTP-server integration test confirmed both 200 forwarding and dropped
connection recording. Gitea replay verdict and layer counts are unchanged.

Before every live seed, the runner verifies that the existing isolated Immich
reports inactive maintenance status. If maintenance remains active, the runner
stops without modifying server state. Inspect local server status and logs
before attempting another run; do not reset the database as a routine step.
