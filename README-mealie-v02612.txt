Mealie Stage4 generic HTTP observation/serial control delta, generator 0.26.12.

Overlay onto the existing v0.26.11 project. Includes only changed files:
  generator_baseline/openapi_to_sbt/__init__.py
  generator_baseline/openapi_to_sbt/verification_cli.py
  generator_baseline/openapi_to_sbt/render/verification_js.py
  generator_baseline/openapi_to_sbt/trace_proxy.py
  generator_baseline/openapi_to_sbt/concurrency_adapter.py
  scripts/run_mealie_stage4.py
  tests/test_http_epoch_lease.py

The new generic CLI flags are --post-join-observation and
--require-serial-controls. The Mealie Stage4 runner enables both explicitly.
Without either flag, generated verifier JS remains byte-identical to v0.26.11.

The proxy serializes same-resource unrelated writes through the adapter's
post-join GET. The evaluator remains unchanged and still reports INCONCLUSIVE
when controls, observation, or other prerequisites fail. Invalid serial
controls skip the epoch and emit SBT:ConcurrencySkipped; they cannot be
counted as an evaluated PASS or VIOLATED concurrency witness.

Local test without Docker:
  python -m unittest discover -s .\tests -p test_http_epoch_lease.py

Windows live preflight (no API traffic):
  & .\scripts\Invoke-Mealie-Stage4.ps1 -Runs 1 -BaseSeed 20261819 `
    -MaxLength 25000 -InstancesPerEntity 2 -InstancesPerAction 1 `
    -MaxFieldPairs 3 -MaxConcurrencyWidth 2 `
    -StoryProfile long-interleaving -PrefixRounds 8 `
    -PrefixBeforeConcurrency 8 -PreflightOnly -FreezeEvidence

Windows live experiment, each seed in a separate clean Docker project:
  & .\scripts\Invoke-Mealie-Stage4-CleanDecision.ps1 -BaseSeed 20261819 -Trials 2

The clean-decision script is included in the immediately preceding overlay
mealie_stage4_clean_decision_v02611_tree_overlay.zip. It restores the
previous Stage4 server and keeps its volumes untouched. Supply the resulting
two evidence ZIPs for final analysis. No live Windows/Docker execution was
possible in the artifact-building environment.
