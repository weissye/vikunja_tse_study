# Vikunja Increment 8.1 — direct concurrency confirmation

Increment 8.1 is a minimizing confirmation experiment. It does not replace
Increment 8 and it does not use Provengo, the research proxy, or the Increment
8 adapter. Its purpose is to decide whether the anomaly found by Increment 8
is produced by Vikunja itself in the pinned Docker/SQLite configuration.

## Files and target locations

Copy this delta over the existing project root
`C:\work\temp\vikunja_tse_study`:

| File in ZIP | Target |
|---|---|
| `scripts/confirm_vikunja_increment8_1.py` | `C:\work\temp\vikunja_tse_study\scripts\` |
| `scripts/evaluate_vikunja_increment8_1.py` | `C:\work\temp\vikunja_tse_study\scripts\` |
| `scripts/Invoke-Vikunja-Increment8_1.ps1` | `C:\work\temp\vikunja_tse_study\scripts\` |
| `tests/test_increment8_1_direct_confirmation.py` | `C:\work\temp\vikunja_tse_study\tests\` |

## Experimental structure

Each trial creates one fresh task and performs:

1. A sequential title PATCH followed by a description PATCH.
2. An independent GET proving both legal operations work sequentially.
3. A reset to unique baseline values and another independent GET.
4. Two pre-connected workers, each with its own TCP/HTTP connection.
5. Barrier release of disjoint title and description PATCH requests.
6. Join, a short quiescence interval, and a GET over a third connection.
7. Independent evaluation of status codes, interval overlap, connection
   independence, and final state.

Every request records a generated request ID. The raw evidence records logical
connection IDs, socket endpoints, worker and operation IDs, monotonic start/end
times, release skew, overlap duration, request/response bodies, resource ID,
and the independent observation.

The bearer token is read only from `VIKUNJA_API_TOKEN`; it is not persisted.

## Validate locally

From the project root:

```powershell
Set-Location "C:\work\temp\vikunja_tse_study"
python ".\tests\test_increment8_1_direct_confirmation.py"
```

Expected result: `Ran 7 tests ... OK`.

## Run the real confirmation

Keep the same token already used by the earlier increments in the current
PowerShell process, then run:

```powershell
Set-Location "C:\work\temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Invoke-Vikunja-Increment8_1.ps1"

& ".\scripts\Invoke-Vikunja-Increment8_1.ps1" `
  -Trials 20 `
  -QuiescenceMs 100 `
  -Container "vikunja-research-sut"
```

The script creates both:

- `runs\increment8_1-direct-confirmation-<timestamp>` — complete raw run;
- `evidence\increment8_1-direct-confirmation-<timestamp>.zip` — upload package.

An evaluator exit code of `2` is intentional: it means a direct defect witness
was reproduced. Exit `0` means all complete trials passed. Exit `3` means the
run is inconclusive or the harness failed.

## Result categories

| Category | Meaning |
|---|---|
| `LOST_UPDATE` | Both PATCH requests returned 200, overlap was proven, but one disjoint update was absent after join. |
| `SERVER_FAILURE` | A legal PATCH returned 5xx under proven overlap. |
| `CONTRACT_REJECTION` | A legal PATCH returned another non-200 response under proven overlap. |
| `PASS` | Both PATCH requests returned 200 and both fields were visible after join. |
| `INCONCLUSIVE` | Sequential control, reset, transport, overlap, connection independence, or observation evidence was insufficient. |

Scope the claim to the captured image digest, Vikunja v2.6.0, one local Docker
instance, and SQLite. PostgreSQL comparison belongs after this direct
confirmation and must not be mixed into this run.
