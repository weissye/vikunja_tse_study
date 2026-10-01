Immich generated pilot: authentication boundary + generic oracle correction

Contains only two changed files, in their project-relative locations:
  scripts/run_immich_generated_pilot.py
  generator_baseline/openapi_to_sbt/evaluate_verifiers.py

Install from the existing C:\work\temp\vikunja_tse_study root:
  Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_generated_auth_control_delta.zip" -DestinationPath . -Force
  & .\scripts\Prepare-Immich-Album-Pilot.ps1
  & .\scripts\Invoke-Immich-Generated-Pilot.ps1 -Runs 2 -BaseSeed 20261007 -MaxLength 20000 -InstancesPerEntity 2 -InstancesPerAction 1 -FreezeEvidence

Scope and scientific interpretation:
  The original 275-operation OpenAPI stays untouched and pinned by SHA256.
  An explicit, Immich-specific OpenAPI projection removes seven session-changing
  operations (logout, change password, lock/unlock, deletion/locking of sessions)
  so the pinned study identity remains usable. The generator DOES receive the
  projected spec; this is a manual scope choice, not a generic generator fix.
  Generated scenarios for the remaining 268 operations are OpenAPI-derived. The generated
  verifier covers 245 active operations; 23 are marked deprecated by the spec.
  Each seed reauthenticates independently, checks /users/me, and halts if the
  trace contains 'Invalid user token'. If that happens, the run is INCOMPLETE.
  The optional evidence ZIP preserves the exact exclusion list and the SHA256
  of the projected OpenAPI in scope.json; the local run also stores its bytes.
  Replaying the prior Immich trace with the generic evaluator correction changes
  seed 20261007 from SEMANTIC_ANOMALY to CONTRACT_DEVIATION (six observations
  with 401 become INCONCLUSIVE); seed 20261008 remains CONTRACT_DEVIATION.
  The repeated GET /oauth/mobile-redirect 307 versus documented 200 remains
  an independent contract mismatch; it is not a semantic finding.
  Gitea replay regression keeps the old result and all layer counts identical.

Important: old ZIP evidence is immutable. No run against the live Immich
container was performed while preparing this patch. Upload the new evidence
ZIP or paste its seed results for analysis.
