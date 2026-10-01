# Gitea Stage 3.2 — evidence and verdict cleanup

Stage 3.2 preserves the Stage 3.1 concurrency mechanism and removes three
sources of research noise discovered in its first successful live run.

## Changes

- Contract-only violations now produce `CONTRACT_DEVIATION`; only state or
  concurrency violations produce `SEMANTIC_ANOMALY`.
- Generated baseline-reset PATCH/PUT requests carry a `generated-reset-*`
  epoch identifier. The state evaluator therefore does not report them as
  ordinary unobserved mutations.
- `provengo_project/products/internal` is excluded from both the hash manifest
  and evidence ZIP. In particular, mutable `runs-db.db` is no longer packaged.
- Generator version is `0.25.9`.

## Run

Run in the same PowerShell process that contains a valid `GITEA_API_TOKEN`:

```powershell
Set-Location "C:\work\temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Invoke-Gitea-Stage3_2.ps1"
& ".\scripts\Invoke-Gitea-Stage3_2.ps1"
```

If the token expired, first run `Prepare-Gitea-Stage1.ps1`, then invoke Stage
3.2 in that same PowerShell window.

Acceptance requires `GITEA_STAGE3_1_CONCURRENCY_ACCEPTED` from the shared
strict gate followed by `GITEA_STAGE3_2_COMPLETE`.
