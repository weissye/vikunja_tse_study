# Increment 8.2 hotfix v1.1

This delta contains only the two runtime files changed after the first local
Docker preparation attempt.

## Corrected failures

1. The named volume mounted at `/app/vikunja/files` was created with root
   ownership. Vikunja runs as UID 1000 and therefore failed its startup storage
   validation with `permission denied`. The Compose project now runs a one-shot
   initializer that changes the volume ownership to `1000:0` before Vikunja is
   started.
2. A fresh invocation with `-ResetState` tried to call Compose before `.env`
   existed. The preparation script now creates the environment file first and
   checks whether `compose down` succeeded.

No experiment, harness, evaluator, API workload, or classification logic was
changed.

## Install

Extract this archive into the repository root and replace the existing files.
The paths in the archive are already rooted correctly.

## Recover from the failed preparation

Run from the repository root in the same PowerShell window:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Prepare-Vikunja-Increment8_2.ps1"

& ".\scripts\Prepare-Vikunja-Increment8_2.ps1" -ResetState

& ".\scripts\Invoke-Vikunja-Increment8_2.ps1" `
  -Trials 20 `
  -QuiescenceMs 100
```

`-ResetState` deletes only the isolated `vikunja_increment8_2` containers and
volumes. It is appropriate here because the failed preparation never reached
the experiment.
