Keycloak maintenance v38

Extract this archive into C:\work\temp\vikunja_tse_study.
Run the cleanup before collecting evidence if the disk is full.

The cleanup deletes only expanded scenario.json files in known Keycloak
preflight or pilot run folders when a report in that exact folder records
successful removal (HTTP 204) of all 16 generated realms. It preserves
logs, reports, original compact samples, generator, OpenAPI, and ZIP files.
Use -Preview to list eligible files without deleting them.

The collector creates one small ZIP from v37 pilot summaries and sanitized
HTTP diagnostics. It excludes raw logs, tokens, and expanded scenarios.
