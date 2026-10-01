# Stage 6.4T verifier renderer repair

This ZIP is a small project-tree overlay on top of the already installed 6.4S + 6.4T. Its only source file is `generator_baseline/openapi_to_sbt/render/verification_js.py`. Stage 6.4T accidentally replaced the Stage 6 renderer with a two-argument baseline while the current Stage 6 verification CLI calls it with four arguments. The restored long-interleaving producer bridge emits Ready events only after a successful operation with bound identity, and always publishes a completion outcome. It retains Stage 6.4T's OpenAPI-derived email and example-shaped color values.

Local verification: generated JS parsed with `node --check`; the renderer accepted four positional arguments, and its output for the prior frozen 6.4S manifest had 1875 lines versus 1875 in the preserved good generated verifier JS. The difference blocks contain only JSON key order and URL parameter substitution order; no live Gitea call was possible in the local workspace. Do not count the failed 11:21 invocation as a test run: verifier generation stopped before an HTTP test.

## Run, same PowerShell window used for `Prepare-Gitea-Stage1.ps1 -ResetState`

```powershell
Expand-Archive -LiteralPath .\gitea-stage6-4t-renderer-hotfix.zip -DestinationPath . -Force
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 `
    -Runs 1 `
    -BaseSeed 20261004 `
    -MaxLength 120000 `
    -InstancesPerEntity 2 `
    -InstancesPerAction 1
```

Since the failed attempt made no generated API request, no additional state reset is needed in the same PowerShell session. If the original session has ended and its token was lost, first run the existing `Prepare-Gitea-Stage1.ps1 -ResetState` in the new session.

## Where this fits in Stage 6

1. Repair generation and collect a successful Stage 6.4T evidence ZIP.
2. Stage 6.5, dependency recovery: report each skipped long story with the exact producer HTTP response and identity binding; repair contract-derived inputs only. Separate admin permissions, webhook config and runner registration from automatic OpenAPI coverage.
3. Stage 6.6, semantic search: add a targeted same-resource label update/delete linearizability oracle, then dependent repository-setting updates and branch lifecycle pairs. Require successful sequential controls, true overlap, post-join independent GET, and sequence-local evaluation. Keep targeted triage results separate from generic Stage 6 coverage until the generator can produce them automatically.
