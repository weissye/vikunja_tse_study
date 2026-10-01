Keycloak: 15 separate live runs selected globally from 150 symbolic schedules.

The 15 complete Provengo JSON traces are in scenarios/run-01..15.json.zst.
This is lossless zstd compression; each JSON is restored and SHA-256 verified
as runs/run-NN/scenario.json before its separate Provengo invocation.
To expand all 15 JSON files in advance: python expand_15.py

Prerequisites: Java, Python 3, and: python -m pip install zstandard
Start Keycloak on http://127.0.0.1:9928. From PowerShell run:
  .\Run-Keycloak-15.ps1 -ProvengoJar "C:\path\Provengo-2026-01-10.uber.jar"
The script prompts for the Keycloak admin password. Each run has a separate
Provengo process, full JSON, HTTP interval log, and result directory.
Fixture realms must be absent before each run. Successful runs clean and verify
only fixture realms absent at preflight. Failed runs stop and preserve evidence.
The sampled schedules do not themselves prove live HTTP overlap or SUT outcomes.
