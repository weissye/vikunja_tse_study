Immich v3.2.0 visibility confirmation delta

Copy the ZIP contents into the root of C:\work\temp\vikunja_tse_study.
The archive contains the exact project-relative paths; it changes only the
generic evaluator and adds two experiment scripts. The older
scripts/run_immich_album_serial.py and pinned local OpenAPI must already exist.

PowerShell (from the project root):

  Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_visibility_confirmation_delta.zip" -DestinationPath . -Force
  & .\scripts\Prepare-Immich-Album-Pilot.ps1
  & .\scripts\Invoke-Immich-Visibility-Confirmation.ps1 -Trials 3 -PrefixRounds 4 -FreezeEvidence

Runs create a tag and an admin notification addressed to the authenticated
research user. Each case reads immediately, performs a serial GET-only prefix,
re-verifies the identity, then reads again. A 400 that itself says 'not found
or no ... access' remains inconclusive unless the same resource was readable
immediately and later loses visibility with the same authenticated identity.
The control does not establish what caused the historical late tag failures:
the generated campaign executed other mutations between create and read.

The generic evaluator now classifies that exact ambiguous 400 state read as
INCONCLUSIVE; it preserves the raw witness and the separate HTTP-contract
result. Offline replay of both uploaded Immich seeds yields CONTRACT_DEVIATION,
with 0 state violations and unchanged concurrency counts. Gitea replay remains
SEMANTIC_ANOMALY with unchanged layer counts.

Only the isolated server on localhost:9926 is contacted by the experiment.
The ZIP freezes response statuses and selected observed fields, never access
tokens or passwords. An actual live server test is required on the user's PC.
