Immich semantic confirmation: authenticated GET fix

Apply this delta at the root of C:\work\temp\vikunja_tse_study. It replaces
only scripts/run_immich_semantic_confirmation.py and adds a focused regression
test at tests/test_immich_semantic_confirmation_auth.py. The earlier wrapper
scripts/Invoke-Immich-Semantic-Confirmation.ps1 is reused as is.

Prior six INCONCLUSIVE outcomes from the 20260924_142443_437127 run were
caused by the runner passing a token positionally as the request body on three
GET call sites, leaving them unauthenticated. The failed GETs cannot support
claims about Immich. The earlier successful creates and GET /users/me calls
were separately authenticated. This change passes token=token explicitly.

Run from the project root:
  python -m unittest discover -s .\tests -p test_immich_semantic_confirmation_auth.py
  & .\scripts\Prepare-Immich-Album-Pilot.ps1
  & .\scripts\Invoke-Immich-Semantic-Confirmation.ps1 -Trials 3 -PrefixRounds 4 -FreezeEvidence

This confirmation run is serial and targeted. It does not exercise Provengo,
the full operation projection, or concurrency. The review ZIP contains the
necessary observations for assessing each candidate separately.
