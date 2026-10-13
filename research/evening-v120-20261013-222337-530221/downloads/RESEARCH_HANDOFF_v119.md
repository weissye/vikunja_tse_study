# Vikunja study — detailed state and rationale

Prepared 2026-10-13 from the visible research history and local artifacts. This is a continuation dossier, not a claim of complete archival recovery. Tool inventories contain SHA256 of available originals. Runtime installers, private storage snapshots and the Windows work/home filesystems are not available in this package.

## 1. Goal and origin

The academic project, associated with "From Stories to Bugs" and FSE 2027, studies whether API contracts can drive behavioral models that expose consistency problems in complex system states. The important property is not merely many HTTP requests: it is independent behavior threads, entity dependencies, runtime event interleaving, independently justified oracles, and attributable evidence.

Mealie provided prior generator and Context experience. The researcher explicitly rejected discarding that infrastructure or replacing it with bespoke Python sequences. Mealie historically included a cross-household shopping-list observation where an unauthorized operation returned 500 yet owner readback showed a change; this is contextual history, not newly revalidated Vikunja evidence. Earlier Library/Garage/Pharmacy/NetBox research exists but is outside this handoff's artifact completeness claim.

Vikunja experimentation initially expanded narrow sequences and prefixes, then relation histories and shared-user pilots. Later architectural review revealed those pilots were not the unified model the researcher intended. Preserve earlier traces as evidence, but do not retroactively call them unrestricted unified Provengo interleavings.

## 2. Terminology that repeatedly caused confusion

- One unified model can live in three JS files. Provengo loads the files into one project; three files do not imply three runs.
- Stories are reusable bthread factories and behavior logic. Interfaces implement event-to-HTTP coupling. DAL is the data/Context layer, not another externally scheduled test executor.
- Multiple independent bthreads share Context and one SUT. Provengo selects one enabled event at synchronization points.
- Current interleaving is logical: application HTTP requests are executed in sequence. It is not simultaneous backend-request concurrency. The server can still have internal background operations.
- Session A and B are two logins of the same user/account. They have distinct readiness/token state. "Two accounts of one user" was clarified operationally to mean these two sessions.
- Multiple instances increase possible resources and bindings. Three books and three readers can represent nine parent tuples for loans; three instances per type does not always mean three children or all nine relationships automatically.
- Prefix length needs an explicit unit. Event-prefix count, HTTP-prefix count and successful-mutation count are different. Audit rounds do not imply distinct prefix states.
- "Generic" concerns the generator boundary: no research phase names or Vikunja-specific policy branching inside the emitter. Domain interpretation and externally validated mappings can exist upstream if labeled.

## 3. Architecture and why it was chosen

The frozen two-input design established in v071 is:

| Component | Input | Responsibility | Forbidden shortcut |
|---|---|---|---|
| Contract preprocessor | Raw Swagger/OpenAPI plus explicit scope/mappings | Normalization, entities, operations, dependency and schema catalogs, fixture recipes, unresolved issues | Silently invent missing mappings |
| Contract IR | Preprocessor result | Sole contract-derived emitter input with provenance | Runtime parsing raw contract in emitter |
| Research configuration | External experimental choices | Counts, budgets, actor profile, sampling, rendering options | Hard-coded "current research stage" |
| Generic emitter | IR plus research configuration | One project, reusable behavior templates, three JS files | Manual family-specific scenario selection disguised as automatic |
| Runtime configuration | Local deployment and research credentials | URL, seed, credentials, supervision limits | Embed machine paths into generic model logic |
| Native Provengo | Generated project | Login events, synchronization, runtime interleaving | Python choosing application event order |
| Transport/supervisor | Native-selected requests | HTTP relay, storage actuation, evidence, JVM supervision | Pretending Python logins are native logins |

