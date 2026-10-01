Keycloak OpenAPI pilot v48. One freshly sampled trace; no SUT execution performed during package build.

Extract keycloak-pilot-v48 into C:\work\temp\vikunja_tse_study.
Run Check-Keycloak-Mapper-Families-v48.ps1 first. It creates one temporary realm,
checks that config.claim.name survives a PUT under client-template and client
protocol mappers, and that config.user.attribute survives a PUT under a client
mapper. It removes the realm. If it fails, do not run the full pilot.
Then run Run-Keycloak-Pilot-v48.ps1 with the installed Provengo.
After the pilot, run Collect-Keycloak-Pilot-v48-Evidence.ps1 -StudyRoot C:\work\temp\vikunja_tse_study.

The pinned OpenAPI SHA-256 is in manifest-v48.json. The generic generator is in
generator_v48 and the evidence-backed operation rules are in
keycloak-stage2-observed-rules-v48.json. The v44 direct probe showed that
client-scope mapper PUT 204 did not retain consentText, consentRequired, or
name, but retained config.claim.name. The v45 pilot first failed at a client
mapper consentText readback. This version selects config.claim.name for the
three mapper update families; both client and client-scope mapper races use
disjoint config.claim.name and config.user.attribute map entries.

The new sampled trace passed static checks: 400 complete workers, two logical
processes, 224 race dispatches, 16 distinct execution-config parents, and no
association duplicates. This does not assert a successful live run. The
expanded scenario is removed after all fixture realms are confirmed absent.
