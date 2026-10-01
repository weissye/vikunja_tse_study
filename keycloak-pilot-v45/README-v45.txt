Keycloak OpenAPI pilot v45. One freshly sampled trace. No SUT execution performed in this package build.

Extract keycloak-pilot-v45 into C:\work\temp\vikunja_tse_study.
First run Check-Keycloak-Mapper-v45.ps1 to confirm both config map keys are retained.
Only after that succeeds, run Run-Keycloak-Pilot-v45.ps1 with the installed Provengo. Do not rerun an existing pilot-01 directory.
After the pilot, run Collect-Keycloak-Pilot-v45-Evidence.ps1 -StudyRoot C:\work\temp\vikunja_tse_study.

The OpenAPI SHA-256 is unchanged and pinned in manifest-v45.json. The generic generator
is included in generator_v45, and the per-operation observed rules are in
keycloak-stage2-observed-rules-v45.json. The v44 direct probe showed that the
client-scope protocol mapper PUT returns 204 while ignoring consentText,
consentRequired, and name. It retained a change to config.claim.name. The
v45 generator uses the OpenAPI config object map, writes claim.name during
serial update, and prepares two disjoint map-key writes (claim.name and
user.attribute) for a PUT race. The second key is part of the create fixture;
its changed value has not been directly tested on this SUT before this pilot.

The new sampled trace passed static checks: 400 complete workers, two logical
processes, 224 race dispatches, 16 distinct execution-config parents, and
no association duplicates. This does not assert a successful live run.
The expanded scenario is removed after all fixture realms are confirmed absent.
