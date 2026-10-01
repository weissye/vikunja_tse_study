# Vikunja Phase 3B — Task Relation Lifecycle Pilot

This delta adds the generic `validated-relation-lifecycle` story profile and a
real-SUT pilot for Vikunja task-to-task relations. The generated scenario is
derived from the OpenAPI contract and uses runtime IDs returned by Vikunja.

## Pilot scope

The scenario creates a project and two tasks, creates a `related` relation,
observes it from both tasks, updates Task A, verifies persistence, removes the
relation and verifies absence on both sides. It then recreates the relation,
deletes Task B, verifies that Task A has no dangling reference, and cleans up.
An external evaluator requires 21 observable witnesses.

## Run one seed on Windows

From `D:\Yeshayahu\Temp\vikunja_tse_study`:

```powershell
Set-Location "D:\Yeshayahu\Temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Invoke-Vikunja-Relation-Lifecycle.ps1"

if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN)) {
    throw "VIKUNJA_API_TOKEN is not set in this PowerShell window."
}

& ".\scripts\Invoke-Vikunja-Relation-Lifecycle.ps1" -Seed 20261011
```

Success ends with `VIKUNJA_RELATION_LIFECYCLE_PASS` and a 21/21 evaluation.
Preserve the complete run directory even if the pilot fails; it contains the
redacted HTTP trace and diagnostic evidence needed for correction.

Do not run multiple seeds yet. After the single pilot passes, use three seeds
before freezing the Phase 3B evidence package.
