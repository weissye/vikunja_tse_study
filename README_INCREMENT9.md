# Vikunja Increment 9 — Provengo-driven concurrency search

Increment 9 broadens the confirmed Increment 8.2 lost-update result into a
systematic search campaign. Provengo owns resource creation, scenario choice,
schedule order, sequential controls, epoch declarations, observations, and
cleanup. The adapter only validates declared operations, opens independent
connections, waits at a barrier, applies declared small delays, joins workers,
and records timing evidence.

The primary SUT is the isolated PostgreSQL-backed Vikunja stack prepared by
Increment 8.2. Search findings are candidates, not confirmed product defects;
each must be reproduced without Provengo, proxy, or adapter in Increment 9.1.

## Search matrix

1. disjoint `title` / `description` writes;
2. disjoint `title` / `priority` writes with a 5 ms stagger;
3. two same-field `title` writes;
4. three-client `title` / `description` / `priority` writes;
5. update/delete race;
6. reversed-stagger `description` / `priority` writes.

Every scenario uses a separate sequential-control task and concurrent task.
The evaluator requires barrier readiness, distinct connections, overlap in
both adapter and proxy intervals, and a post-join HTTP observation.

## Install

Extract the delta ZIP into the existing repository root. It adds files under
`scripts` and `tests`; it does not replace the Increment 8.2 deployment.

## Run

Use one PowerShell process so the token exported by Increment 8.2 remains
available:

```powershell
Set-Location "C:\work\temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

& ".\scripts\Prepare-Vikunja-Increment8_2.ps1"

Unblock-File ".\scripts\Prepare-Vikunja-Increment9.ps1"
Unblock-File ".\scripts\Invoke-Vikunja-Increment9.ps1"

python ".\tests\test_increment9_campaign.py"
& ".\scripts\Prepare-Vikunja-Increment9.ps1"
& ".\scripts\Invoke-Vikunja-Increment9.ps1" -Seed 20262241
```

The invocation always creates a review ZIP under `evidence`. Evaluator exit 2
means candidates were found and correctly preserved; it is not a harness
failure. Exit 3 means the run was inconclusive or infrastructure failed.

The Docker inspect evidence is redacted before packaging. The token is never
written to evidence. Both Vikunja and PostgreSQL container logs are included.