Important files in the v103 source package: Build-Model-v103.py, source/input_pipeline.py, source/generic_emitter.py, source/native_sessions.py, source/effect_footprints.py, source/interaction_templates.py, source/interaction_stories.js, source/interaction_global_gate.js, source/interaction_control_interfaces.js, source/interaction_dal.js; runtime/native_session_gateway.py, runtime/interaction_gateway.py, runtime/bind_backend.py, runtime/checkpoint_backend.py; run_recovery_v103.py and Run-Model-v103.ps1. These names are inventoried from available source; later source review should inspect bodies.

The IR contains source metadata, selected_paths, normalized document, entities, fixture_recipes, negative_catalog, method_adapter, request_mappings, authentication, issues, unsupported_candidates, policy, sensitive_response_fields, acceptance_observations and value_domains. Entity records include detail/create/update routes, schemas, dependencies and path_dependencies, identity fields, writable-field candidates and provenance.

Historical saved-filter fixture mapping and method interpretation are upstream external knowledge. Do not claim the pipeline already derives all semantics automatically from OpenAPI. v071 proves an emitter boundary, not universal semantic inference.

## 4. Configuration separation

Research-config versions use model, instances, fixtures, render, budgets, actors, missing_information, recovery, sampling and interactions sections. Validation intentionally rejects unknown keys. In current short runs the unified model uses eight selected types, three instances per type, one user and two sessions. Earlier overnight models used ten instances and 1,300 planned negative checks; they were too expensive for routine iterations.

The supported types are ModelsProject, ModelsTask, ModelsLabel, ModelsSavedFilter, ModelsTeam, ModelsLinkSharing, ModelsProjectView and ModelsTaskComment. Typical declared dependencies are Project -> Task, Project -> ProjectView, Project -> LinkSharing and Task -> TaskComment. This is selected scope, not all system entities, all operation families or all many-to-many relationships.

Sampling selects eight checks out of 390 candidate runtime checks in the three-instance profile. There are 65 supported distinct rules in the accepted baseline analysis, while unsupported candidates are recorded separately. Sampling history affects selection: seed alone does not identify the exact sample. Archive the effective config and selected cases.

Current admission target is approximately 600 seconds plus up to 300 seconds for draining and cleanup, with further packaging overhead possible. This is not a guaranteed 15-minute bound under infrastructure failure. Per-run elapsed time must be measured.

The v117 add-on uses a third audit-config file with enabled/rounds. This is a temporary static wrapper and does NOT yet satisfy the intended consolidated two-input design. A future integration should place audit options in validated research-config rather than preserve an unacknowledged third generator input.

## 5. Actor/model expansion strategy

The agreed method iterates dimensions instead of abandoning one scope for unrelated hand scenarios:

1. One user, one session: widen valid lifecycles, selected entities and dependencies; introduce negative checks with source-backed expectations early.
2. Same user, two sessions: independent workflows on shared physical resources, with native login and per-session identification.
3. Two users: validate access prerequisites first, then shared-resource consistency; distinguish ownership/private-resource failures from semantic bugs.
4. Return to simpler actor configuration to widen additional entities/actions/dependencies.
5. Repeat shared-session/shared-user checks on the widened model.

Historical v050/v051 pilots covered two clients and two users, respectively, but they were narrow campaigns. The generic current unified model remains one user/two sessions. A creator-B label-attachment 403 in v055 was an unresolved access precondition, not a confirmed relation bug. Do not generalize it into a universal authorization oracle.

## 6. Version chronology and evidence strength

