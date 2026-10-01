Mealie focused rules PUT decision overlay (after v0.26.16a)

Files in this ZIP replace matching relative paths under C:\work\temp\vikunja_tse_study.
Run after the integrated campaign and v0.26.16a fix are installed.
The CLI adds --include-concurrency-oracle to select one exact OpenAPI-derived oracle.
Selected oracle: concurrency::disjoint-put::update_one_api_households_mealplans_rules__item_id__put
The runner asserts the generated fields are day and entryType and that exactly one
ready oracle remains. All other contract/state verifiers stay enabled.

Example PowerShell:
cd C:\work\temp\vikunja_tse_study
python -m unittest discover -s .\tests -p test_mealie_rule_decision.py
& .\scripts\Invoke-Mealie-Rule-Decision.ps1 -BaseSeed 20261841 -PreflightOnly
& .\scripts\Invoke-Mealie-Rule-Decision.ps1 -BaseSeed 20261841 -Trials 2

Each live trial starts a fresh Docker project and volumes; successful trial
volumes are removed; incomplete trial volumes are preserved for diagnosis.
Each trial freezes a review ZIP with target-decision.json (projected evidence).
The full HTTP trace stays in the local run directory. Classification requires
an item created and read in this trial, a verified 8-round prefix, both serial
controls with observed reset, and real HTTP overlap. The evaluator supplies the
exact two-serial-order comparison; absent witnesses remain INCONCLUSIVE.
This targeted trial says nothing about cross-entity coverage.

Validation here: seven Python unit tests passed, OpenAPI generated one ready
disjoint PUT oracle with day/entryType, and node --check passed. Docker and
PowerShell execution need the user's Windows Mealie environment.
