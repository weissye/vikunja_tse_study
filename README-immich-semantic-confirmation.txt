Immich v3.2.0: tag-upsert and notification semantic controls

Copy this ZIP into C:\work\temp\vikunja_tse_study (Expand-Archive -Force).
The two new files belong in scripts/. Existing pinned
scripts/run_immich_album_serial.py, model/immich/immich-v3.2.0-openapi.json,
and the isolated deployment are required. No generator file is replaced.

From PowerShell in the project root:
  & .\scripts\Prepare-Immich-Album-Pilot.ps1
  & .\scripts\Invoke-Immich-Semantic-Confirmation.ps1 -Trials 3 -PrefixRounds 4 -FreezeEvidence

Tag case: create two uniquely named tags, verify both by ID, execute only GET
requests and verify again, then PUT /tags with a third new tag; check both
original IDs with GET /tags/{id} and in GET /tags. This isolates the successful
upsertTags call observed between createTag and the failed reads in seed
20261013. The pinned OpenAPI describes upsertTags as "Create or update multiple
tags in a single request." No resource is intentionally deleted.

Notification case: create an admin notification addressed to the currently
authenticated user, then check GET /notifications/{id} and
GET /notifications?id={id}, both immediately and after a short GET-only prefix.
The request rechecks /users/me. Evidence includes selected response fields and
sanitized error messages, but does not publish authentication secrets.

Verdict SEMANTIC_CANDIDATE means an externally visible contradiction under the
recorded serial prerequisites. Inspect the evidence ZIP and pin down the API
semantics before claiming a confirmed product defect; a PASS or INCONCLUSIVE
must not be reported as a bug. These targeted controls are not Provengo and
do not measure automatic exploration or concurrency.
