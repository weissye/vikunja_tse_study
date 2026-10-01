Vikunja Increment 2 evidence-freeze delta
==========================================

Copy this delta over the repository root. It adds:

  scripts/Freeze-Vikunja-Increment2-Evidence.ps1

The script selects the latest canonical passing run for each seed:

  20261811, 20261812, 20261813, 20261814

It requires, per run:

  - Phase lifecycle evaluation: 16/16 PASS
  - Task create verifier: 6/6 PASS
  - Task update verifier: 6/6 PASS
  - Task delete verifier: 6/6 PASS
  - no violated, inconclusive, or missing witnesses
  - successful deletion probe
  - a valid source-run SHA256 manifest

It also requires four distinct Intent schedules and four distinct Permit
schedules before creating the evidence ZIP.

Run from the repository root:

  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
  Unblock-File ".\scripts\Freeze-Vikunja-Increment2-Evidence.ps1"
  & ".\scripts\Freeze-Vikunja-Increment2-Evidence.ps1"

