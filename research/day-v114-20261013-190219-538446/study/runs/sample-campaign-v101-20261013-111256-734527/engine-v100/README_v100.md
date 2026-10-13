# v100 generic observation isolation correction

Current entrypoint Run-Model-v100.ps1. Based on v099; same selected eight resource
families, default three instances each (24), 48 independent session workflows,
78 supported positive field updates and eight sampled negatives out of 390.
One native JVM, one Context, three JS files, native A/B login of the same user.
Provengo selects interleavings. No external operation ordering is added.

Generic emitter still reads only contract IR + research-config-v100.json.
Effect footprints are derived from selected IR dependencies and bound parent tuples.
A resource's conservative footprint includes itself and transitive parents. Provenance
and every logical instance mapping are emitted in project/effect-footprints.json.
This is potential influence inferred from dependencies, not a proven side-effect
specification for every operation. Unmodelled dynamic links are outside this closure.
Historical external saved-filter input mapping remains explicitly external.

A negative acquisition waits for intersecting positive operation windows, unfinished
writes and unverified creations. Once acquired, related new operations and writes are
blocked until negative verification/recovery/release. Disjoint dependency closures
remain available to Provengo. Positive-positive interleaving is not globally locked
by this new gate. Conservative parent closure can also block siblings under a shared
parent during a negative window; this restriction is reported, not exhaustive search.
Global cold-restore checkpoint actuation still pauses unrelated business HTTP during
storage rollback, as required by the existing recovery implementation.

Gateway asserts exact equality between the negative preparation API response and
its checkpoint API baseline before saving the snapshot or sending the negative write.
Drift is MODEL_ISOLATION failure, never a SUT finding. No fields/timestamps/arrays were
removed from comparison, and the earlier baseline is never silently replaced.

Defaults unchanged: 600s admission cutoff + up to 300s drain, eight negative instances,
minimum 1 GB for the short profile. Larger profiles retain 2 GB minimum. Cleanup and
packaging may add time; unsafe completion is NOT_ACCEPTED. Same sampling history file
sampling-history-v096.json is preserved; previously verified checks receive rotation
preference. This is a fresh native run, not continuation of v099's stopped JVM.

Native log capture, parent route fixes and pre-failure-only evidence counters from
v099 are preserved. Original v099 evidence remains separate. V099_ISOLATION_ANALYSIS.json
records equality of checkpoint, rejected-operation after-state and restored state.

Local tests passed: actual emitted effect gate (child drain, parent lock, unrelated
work, creation drain); multi-parent/transitive footprints; stale-baseline guard;
sampling/determinism/history; budget gate; actual route and file log capture; original
v093 shared-template/context/login/recovery regression. Native/live frozen-JAR
acceptance is still pending on the user's Windows study server.

Run:
& .\Run-Model-v100.ps1 -StudyRoot 'C:\work\temp\vikunja_tse_study' -SampleSeed 1
& .\Run-Model-v100.ps1 -StudyRoot 'C:\work\temp\vikunja_tse_study' -SampleSeed 1 -RunLive

Current research parameters: input-source/research-config-v100.json.
Runtime localhost endpoint/password: run-config.local.json. No Docker state or
previous evidence directories are overwritten or deleted.
