Increment 6: linearizable-write-conflicts

This delta extends Increment 5 without replacing its 109 positive/negative
witnesses. It generates two competing BP writers for one Project, six Tasks,
three Labels and four Comments: 28 PUTs plus 28 verifier GETs. Provengo freely
interleaves these bthreads. A BP block prevents baseline destructive mutations
until the conflict obligations close.

The external trace-order oracle expects each verifier GET to expose the latest
successful write that precedes it in the observed HTTP sequence. A stale read,
failed legal write, or missing observation is classified explicitly. A semantic
anomaly is only a bug candidate until reproduced and minimized.

Install this delta over the Increment 5 project, then run only the pilot:
  python .\tests\test_increment6_linearizable_conflicts.py
  & ".\scripts\Prepare-Vikunja-Increment6.ps1"
  & ".\scripts\Invoke-Vikunja-Increment6.ps1" -Seed 20262201
