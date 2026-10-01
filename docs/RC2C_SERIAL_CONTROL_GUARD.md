# RC2c: admit concurrency only after valid serial controls

Overlay this delta onto RC1 + RC2 + RC2a + RC2b in the project root. Only `generator_baseline/openapi_to_sbt/render/verification_js.py` changes. No application-specific field names or hard-coded endpoint rules are added.

## Evidence and diagnosis

In Immich seed `20261411`, all five INCONCLUSIVE concurrency epochs selected the optional `albumThumbnailAssetId` UUID. Its fabricated UUID is syntactically valid but did not identify a real album asset: the sequential PATCH returned HTTP 400 (`Invalid album thumbnail`). The reset also sent an observed `null` thumbnail back in a string-typed PATCH and returned HTTP 400. The evaluator correctly classified these five as INCONCLUSIVE. The remaining seven epochs passed with ten verified prefix rounds.

## Change

For prefix-gated oracles only, the renderer checks that every selected field has an observed, restorable baseline value before attempting the serial control. It monitors forward and reverse control response codes, resets only fields whose control write succeeded and whose baseline is non-null, checks reset status, and closes the oracle with a diagnostic reason before launching an epoch if a required control fails. An unavailable baseline also closes the oracle. Thus a fabricated UUID or invalid reset cannot be counted as meaningful concurrent evidence or disrupt the next oracle. An unproven reference is not silently replaced with another fabricated identifier; exercising that field would require a verified, available related resource.

No-prefix generated JavaScript was checked byte-for-byte against RC2b for available Immich and Gitea manifests. Prefixed Immich JavaScript passes Node syntax checking. Provengo and Immich live execution are the remaining validation gate.

## Install and run on Windows

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_prefix_serial_controls_rc2c_delta.zip" -DestinationPath . -Force
& .\scripts\Invoke-Immich-Generated-Pilot.ps1 `
  -Runs 1 -BaseSeed 20261411 -MaxLength 60000 `
  -InstancesPerEntity 2 -InstancesPerAction 1 `
  -MaxFieldPairs 4 -JsonDisjoint `
  -LongStoryMinRounds 10 -LongStoryMaxRounds 12 `
  -PrefixBeforeConcurrency 10 -PreflightOnly -FreezeEvidence
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Pilot.ps1 `
  -Runs 2 -BaseSeed 20261411 -MaxLength 60000 `
  -InstancesPerEntity 2 -InstancesPerAction 1 `
  -MaxFieldPairs 4 -JsonDisjoint `
  -LongStoryMinRounds 10 -LongStoryMaxRounds 12 `
  -PrefixBeforeConcurrency 10 -FreezeEvidence
```

Judge the new run by successful serial controls, number of actual epochs with `prefix_evidence.rounds >= 10`, PASS versus INCONCLUSIVE counts, and `ConcurrencyClosed` reasons for skipped oracles. Fewer epochs are possible because previously invalid witnesses now close before adapter submission; do not interpret that alone as regression or as an additional semantic bug. The independent OAuth redirect contract discrepancy may remain.
