# Vikunja generator v0.25.5 Hotfix 4

Hotfix 4 follows the successful Hotfix 3 run, which recorded 58 Ready,
Permit, Closed, and overlapping epoch histories.

Changes:

- HTTP DELETE cleanup is blocked while generated concurrency admission is
  active, preventing base-story cleanup from invalidating live epochs.
- PUT baseline fields are excluded when identifying the changing concurrent
  intent.
- Generated concurrency traffic is evaluated once in the concurrency layer
  instead of being duplicated as hundreds of contract witnesses.
- Failed sequential controls classify their matching concurrent epoch as
  INCONCLUSIVE rather than as a SUT concurrency violation.
- Final acceptance compares runtime Ready, Permit, Closed, and recorded epoch
  counts. Static manifest plans and distinct oracle families are reported
  separately.

The changes are generic and use only generated OpenAPI structure and runtime
events. They contain no Vikunja-specific business assumptions.

## Install and run

```powershell
Expand-Archive `
  ".\openapi-verified-generator-v0.25.5-hotfix4-delta.zip" `
  -DestinationPath "." `
  -Force

& ".\scripts\Prepare-Vikunja-Increment8_2.ps1"
& ".\scripts\Invoke-Vikunja-V0255-FinalAcceptance.ps1"
```
