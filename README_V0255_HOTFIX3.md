# Vikunja generator v0.25.5 Hotfix 3

Hotfix 3 replaces the generated concurrency controller's global all-ready
barrier with readiness-driven admission.

In the 2026-09-23 acceptance run, 58 of 60 executable overlays emitted
`SBT:ConcurrencyReady`; two task-comment overlays had no concrete resource.
The old controller waited for all 60 and consequently emitted no permits and
recorded no epochs.

The corrected controller:

1. accepts any generated Ready event;
2. extracts that oracle's generated index;
3. blocks other Ready events while the selected oracle is active;
4. emits its Permit and waits for its payload-bearing Closed event;
5. repeats for the next pending Ready event.

An oracle whose prerequisite resource is absent remains unexercised and no
longer prevents ready oracles from running. The change is generic and uses no
Vikunja-specific knowledge.

## Install

From `C:\work\temp\vikunja_tse_study`:

```powershell
Expand-Archive `
  ".\openapi-verified-generator-v0.25.5-hotfix3-delta.zip" `
  -DestinationPath "." `
  -Force
```

## Validate and run

Keep the same PowerShell process in which the Vikunja token was prepared:

```powershell
python ".\generator_baseline\tests\unit\test_v0255_campaign_continuation.py"

& ".\scripts\Invoke-Vikunja-V0255-FinalAcceptance.ps1"
```

If the token is rejected, run this first in the same PowerShell process:

```powershell
& ".\scripts\Prepare-Vikunja-Increment8_2.ps1"
```
