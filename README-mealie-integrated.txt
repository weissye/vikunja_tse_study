Mealie integrated concurrency campaign (generator 0.26.16)

Install this overlay into the existing vikunja_tse_study tree. The pinned
Mealie Stage4 Docker deployment, verified create/update controls, and Provengo
from the previous Stage4 are prerequisites.

PowerShell:
  cd C:\work\temp\vikunja_tse_study
  Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\mealie_integrated_campaign_v02616_tree_overlay.zip" -DestinationPath . -Force
  python -m unittest discover -s .\tests -p test_mealie_combined_campaign.py
  python -m unittest discover -s .\tests -p test_combined_oracle_evaluation.py
  python -m unittest discover -s .\tests -p test_multi_resource_adapter.py
  & .\scripts\Prepare-Mealie-Stage4.ps1
  & .\scripts\Invoke-Mealie-Combined-Coverage.ps1 -Runs 2 -BaseSeed 20261831 -PrefixRounds 10 -PrefixBeforeConcurrency 8 -PreflightOnly
  & .\scripts\Invoke-Mealie-Combined-Coverage.ps1 -Runs 2 -BaseSeed 20261831 -PrefixRounds 10 -PrefixBeforeConcurrency 8

The generic verifier CLI is byte-for-byte unchanged in its default generated
plan and JS; extra families require --combined-campaign.

NO-OP: a read baseline, serial no-op/read and serial change/read precede
overlap. If the no-op is rejected, the epoch is skipped.

Two-field PUT: evaluate final state against BOTH observed serial orders,
since OpenAPI alone cannot promise PUTs of separate fields commute.

Cross-entity: two distinct readable item paths, each with verified prefix,
serial change/read/reset/read, two connections, and two adapter-owned final
GETs while leases are held.

The per-family audit is saved at <run>/coverage-matrix.json before freezing.
Ready, overlapping, verified-prefix and evaluated counts are separate.
An absent family is reported as incomplete rather than a passing test.
PUT/DELETE remains in the matrix but outside this four-family scope.

Offline verification: targeted Python tests, JS syntax, local two-resource
HTTP adapter, archived legacy replay, byte-identical old/default generation
on Vikunja, Immich and Mealie projected specs. Docker and Provengo are not
installed in this build environment; the live Mealie verdict needs the
Windows commands above.
