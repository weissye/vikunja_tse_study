# v103 live acceptance of native shared-resource interactions

Current launcher: Run-Model-v103.ps1. This is a fresh run; frozen v100 remains unchanged.
No live run has been performed in the build environment; native acceptance is pending.

One unified project, one native JVM, one business Context, three generated JS files.
One user / two native-login sessions. Six automatically selected interaction groups
from the same 117-candidate IR-derived catalog as v102: twelve session workers, six
native coordinators and six independent two-session observers. Existing 24 resources,
48 control workflows, 78 control updates and eight sampled negatives stay in the model.
Additional planned group operations: twelve cached reads, twelve exploratory writes,
twelve independent probes. Native logins occur only in Provengo; no Python login.

Generic generation remains IR + research config. App-name-specific cases are not
added. Legacy external mappings inherited from v100 are still external. The optional
interaction extension disabled reproduces v100's three JS files byte-for-byte.

Protocol:
1. Ready group reserves admission; existing positive/negative operations and creation
   verification drain. New business operation admission waits.
2. Native coordinator acquires the group, captures business Context projection, selects
   an actuation checkpoint event, and triggers native A/B reauthentication after save.
3. Provengo interleaves the two workers. Each has a group+session-specific snapshot and
   request body. Shared profiles wait for BOTH read events regardless of arrival order;
   free profiles allow a write before the other read.
4. Independent observer reads through both sessions after both writes complete.
5. Native restore event actuates storage restore; native logins refresh both sessions.
6. Outcome event independently checks whole registered API prefix against the checkpoint,
   strict storage equality and protocol completeness. Native coordinator also checks
   the entire business Context projection is unchanged before releasing admission.

Cold whole-store restoration requires a GLOBAL business HTTP window during each group.
Unrelated bthreads can wait/advance non-HTTP events, but unrelated business HTTP does
not run inside that window. Worker HTTP ordering remains Provengo's. This acceptance
therefore does not claim unrestricted interaction with outside writers, nor simultaneous
HTTP execution. Targeted rollback is a future extension.

Observed exploratory writes are NOT adopted as expected Context state. Their original
requests/responses/probes and optional observed storage snapshot are retained, then
baseline restored. Interaction.Active shadow entities track group admission and are
removed on release. No arbitrary overwrite of expected state hides a failure.

Oracles: OBSERVATION_ONLY. A stale full replacement that erases another worker's field
is reported as desired_field_not_preserved, not a confirmed semantic bug. Protocol,
transport, native synchronization and restoration checks are acceptance assertions;
application lost-update guarantees still require an authoritative semantic rule.

Native/positive group failure stops acceptance. If possible, cleanup restores the
original group storage; it does not claim API verification after the native JVM is
stopped and does not continue. Original group HTTP evidence and abort status survive.
No automatic mutation replay is performed.

Default budget: 600s new-admission cutoff + 300s drain; closure/packaging may add time.
Interaction reserves also obey the cutoff; already admitted groups may finish.
V103_SAMPLE_COMPLETED requires all selected groups, business controls, sampled negatives
and restoration obligations complete. Stable time-budget partials are explicit.
Negative sampling history retains its v096 identity for continuity.

Review files: interaction-ledger.json, native INTERACTION_RESTORE_CHECK and
INTERACTION_GROUP_COMPLETE markers, gateway journal, existing negative recovery ledger,
result_v103.json and manifest. Private snapshots/raw native output are excluded.
Full acceptance checks actual group IDs, two reads/writes/probes, native-only logins,
shared-read baseline where required, storage/API restore and business Context equality.

Local checks passed: actual emitted coordinator readiness (B-first and duplicates),
free/shared barrier distinction, whole-store admission/drain gate, fake backend/token
invalidation with stale replacement observation and verified restore, business Context
drift guard, JS syntax, disabled-extension byte identity and v093 base regressions.
These are not substitutes for frozen Rhino/JAR and live Docker acceptance.
