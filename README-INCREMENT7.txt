Increment 7: disjoint-field-update-commutativity

This delta extends Increment 6 and preserves its baseline and 28 competing-write
witnesses. For each of six existing Tasks, two independent BP writers update
different writable fields: title and description. A per-Task verifier executes
only after both writes close and requires one external GET to expose both
successful effects. This adds 12 PUTs, 6 verifier GETs and 6 semantic witnesses.

The Increment 7 phase starts only after Increment 6 closes. A BP constraint keeps
the baseline destructive phase blocked until all Increment 7 verifiers close.
The oracle uses only ordered, redacted HTTP trace evidence. A lost field is a
semantic-anomaly candidate, not a confirmed product bug, until reproduced,
minimized, and checked against Vikunja's omitted-field update semantics.

Extract this delta directly into the working Increment 6 project root:
  C:\work\temp\vikunja_tse_study

The archive already contains scripts\ and tests\ at its root. Then run:
  python .\tests\test_increment7_disjoint_updates.py
  & ".\scripts\Prepare-Vikunja-Increment7.ps1"
  & ".\scripts\Invoke-Vikunja-Increment7.ps1" -Seed 20262211
