# Vikunja Transfer v011

Version advance of accepted v010. No selection, verifier or execution logic changes. Default launch depth is now 1, with one instance and seed 1. The composed run has 24 research requests, 25 bthreads, and 3 task-parent readback checks. Authentication and read-only preflight requests are additional.

v010 remains unchanged. Frozen Method Spec v001, source contract and contract hash are unchanged. Label method adapter remains hash/version scoped.

Run Run-Vikunja-Stage5-v011.ps1 with StudyRoot, BaseUrl and Username as before. The default contract is included. Password is hidden; only sanitized whitelisted evidence is exported to review_v011.zip. No database reset or cleanup is performed.

This is one owner, one instance, sequential HTTP, positive create/update/readback acceptance. Live v011 acceptance is pending. Accounts, negative tests, true concurrency and evaluation campaign dispatch remain deferred.

Generate-Package-v011.py defaults to depth 1. The internal prepare() helper retains its explicit depth argument and minimal depth 0 for unit controls. Previously written control tests remain depth 0 unless explicitly configured; validation distinguishes them from depth 1 runner acceptance.
