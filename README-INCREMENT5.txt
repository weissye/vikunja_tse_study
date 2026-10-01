Increment 5: negative-and-conflict-exploration

This delta preserves Increment 4's 58 positive witnesses and adds an
OpenAPI-generated negative BP story with 23 groups and 56 HTTP observations.
The Provengo engine interleaves the positive and negative bthreads. Completion
is blocked until every negative group closes.

Expected negative behavior: HTTP 4xx. A 2xx/3xx/5xx response is a semantic
violation candidate; a missing observation is INCONCLUSIVE. A candidate is not
called a confirmed product bug until reproduced twice and minimized.

Extract into the study root, then run:
  python .\tests\test_increment5_negative_exploration.py
  & ".\scripts\Prepare-Vikunja-Increment5.ps1"
  & ".\scripts\Invoke-Vikunja-Increment5.ps1" -Seed 20262101

Preserve any failing run directory. Do not run the next three seeds until the
first result has been classified.
