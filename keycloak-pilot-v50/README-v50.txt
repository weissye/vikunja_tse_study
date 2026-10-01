Keycloak OpenAPI pilot v50. One newly sampled trace; no SUT execution during package build.

Extract keycloak-pilot-v50 into C:\work\temp\vikunja_tse_study.
Run Run-Keycloak-Pilot-v50.ps1 with the installed Provengo. The runner checks
pinned OpenAPI, rules, generated story, and compressed trace before use.
After the pilot, run Collect-Keycloak-Pilot-v50-Evidence.ps1 -StudyRoot
C:\work\temp\vikunja_tse_study. The expanded trace is removed after verified
fixture cleanup. The collector excludes access tokens and large trace data.

The generic generator is in generator_v50. The OpenAPI snapshot and the
evidence-backed request rules are included, with SHA-256 values in
manifest-v50.json. The v48 pilot stopped at RACE_OUTCOME_UNCLASSIFIED after
36 overlapping pairs. Inspection showed a false generator dependency:
client-templates borrowed a client-scope ID because their own item suffix
was named client-scope-id in the OpenAPI. A client-template writer could then
modify the client-scope resource during a race. D1 inference now treats the
single suffix of an entity item path as that entity's own ID, and the template
create response supplies its own ID. Race A also changes its field relative
to the preceding serial update; previously that PUT could be a no-op.

The race oracle is unchanged. This package contains one newly sampled trace
and must pass its static audit before it can be run. A live PASS is not
asserted here. v48 mapper field corrections and measured HTTP relay behavior
remain in the evidence-backed rules and generated project.
