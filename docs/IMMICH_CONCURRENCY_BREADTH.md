# Generated concurrency breadth campaign

Apply this tree overlay **after** `immich_verified_asset_branch_delta.zip`.

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_concurrency_breadth_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_generated_concurrency_breadth.py
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile concurrency_breadth -PreflightOnly
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile concurrency_breadth
```

This is a generated OpenAPI → Provengo experiment. The new generic
`concurrency-breadth` story profile runs outcome-checked creator stories with
their inferred dependencies and the existing generated verifier/concurrency
overlay. It omits unrelated action, long-prefix and cleanup stories from **this
breadth run** so they do not consume the event budget or delete producer
resources. It makes no changes to older profiles. `MaxFieldPairs=8` enlarges
the current bounded oracle sample; the previous campaign used 4.

The preflight on the pinned Immich v3.2.0 specification produces 265 interface
bindings, 243 contract verifiers, and 54 concurrency candidates: 45 runtime
ready, 7 abstract family templates instantiated by concrete scenarios, and
2 cases without documented create-to-item binding. The 265 bindings do **not**
mean 265 concurrently runnable operations. Existing inference currently
generates runnable same-field/disjoint PUT/PATCH item oracles for three
operation families (`updateAlbumInfo`, `updateSharedLink`, `updateNotification`).
Additional operation families such as cross-method album add/remove need a
separate generic derivation and evaluator; this campaign does not silently
claim them.

Each seed writes `concurrency-matrix.json`; the campaign writes
`coverage-summary.json`. For each oracle they distinguish generated,
runtime-ready, actual proxy-confirmed overlap, and independent oracle verdict.
An overlap with an inconclusive evaluator is not counted as PASS. If ready
oracles remain untested, the campaign reports `PARTIAL_READY_ORACLE_COVERAGE`
even if another oracle found a contract deviation. Review the evidence ZIP or
the run directory before choosing the next profile; do not rerun a seed that
only repeats already observed oracles.

One run is configured initially because Provengo's `runs-db.db` may consume
substantial disk space. Ensure there is sufficient free space before the live
run; preflight only creates the model. No live Immich run was executed while
preparing this overlay. The earlier directed asset membership pilot remains
a separate experiment and is not counted as generated concurrency here.
