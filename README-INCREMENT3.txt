Vikunja Increment 3: generated Project and Label verifier obligations
====================================================================

Copy this delta over the existing vikunja_tse_study repository root.
It assumes that the Increment-2 race/count fix is already installed.

Changed generator files:
  generator_baseline/openapi_to_sbt/cli.py
  generator_baseline/openapi_to_sbt/render/stories_js.py

New scripts:
  scripts/generate_resource_oracle_manifest.py
  scripts/validate_resource_verifiers.py
  scripts/Prepare-Vikunja-Increment3.ps1
  scripts/Invoke-Vikunja-Increment3.ps1

New tests:
  tests/test_increment3_verified_resources.py
  tests/test_resource_verifiers.py

Increment 3 adds the profile:
  multi-resource-verified-resources

The profile preserves all Increment-2 Task verifiers and adds generated
create/update/delete obligations for one Project and all generated Labels.
With the default cardinalities, the external validator requires 30 witnesses:
  Task:    6 create + 6 update + 6 delete = 18
  Project: 1 create + 1 update + 1 delete = 3
  Label:   3 create + 3 update + 3 delete = 9

The Label deletion policy accepts 404, or 403 only when a successful
pre-deletion read proved that the same Label existed and was visible.

Commands (from repository root):

  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
  Get-ChildItem ".\scripts\*.ps1" | Unblock-File

  python ".\tests\test_increment3_verified_resources.py"
  python ".\tests\test_resource_verifiers.py"

  & ".\scripts\Prepare-Vikunja-Increment3.ps1"
  & ".\scripts\Invoke-Vikunja-Increment3.ps1" -Seed 20261901

Expected final marker:
  VIKUNJA_INCREMENT3_VERIFIED_RESOURCES_PASS

Do not run multiple seeds before the first seed passes. Preserve any failed
run directory for harness-versus-product diagnosis.
