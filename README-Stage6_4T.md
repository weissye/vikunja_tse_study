# Stage 6.4T — contract-derived concurrency control inputs

Extract at the root of `vikunja_tse_study`. This incremental overlay assumes the previous Stage 6.4S tree overlay is already applied. It includes only two modified Python files and this README. No new runner or installation method.

## Changes

- `generator_baseline/openapi_to_sbt/verification.py`: when a string field's *own OpenAPI description* explicitly says `email address` but lacks `format: email`, derive that format for generated concurrency values; also propagate documented schema examples to the verifier plan. No application name or field-name special case.
- `generator_baseline/openapi_to_sbt/render/verification_js.py`: generate two different candidate values with the same `#` and hex digits shape as an OpenAPI example such as `#00aabb`. Existing email-format generator already yields two valid email-shaped strings.

The generated Gitea JS now contains `sbt-a@example.invalid`, `sbt-b@example.invalid`, `#00aabb`, and `#00aabc` instead of invalid generic strings for those specific controls. This is a local generation check; acceptance by the live server is unverified. The five inconclusive oracles may not all become PASS: color responses normalize their format, the repository merge setting has a server-side prerequisite, and the milestone date is canonicalized. These need observation-based treatment; this package does not reclassify them. It also does not change the 18 unavailable-dependent long stories or the documented 200 vs returned 201 for `repoCreateTag`.

## Run in the existing PowerShell session (project root)

```powershell
Expand-Archive -LiteralPath .\gitea-stage6-4t-tree-overlay.zip -DestinationPath . -Force
& .\scripts\Prepare-Gitea-Stage1.ps1 -ResetState
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 `
    -Runs 1 `
    -BaseSeed 20261004 `
    -MaxLength 120000 `
    -InstancesPerEntity 2 `
    -InstancesPerAction 1
```

Run preparation and generation in the same PowerShell window so that the new token is available. Reset clears isolated Gitea test state, not prior evidence ZIPs.
