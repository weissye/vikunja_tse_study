# v087 — one user, two sessions, one unified Context model

This package extends v082. Live acceptance has NOT been performed here: no frozen JAR or Windows Docker SUT is available in the build environment.

## Scope and design

Eight resource types, three instances each: projects, tasks, labels, project views, task comments, teams, saved filters, project link shares. One native Provengo process and exactly three generated JS files. Baseline: 24 lifecycle bthreads and 18 negative-test bthreads; added: six independent shared-session workflows and one observation-window blocker. Context verifier templates remain active.

Both logins authenticate the same SBT-tester user. Sessions A and B have independent authentication state and independent login/renewal calls. A server may issue identical JWT text for two logins in the same second; different JWT bytes are not the definition of separate logical sessions. The transport selects the session credential from X-SBT-Session metadata and records that session; it does not schedule model events. Credentials stay in memory and are redacted from exported evidence.

For EACH of three tasks, two separate bthreads wait for baseline revision 2. A updates title; B updates description. Their order is selected by Provengo. There is no imposed A-before-B order. Each update uses the current expected state and is independently verified by Context, then read by both sessions. Writable fields are selected in external research configuration and validated against IR. Updates on different tasks and unrelated lifecycle threads remain available for interleaving.

A resource-local observation window covers each shared update's preparation, write and verification. This deliberately prevents two read-modify-write preparations from holding stale snapshots simultaneously. It does NOT test lost updates from overlapping preparations or simultaneous HTTP. Negative windows and child writes touching a protected parent cannot overlap a shared window. The gateway processes requests serially as in v082.

The 18 baseline negative checks remain. Rules with local index 0 use A, index 1 use B, so both sessions contribute negative tests. Findings are never converted into PASS. Storage restoration and authenticated whole registered-prefix API observations are verified through BOTH sessions before continuation. Pending bthreads and the JVM remain alive. Positive operation failures remain fatal; recovery is still limited to negative update windows.

## Inputs and generic code

The emitter reads only contract-ir.json and research-config.json. A generic session_templates.py handles explicit entity/session/field workflow configuration; no Vikunja path or known-bug exception is embedded there. The input builder retains the v082 frozen contract, adapters, mappings and fixtures. Configuration adds users=1, sessions_per_user=2 and two explicit workflows for ModelsTask. No original contract is read by the emitter.

The added workflows do not claim automatic semantic-policy discovery: title/description selection is external experimental configuration. Existing negative rules are derived from the contract catalogue. Multi-user accounts and arbitrary session counts are explicitly unsupported in this delivery.

## Planned acceptance

- 24 resources created; 21 positive updates (15 baseline + six shared).
- 18 complete negative checks and 18 verified recoveries.
- Six SHARED_SESSION_CHECK markers: all task/session combinations, each with independent readers A and B.
- Successful actual HTTP updates from both session labels; same server user ID confirmed.
- Native exit 0 and Test Result SUCCESS; one native process.
- Relationship audit considers all lifecycle and added independent reads; every observed parent relation must match.

Run the static launcher, then RunLive. Supply the password once. The live runner supports work bind mounts and home named volumes and renews each session after restart when needed. Snapshots are private and excluded from the review ZIP. Cold restoration applies to the local SUT's WHOLE database/files; do not edit its state externally during acceptance.

Home command:

    .\Run-Recovery-v087.ps1 -StudyRoot 'D:\Yeshayahu\Temp\vikunja_tse_study' -Seed 3
    .\Run-Recovery-v087.ps1 -StudyRoot 'D:\Yeshayahu\Temp\vikunja_tse_study' -Seed 3 -RunLive

## Local validation

Test-Sessions-v087.py: real generated JS syntax, six bthreads, 24 resources, 18 negatives, single-session byte compatibility with v082 at the same URL, session-specific credential selection, two authenticated views, two renewals after simulated expiration.
Test-Session-Gate-v087.js: executes the actual emitted blocker; other session/negative/child writes blocked within a window, owning and unrelated writes allowed, stale release ignored.
Test-Recovery-v087.py: prior protocol regression scenarios, rollback/finding preservation, unsafe rollback blocked, no ambiguous mutation replay, nested callback and verifier tests. Historical source-hash assertions have been superseded because two generic modules intentionally changed.

These are local tests with injected transport/storage, not a native live acceptance. Historical v082 files and reference fixtures are retained for comparison; use the v087 launchers/tests above. Full model/state-space coverage has not been achieved.
