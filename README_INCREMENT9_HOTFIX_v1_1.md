# Increment 9 hotfix v1.1

The Provengo campaign and evaluator completed successfully. Packaging stopped
only because Windows PowerShell 5 treats text written by `docker logs` to
stderr as a terminating `NativeCommandError`. PostgreSQL emitted the harmless
text `sh: locale: not found` on that stream.

This hotfix changes log collection to `Start-Process` with separate temporary
stdout/stderr files. It also adds a recovery command that packages the already
completed run, so the campaign must not be rerun.

From the repository root:

```powershell
Expand-Archive `
  ".\vikunja_increment9_windows_log_collection_hotfix_20260922_v1_1.zip" `
  -DestinationPath "." `
  -Force

Unblock-File ".\scripts\Complete-Vikunja-Increment9-Evidence.ps1"
& ".\scripts\Complete-Vikunja-Increment9-Evidence.ps1"
```

The recovery command selects the latest Increment 9 run, preserves its original
trace and evaluation, adds both container logs, recalculates checksums, and
creates the review ZIP under `evidence`.
