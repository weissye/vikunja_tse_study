Mealie follow-up: generator 0.26.15 reverse serial control.

Observed preserved seed 20261823: POST succeeded and three meal plans were GET-readable. Both serial controls ran: PUT 200->GET 200->DELETE 200->GET 404, and DELETE 200->GET 404->PUT 404->GET 404. Old generated verifier incorrectly demanded GET 200 after the rejected reverse PUT, skipping concurrency. v0.26.15 requires absence after the rejected PUT. Successful resurrection is conservatively excluded from this oracle. No previous evidence is reclassified as a concurrency result.

Install on top of 0.26.14 and from C:\work\temp\vikunja_tse_study run:
  python -m unittest discover -s .\tests -p test_empirical_put_delete_reverse_control.py
  python -m unittest discover -s .\tests -p test_mealie_next_stages.py
  & .\scripts\Invoke-Mealie-NextStages.ps1 -Branch mealplan-put-delete -BaseSeed 20261824 -PreflightOnly
  & .\scripts\Invoke-Mealie-NextStages.ps1 -Branch mealplan-put-delete -BaseSeed 20261824

If live run is incomplete, retain the frozen evidence and inspect the new control statuses; do not count a bug until an epoch overlaps and the evaluator confirms it.
