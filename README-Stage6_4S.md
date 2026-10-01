# Stage 6.4S — identity-change and evidence correction

Extract this ZIP at the root of `vikunja_tse_study`. The ZIP contains only the two modified source files and this README; it uses the same project paths as the earlier Stage 6 overlays.

## Why
The prior run renamed a repository through `repoEdit.name`. Later requests, state checks and concurrent controls still used the old URL and received HTTP 301. A redirect after a verified successful rename is insufficient evidence of a missing resource. The generated story now records identity-changing candidates as `SBT:StorySkipped` with reason `identity-change-requires-rebinding` in the opt-in `long-interleaving` profile. It emits the matching `StoryPhaseComplete` event so cleanup and ordering do not hang. Other profiles are unchanged. Full identity rebinding for those skipped operations is future work.

The evaluator marks only redirects at an old path following a previously logged successful `PATCH` or `PUT` that acknowledged a changed `name` as INCONCLUSIVE. It preserves other violations. Re-evaluating the uploaded 501-event trace leaves one contract deviation: `repoCreateTag` returned 201 versus documented 200. It cannot establish the truth of a hidden semantic fault.

## Installation and run (PowerShell from project root)

```powershell
Expand-Archive -LiteralPath .\gitea-stage6-4s-tree-overlay.zip -DestinationPath . -Force
& .\scripts\Prepare-Gitea-Stage1.ps1 -ResetState
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 `
    -Runs 1 `
    -BaseSeed 20261004 `
    -MaxLength 120000 `
    -InstancesPerEntity 2 `
    -InstancesPerAction 1
```

Keep preparation and execution in the same PowerShell session: the prepare script sets the token for the new isolated Gitea state. `-ResetState` clears the Gitea test state; it does not remove the prior evidence ZIPs.

## Files

- `generator_baseline/openapi_to_sbt/render/stories_js.py`: fixes identity-changing scenario scheduling for `long-interleaving` only.
- `generator_baseline/openapi_to_sbt/evaluate_verifiers.py`: retains the previous generic evaluator correction and adds evidence-bound classification for redirects after an observed rename.

Current generated work and previous runs are not replaced. The Stage 6 script regenerates them when run.
