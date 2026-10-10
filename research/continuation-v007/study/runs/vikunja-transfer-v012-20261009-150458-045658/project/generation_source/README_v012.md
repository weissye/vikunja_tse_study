# Vikunja Transfer v012

Version advance of accepted v011: default launch depth is 3, with one instance and seed 1. Selection, compiler, verifiers and sequential execution logic are unchanged apart from version identifiers and the default depth.

The composed run contains 40 research requests, 41 bthreads, and 5 task-parent readback checks across label, project, task and team. Login and read-only preflight requests are additional. The known label method adapter remains scoped to the unchanged source contract hash and version.

Run Run-Vikunja-Stage5-v012.ps1 with StudyRoot, BaseUrl and Username. Contract is included; password is hidden. Exported review_v012.zip contains whitelisted sanitized evidence. Created resources remain; no reset or automatic cleanup occurs.

Frozen Method Spec v001 and the raw contract are unchanged. v011 is preserved. This is positive single-owner acceptance, not multi-account testing, negative testing, true concurrency or a complete evaluation campaign. Live v012 acceptance is pending.

Generate-Package-v012.py defaults to depth 3. Test-v012.py keeps explicit depth-0 controls and covers all four allowed depths. Check-Runner-Fixture-v012.py exercises the actual default runner against a synthetic server, never real Vikunja.
