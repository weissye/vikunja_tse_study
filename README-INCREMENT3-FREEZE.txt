Vikunja Increment 3 evidence-freeze delta
==========================================

Copy over the vikunja_tse_study repository root. Adds only:
  scripts/Freeze-Vikunja-Increment3-Evidence.ps1

Required canonical seeds:
  20261901, 20261902, 20261903, 20261904

Per-run acceptance:
  - 16/16 multi-resource lifecycle checks
  - 30/30 external verifier witnesses
  - Task 18/18, Project 3/3, Label 9/9
  - zero VIOLATED, INCONCLUSIVE, or missing witnesses
  - successful deletion probe and valid source SHA256 manifest

Across-run acceptance:
  - identical OpenAPI/interfaces/stories/oracle hashes
  - four distinct Intent schedules
  - four distinct Permit schedules

Run:
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
  Unblock-File ".\scripts\Freeze-Vikunja-Increment3-Evidence.ps1"
  & ".\scripts\Freeze-Vikunja-Increment3-Evidence.ps1"
