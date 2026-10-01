Mealie integrated campaign v0.26.16a — corrective overlay

Install in C:\work\temp\vikunja_tse_study with Expand-Archive -DestinationPath . -Force.
This overlay requires mealie_integrated_campaign_v02616_tree_overlay.zip already installed.

Fixed: PowerShell $Runs case-insensitive collision with local $runs after the completed run.
New controlled reset read: NO-OP and disjoint PUT require an observed baseline
before a concurrency epoch. Evaluator fails closed if reset missing/failed or
an intervening mutation occurs. Original VIOLATED epoch-15 remains a candidate.
Local replay reads the original complete trace and writes a small projected report:
python .\scripts\mealie_combined_review.py --run .\runs\research-fit-mealie-stage4-20260927_114804_173 --output .\evidence\mealie-combined-replay-20261831.json
The frozen review ZIP omits HTTP bodies and cannot independently confirm the field outcome.
The next generated run freezes coverage-matrix.json and a scrubbed combined-review.json.

Original campaign: 22 ready/seed, 4 and 6 actual overlaps, eight verified prefix
rounds, cross-entity 0 overlaps. Neither run demonstrated full family coverage.
Unit tests and generated JS syntax checked on Linux; PowerShell and the live
Mealie instance require validation on the user's Windows host.
