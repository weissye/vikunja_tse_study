# Version 0.25.5 Hotfix 1

This delta fixes two execution defects found from
`openapi-verified-vikunja-20260923_080939_949-review.zip`.

## Findings from the uploaded run

- Provengo completed successfully and the external evaluator continued after
  anomalies: 38 PASS, 6 VIOLATED, 3 INCONCLUSIVE.
- No concurrency epoch ran. All 60 executable oracles emitted Ready events,
  but Ready events arrived out of index order and included payload data. The
  old controller waited sequentially for data-less Event objects, so it never
  emitted `ConcurrencyPermit:0`.
- The direct 304 confirmation failed before producing a verdict. Windows
  PowerShell converted the first Python stderr line into a terminating
  `NativeCommandError`, hiding the rest of the traceback.

## Fixes

1. The generated controller first collects all Ready events in arbitrary
   order using an EventSet predicate, then releases epochs deterministically.
2. Closed events are matched by name, so their diagnostic payload no longer
   prevents matching.
3. The confirmation wrapper captures complete stdout/stderr with native error
   handling temporarily relaxed. Even if Python fails, it creates an
   INCONCLUSIVE summary and freezes the complete error log and evidence ZIP.

## Validation

- New targeted tests: 7/7 PASS.
- Reconstructed regression suite: 113/113 PASS.

## Install

From `C:\work\temp\vikunja_tse_study`:

```powershell
Expand-Archive `
  ".\openapi-verified-generator-v0.25.5-hotfix1-delta.zip" `
  -DestinationPath "." `
  -Force
```

The direct confirmation is quick and does not require rerunning the long
acceptance campaign:

```powershell
& ".\scripts\Confirm-Vikunja-Patch304Candidate.ps1" `
  -Trials 10 `
  -Target "http://127.0.0.1:3466" `
  -Container "vikunja-increment8-2-postgres"
```

For a later corrected concurrency campaign, regenerate the verifier artifacts
with `Invoke-OpenApi-Verified-Generator.ps1` before rerunning acceptance. Do not
rerun acceptance merely to obtain the 304 confirmation result.

