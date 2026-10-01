# Verified generator 0.25.2 hotfix

This hotfix corrects three failures exposed by the first Vikunja runtime
acceptance attempt:

1. The generated Provengo `EventSet` predicate now always returns a Boolean.
2. An empty trace is reported as `INCONCLUSIVE` with an explicit run-evidence
   witness; it can no longer print a misleading `PASS`.
3. The Vikunja acceptance runner probes authenticated `/user` through the trace
   proxy before starting Provengo. A stale token or a token belonging to another
   database instance is rejected immediately with remediation instructions.

The observed HTTP 401 was an environment/authentication failure, not a SUT
finding and not verifier evidence. Regenerate the verifier output after applying
this hotfix, refresh the PostgreSQL test token in the same PowerShell process,
and rerun the acceptance script.