| Versions | Work | What must not be overstated |
|---|---|---|
| Early Stage5 | Fixed files-directory permissions; discovered live server v2.6.0 differs from newer contract | Newer contract is not frozen live contract |
| Earlier v009–v016 | Prefix 0/1/3/6, instances, negative types/constraints; separated rejection, documented status and state preservation | Early traces are not proof of current unified interleaving |
| Context/checkpoint v008–v010 | Focused finding, evidence preservation, cold recovery; directory metadata correction | Private checkpoints were not transferred through Git |
| v027–v029 | Catalog queue of 190 checks; 139 completed before interruption; per-check renewal later hit login 429 | Queue execution differs from current unified runtime |
| v030–v039 | Relation model and histories, labels/tasks, deletions and independent absence/pagination observations | Narrow sequences, not full-contract coverage |
| v047–v055 | Continuation repair, order variants, two sessions/users, moves and labels | Ownership prerequisites limited reverse-user cases |
| v057–v064 | Broad static catalog/models; v057 112 cases, 56 comparison pairs, 24,024 planned checks | Static planning numbers are not executed counts |
| v068–v069 | Unified one-project design, three JS, 24 lifecycle resources at three instances/type | Initial live model had mapping/recovery defects |
| v071 | Generic two-input emitter and historical JS compatibility | Compatibility is static, not live acceptance |
| v072–v073 | Saved-filter mappings/input corrections upstream | v072 creation returned 412; do not call it live accepted |
| v074–v082 | Unified recovery expanded dependent entities, views/comments, teams/filters, shares | Positive create/delete recovery remained incomplete |
| v087–v093 | Native A/B login, reusable templates, longer runs | v091 callback continuation issue; v093 overnight not completed in supplied evidence |
| v096 | Short sampled run, eight negatives | Parent route and log-reader cleanup failures |
| v099 | Route/capture repair | False project-state comparison caused by related child activity |
| v100 | Generic footprint isolation and baseline equality checks | Accepted selected scope only |
| v101 | Two completed additional frozen-v100 samples | Cumulative coverage is not whole-contract coverage |
| v102 | Static automatic interaction candidates | Permanent activation guard; no live execution |
| v103 | Six native interaction groups with cold reconciliation | Three partial live runs, each stopped on 500 |
| v112–v113 | Backup/readiness/offline integrity diagnostics | Proposed live causal comparison was NOT completed |
| v116–v118 | Metadata catalog, static readback extension, passive counter | No delivered live acceptance launcher |

This table combines direct artifact verification for recent evidence and visible-history descriptions for older phases. Do not invent absent version packages or assume every version increment corresponds to implementation.

## 7. Backward compatibility and failures in the model

v071 reported three v069 JS files byte-identical, 48 historical JS files across 16 projects compatible, standalone IR-only generation, unknown-config/missing-schema rejection and syntax checks. v072 targeted ModelsSavedFilter while preserving DAL and no-overlay v069 identity.

The v091 model had a Rhino continuation problem from a request invoked under an Array.forEach callback. v093 moved suspending work into normal loop bodies while preserving reusable registration factories. Template instantiation callbacks can be acceptable; suspending request callbacks must be reviewed against the frozen runtime.

v096 failed before a child negative request reached the SUT because a parent route placeholder remained unresolved. Post-failure native markers could misleadingly appear despite Test Fail Mode skipping actuation. v099 shared route expressions across positive/negative paths and switched away from pipe-reader thread shutdown to file-backed log capture with bounded polling. Any acceptance parser must exclude completion markers after the first native failure.

v099 project negative-state mismatch was a false oracle: a child view update changed the parent's observed state between preparation and checkpoint. v100 derived conservative resource+self/transitive-parent footprints, waited for overlapping admitted work to drain, and required preparation readback equality with the checkpoint before mutation. It did not ignore timestamps or adopt a changed baseline to pass.

## 8. Accepted v100/v101 results

Directly analyzed v100 review: 20/20 archived hashes matched; one JVM, exit zero; 24/24 resources, 48/48 workflows, 78/78 positive updates, 8/8 negative checks and verified storage/API recoveries, 60 relationship checks. Elapsed approximately 284.58 seconds. A and B each performed 39 positive updates. Native login count 34; Python pre-login count zero in accepted analysis. No confirmed semantic bug in that sample.

v101 used the frozen v100 package for sample/run seeds 2 and 3. Both completed the same aggregate planned counts, with durations 310.88 and 308.11 seconds. Cumulative baseline+two-sample coverage: 21 of 65 supported rule IDs, 24 distinct negative case IDs, 19 abstract checkpoint states. Abstract state novelty excluded physical IDs/timestamps; that abstraction was for novelty accounting, not weakening correctness comparisons.

