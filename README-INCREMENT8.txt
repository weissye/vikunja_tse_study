Increment 8: Provengo-native true concurrent HTTP epochs

Increment 8 extends the validated Increment 7.2 model. Provengo still owns all
test decisions: participating operations, resources, sessions, constraints,
epoch lifecycle and observations. A deliberately narrow transport adapter only
prepares independent HTTP connections, releases a Provengo-declared epoch at a
barrier, joins it and emits timing evidence. It cannot select or mutate a test.

Pilot workload:
  - 6 Tasks inherited from the cumulative model
  - 1 epoch per Task
  - 2 independent PATCH operations per epoch (title and description)
  - 2 independent HTTP connections released by one barrier
  - 1 post-join GET per epoch
  - overlap must be proven independently by adapter and proxy intervals

The prior Increment 7.2 run inside the same cumulative scenario is the
sequential/interleaving control. A successful pair whose effects are not both
visible is only a bug candidate. Confirmation still requires two reproductions,
schedule minimization and a direct-client reproduction.

Extract this delta directly into:
  C:\work\temp\vikunja_tse_study

Run the pilot:
  python .\tests\test_increment8_concurrent_epochs.py
  & ".\scripts\Prepare-Vikunja-Increment8.ps1"
  & ".\scripts\Invoke-Vikunja-Increment8.ps1" -Seed 20262231

Do not freeze Increment 8 before the pilot evidence has been reviewed.
