# Gitea Stage 6.6: directed Team update/delete experiment

## Why this experiment

Stage 6.5D independently confirmed that the User Hook and OAuth2 producers work
with the observed required fields. Their remaining generated story skips need a
separate, explicitly reviewed generator change. This package instead follows the
earlier Stage 6 Team result: a readable Team can be created with `units:
["repo.code"]`. It tests a concrete state consistency hypothesis after a real
overlap of `orgEditTeam` (PATCH) and `orgDeleteTeam` (DELETE).

This is a **directed diagnostic**, not an OpenAPI-only generated finding. The
Team request selection and prior observed units precondition are recorded here.
It uses the project's existing `openapi_to_sbt.trace_proxy` and
`openapi_to_sbt.concurrency_adapter`, including its barrier, distinct connections,
timestamps and quiescence. It does not alter the generated Stage 6 campaign.

## Copy into the project

Extract the ZIP at `C:\work\temp\vikunja_tse_study`. It adds:

* `scripts/Invoke-Gitea-Stage6_6-Team.ps1` — PowerShell entry point.
* `scripts/run_gitea_stage6_6_team.py` — targeted experiment and evidence writer.
* `README-Stage6_6.md` — this protocol.

The existing `generator_baseline/openapi_to_sbt` and frozen
`model/gitea/gitea-1.27.3-swagger.json` must already be in the project.

## Execute in PowerShell

Keep the Stage 1 research instance running and obtain the token **in the same
PowerShell process** using the existing preparation script:

```powershell
cd C:\work\temp\vikunja_tse_study
& .\scripts\Prepare-Gitea-Stage1.ps1
& .\scripts\Invoke-Gitea-Stage6_6-Team.ps1 -Trials 8 -PrefixRounds 4 -FreezeEvidence
```

If Stage 1 is already running and `GITEA_API_TOKEN` is set in that process, run
only the second command. Use `-ResetState` with Stage 1 only when an isolated
fresh environment is desired; it removes that instance's prior data.

Each trial creates a fresh org and two fresh Teams. After four persisted PATCH
rounds, one Team passes sequential PATCH → GET → DELETE → GET controls. For the
other Team, PATCH and DELETE start from the same barrier, followed by GET after
150 ms quiescence. Submission order varies reproducibly with `-Seed`.

## Evidence and interpretation

The command prints paths to `runs/gitea-stage6-6-team-update-delete-*` and
`evidence/gitea-stage6-6-team-update-delete-*-review.zip`. The run contains
`stage6_6-summary.json`, `stage6_6-trials.csv`, `http-trace.jsonl`,
`concurrent-epochs.jsonl`, the exact Python runner, metadata and checksums.
The bearer token is read from the environment by the existing proxy and is
not written into the evidence ZIP.

* `PASS`: controls pass, requests truly overlap, DELETE returns 204, PATCH
  returns a documented 200/404, and the later independent GET returns 404.
* `SEMANTIC_CANDIDATE`: same prerequisites, but GET returns 200 after DELETE
  returned 204. Inspect the timeline and rerun before calling it a bug.
* `INCONCLUSIVE`: a control failed, the requests did not overlap, statuses are
  unexpected, or an infrastructure error occurred. It is not a pass.

The generated campaign's remaining Hook/OAuth story skips are a separate
follow-up: first verify their generator-only schema provenance, then change
their producer variants and rerun Stage 6; admin-only and runner dependencies
require their own permissions or environment controls.
