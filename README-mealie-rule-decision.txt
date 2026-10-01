Focused Mealie rule decision: isolated controls through overlapping PUTs

Prerequisite: the existing Mealie Stage4 environment, generator v0.26.16,
and the prior v0.26.16b focused decision overlay are installed.
This archive contains only changed files, at their project-relative paths.

From C:\work\temp\vikunja_tse_study in Windows PowerShell:

Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\mealie_rule_exclusive_controls_v02616c_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_mealie_rule_decision.py
python -m unittest discover -s .\tests -p test_mealie_exclusive_lease.py
& .\scripts\Invoke-Mealie-Rule-Decision.ps1 -BaseSeed 20261843 -PreflightOnly
& .\scripts\Invoke-Mealie-Rule-Decision.ps1 -BaseSeed 20261843 -Trials 2

The two live trials run against separate, fresh Docker volumes. The generated
OpenAPI oracle remains the sole selected concurrency oracle. Once its long
same-resource prefix is verified, an HTTP resource lease excludes unrelated
writes while both serial orders, both resets, the overlapping PUTs, and the
final read take place. The lease releases even if a generated control returns
early. Its acquire and release events are included in the frozen trace.
The focused decision report requires both lease events and excludes outside
writes before reporting REPRODUCED_IN_FRESH_INSTANCE or SERIALIZABLE_IN_FRESH_INSTANCE.
An inconclusive first trial does not prevent the second trial from running.
Each trial's full run directory and frozen review ZIP remain on disk; completed
trials' isolated Docker volumes are removed when the trial finishes.

No claim about the SUT is justified by a preflight or by the unit tests alone.
Inspect MEALIE_RULE_CAMPAIGN and the per-trial target-decision.json after live
execution. Two reproductions in fresh instances provide stronger confirmation;
MIXED_OR_INCONCLUSIVE is not a confirmed new bug.
