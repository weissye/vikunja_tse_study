# Vikunja Transfer v014

Version advance of accepted v013: default launch is two instances, prefix depth 6 and seed 1. Selection, compiler, verifiers and sequential execution logic are unchanged apart from version identifiers and the instance default.

The composed run contains 128 research requests, 129 bthreads and 16 task-parent readback checks. It creates two labels, two projects, two tasks and two teams under one existing research owner. Each task binds to its own indexed project; captures and scalar values are instance-specific. Authentication and read-only preflight requests are additional.

Run Run-Vikunja-Stage5-v014.ps1 with StudyRoot, BaseUrl and Username. The captured contract is included. The known label PUT-to-POST adapter remains hash/version scoped. Password input is hidden; review_v014.zip exports sanitized whitelisted evidence. Created resources remain; no reset or automatic cleanup occurs.

Two instances are not two users, two sessions or true concurrency: REST dispatch is sequential and dependency-constrained. Shared-resource operations, negative tests and multi-account testing remain deferred. Frozen Method Spec v001 and raw contract are unchanged; v013 is preserved.

Generate-Package-v014.py defaults to two instances and depth 6. Test-v014.py retains explicit minimal controls and checks both instance counts and all allowed depths. Check-Runner-Fixture-v014.py exercises the full default runner against a synthetic server, not real Vikunja. Live v014 acceptance is pending.
