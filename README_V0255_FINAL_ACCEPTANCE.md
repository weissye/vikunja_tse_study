# Vikunja 0.25.5 Final Acceptance

This runner regenerates the model after the concurrency-controller hotfix,
checks the generated JS for all hotfix markers, runs the acceptance campaign,
and rejects the result unless every runtime-ready concurrency oracle was
exercised and at least one real epoch was recorded.

The Vikunja token must already be valid in the current PowerShell process.

```powershell
& ".\scripts\Invoke-Vikunja-V0255-FinalAcceptance.ps1"
```

Success ends with `VIKUNJA_V0255_FINAL_ACCEPTANCE_COMPLETE` and prints the
evidence ZIP, SHA-256, epoch count, ready-oracle count, and exercised count.
`SEMANTIC_ANOMALY` is allowed because confirmed SUT defects are expected;
missing concurrency coverage or infrastructure failures are not allowed.

