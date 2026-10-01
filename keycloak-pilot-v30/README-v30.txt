Keycloak OpenAPI pilot v30: one selected trace and no SUT execution yet.

Extract this ZIP into C:\work\temp\vikunja_tse_study. It creates only the
keycloak-pilot-v30 directory; the old 15 and generator_baseline are untouched.
The isolated generator_v30 reads the pinned keycloak-stage2-openapi.json.
The observed request rules are keyed by OpenAPI method and path, include
provenance, and are bound to the exact SHA-256 of the OpenAPI document.

The bundled compressed sample passed the static audit: 400 complete workers,
25 entity families, two logical processes, 224 race dispatches and verifiers,
and no duplicate active organization/identity-provider associations.
This is not a SUT result. Run Run-Keycloak-Pilot-v30.ps1 once to actuate it.
The runner checks that its fixture realms do not already exist, records HTTP
intervals and cleanup status, and deletes the expanded 551 MB scenario after
all generated realms are removed. It preserves evidence and refuses reruns.

Generate-Keycloak-Pilot-v30.ps1 is for generating another single trace in a
fresh copy of this folder after moving the bundled sample and digest away.
It is not required to run the bundled pilot.

The relay preserves upstream success codes. It still supplies identifiers from
Location headers when Provengo receives an empty 201 body and refreshes a
client immediately before a serial description PUT. Other request rewrites
are reported as a failed acceptance gate. No Keycloak endpoint is contacted
during sample generation or static auditing.
