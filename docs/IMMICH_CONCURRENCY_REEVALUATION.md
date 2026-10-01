# Reevaluate the preserved Immich concurrency run

The original `20261601` run observed proxy-confirmed overlap for 44 of 45
runtime-ready oracle scenarios. Its old evaluator preferred a broad family
template over the exact field-pair oracle. For `updateSharedLink` with
`allowDownload` and `slug`, the reverse serial control also lost `slug`.
The original concurrency verdict is therefore unproven. This overlay makes
the exact oracle take precedence, requiring its reverse serial control, and
adds a read-only coverage reevaluation command.

Install the ZIP at the project root. Rerun the evaluator on the local original
run, whose unredacted trace and generated manifest are both available:

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_concurrency_reevaluation_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_concurrency_specific_oracle.py
$seedDir = '.\runs\research-fit-immich-generated-20260924_195135_376\seed-20261601'
python .\generator_baseline\openapi_to_sbt\evaluate_verifiers.py `
  --trace (Join-Path $seedDir 'http-trace.jsonl') `
  --manifest (Join-Path $seedDir 'generated\verification-manifest.immich.json') `
  --output (Join-Path $seedDir 'generated-verifier-reevaluation.json')
if ($LASTEXITCODE -notin @(0,2,3)) { throw "Reevaluation failed: $LASTEXITCODE" }
python .\scripts\generated_concurrency_matrix.py `
  --plan (Join-Path $seedDir 'generated\concurrency-plan.immich.json') `
  --epochs (Join-Path $seedDir 'concurrent-epochs.jsonl') `
  --trace (Join-Path $seedDir 'http-trace.jsonl') `
  --evaluation (Join-Path $seedDir 'generated-verifier-reevaluation.json') `
  --output (Join-Path $seedDir 'concurrency-matrix-reevaluated.json') `
  --summary (Join-Path $seedDir 'coverage-summary-reevaluated.json')
if ($LASTEXITCODE -ne 0) { throw "Coverage report failed: $LASTEXITCODE" }
```

Original evidence remains intact; the reevaluation writes separate files.
The distributed review ZIP has redacted request values for a password scenario,
so it cannot fully evaluate that one scenario. Prefer the local run for final
counts. Keep the raw local trace private; export redacted review evidence only.
Do not report the old `SEMANTIC_ANOMALY` as a confirmed concurrency bug.
