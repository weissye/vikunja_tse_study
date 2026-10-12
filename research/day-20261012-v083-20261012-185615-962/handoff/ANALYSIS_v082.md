# v082 live evidence analysis — 2026-10-12

The uploaded review manifest verified 16/16 files. Status: V082_RECOVERY_ACCEPTANCE_COMPLETED_WITH_FINDINGS. Run seed 3, fixture seed 1. One native launch, PID 884, exit 0. No test-fail-mode switch; no inconclusive checks.

Planned versus completed: 24 creations, 15 positive updates, 39 independent lifecycle reads, 18 selected negative checks, 18 verified recoveries and 18 relationship observations. All expected coverage completed. Every recovery ledger entry reports strict supported storage equality and matching before/restored API views.

Findings retained: three labels accepted/persisted empty title; three tasks accepted empty input while retaining their title and changing updated (semantic classification remains open). Nine array-type inputs rejected with 400. Three empty team names rejected with 412 and unchanged state; 412 is an undocumented response code, separate from correct rejection.

Restart journal: 42 START_COMMAND_SUCCEEDED records, all attempt 1. No actual port conflict occurred in this acceptance. Thus the run validates normal operation with the patched runtime, but does NOT empirically demonstrate bounded retry recovery from the previous Docker Desktop port race. Local helper/backend tests cover transient conflict, exhaustion, unrelated error, already-running branch and no HTTP write replay.

Seed-1 v080, seed-2 v081 and seed-3 v082 are complete evidence sets. The earlier failed seed-3 v081 remains partial evidence and must not be merged with v082 as one continued trace. Fresh seed-3 v082 created new resources; it did not revive the earlier JVM or historical checkpoint.

Eight selected types are covered by their emitted workflows. This is not exhaustive OpenAPI coverage or schedule exploration. Comments, saved filters and link shares have creation/readback only. Effective cross-user permissions, deletion, extended histories and additional relationships remain outside this accepted scope.
