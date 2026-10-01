# Gitea Stage 3.1 — true-concurrency admission

Stage 3 generated concurrency plans but completed with zero executed epochs.
Stage 3.1 fixes the generic OpenAPI-to-runtime binding and makes a real epoch
an acceptance requirement.

## What changed

- Completion events carry their OpenAPI `operationId`; verifier threads wait
  for the exact documented producer instead of an ambiguous entity label.
- Response bindings support documented nested identities such as
  `owner.login` and type-compatible resource names such as `name`.
- When several POST operations can create the same item shape, the generator
  prefers the producer with the fewest prerequisite path resources.
- The live gate requires at least one Ready, Permit, Closed, adapter epoch,
  and external concurrency evaluation. Zero epochs is a failure.
- Provengo's mutable internal `runs-db.db` is excluded from the hash manifest;
  immutable research artifacts remain hashed.

All binding rules are generic and derived from OpenAPI. No Gitea-specific
resource name or business rule is embedded in the generator.

## Run

Use the same PowerShell process in which Stage 1 set `GITEA_API_TOKEN`:

```powershell
Set-Location "C:\work\temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Invoke-Gitea-Stage3_1.ps1"

& ".\scripts\Invoke-Gitea-Stage3_1.ps1"
```

If the token is no longer valid, first run:

```powershell
& ".\scripts\Prepare-Gitea-Stage1.ps1"
```

Do not use `-ResetState` unless a clean Gitea database is intentionally
required. Then invoke Stage 3.1 in that same PowerShell window.

## Required success marker

The run is accepted only when it prints both:

```text
GITEA_STAGE3_1_CONCURRENCY_ACCEPTED
GITEA_STAGE3_1_COMPLETE
```

The summary also prints runtime-ready plans, Ready/Permit/Closed event counts,
adapter epoch count, evaluated epoch count, and the evidence ZIP path.
