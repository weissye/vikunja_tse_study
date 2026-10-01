Keycloak OpenAPI pilot v42. One sampled trace, no SUT execution yet.

Extract into C:\work\temp\vikunja_tse_study. The v42 folder is isolated.
Use the installed Provengo with Run-Keycloak-Pilot-v42.ps1.

The unchanged OpenAPI SHA-256 and evidence-backed operation overlay are pinned.
The generic generator binds one execution config to each execution parent.
For realm and client role PUT races, it excludes the path identity (name)
and uses description and attributes, validated in the direct v41 SUT probe.
The race oracle compares JSON objects recursively without depending on key order.
A new sample is statically audited for 400 complete workers, 224 race pairs,
16 distinct execution config parents, and 32 role attribute races.
After a run the expanded scenario is removed if all generated realms are absent,
even on a test failure; the compact sample and evidence remain.

After the pilot, use Collect-Keycloak-Pilot-v42-Evidence.ps1 from this folder
to create a small sanitized evidence ZIP. Do not upload raw provengo.log.
