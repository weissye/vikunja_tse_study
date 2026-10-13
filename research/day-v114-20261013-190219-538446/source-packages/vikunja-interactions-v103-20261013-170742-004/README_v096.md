# v096: short sampled unified model

Based on v093; one JVM, one Context, Stories/Interfaces/DAL. Login remains native.
Default: 8 entity types, 3 instances each (24 resources), 48 shared-session workflows,
78 supported positive field updates, exactly 8 selected negative instances out of 390.
These are planned counts; actual completion is reported separately. Provengo selects
interleavings. There is no externally prescribed operation schedule or prefix.

Research input: input-source/research-config-v096.json. Sampling seed, negative limit,
instances and soft/drain time budgets belong here. Runtime URL/password belong in
run-config.local.json. Generic emitter reads only IR + research input; preprocessing
still retains the explicitly documented historical external saved-filter mapping.

Sampling: deterministic seed, resource-type strata, preference for unseen case IDs,
then distinct rules and sessions. Full candidate/selected/omitted inventory is emitted.
Only five of the eight entity types have supported writable negative-rule candidates.
Absent/unsupported rules are not claimed covered. This is a heuristic sample, not
uniform sampling or statistical confidence in correctness.

Verified recovery case IDs accumulate atomically in StudyRoot/sampling-history-v096.json.
Only completed recoveries count, including original findings whose recovery succeeded.
History is tied to frozen contract SHA. Static generation does not advance history.
No continuation of a previous JVM/private checkpoint is attempted; each run is fresh.

At 600 seconds from native model initialization, a native blocker rejects NEW create
requests and operation/negative acquisitions. Existing readback/recovery/relogin/release
may drain. Cutoff never selects/reorders normal events. 900 seconds is the supervisory
limit; unsafe or unfinished drain is NOT_ACCEPTED, never a successful partial run.
Packaging/shutdown may add time. Exact 15-minute completion is not guaranteed.

Accepted statuses: V096_SAMPLE_COMPLETED (all selected work complete) or
V096_TIME_BUDGET_STABLE_PARTIAL (budget reached, native SUCCESS, no active operations,
pending create/Context verification/write locks, and all executed negatives recovered).
Partial coverage is explicit and does not claim the remaining bthreads ran. Early
unexplained termination, native failure, positive verifier failure or unsafe recovery
remains NOT_ACCEPTED. Checkpoint backend and positive-failure limitations are unchanged.

Run on work Windows:
& .\Run-Model-v096.ps1 -StudyRoot 'C:\work\temp\vikunja_tse_study'
& .\Run-Model-v096.ps1 -StudyRoot 'C:\work\temp\vikunja_tse_study' -RunLive
Use -SampleSeed 2 for a later sample. Work server must already be available at frozen
localhost endpoint; both bind and named-volume backends remain supported.

Local checks: sampling exact counts/determinism/seed variation/history rotation,
actual emitted JS syntax, admission gate with mocked clock and in-flight drain,
unchanged v093 baseline 80/160/1300 template and native-session protocol regressions.
Frozen Rhino/JAR and live work Docker acceptance are not available here and remain
unverified. Do not report this delivery as live accepted.
