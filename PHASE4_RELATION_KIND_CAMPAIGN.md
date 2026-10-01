# Vikunja Phase 4 — High-Complexity Relation-Kind Campaign

This delta adds the generic `relation-kind-campaign` generator profile and a
real-SUT pilot for all task-relation kinds declared by the OpenAPI contract.

## Complexity

- One project, one hub task, and eleven spoke tasks.
- Eleven relation kinds, one per hub-to-spoke edge.
- Bidirectional observation of every edge.
- Four task updates while the complete graph exists.
- Alternating deletion direction; inverse kinds are discovered from runtime
  responses rather than hard-coded.
- Twelve post-unlink reads.
- Six relation recreations followed by target deletion and immediate dangling
  reference checks.
- Cleanup probes for all twelve tasks and the project.

The external evaluator has fifteen aggregate semantic checks and reports
individual anomalies with their phase, edge, and reason.

## Pilot

Run only one seed initially:

```powershell
Set-Location "D:\Yeshayahu\Temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Invoke-Vikunja-Relation-Kind-Campaign.ps1"

if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN)) {
    throw "VIKUNJA_API_TOKEN is not set in this PowerShell window."
}

& ".\scripts\Invoke-Vikunja-Relation-Kind-Campaign.ps1" -Seed 20261101
```

Success ends with `VIKUNJA_RELATION_KIND_CAMPAIGN_PASS`. A failure may be a
semantic anomaly rather than a harness defect; preserve the complete run
directory and inspect `phase4-relation-kind-evaluation.json` before changing
the model or evaluator.
