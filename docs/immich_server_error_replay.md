# Immich cross-method evidence replay

Apply the ZIP from the repository root with `Expand-Archive -DestinationPath . -Force`.
The package adds only an evaluator field and an offline replay command. It does
not call Immich or change the Provengo schedule.

```powershell
python -m unittest discover -s .\tests -p test_empirical_update_delete.py
$archives = @(
  '.\evidence\research-fit-immich-generated-20260926_191223_743-review.zip',
  '.\evidence\research-fit-immich-generated-20260926_191733_041-review.zip',
  '.\evidence\research-fit-immich-generated-20260926_191755_771-review.zip'
)
python .\scripts\reevaluate_server_error_candidates.py @archives `
  --output .\evidence\immich-cross-method-server-error-reevaluation.json
```

Expected: `updateAlbumInfo` has a `SERVER_ERROR_CANDIDATE` in all three
archives; `updateSharedLink` has one in the final archive. The concurrent
state verdict for those candidates remains `INCONCLUSIVE` because a HTTP 500
does not by itself establish a final-state semantic violation.

The candidate requires both serial orders on distinct verified resources,
actual overlap on the same resource, successful deletion, a later read
matching the verified absence response, and HTTP 5xx on the overlapping update.
Existing `run_status` and `counts` retain their meanings. Full backward
compatibility across the other research systems requires running their suites
in the complete Windows repository; the local package has only Immich and
Gitea specs plus the available Python test suite.
