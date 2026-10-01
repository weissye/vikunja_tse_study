# Coverage gate following the repeated combined campaign

This tree overlay applies *after* `immich_generated_contract_fix_delta.zip`.
Only the files listed in this ZIP replace project files. No generated JS or
product-specific assumptions were added to the generic verifier.

The previous two combined runs generated 265 operations and 243 verifiers per
seed but all seven overlapping epochs per seed used `updateAlbumInfo`. The
repeated contract deviation is the independent `redirectOAuthToMobile` 307.

## What this overlay does

* New opt-in, generic `--exclude-concurrency-operation OPERATION_ID` on the
  verification CLI filters *only* concurrency candidates. Contract/state
  verifiers and generated operations are unchanged. An unknown operation ID
  is a generation error. Defaults produce identical verification artifacts.
* The `discovery` profile excludes the already observed `updateAlbumInfo`
  oracle family, leaving the OpenAPI-derived candidates for `updateSharedLink`
  and `updateNotification`. Preflight prints those candidate names.
* `--require-new-overlap` measures actual overlapping epochs mapped to the
  generated oracle plan; if none execute, the run exits incomplete after
  freezing the `coverage-gate.json` and other evidence. It stops after the
  first failed seed; it never calls an unexecuted candidate a discovery.

## Known prerequisite gap

This overlay does **not** make either remaining candidate automatically
executable. Prior live trace shows two HTTP 400 responses creating shared
links (missing `albumId`/`assetIds` for the selected link type), and an
unreadable notification. The OpenAPI's `SharedLinkCreateDto` requires only
`type`; it does not document these conditional validation requirements. A
failure with `NO_NEW_TARGET_OVERLAP` therefore means prerequisites need a
model or independent valid fixture before another expensive run.

Binary `uploadAsset` still requires a supplied reproducible image fixture;
its spec has no bytes/MIME example. NOP testing is also still a separate
confirmation tool, not a generated case. Neither is claimed as covered.

## Install and one diagnostic run (PowerShell)

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive `
  -LiteralPath "$env:USERPROFILE\Downloads\immich_coverage_gate_delta.zip" `
  -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_immich_coverage_gate.py
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile discovery -PreflightOnly
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile discovery
```

An incomplete exit when no new relationship overlaps is intentional. The
evidence ZIP and `runs/<run>/seed-*/coverage-gate.json` explain what was
selected, what truly overlapped, and which target operations were missing.
Do not repeat `combined` or rerun `discovery` unchanged on this result.

Offline checks completed: unit tests; Immich discovery preflight gives 20
candidate oracles, 13 runtime-ready (`updateSharedLink` 12,
`updateNotification` 1), no `updateAlbumInfo`; and default verifier outputs
are byte-identical for pinned Immich and Gitea. No Immich live service was
available in this workspace, so no live discovery is asserted.
