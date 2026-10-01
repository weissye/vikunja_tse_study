# Gitea Stage 6.5: sequential confirmation

Overlay tree: copy the contents of this ZIP into the existing
`C:\work\temp\vikunja_tse_study` directory. One project script is replaced:

- `scripts/Invoke-Gitea-Stage6_5.ps1`

Run in the same PowerShell process that contains `GITEA_API_TOKEN` from
`Prepare-Gitea-Stage1.ps1`. Reusing the currently running Gitea Stage 1
environment is sufficient; a reset is not needed.

```powershell
Set-Location C:\work\temp\vikunja_tse_study
& .\scripts\Invoke-Gitea-Stage6_5.ps1 -Trials 2 -TeamOnly -FreezeEvidence
```

If that shell no longer has the token, run
`& .\scripts\Prepare-Gitea-Stage1.ps1` in the current PowerShell process
without `-ResetState`, then run the command above.

Each trial creates an independent organization and checks four documented
Team request shapes: name only, documented options without units, units using
the OpenAPI example `repo.code`, and units_map with a code read permission.
Each successful creation is independently read. The `-TeamOnly` switch skips
Release, which passed in both previous Stage 6.5 runs. All requests are
sequential and retain the existing Stage 5.2 trace/evidence layout.

Output: `runs/gitea-stage6_5-serial-confirmation-*/` and
`evidence/gitea-stage6_5-serial-confirmation-*-review.zip` with trace,
per-family verdicts, container log since the run began, script snapshot,
and checksums. Share the ZIP to decide whether to repair the generated input,
inspect a server error, or return to the 18 skipped dependency stories.

Interpretation: `UNDOCUMENTED_UNITS_PRECONDITION` means both requests without
units returned 500, while a documented units control created a visible team.
This can inform a generic OpenAPI-derived recovery of the skipped Team stories.
