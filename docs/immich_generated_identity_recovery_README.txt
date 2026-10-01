Immich generated pilot, research identity recovery after prior generated run

Project-relative changed/new files:
  scripts/run_immich_generated_pilot.py     (replace)
  scripts/recover_immich_pilot_identity.py  (add)
  docs/immich_generated_identity_recovery_README.txt (new instructions)

Run from C:\work\temp\vikunja_tse_study after installing earlier pilot and
auth-control deltas:
  Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_generated_identity_recovery_delta.zip" -DestinationPath . -Force
  & .\scripts\Prepare-Immich-Album-Pilot.ps1
  & .\scripts\Invoke-Immich-Generated-Pilot.ps1 -Runs 2 -BaseSeed 20261009 -MaxLength 20000 -InstancesPerEntity 2 -InstancesPerAction 1 -FreezeEvidence

The first previous run successfully changed the isolated admin's email via
PUT /users/me. The private local credentials file still contains its old email.
This repair reads the local prior HTTP trace, tries its recorded new email with
the existing private password, verifies successful login AND the same admin id
using GET /users/me, and only then atomically updates the local credentials
file. Password and access token are never written to evidence or stdout.
If no verified recovery is possible it stops; it does not reset any containers,
data, volumes, or credentials blindly.

The explicit Immich-specific OpenAPI projection now excludes eight operations
that can invalidate/change the fixed research identity. This is NOT a generic
generator rule, BLOCK directive, or claim of coverage for excluded operations.
Remaining coverage: 267 operations generated, 245 active + 22 deprecated;
all 245 active operations receive verifiers. Exact operation list and source
hashes are recorded in scope.json of the review ZIP.

The simulator and regression tests were offline. We cannot confirm the live
login recovery until the user runs it against their isolated local server.
Use a new pair of seeds because earlier seeds changed persistent local data.
