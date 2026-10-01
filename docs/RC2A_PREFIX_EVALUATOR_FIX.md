# RC2a: preserve the admitted prefix when evaluating concurrent epochs

Install this small delta on top of RC1 and RC2. The previous evaluator matched the broad diagnostic field domain before the narrower runtime-ready oracle. The broad domain has no prefix requirement; therefore it reported concurrent PASS without recording `prefix_evidence` even when the observed HTTP trace had seven complete rounds. This update chooses the matching ready and gated oracle when an epoch bears prefix tags. Untagged runs retain their earlier candidate choice. If no gated oracle matches a tagged epoch, the witness is INCONCLUSIVE.

The preserved evidence ZIP and the original run directory remain untouched. To reevaluate both existing combined seeds from the Windows project root:

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_prefix_evaluator_rc2a_delta.zip" -DestinationPath . -Force
$run = '.\runs\research-fit-immich-generated-20260924_152454_844'
foreach ($seed in 20261401, 20261402) {
    $folder = Join-Path $run "seed-$seed"
    python .\generator_baseline\openapi_to_sbt\evaluate_verifiers.py `
        --trace (Join-Path $folder 'http-trace.jsonl') `
        --manifest (Join-Path $folder 'generated\verification-manifest.immich.json') `
        --output (Join-Path $folder 'prefix-reevaluation.json')
    if ($LASTEXITCODE -notin @(0,2,3)) { throw "Evaluation failed for $seed ($LASTEXITCODE)" }
    $result = Get-Content (Join-Path $folder 'prefix-reevaluation.json') -Raw | ConvertFrom-Json
    $result.witnesses | Where-Object { $_.prefix_evidence } |
        Select-Object epoch_id, result, @{Name='rounds';Expression={$_.prefix_evidence.rounds}}
}
```

Based on the supplied frozen review ZIPs, both combined seeds have 12 overlapping epochs each: seven PASS with validated prefix and five INCONCLUSIVE because serial controls failed. The contract violation in each run is an independent 307 response to `GET /oauth/mobile-redirect` while the OpenAPI declares 200. This is contract documentation behavior, not evidence of a concurrency fault. Preserve the original evidence and the reevaluation separately.
