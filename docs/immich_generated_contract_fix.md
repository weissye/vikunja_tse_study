# Immich generated campaign: contract-driven correction

Install the ZIP over the existing project tree. The archive contains only
changed files; it does not contain a standalone generator or OpenAPI document.

## Changes

- `generator_baseline/openapi_to_sbt/inference/values.py`: if `format: uuid`
  additionally supplies a regex requiring RFC 4122 version 4, generate a
  deterministic matching identifier. Preserve previous bytes for UUIDs without
  such a constraint. This fixes *format*, not resource existence.
- `generator_baseline/openapi_to_sbt/render/stories_js.py`: when the selected
  request is multipart with a binary field and no binary encoder/fixture exists,
  mark its generated story unavailable. No fabricated binary or malformed JSON
  multipart request is sent; dependent stories receive an unavailable event.
  This does not synthesize a readable asset, and the album–asset relation
  therefore remains outside fully automatic observed coverage.
- `scripts/run_immich_generated_pilot.py` and two PowerShell entry points:
  opt in to existing documented JSON DELETE generation and authorize the
  adapter against the *same projected* OpenAPI. The `combined` profile opts in;
  the other profiles and other systems keep their previous defaults.
- The recorded `CONTRACT_DEVIATION` for the redirect endpoint remains a
  contract discrepancy. This package does not change the evaluator or hide it.

## What was already automatic

The preserved combined campaign generated 265 operations and 243 verifiers,
with 34 same-record candidate concurrency oracles. Seven epochs were realized
per seed, all against `updateAlbumInfo`, with a verified 7-round prefix.
This includes same-field and disjoint-field updates. The dependency graph has
26 nodes and 8 edges; the album–asset relation is not the only coverage gap.

The existing positive update story has an OpenAPI-driven attempt to avoid a
no-op by reading the previous value and making a different value. The existing
`confirm_noop_candidate.py` is a separate post-discovery confirmation tool.
It is **not** an automatically generated NOP campaign; do not count NOP as
covered by this patch.

## Commands (PowerShell, from C:\work\temp\vikunja_tse_study)

```powershell
Expand-Archive `
  -LiteralPath "$env:USERPROFILE\Downloads\immich_generated_contract_fix_delta.zip" `
  -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_immich_generated_contract_fix.py
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile combined -PreflightOnly
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile combined
```

Check the resulting `scope.json`, each seed's generated `stories.immich.js`,
`concurrency-plan.immich.json`, `generated-verifier-evaluation.json`, and
HTTP trace. A generated operation is not considered exercised solely because
it appears in a report. The user-host live run is still required; this package
was verified in offline generation and focused tests on a composite baseline.

## Required next engineering work

To make multipart relations automatically executable, add a genuine generic
binary transport with an explicit, reproducible fixture corpus or examples
from the OpenAPI. Immich's `assetData` is described only as `format: binary`;
the document supplies neither file bytes nor an accepted file MIME type.
Then require a successful create and an independent read before using the
returned asset ID in a membership operation. Finally generate a NOP scenario
with two observational controls and a distinct-change control, keeping its
finding separate from response-contract mismatches.