The task empty-title check in a v101 sample returned 200 yet retained its prior nonempty title, with updated timestamp changed. This is distinguishable from the older label-empty-title persisted-state finding. Undocumented 412 responses and formal request-schema violations are separate from semantic consistency failures. Preserve before/after field values, status and exact rule-source pointers.

## 9. Interaction method: what v102/v103 actually did

Automatic selection used writable/observable field candidates from IR and selected six groups from 117 candidates, spreading profiles/resource types. Profiles: shared_read_same_field, shared_read_disjoint_fields and free_stale_disjoint_fields. Each group has two session workers, a coordinator and independent observations. Session-local cached bodies are important: an old body can overwrite another field's intervening update.

Examples of selected resource/field families: team name/description; label description/color; project same-field color; task title/color; view title; project description/color. These are schema-based candidate situations, not universal lost-update assertions.

Native groups reserve admission, drain existing business windows, acquire a group, capture business Context, save a cold storage checkpoint, invalidate/re-login sessions natively, open worker operations, collect readiness events without parent/session order dependence, observe through both sessions, restore, re-login and compare registered API prefix, storage and business Context.

IMPORTANT LIMITATION: during an active v103 group, unrelated business HTTP is globally paused. The two workers' order is selected by Provengo, but the group is isolated from outside writes because whole-storage rollback would otherwise erase them. Do not claim unrestricted surrounding business interleaving during the group. Broader interleaving requires a compatible recovery design, not simply deleting that gate.

Writes labeled interaction_write intentionally do not adopt speculative state into business Context. Independent probes retain observations; reconciliation returns to the saved baseline. Desired-field-not-preserved observations are OBSERVATION_ONLY unless endpoint semantics justify a stronger oracle. Same-field overwrite alone is often expected.

The method's potential contribution is automatic candidate construction and runtime-selected order plus attributable consistency observations under a budget. Demonstrating incremental bug-finding benefit requires controlled comparison; number of emitted bthreads alone is insufficient.

## 10. v103 live comparison

| Metric | Original seed 3 | Repeated seed 3 | Seed 4 |
|---|---:|---:|---:|
| Created resources /24 |21|19|15|
| Completed workflows /48 |13|20|6|
| Positive updates /78 |30|35|9|
| Negative checks /8 |3|3|3|
| Completed interaction groups /6 |5|5|5|
| Native login requests |34|34|34|
| Native processes |1|1|1|
| Native exit |1|1|1|

All three archives had 20/20 manifest hashes valid. Same eight negative selections were retained. Original native PID 27640, repeat PID 7184, alternate PID 29340. Each completed group had storage equality, API-prefix equality, valid protocol and unchanged business Context. These validated windows do not make the entire run accepted.

Server logs confirmed three database-is-locked 500 responses at ordinary create/update operations: a project view, a label update and a project sharing creation. There was substantial free disk space at follow-up (11+GB), and these specific server records report locking rather than disk exhaustion. The researcher regards these as bugs; defensible evidence labeling is "observed repeated server failure, root cause unresolved". Do not assert the interaction profiles caused them.

The original and repeated seed-3 runs had successful writes between the last negative recovery and failure: respectively 11 updates+4 creates and 14 updates+1 create. In seed4, an additional interaction checkpoint/restore occurred after the last negative recovery. Earlier reported 29.6-second interval from last negative recovery is NOT the interval from the last restore of any type.

Identical seed3 did not yield identical interleaving/completion counts. Timing-dependent events such as readiness/time budgets and initial live state can influence enabled-event sets. Effective model, sample, native seed, fixture settings, admission times and starting state must all be archived for interpretation.

## 11. Recovery and controls

