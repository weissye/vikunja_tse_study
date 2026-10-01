Vikunja Increment 2: BP verifier obligations
=============================================

This delta adds a new generator profile without modifying the frozen Phase 7
profile or evidence:

  multi-resource-verified-obligations

For each generated Task instance, the profile creates three explicit BP
obligations and three independent verifier bthreads:

  create -> Obligation:VerifyTaskCreate -> GET -> VerifierClosed:TaskCreate
  update -> Obligation:VerifyTaskUpdate -> GET -> VerifierClosed:TaskUpdate
  delete -> Obligation:VerifyTaskDelete -> GET expected 404 -> VerifierClosed:TaskDelete

Mutation constraints block update until the create verifier closes and block
delete until the update verifier closes. Campaign completion waits for all 18
Task verifier obligations to close. Unrelated resource stories remain free to
interleave while an obligation is pending.

The external validator from Increment 1 remains authoritative. BP closure is
coordination evidence; semantic PASS/VIOLATED is determined from HTTP trace.

New files:
  scripts/Prepare-Vikunja-Increment2.ps1
  scripts/Invoke-Vikunja-Increment2.ps1
  tests/test_increment2_verified_obligations.py

Generator files replaced:
  generator_baseline/openapi_to_sbt/cli.py
  generator_baseline/openapi_to_sbt/render/stories_js.py

Run from the project root:

  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
  Unblock-File .\scripts\Prepare-Vikunja-Increment2.ps1
  Unblock-File .\scripts\Invoke-Vikunja-Increment2.ps1
  python .\tests\test_increment2_verified_obligations.py
  & .\scripts\Prepare-Vikunja-Increment2.ps1
  & .\scripts\Invoke-Vikunja-Increment2.ps1 -Seed 20261811

Expected preparation marker:
  VIKUNJA_INCREMENT2_PREPARE_PASS

Expected run marker:
  VIKUNJA_INCREMENT2_VERIFIED_OBLIGATIONS_PASS

Expected external verification:
  run_status: PASS
  task-create-visibility: 6/6
  task-update-persistence: 6/6
  task-delete-absence: 6/6
