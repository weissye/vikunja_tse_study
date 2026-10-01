# Stage 6.2 candidate triage (20261002)

This incremental ZIP adds only `scripts/triage_gitea_stage6.py`. The included `analysis/triage.json` was produced offline from the two preserved 071553/071556 evidence archives. It contains no Gitea token.

Observed: 30 long stories generated, 4 completed all rounds (19 selected steps), 26 skipped, 21 truly overlapping epochs. The 24 dependency skips are grouped by direct scoped resource event in `analysis/triage.json`. Two repoEdit stories stopped on HTTP 422: the live response describes cross-field constraints on update styles. No concurrency oracle was violated (14 PASS, 7 INCONCLUSIVE).

Candidate status: the documented GET /repos/{owner}/{repo}/teams returned 405 with the explicit server message that the repository is not owned by an organization. This supports a status-code/documentation gap, not a confirmed product bug. POST merge-upstream returned 500 with request `{ "ff_only": false }` lacking `branch`; a 500 for that incomplete request remains a candidate for handling of invalid input, not a valid-fork bug confirmation.

From the project root on Windows, after extracting this ZIP, run:

```powershell
if (-not $env:GITEA_API_TOKEN) { throw 'GITEA_API_TOKEN is not set' }
python .\scripts\triage_gitea_stage6.py `
  --stage3 .\evidence\gitea-stage3-live-acceptance-20260924_071556_782-review.zip `
  --stage6 .\evidence\gitea-stage6-generated-20260924_071553_316-review.zip `
  --evidence .\evidence --replay
```

The replay creates one isolated repository under the authenticated user, checks the personal repository `/teams` endpoint, sends the preserved `merge-upstream` body and a one-field control with its observed default branch, then deletes only that repository. It writes a new `evidence/gitea-stage6-triage-*-review.zip` and prints its SHA256. Upload the resulting ZIP for verdict classification. The script does not modify the generic OpenAPI generator.

A positive 500 under these controls still requires a verified *fork* setup for a valid-operation product bug claim; the existing `Invoke-Gitea-Stage5_2.ps1` constructs that separate case. Keep contract deviations, invalid-input handling, and valid-fork findings distinct.
