# Gitea Stage 6 valid-fork control

Replaces only `scripts/triage_gitea_stage6.py` from the earlier targeted triage ZIP. The generic OpenAPI generator and six-system compatibility baseline remain untouched.

The prior replay reproduced 500 both with and without `branch`, but the repository had `fork=false`. This follow-up creates an isolated upstream and organization-owned fork, verifies `fork=true` and `parent.full_name`, advances the upstream, reads both branch heads, sends `merge-upstream` with an observed `branch` and `ff_only=false`, reads the fork head, and attempts to delete only its own resources. It records setup, response and cleanup statuses in a review ZIP under `evidence/` without storing the API token.

From the Windows study root, after extraction:

```powershell
if (-not $env:GITEA_API_TOKEN) { throw 'GITEA_API_TOKEN is not set' }
python .\scripts\triage_gitea_stage6.py `
  --stage3 .\evidence\gitea-stage3-live-acceptance-20260924_071556_782-review.zip `
  --stage6 .\evidence\gitea-stage6-generated-20260924_071553_316-review.zip `
  --evidence .\evidence --valid-fork
```

Interpretation: A 500 after `preconditions_verified=true` is a stronger valid-operation defect candidate. A 200 must be checked against `final_head_matches_upstream`; 400/404/409/422 indicate a rejection to triage, not automatically a product bug. If the control cannot create or independently verify the fork, it reports `INCONCLUSIVE` and does not issue the merge request. Upload the resulting `evidence/gitea-stage6-triage-*-review.zip` for classification.
