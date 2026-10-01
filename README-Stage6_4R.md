# Gitea Stage 6.4R — focused rerun delta

This delta contains one replacement source file. It was derived from the
`generator-stories_js.py` source snapshot inside the preserved 6.4 campaign
`gitea-stage6-generated-20260924_081555_854-review.zip`. Do not apply it to
an unrelated generator revision.

## What it changes

In the opt-in `long-interleaving` profile only, a string request field whose
own frozen OpenAPI description explicitly says `email address` is generated
as a valid email address even if Swagger omitted `format: email`. The
same-field no-op fallback keeps the value email-shaped. The `full` profile's
generated `stories.gitea.js` was byte-identical before and after this delta.

This does not repair unavailable producers, create-team HTTP 500 responses,
or failed sequential controls. They must remain visible in the evidence and
must not be counted as concurrency defects.

## Install and run in Windows PowerShell

Run from `C:\work\temp\vikunja_tse_study` (or the equivalent current study
root). Preserve the existing Stage 6.4 evidence ZIPs. Copy the delta ZIP into
the study root and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Expand-Archive .\gitea-stage6_4r-delta.zip .\stage6_4r_delta -Force

$dst = '.\generator_baseline\openapi_to_sbt\render\stories_js.py'
$expected = 'f7580a501c16bc6c80a2965797802c75f7b64a3f60d002b9114409fa3d8ba5db'
if (-not (Test-Path $dst)) { throw "Missing $dst" }
if ((Get-FileHash $dst -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected) {
    throw 'Generator differs from the preserved 6.4 source. Do not overwrite; send the current source or hash for rebase.'
}
Copy-Item $dst "$dst.before-stage6_4r" -ErrorAction Stop
Copy-Item '.\stage6_4r_delta\openapi_to_sbt\render\stories_js.py' $dst -ErrorAction Stop
if ((Get-FileHash $dst -Algorithm SHA256).Hash.ToLowerInvariant() -ne
    '86ef9bcb354f776a9ae63c493a7c941e12ec4be53b8fcb438751544920bccd74') {
    throw 'Copied source failed SHA256 verification.'
}
```

For a directly comparable rerun, use the *existing isolated Stage 1 reset
procedure* first. `-ResetState` deletes only its isolated Gitea containers
and volumes, not the study's preserved `evidence` directory; check your own
local changes before running it. It also creates a new research token for the
current PowerShell process. Do not print or put the token in a ZIP.

```powershell
& .\scripts\Prepare-Gitea-Stage1.ps1 -ResetState
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 `
    -Root (Get-Location).Path `
    -BaseSeed 20261004 -Runs 1 -MaxLength 120000 `
    -InstancesPerEntity 2 -InstancesPerAction 1 `
    -MinimumPriorHttpEvents 12 -QuiescenceMs 100
```

The existing runner performs Stage 2 preflight, generation, Stage 3 live run,
external evaluation and evidence freeze. Do not run the older independent
`Invoke-Gitea-Stage6.ps1`/`stage6.py` path. Do not edit generated JavaScript.

The run prints `Evidence ZIP:` and SHA256. It writes
`runs\gitea-stage6-generated-*\stage6-campaign-summary.json` and a paired
`evidence\gitea-stage3-live-acceptance-*-review.zip` containing the HTTP
trace, epochs, verifier evaluation, metadata and generated model. Upload
**both ZIPs** plus the short console output. No need to upload the entire
working tree.

## Decision after the rerun

Check that `update:orgEdit:1:field:email` is selected and its request is a
valid email, then compare completed/fully observed/skipped long stories and
epoch outcomes with the preserved 6.4 summary. A repeated HTTP 500 requires
an independently valid request and sequential confirmation. A concurrency
claim requires the *same resource* in a legal long prefix and concurrent
epoch, a passing sequential control in both orders, post-quiescence state,
and a sequence-local oracle violation. Merely increasing the selected seed
count or the prior-HTTP threshold does not establish that link.

If the rerun still has `PARTIAL_WITNESS_COVERAGE`, retain its evidence. The
next focused change should address the recorded producer failures or select
reachable candidates based on the frozen contract and measured evidence;
do not silently classify skipped stories as successes. Only after this review
should a second exploratory seed (`20261005`) be run on a fresh isolated state.

## Local verification performed for this delta

* Parsed the frozen Gitea 1.27.3 OpenAPI in the Stage 2 evidence.
* Generated `long-interleaving` for seed 20261004 with generator 0.26.2:
  `orgEdit.email` became `user36959@example.test` and its fallback retained
  valid email syntax.
* Generated the `full` profile before and after the patch and compared
  `stories.gitea.js` byte for byte: identical.
* No live Gitea run was performed in this environment.
