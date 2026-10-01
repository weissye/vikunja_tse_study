# Vikunja Increment 8.2 — PostgreSQL differential confirmation

Increment 8.2 compares the canonical direct SQLite result from Increment 8.1
with an isolated PostgreSQL deployment. The direct harness and its independent
evaluator are reused unchanged. The database backend is the controlled
variable.

## Added files

| File | Target under `C:\work\temp\vikunja_tse_study` |
|---|---|
| `deployment/increment8_2/docker-compose.yml` | `deployment/increment8_2/` |
| `scripts/Prepare-Vikunja-Increment8_2.ps1` | `scripts/` |
| `scripts/Invoke-Vikunja-Increment8_2.ps1` | `scripts/` |
| `scripts/compare_vikunja_increment8_2_backends.py` | `scripts/` |
| `tests/test_increment8_2_differential.py` | `tests/` |

The SQLite container and its state are not modified. The new stack uses:

- Vikunja on `127.0.0.1:3466`;
- container `vikunja-increment8-2-postgres`;
- PostgreSQL container `vikunja-increment8-2-db`;
- isolated named volumes;
- the exact Vikunja image digest captured by Increment 8.1.

## Validate

```powershell
Set-Location "C:\work\temp\vikunja_tse_study"
python ".\tests\test_increment8_2_differential.py"
```

Expected: `Ran 5 tests ... OK`.

## First preparation

Run preparation and invocation in the same PowerShell window. `-ResetState`
removes only the isolated Increment 8.2 containers and volumes; it never
touches the SQLite deployment.

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Prepare-Vikunja-Increment8_2.ps1"
Unblock-File ".\scripts\Invoke-Vikunja-Increment8_2.ps1"

& ".\scripts\Prepare-Vikunja-Increment8_2.ps1" -ResetState
& ".\scripts\Invoke-Vikunja-Increment8_2.ps1" -Trials 20 -QuiescenceMs 100
```

Preparation generates local-only database/service secrets, starts the stack,
creates a unique test user through Vikunja's CLI, logs in, and exports the JWT
only to the current PowerShell process. Passwords and tokens are not written to
the evidence package.

The invocation automatically selects the latest complete Increment 8.1 SQLite
evaluation, executes the unchanged direct harness against PostgreSQL, evaluates
the witnesses, compares the two backends, captures both container logs and
image identities, hashes the files, and writes a review ZIP under `evidence`.

## Interpretation

| Comparison status | Meaning |
|---|---|
| `DEFECTS_NOT_REPRODUCED_ON_POSTGRES` | Both observed defect families are limited to the tested SQLite configuration. |
| `SQLITE_LOCK_FAILURE_NOT_REPRODUCED_BUT_LOST_UPDATE_IS_CROSS_BACKEND` | Lock failures are SQLite-specific, while lost update is application-level or cross-backend. |
| `BOTH_DEFECT_FAMILIES_REPRODUCED_ON_POSTGRES` | Both concurrency failures extend beyond SQLite. |
| `SERVER_FAILURE_REPRODUCED_ON_POSTGRES` | Server-side concurrent-write failure also occurs with PostgreSQL. |
| `INCONCLUSIVE` | A control, overlap, transport, or observation requirement failed. |

Do not run the SQLite and PostgreSQL confirmation campaigns simultaneously.
