# Scripts in this overlay

- `run_mealie_stage4.py`: adds `--coverage-target-oracle-id`, restricts generated concurrency to that exact OpenAPI-derived oracle, freezes the new target report, and fails on missing coverage. Existing `--target-oracle-id` remains the rule-specific semantic bug classifier.
- `mealie_coverage_target.py`: validates runtime readiness, measured overlap, causally verified prefix, and a `PASS` or `VIOLATED` result; it never labels a new bug automatically.
- `Invoke-Mealie-Coverage-Closure.ps1`: runs one of three explicit coverage profiles using fresh Docker projects and retains incomplete data for inspection.

The existing `coverage_matrix.py` and verifier/evaluator are required and remain in the installed Stage 4 project. This delta does not change them.
