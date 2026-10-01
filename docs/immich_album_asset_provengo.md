# Immich album–asset: generated interface and Provengo scheduling

This is a focused continuation of the 4/4 passing album–asset adapter experiment.
The same pinned Immich v3.2.0 instance and SHA256-checked OpenAPI are required.

## What the run does

1. Authenticate the isolated research account and generate the Immich REST interface from the pinned OpenAPI, enabling documented JSON DELETE bodies.
2. For each trial, create a readable album and two individually readable image assets. Establish `{A}` membership, run the requested number of verified album update rounds, set a real thumbnail asset ID, verify both serial orders of `DELETE A` and `PUT B`, and restore `{A}`.
3. Create a fresh Provengo project. Its single focused bthread reads the album through the generated `getAlbumInfo`, submits an epoch to the existing OpenAPI-backed concurrency adapter, performs a tagged album GET, and emits `SBT:AlbumAssetEpochClosed`.
4. Check that Provengo selected both fixture and closing events; exactly one adapter epoch was logged; and the independent proxy trace contains exactly the two requested writes, distinct overlapping requests, and the later tagged GET. Read membership twice, and classify the final state. Any missing evidence is `INCONCLUSIVE`.

The fixture and two serial orders remain directed Python logic. The REST interface is generated, and Provengo schedules the focused concurrency story. This is **not** a full automatic campaign over all Immich entities.

## Install in the existing Windows project

From `C:\work\temp\vikunja_tse_study`:

```powershell
Expand-Archive `
  -LiteralPath "$env:USERPROFILE\Downloads\immich_album_asset_provengo_delta.zip" `
  -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_immich_album_asset_provengo.py
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Album-Asset-Provengo.ps1 `
  -Trials 2 -PrefixRounds 8 -MaxLength 1500 -FreezeEvidence
```

The ZIP adds `scripts/Invoke-Immich-Album-Asset-Provengo.ps1`,
`scripts/run_immich_album_asset_provengo.py`,
`tests/test_immich_album_asset_provengo.py`, and this document.
No earlier generator, runner, model, or deployment file is overwritten.

The run prints `IMMICH_ALBUM_ASSET_PROVENGO_RESULT` for each trial and saves a review ZIP in `evidence/`. Its `summary.json` identifies every result. The review ZIP includes generator output, generated interface, Provengo story and logs, adapter epoch log, sanitized HTTP trace, and checksums; the large Provengo run database remains only in the run directory. A trial with missing Provengo or proxy evidence is `INCONCLUSIVE`; it is never counted as `PASS`.

The local package can be checked without starting Immich by running the unit test. The live Provengo integration must be evaluated on the Windows research host, where Provengo and the isolated Immich container are installed.
