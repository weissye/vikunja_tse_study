Keycloak OpenAPI pilot v56: independent sample with generator seed 2.
Pinned OpenAPI and evidence-backed rules are included. The generic generator includes
the D1 own-ID correction and distinct race A value from v50. No SUT execution has
been performed for this sample. Static audit: 400 workers, 224 races, 16 distinct
execution configuration parents. Scenario expansion is transient and is removed
after verified realm cleanup. Semantic oracle remains strict. A first semantic
failure is classified SEMANTIC_CANDIDATE, preserving the original Provengo exit
and incomplete-race counts. Use the independent targeted controls before claiming
a confirmed bug.

Extract into C:\work\temp\vikunja_tse_study, then run
keycloak-pilot-v56\Run-Keycloak-Pilot-v56.ps1. Afterwards run
keycloak-pilot-v56\Collect-Keycloak-Pilot-v56-Evidence.ps1 -StudyRoot
C:\work\temp\vikunja_tse_study. If semantic candidate, run
keycloak-pilot-v56\Extract-Keycloak-Race-v56.ps1 -StudyRoot
C:\work\temp\vikunja_tse_study.
