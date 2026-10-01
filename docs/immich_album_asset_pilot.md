# Immich album–asset membership: directed experiment

Target: the existing isolated Immich v3.2.0 deployment on 127.0.0.1:9926.
The runner checks the pinned OpenAPI SHA before making requests. It reuses
the existing local authentication helper and generic HTTP trace proxy.
This is a directed diagnostic; it is **not** a fully generated Provengo run.
No generator or existing test file is replaced by this overlay.

For each trial:

1. Create a new album and upload two different, tiny valid PNG assets A and B.
   Require HTTP 201 and a successful GET for each asset ID.
2. Add A; independently confirm the album count and filtered membership search.
   Verify the requested album-name prefix rounds. Set thumbnail to the real
   member A and verify the returned `albumThumbnailAssetId`.
3. Run serial `DELETE A; PUT B`, restore the {A} baseline, then run
   `PUT B; DELETE A`, restore {A} again. Verify membership and count after
   both orders and both resets.
4. Release `DELETE A` and `PUT B` from a two-thread barrier over separate
   connections; require the trace proxy's upstream intervals to overlap.
   Both API responses must individually acknowledge success. Read the final
   album and independently search its membership twice after quiescence.
   Expected final set is {B} and assetCount is 1.
5. Delete only the newly created trial album and trial assets; retain a
   redacted trace, source copy, checksums, summary and optional evidence ZIP.

`PASS` means both serial controls and final membership passed with witnessed
overlap. `SEMANTIC_CANDIDATE` means stable incorrect membership after two
successful, overlapping requests; follow up with isolated reproduction.
Missing dependencies, inconsistent read views, HTTP errors and unwitnessed
overlap are `INCONCLUSIVE`. No parallel result is treated as a bug solely on
timing, or from the album count alone.

## Run (PowerShell, from the project root)

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_album_asset_membership_pilot_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_immich_album_asset.py
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Album-Asset.ps1 -Trials 2 -PrefixRounds 4 -FreezeEvidence
```

The run directory and optional evidence ZIP are printed. Upload response 200
(duplicate asset) stops that trial: the pilot needs an independently created
asset. This overlay does not change previous campaign results or expand the
generic generator's capability to encode DELETE requests with JSON bodies.
