# Generated shared-link dependency branch (opt-in)

Apply this delta **after** `immich_coverage_gate_delta.zip`. It modifies only
the included project-tree paths and adds `shared_link_branch` as a separate
profile. The `combined` and `discovery` profiles retain their defaults.

## What the uploaded failure proves

The discovery run recorded 355 HTTP events and **zero epochs**; the coverage
gate stopped after one seed and preserved its evidence, as designed.
Two album creations succeeded. `POST /shared-links` sent
`{"type":"INDIVIDUAL"}` without `assetIds` and received HTTP 400. A
`POST /admin/notifications` succeeded for a different user, so a readable
notification belonging to the research identity was not established. The
contract deviation remains the independently documented OAuth redirect.

## Change

The opt-in generator examines the resolved OpenAPI for an optional property
`XId`, a creation dependency on entity X, and a request `type` enum value X.
When there is exactly one unambiguous match and a generated producer for X,
it waits for a successful generated creation of X, binds its real ID, and
chooses the matching enum. For this pinned spec the produced JS binds
`albumId` from `SBT:InstanceReady:albums` and sets `type = "ALBUM"`.

This is an **exploratory structural hypothesis**, not proof that OpenAPI
documented the server's conditional business rule. The generated create
must return its documented success response and its GET must succeed; the
existing seven-round verified prefix and independent overlap evaluator then
decide whether `updateSharedLink` was exercised. The profile excludes album
and notification concurrency oracles. The generic generator has no Immich
operation ID or hand-authored asset story.

## Run (PowerShell from project root)

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive `
  -LiteralPath "$env:USERPROFILE\Downloads\immich_shared_link_branch_delta.zip" `
  -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_immich_optional_enum_branch.py
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile shared_link_branch -PreflightOnly
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile shared_link_branch
```

If the last command exits with `NO_NEW_TARGET_OVERLAP`, the evidence ZIP is
preserved; stop and inspect the `POST /shared-links` status, the subsequent
GET and `coverage-gate.json`. Do not repeat it unchanged. This overlay does
not automate binary asset creation or NOP testing.

Offline verification: pinned-spec unit test passed; preflight generated
265 operations and 243 verifiers; its generated create story binds the
album ID and sets the ALBUM enum, and the default generated stories were
byte-identical to the earlier version. Live Immich execution must be done
on the user's isolated server.
