Keycloak OpenAPI pilot v35. One corrected trace, no SUT execution yet.
Extract into C:\work\temp\vikunja_tse_study. It creates only keycloak-pilot-v35.
Run Run-Keycloak-Pilot-v35.ps1 once using installed Provengo.
The exact source OpenAPI and evidence backed operation rules are SHA-256 pinned.
The generator appends a unique __sbt_event URL marker to each symbolic REST event.
The relay strips the marker before forwarding requests to the SUT, preserving
contract paths and query parameters. Race POST markers are internal to the relay.
This prevents Provengo from merging different callbacks for equal REST URLs.
The static gate checks that runtime values have producer callbacks selected
before use and that no equal URL carries a different callback. The current
sample passed with 400 complete workers and 224 race dispatches.
The ~563 MB expanded scenario is deleted after all generated realms are cleaned.
This is a new single sample because the v34 sample lacks causal producers.
Prior pilot folders and evidence are untouched.
