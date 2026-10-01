# Verified album asset branch

Apply this ZIP over the existing project tree after `immich_shared_link_branch_delta.zip`.

From the project root in PowerShell:

```powershell
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_verified_asset_branch_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_verified_album_asset_values.py
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile album_asset_branch -PreflightOnly
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile album_asset_branch
```

The opt-in branch makes a unique PNG (explicit fixture; its bytes cannot be inferred
from OpenAPI), uploads it with documented multipart fields and authenticates a
`GET /assets/{id}` before producing generated stories. The generator checks the
supplied `operationId` and schema before binding that real ID into the documented
`ids` array of `addAssetsToAlbum`. Provengo schedules the generated action.
The runner requires the authenticated proxy trace to show an ordinary generated
`PUT /albums/{id}/assets` with `ids` equal to the verified asset and an HTTP 200
response containing that ID with `success: true`. Otherwise the experiment is
INCOMPLETE and preserves the evidence. The preflight value is an explicitly
unverified placeholder and preflight sends no API requests.

`asset-fixture-evidence.json` and `asset-add-witness.json` are included in
redacted review evidence. Verifier output remains authoritative for its own
contract and concurrency layers. A successful add witness is a prerequisite
coverage result, not proof of concurrent add/remove or a semantic bug. The
generated remove action still requires a demonstrated membership and causal
binding before it can be interpreted as a positive serial control. The
experiment does not yet automatically exercise a valid `albumThumbnailAssetId`
update or a concurrent add/remove pair. The earlier dedicated adapter pilot
does exercise both serial orders and real overlap, but is a separate control.

The ZIP contains only project-relative changed files. Defaults are unchanged;
the new path is enabled only by `--verified-album-asset-fixture` or the profile.
