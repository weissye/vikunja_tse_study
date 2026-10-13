# v082 — Bounded restart recovery for seed 3

The v081 seed-2 run completed. Seed 3 stopped during restoration after Docker could not bind localhost port 3456. Fourteen negative checks/recoveries completed; the next write had been observed but its restoration/verification did not finish. The container was later started manually and the API reported v2.6.0. That availability alone does not prove the interrupted run's original prefix or restore a terminated JVM.

v082 adds a runtime-only bounded restart helper. Every storage adapter's existing Docker start call uses it. It retries ONLY when stderr explicitly reports ports unavailable, bind failure and the recognized Windows/Linux address-in-use wording. Maximum six starts, with waits of 2,4,8,10,10 seconds. Other errors and timeouts propagate immediately. No process is killed to free a port, no container/volume is deleted, and no HTTP write is replayed. An inspected already-running container must still pass existing API/authentication/state verification; running status alone is never acceptance.

Each start attempt/result/wait is recorded in docker-start-journal.jsonl. The previous strict storage verification, readiness check, authentication probe/renewal and complete observed prefix equality remain. Unsafe or exhausted recovery still blocks continuation.

## Fresh acceptance, not resume

Run a NEW seed-3 acceptance of the exact v080/v081 model. It creates new research resources and current-prefix checkpoints, leaving v081 evidence/private snapshots untouched. It does not resume from the interrupted 15th case, recreate its JVM stack, or claim equality to that historical prefix. No old snapshot is restored by this launcher.

Eight selected types, three instances each, one project/three JS files. Expected 24 creations, 15 updates, 39 lifecycle GETs, 18 negative checks/recoveries and 18 relationship observations. Fixture seed remains 1; Provengo run seed is 3. Original findings stay enabled. Longer histories/relationship mutation workflows, multiple users and positive create/delete failure recovery remain outside this version.

Generic generator source is unchanged. Three generated JS files remain byte-identical to v081 at the same proxy URL. Only infrastructure startup handling changes. The emitter still reads two inputs; the runtime retry policy is independent of domain generation.

## Run

Existing local server v2.6.0 must be running. The frozen JAR defaults to <StudyRoot>/Provengo-2026-01-10.uber.jar. Use the same isolated Docker storage with no other clients during rollback, and enough disk for snapshots (minimum 2 GB).

```powershell
& .\Run-Recovery-v082.ps1 -StudyRoot 'C:\work\temp\vikunja_tse_study' -Seed 3 -RunLive
```

Home: D:\Yeshayahu\Temp\vikunja_tse_study. Omit -RunLive for generation only. Every invocation requests the password once and prints a distinct review_v082.zip path. Private DB/files snapshots remain local; shared-link capabilities are redacted in exported evidence. Logs are sealed before manifests.

## Validation

Tests exercise the actual helper and actual backend integration using a fake Docker runner: transient conflict succeeds; persistent conflict exhausts exactly six attempts; unrelated failure is not retried; an already-running branch still requires subsequent checks; command set is only start/inspect. Existing generator, gate, nested routes, actual verifiers, redaction, storage protocol and log-closure tests pass. Explicit JS identity to v081 passed 3/3.

These local tests do not reproduce the Docker Desktop port race and are not native/live acceptance. Native/live seed-3 acceptance must be verified on the user's host. Full acceptance requires all expected coverage and verified continuation after a retained finding. If a restart conflict is retried, its journal documents it; if no conflict occurs, the run validates normal startup only, not empirical recovery from the race.
