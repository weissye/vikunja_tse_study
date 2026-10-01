v56.1 OFFLINE EVIDENCE AND COVERAGE PATCH

Extract this ZIP into C:\work\temp\vikunja_tse_study.
Adds two files under keycloak-pilot-v56. Does not overwrite existing code.
Requires Python 3.9+ and existing completed pilot-01 evidence.

Run:
& 'C:\work\temp\vikunja_tse_study\keycloak-pilot-v56\Collect-Keycloak-Pilot-v56_1-Evidence.ps1'

No server requests. Does not rerun tests, alter assertions, remove files or change original verdicts.
Expected pair count comes from static-audit-v56.json relay_dispatches.
Checks measured pair intervals separately from campaign completion.
Flags selected and CrudVerified events after fail mode as untrusted execution/pass evidence.
Preserves all HTTP metadata records (not just the last 25) using a strict field allowlist.
Includes source SHA256 fingerprints and an archive member manifest.
Existing output paths are never overwritten. Keep original run files locally; hashes are not backups.

LIMITATIONS
Cannot recover missing response bodies or semantic observations.
Does not add observation recording to live tests. Observed fields remain unavailable.
Does not infer server-internal scheduling from HTTP overlap.
Does not count a missing pair completion record as proof that no dispatch happened.
A complete pair count is not proof that semantic checks completed.
All-pairs interval validation needs the complete original http-intervals.jsonl.
