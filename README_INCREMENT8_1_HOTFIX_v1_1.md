# Increment 8.1 hotfix v1.1

This hotfix fixes evidence packaging on Windows PowerShell 5.1, where
`System.IO.Path.GetRelativePath` is unavailable. The experiment itself and its
evaluation are unchanged.

Extract the ZIP over `C:\work\temp\vikunja_tse_study`. It replaces the invoke
script and adds a recovery script.

Do not rerun the completed 20-trial experiment. Package the latest completed
run with:

```powershell
Set-Location "C:\work\temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Complete-Vikunja-Increment8_1-Evidence.ps1"
& ".\scripts\Complete-Vikunja-Increment8_1-Evidence.ps1"
```

The recovered ZIP is written under `evidence`. The recovery command exits 0
when packaging succeeds even when the contained experiment correctly reports
`DIRECT_DEFECT_REPRODUCED`.
