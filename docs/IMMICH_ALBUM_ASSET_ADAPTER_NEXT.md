# Next Immich stage: OpenAPI-backed DELETE body in the generic adapter

This delta builds on the prior album–asset pilot that produced one PASS.
It updates four generic generator files, adds one scoped runner and two
PowerShell entry points, and adds an adapter regression test. Extraction at
the project root replaces those four specific generic files; it does not
replace the previous pilot, its evidence, or any OpenAPI document.

## Purpose and boundary

The isolated, pinned Immich v3.2.0 server is used exactly as before. Each
trial creates and GET-verifies two real uploaded assets. Their image bytes
differ across trials to avoid false duplicate responses from content-based
deduplication. The experiment verifies serial
album membership changes in both orders, validates four or more name-prefix
steps, verifies a thumbnail using a real asset ID, and only then launches
DELETE A + PUT B through the generic `openapi_to_sbt.concurrency_adapter`.
The adapter accepts the DELETE `{ids:[A]}` body only when an explicitly
provided OpenAPI document declares `application/json` on that DELETE path.
It records separate connection identifiers, barrier release, response
acknowledgments, quiescence, and overlap. The HTTP trace must independently
witness upstream overlap before an incorrect final set can be classified as
a `SEMANTIC_CANDIDATE`. Independent filtered search and album count must
agree twice; otherwise the result is `INCONCLUSIVE`.

This stage still uses a scoped Python fixture for binary asset upload and
serial controls. The generator can now emit a JSON body for documented
DELETE requests when `--json-delete-bodies` is explicitly selected, and
the generated interface is checked during preflight. Provengo does **not**
yet schedule this album–asset trial: the missing general capability is
generation of a readable binary asset and its dependent membership oracle.
Do not label the directed adapter result a fully generated Provengo result.

## Install (PowerShell, from `C:\work\temp\vikunja_tse_study`)

The baseline hashes below correspond to the installed RC2 generator's four
affected files. Verify **before** extraction. If any hash differs, stop:
an older or newer generator needs a rebased delta; `-Force` would overwrite
its changes.

```powershell
cd C:\work\temp\vikunja_tse_study
$expected = @{
 'generator_baseline\openapi_to_sbt\cli.py' = 'de59f7ccc1038a2a50999d36948e2ff77f3894482f45cd556e2a60dfbbbcd582'
 'generator_baseline\openapi_to_sbt\pipeline.py' = '79202616db416bd1a75e4c4c97d00847c9ab0df84dd2d33eb2fd2605e9ad3e62'
 'generator_baseline\openapi_to_sbt\render\interfaces_js.py' = '6dda44bbdf544e0dec88d4ced1a453d806ec4a5710bfa016178c6da5360726e9'
 'generator_baseline\openapi_to_sbt\concurrency_adapter.py' = '7a9e8963dc45959933cc0549284e1e9f273bb0aa625506593a64f428ba4296c0'
}
foreach ($path in $expected.Keys) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Missing generator file: $path" }
  if ((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected[$path]) {
    throw "Generator version mismatch at $path; stop before extraction"
  }
}
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_album_asset_adapter_openapi_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_json_delete_adapter.py
& .\scripts\Test-Immich-JsonDelete-Preflight.ps1
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Album-Asset-Adapter.ps1 -Trials 4 -PrefixRounds 8 -FreezeEvidence
```

If the four existing generator files already have the *new* hashes printed
in the release notes, extraction can be repeated without the baseline gate.
The pilot prints its run directory and evidence ZIP. Start with `-Trials 1`
if you need a brief smoke before `-Trials 4`.

## Backward compatibility performed at build time

The default generator produced byte-identical interfaces, stories, reports,
and dependency graphs on Library, Garage, Pharmacy, NetBox, Vikunja, Gitea,
and Immich when compared against RC2 for the same seeds and flags. See
`docs/backward_compatibility.txt`. The opt-in Immich generation emitted a
documented JSON body and media type for `removeAssetFromAlbum`. The adapter
still rejects JSON DELETE bodies by default when no OpenAPI document is
supplied. These are static and local HTTP checks, not seven live SUT runs.

## New generic file hashes

- `cli.py`: `9776228162b6dc5c0df3871ec90f02859ef32b8d3cf8fbf41a41eb658baf72c4`
- `pipeline.py`: `6d7ec77fc95cea179d487b5870ccad3923e0a644f617a4d0dcc1aed856d17fb4`
- `render/interfaces_js.py`: `b286903c93fa918bc2558746f0ca76f47d61002a117e6a0de8ebafc41ac8d552`
- `concurrency_adapter.py`: `a03d4091ae095a8f8fe74f0738dc384419d5fc4008fc5bd4f5ddee4006bdef26`
