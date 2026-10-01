# Phase 7 — Multi-resource BP interleaving

Phase 7 generates one SBT model from a fixed 29-operation OpenAPI projection.
The generated model contains independent Project, Task, Label, Comment, and
Relation stories. Runtime IDs flow through BP events; `waitFor` defines causal
dependencies, `block` protects cleanup invariants, and Provengo selects legal
interleavings. The external evaluator uses only the preserved HTTP trace.

First prepare the projection and generated model:

```powershell
Set-Location "D:\Yeshayahu\Temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Get-ChildItem ".\scripts\*Phase7*.ps1" | Unblock-File
& ".\scripts\Prepare-Vikunja-Phase7.ps1" -Tasks 6
```

Then run one pilot seed:

```powershell
& ".\scripts\Invoke-Vikunja-Phase7-MultiResource.ps1" -Seed 20261701 -Tasks 6
```

Success ends with `VIKUNJA_PHASE7_MULTI_RESOURCE_PASS`. Preserve any failing
run unchanged: it is a triage candidate, not automatically a Vikunja bug.