Cold adapters cover named-volume Linux archives at home or diagnosed Windows bind paths at work. Work adapter copies DB/files while stopped and verifies hashes/tree metadata, including directory mtime. Snapshots include DB, WAL and SHM. Exact file equality is not proof of no runtime transaction/lock after restart.

v112 work backup at C:\work\temp\vikunja_tse_study\backup-controls-v112-20261013-184111-274 contains private copies locally; uploaded review contains controls JSON, server log and DB manifest. Missing files-manifest may be related to empty-file enumeration, but absence alone is not proof of an empty files directory. Do not delete live sidecar files based on this.

v113 worked on offline copies: full triplet, regenerated SHM, SQLite backup. All integrity_check results ok, 37 tables, 15,467 total rows, schema and per-table counts equal. Per-cell value equality and runtime lock behavior were NOT measured.

Three proposed live causal controls (no restart, restart only, cold restore) were never delivered/completed. No post-500 independent state readback was supplied for the failing positive operations. No minimal causal prefix was established. These remain open research questions, not work already done.

## 12. v116/v117/v118: honest current state

v116 is a static metadata compiler: 1,018 candidates (81 same-field, 889 disjoint-field, 48 parent-child observations), one blocked entity in the local test. Candidate counts were not admissible runtime scenario counts. It does not emit bthreads or bind instances. Its configuration hash is recorded, but research sampling/count behavior is not implemented there. Do not use it to claim expansion of live coverage.

v117 builds upon installed v103 generic_emitter and appends independent audit threads to Stories. At three rounds, 24 resource definitions x A/B =48 bthreads, 144 planned calls to existing strict verifiers. Native helper waitForDependencies is reused, then waitForResource, OperationAcquire, verification and OperationRelease. Interfaces/DAL remain baseline outputs. One project/three JS is retained. Syntax/full static build passed locally and at home. NOT live accepted.

These are READBACK audits, not additional update streams. The user explicitly wants multiple updates per shared-resource session workflow; v117 did not implement that. Repeated reads can see the same state. Its admission behavior and completion-marker placement still need native validation. Existing server failure handling and baseline completion counters do not establish all audits executed.

v118 passively checks unique logical-resource/session/round completion keys against the planned audit report. It rejects duplicates/unplanned markers and excludes after-failure markers. Native success marker is required for its marker-accounting status. It does not independently validate HTTP, recovery, oracle correctness, unhandled error types or log completeness. It is not a live launcher.

## 13. Deployment, hashes and portability

Work root: C:\work\temp\vikunja_tse_study.
Home root: D:\Yeshayahu\Temp\vikunja_tse_study.
SUT local base: http://127.0.0.1:3456/api/v1; container vikunja-research-sut; server v2.6.0; SQLite path /db/vikunja.db; storage mounts /db and /app/vikunja/files. Helper container: vikunja-increment8-2-files-init.

Frozen contract SHA256: 171e238314089ca9b1c5c6fa3f87cf7f80a7c2a55934d1d6c228b39d48b65843.
Frozen Provengo JAR SHA256: dda4be276ff517faa06b942d587cad2d342c66d83c9959f7eb3c6c77a8b2fc2b.
Runtime filename: Provengo-2026-01-10.uber.jar; reported runtime 0.7.5-SNAPSHOT.
Username SBT-tester. Runtime credentials were supplied locally; no password is needed for this documentation task. Never print tokens in reviews.

Work image revision was reported as a4218eeb8fb3ada95e14a2331731524c9120d5bd. Do not assume home image identity or exact installed Java/Python/Docker versions match work. Recent work log user-agent indicated Python3.12; prior different projects used other versions. Actual versions need local inspection.

NTFS disk pressure caused multiple infrastructure stops. Compression preserved content but was not always enough; reboot recovered substantial space on one occasion. Stopping containers alone does not shrink Docker's virtual disk. Do not prune storage or remove research evidence to satisfy a test budget without verified backup.

