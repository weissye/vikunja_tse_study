# v088: native login, shared sessions, automatic supported-field workflows

## Evidence boundary

LOCAL STATIC/INJECTED-TRANSPORT TESTS PASS. Native Provengo 0.7.5-SNAPSHOT and live Docker acceptance have not been run in this build environment. No new bug or complete state-space coverage is claimed.

This is NOT yet a wholly contract-only model: the inherited saved-filter creation mapping is external, verified historical information. The frozen Swagger lacks its complete request schema. That fact is preserved in contract IR provenance and REQUIREMENTS_AUDIT_v088.json; it must not be relabelled automatic contract discovery.

## Generated model

One project, one Context, three JS: stories.vikunja.js, interfaces.vikunja.js, dal.js. Eight selected resource types, ten shared resources each = 80. Dependent instances are derived from parent tuples; multi-parent dependencies use the existing Cartesian planner and readiness queries, independent of parent arrival order.

80 creation lifecycles execute once, not once per session. For every resource the SAME contract-derived work template is instantiated for session A and session B: 160 workflow bthreads. Both operate on the shared Context identity/RTV locator. Currently 14 supported plain-string update fields across five types produce 280 positive updates across both sessions and ten instances. Other types have independently actuated per-session reads, not fabricated update operations. No manual ModelsTask/title-vs-description session assignment remains.

Two native login bthreads create token-A/token-B at model runtime. The login operation is discovered upstream from the full frozen contract by its documented JSON username/password request and token response. Work waits for Session.Ready in Context. Every selected REST event carries its session ID and resolves that session's RTV token. Python starts the JVM and forwards native-selected requests; it never initiates login or token renewal independently. Two logins may return identical token bytes; session identity is model metadata, not token inequality.

The local runtime configuration includes the password supplied by the user for this isolated test environment. The generated JS references child-process environment variables, not the literal password. The password and tokens are redacted from logs/review evidence. The local configuration is excluded from the review and has a gitignore rule. This DELIVERY ZIP contains the requested local configuration: do not upload this ZIP or its local credential file unchanged to Git. The earlier v083 uploader only selected packages through v082; it does not upload this ZIP.

## Sources and configuration

- input-source/contract.json: frozen contract.
- input-source/scope-v088.json: selected contract subset and historical fixture/mapping provenance.
- input-source/research-config-v088.json: counts, budgets, two sessions, automatic workflow policy. Editable without changing generator code.
- run-config.local.json: server/credentials/runtime seed/login pacing/timeout.
- Build-Model-v088.py: preprocessing/builds IR and config. Authentication discovery reads the full contract here.
- source/generic_emitter.py: reads ONLY the generated contract-ir.json and research-config.json.
- source/native_sessions.py: generic field classification and template/session instantiation; no Vikunja paths/entity branches.
- example/: complete generated JS and inputs for inspection.

Field support is intentionally explicit: writable and observable plain strings without enum/format/pattern are selected. Identity/temporal/server metadata candidates are excluded by a documented lexical heuristic. This heuristic is inference, not a declaration from the contract. Unsupported shapes and domain constraints are recorded. 69 applicable negative rules become 1,380 session/resource cases; 135 other catalogue rules are explicitly blocked in negative_catalog.json. This is broad supported coverage, not all OpenAPI operations or all possible negatives.

## Interleaving and verification

Provengo chooses events across all bthreads. Each session workflow releases its operation window after EACH individual update and verification, so A-field-1, B-field-1, A-field-2, B-field-2 is possible. There is no A-before-B plan, whole-workflow SharedAcquire, or external event scheduler. Disjoint resources remain available.

A per-operation window protects read-modify-write preparation and the independent current-revision readback. It prevents the HARNESS from producing stale shared RTV bodies. This implementation does not explore overlapping preparation windows or simultaneous HTTP. The expected Context state changes from actual selected positive write events. Verifiers compare current input-derived expectations, not a frozen workflow-start snapshot. Extra reads by each session are separately selected events.

Negative windows block conflicting logical resource mutations. Whole-database checkpoint restoration additionally pauses all unrelated business HTTP from checkpoint through verified recovery; this is necessary because a whole-database rollback would otherwise erase unrelated writes. The pause and its limits must be disclosed in research claims. Context bookkeeping/login events still proceed.

## Recovery and native authentication

1. Negative bthread acquires resource window and reads preparation.
2. Model selects checkpoint transport event; gateway observes both sessions' API state and cold-saves storage.
3. Model invalidates Session.Ready. Both native login bthreads log in again.
4. Original negative write and original post-write observation are recorded; finding state is privately saved when needed; storage is restored.
5. Model invalidates readiness again. Both native bthreads log in again.
6. Native negative verifier requests outcome. Gateway validates both authenticated user IDs and equality of the whole registered-resource API projection with the checkpoint; original finding and recovery evidence remain separate.
7. Model releases window and continues in the SAME JVM with pending bthreads intact.

No external login, write retry, artificial PASS, parent-ID replacement, or JVM restart is used to continue. Ambiguous writes/unsafe restore/positive native failures stop. Positive-operation failure recovery and arbitrary-account authorization testing are NOT implemented.

## Acceptance and cost

Planned counts: 80 creations, 160 completed session workflows, 280 positive updates, 1,380 negative results and verified recoveries. Both writer session IDs must appear in real HTTP evidence. Independent relationship observations are audited from actual reads. Actual/planned counts are written to result_v088.json; partial native failure does not claim acceptance.

Native login forwarding is paced by the runtime setting login_interval_seconds (default 7). Every login is still requested by a model event; pacing does not choose bthread order. Server HTTP 429 may still stop native acceptance: automatic model-level authentication backoff is not yet implemented. With four logins per negative window, login pacing alone can add approximately 10.7 hours for 1,380 cases. Full execution is a long campaign, not a quick smoke test. timeout_seconds defaults to 86,400. Private snapshots and logs need substantial disk space; initial 2 GB free check is a minimum, not a full campaign capacity guarantee.

## Commands

Run-Model-v088.ps1 (without RunLive) builds the static model and review. Add -RunLive for new local acceptance. It verifies the frozen JAR, live contract and storage layout. No prompt is needed after filling run-config.local.json. Default home root is D:\Yeshayahu\Temp\vikunja_tse_study.

Test-Native-Sessions-v088.py validates generated shape, identical field sets per session, native authentication gateway stages, no hidden renewal, strict recovery, 80/160/1,380 counts and JS syntax. Test-Native-Gate-v088.js executes the ACTUAL emitted readiness/recovery blocker. Test-Callback-v088.js verifies preservation of original negative findings and strict recovery gating. Node is required only for development tests, not the run launcher.

Historical v082/v087 files are retained as references; their golden hash tests do not describe v088. Use v088 entrypoints. All native API/Context behavior on the frozen JAR remains subject to live acceptance.
