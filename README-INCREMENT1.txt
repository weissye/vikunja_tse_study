Vikunja verifier Increment 1
============================

Copy the files from this delta over the existing vikunja_tse_study tree.

New files:
  scripts/generate_task_oracle_manifest.py
  scripts/validate_task_verifiers.py
  tests/test_task_verifiers.py

Replace existing files:
  scripts/Prepare-Vikunja-Phase7.ps1
  scripts/Invoke-Vikunja-Phase7-MultiResource.ps1

The preparation script now generates:
  phase7/generated-multi-resource-interleaving/oracle-manifest.json

Each run now generates:
  task-verifier-evaluation.json
  oracle-manifest.json

The external validator checks three OpenAPI-derived Task lifecycle oracles:
  1. task-create-visibility
  2. task-update-persistence
  3. task-delete-absence

The validator reports PASS, VIOLATED, NOT_EXERCISED, or INCONCLUSIVE.
A VIOLATED result is a semantic anomaly candidate and is never labeled a
confirmed product bug by this increment.

Suggested commands from the project root:

  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
  Unblock-File .\scripts\Prepare-Vikunja-Phase7.ps1
  Unblock-File .\scripts\Invoke-Vikunja-Phase7-MultiResource.ps1
  & .\scripts\Prepare-Vikunja-Phase7.ps1
  python -m unittest -v .\tests\test_task_verifiers.py
  & .\scripts\Invoke-Vikunja-Phase7-MultiResource.ps1 -Seed 20261801

Expected final marker:
  VIKUNJA_PHASE7_MULTI_RESOURCE_PASS

Also inspect the run's task-verifier-evaluation.json. Its run_status must be
PASS and each of the three oracle summaries must be PASS.
