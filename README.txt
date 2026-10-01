Mealie Stage4 clean decision overlay (compatible with generator 0.26.11).

Copy this ZIP over the existing C:\work\temp\vikunja_tse_study tree.
No generator or verifier code is replaced.

Replay the previous frozen result without a server:
  python .\scripts\analyze_mealie_decision.py .\evidence\research-fit-mealie-stage4-20260927_094858_162-review.zip --output .\evidence\mealie-20261816-decision.json

Run two independent trials, each with a new isolated Docker Compose project:
  & .\scripts\Invoke-Mealie-Stage4-CleanDecision.ps1 -BaseSeed 20261817 -Trials 2

The script temporarily stops the original fse-mealie-stage4 containers to free
127.0.0.1:9927, and restarts them in finally. It never removes the original
project's volumes. Each successful temporary project's volumes are removed
after the run is frozen; incomplete projects retain their volumes for diagnosis.
It does not reset the original Docker volumes or change the pinned OpenAPI.

For each seed, upload the newly printed Stage4 evidence ZIP and its
clean-decision.json (under the corresponding run directory).

Classification: PASS/VIOLATED come from the existing evaluator only.
INCONCLUSIVE stays INCONCLUSIVE if serial controls fail or an intervening write
occurs. This report uses redacted HTTP metadata and does not infer hidden values.
