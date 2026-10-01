# RC2d: admit a contiguous verified window of N rounds

Install this tree overlay after RC2c. It replaces exactly three files:

- `generator_baseline/openapi_to_sbt/render/verification_js.py`: searches all generated matching stories and resources for N consecutive `SBT:PrefixVerified` rounds. A missing round breaks only that story's streak. `SBT:PrefixAdmitted` records the actual first and last round.
- `generator_baseline/openapi_to_sbt/trace_proxy.py`: records `X-Provengo-Prefix-Start-Round` from the adapter traffic.
- `generator_baseline/openapi_to_sbt/evaluate_verifiers.py`: requires consistent start and end tags on concurrent operations and verifies every tagged GET in the exact same-story, same-path window completed before the epoch. Old traces without the start tag still require rounds 1..N.

Evidence motivating the change: in seed `20261412`, the album `order` story published `SBT:PrefixVerified` for rounds 3..12 on one album (ten consecutive successful rounds). Its round 1 and 2 HTTP reads existed but did not publish `SBT:PrefixVerified`. The older gate latched onto a different album story and stalled at its missing round 3. The preserved historical run has no concurrent epoch and cannot be converted into a witness by reevaluation.

Run from the Windows project root:

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_contiguous_prefix_rc2d_delta.zip" -DestinationPath . -Force
& .\scripts\Invoke-Immich-Generated-Pilot.ps1 `
  -Runs 1 -BaseSeed 20261412 -MaxLength 60000 `
  -InstancesPerEntity 2 -InstancesPerAction 1 `
  -MaxFieldPairs 4 -JsonDisjoint `
  -LongStoryMinRounds 10 -LongStoryMaxRounds 12 `
  -PrefixBeforeConcurrency 10 -PreflightOnly -FreezeEvidence
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Pilot.ps1 `
  -Runs 2 -BaseSeed 20261412 -MaxLength 60000 `
  -InstancesPerEntity 2 -InstancesPerAction 1 `
  -MaxFieldPairs 4 -JsonDisjoint `
  -LongStoryMinRounds 10 -LongStoryMaxRounds 12 `
  -PrefixBeforeConcurrency 10 -FreezeEvidence
```

Validation: Python unit tests for later and legacy windows, rejection of missing/mixed/late rounds; Node syntax check for generated prefixed Immich JS; byte-identical ungated renderer output versus RC2c for available Immich and Gitea manifests; archived seed `20261411` and `20261412` evaluations retain their concurrency verdicts; actual archived seed `20261412` HTTP reads of album `order` round 3..12 satisfy the new evaluator's window rule under a hypothetical later epoch. Live execution remains necessary to learn whether Provengo admits and completes the epoch, and whether serial controls and the concurrent observation pass.
