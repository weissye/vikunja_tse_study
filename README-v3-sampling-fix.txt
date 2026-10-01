Keycloak parallel CRUD generator v3: symbolic sampling / runtime binding fix

Overlay these files on the existing C:\work\temp\vikunja_tse_study project.
This is a delta ZIP. It requires the v2 generator and the previously installed
Run-Keycloak-ParallelCrud-Pilot.ps1 plus scripts/run_keycloak_parallel_crud_pilot.py.

PowerShell:
  Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\keycloak_parallel_crud_v3_sampling_fix.zip" -DestinationPath 'C:\work\temp\vikunja_tse_study' -Force
  cd C:\work\temp\vikunja_tse_study
  $env:PYTHONPATH = Join-Path (Get-Location) 'generator_baseline'
  python -m unittest discover -s .\tests -p test_parallel_crud_symbolic.py
  if ($LASTEXITCODE -ne 0) { throw 'Symbolic CRUD test failed' }
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\Run-Keycloak-ParallelCrud-Pilot.ps1'

The pilot still runs 1 logical process x 1 worker per entity initially. Its
sample-audit.json must say SAMPLE_COMPLETE_INTENT before starting real HTTP.
On failure, send sample-audit.json or the sanitized error plus pilot-summary.json;
do not send private logs or tokens. On a passing sample the existing runner
starts the local HTTP relay and executes exactly that one sampled scenario.

Changes: the generator never branches on a response code while sampling.
Callbacks check HTTP status and bind server IDs into per-worker RTVs; later
requests use @{sbt_...}. The observed GET body is used to construct PUT bodies
at runtime. Workers and verifiers still use independent bthreads and all 39
contract-derived parent dependencies. The audit remains structural only.

Local checks: Python regression tests passed; JS syntax passed; 25 entities,
39 edges, 2x8 yields 400 CRUD workers, 400 per-worker verifiers, 64 optional
lookup verifiers; static OpenAPI validation passed. Provengo sampling and live
Keycloak were NOT_RUN in the development environment.

No actual overlap or semantic bug is claimed by these checks. Four entity
types lack a documented update and one lacks a documented delete, so the
model reports 336 updates and 384 deletes at 2x8.