Windows PowerShell5.1 can treat native stderr warnings as terminating errors under Stop; Docker exit code must be inspected without interpreting an innocuous warning as failure. JSON BOM handling is explicit in newer scripts. Git longpaths and autocrlf=false are required for path/byte portability.

## 14. Git continuation

Repository: https://github.com/weissye/vikunja_tse_study.git.
Latest confirmed MAIN upload from user output:
commit 718a084bf559202193ee036738f081344b92022b;
snapshot research/day-v114-20261013-190219-538446;
2,742 copied/hash-verified files.

Earlier pins: 7964318afcb03455190c4d5a6b5ab39a6d1893b8 (day through082); 112218e7c4da9d7fb14137cb4715a8cecf94451b (night through093). The v114 snapshot excludes private snapshots, live DBs, Provengo products and JARs. Upload selection used today's timestamps and was not a proof that every historical project artifact was copied. v116/v117/v118 were created AFTER v114 and must not be assumed present at that pin.

Home v115 downloads isolate a sparse snapshot at a fixed commit, verify its SHA256 inventory and avoid altering the existing study. Original frozen private checkpoints were not transferred; recreate compatible ordinary fixtures rather than pretending a work checkpoint can be resumed from public evidence alone.

Reported home v117 project: D:\Yeshayahu\Temp\vikunja-consistency-v117-20261013-195819-023\project. It inherited effective input/runtime model URLs from work evidence during static generation; those are not live home bindings. No compatible home live launcher was provided.

## 15. Acceptance and evidence rules

Always report planned, selected, enabled, requested, actually executed HTTP, callback-confirmed, verified and recovered counts separately. Use per-resource/session/type/family breakdowns. Record blocking reasons: unavailable parents, unresolved path mapping, missing semantic rule, budget cutoff, failed actuation, infrastructure stop.

Evidence should carry contract hash, emitted JS hashes, effective configs, sampling history/selection, seed, runtime identity, timestamps, logical/physical resource mapping, native-selected events, actual HTTP input/status/output, before/after projection, oracle source, recovery equality and last safe point. A review manifest proves file integrity only, not correctness of assertions.

On negative cases distinguish rejected?, status documented?, state preserved?, observation available? A 412 mismatch is not the same as invalid input accepted or state changed despite rejection. On positive errors distinguish response failure from side effects; no safe state should be inferred merely from HTTP500.

Recovery must preserve pending model execution semantics and reconcile server plus Context. It cannot simply reset server while Context expects a successful write. Known window protection uses conservative affected-resource footprints and allows unrelated windows only when compatible with whole-storage recovery. Current unexpected positive failure continuation is unproven.

## 16. Method evaluation and next review tasks

Freeze a method/version before held-out-system evaluation. Define automatic candidate derivation, external researcher inputs, source-backed oracles, unsupported rules, sampling novelty, budget, control cases and measured contribution. Compare lifecycle-only vs added consistency workflows under matched runtime/seed/resource budgets; avoid attributing a discovered issue to interleaving without an adequate baseline.

Priorities for the receiving engineer: source-backed architectural audit; review v117 dependency/lock/readback admission; unify its audit settings into research-config; improve passive evidence accounting; review callback/session safety; distinguish undefined semantics from failed consistency; document all gaps before expanding entity/actor coverage.

Do not claim the assistant can prevent safety/UI blocks, guarantee no errors, or infer specific automated-block causes. Earlier pauses and unsupported promises are part of the project-management history, not a property of Provengo.

## 17. What this package does and does not contain

Included: this dossier, Claude prompt, version/file SHA256 inventory of available artifacts, extracted aggregate evidence summary, passive v118 analyzer and a package-integrity verifier. Evidence summaries were regenerated from available archives rather than guessed.

Not bundled: historical executable interaction/failure-search packages, full generated live models, raw request traces, credentials, DB/files backups, JAR, Docker images, Windows executables, Git's entire history or proof of access to every older ZIP. Original artifacts are indexed for provenance. This is a documentation/offline-analysis handoff, not a turnkey live experiment environment.
