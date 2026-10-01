# Stage 6.9: finish OAuth2 update stories in Stage 6

## What Stage 6.8 proved

In two independent trials, OAuth2 creation and GET succeeded, PATCH containing
only a new name returned 422 without changing the name, and PATCH with the
same new name plus the already observed `redirect_uris` returned 200 and
persisted. These are serial HTTP controls. They establish a safe basis for
constructing a positive update story; they do not establish a semantic bug.

The Stage 6.8 ZIP emitted a harmless PowerShell `Get-FileHash` error while
`checksums.csv` was being written. Inspection confirmed that the archive had
all expected files, and every existing checksum entry was valid. This ZIP
corrects that script for future Stage 6.8 reruns; **no rerun is needed**.

## Files and changes

Extract this ZIP at `C:\work\temp\vikunja_tse_study`:

* `generator_baseline/openapi_to_sbt/render/stories_js.py`: cumulative
  replacement based on Stage 6.7, including Stage 6.5C. In the opt-in long
  story profile, carry the documented `name` and `redirect_uris` from the
  independent item GET into PATCH, keeping the field deliberately under test
  free to change. The generator matches names and compatible types between
  the create request, PATCH request and GET response. It includes no Gitea
  operation ID, endpoint name, or hardcoded OAuth request value.
* `scripts/Invoke-Gitea-Stage3.ps1`: cumulative replacement of the existing
  Stage 3 runner. Capture Provengo output to a file and redact response
  credentials **after** the verifier evaluates the original HTTP trace but
  **before** checksums and ZIP creation. This does not rewrite verifier results.
* `scripts/redact_gitea_stage3_evidence.py`: sanitizer called by Stage 3. It
  fails the evidence freeze if credential masking is incomplete.
* `scripts/Invoke-Gitea-Stage6_8-OAuth-Serial.ps1`: only excludes
  `checksums.csv` from its own hash pipeline.

The existing Stage 6 orchestration and other project files are unchanged.
This ZIP replaces the named files only. Earlier raw ZIPs remain unchanged.

## Run and evaluate

For a same-seed comparison with Stage 6.7, prepare a **fresh isolated Gitea
Stage 1** in the same PowerShell process, then run Stage 6 again:

```powershell
cd C:\work\temp\vikunja_tse_study
& .\scripts\Prepare-Gitea-Stage1.ps1 -ResetState
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 `
    -Runs 1 `
    -BaseSeed 20261005 `
    -MaxLength 120000 `
    -InstancesPerEntity 2 `
    -InstancesPerAction 1
```

`-ResetState` replaces only the isolated Stage 1 containers and volumes; the
existing `runs` and `evidence` files on disk remain available. It is needed
here because reusing the same seed against existing OAuth applications can
produce duplicate-name failures.

Inspect the Stage 6 summary and the Stage 3 trace: OAuth2 long stories should
now send PATCH with both fields, GET after PATCH should show the selected
change, and the count of `operation-failed` skips should decline. Preserve
other skip reasons and do not count them as pass. This does **not** update
the generated concurrency-plan's OAuth PATCH requests: those may still return
422, so a run-level `INCONCLUSIVE` is possible even if long stories recover.
That concurrency input is the next, separate, measured change.

The new Stage 3 evidence ZIP should contain the same HTTP status/timing
observations but no OAuth client-secret values. Only the completed, newly
frozen ZIP is sanitized; an interrupted local run may retain raw traces in
its run directory. Do not share an incomplete run directory without checking
it. The previous Stage 6.7 evidence ZIP was not retroactively modified.

Local checks: frozen-spec generation changed only three OAuth update stories
(five inserted carry assignments) at the same seed; replaying the prior
389-event/26-epoch Stage 3 run through the sanitizer retained both event
counts and valid JSON while removing credential values. A live Gitea run is
still needed to verify the update stories.
