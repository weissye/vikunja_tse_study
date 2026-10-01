# Gitea Stage 6: long prefix and concurrent merge pilot

Copy `Invoke-Gitea-Stage6.ps1` and `gitea_stage6.py` into the existing project's `scripts/` folder. These two files replace any earlier Stage 6 launcher and its missing Python driver. Keep the Stage 1 Gitea container running, and use the same authenticated research user as in Stage 5.2. Python 3.9 or newer is sufficient. Stage 6 needs no Provengo executable: it is a controlled HTTP diagnostic, not a comparative Provengo campaign.

From the project root in PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File .\scripts\Invoke-Gitea-Stage6.ps1
# GITEA_API_TOKEN must already be available in this PowerShell session.
& .\scripts\Invoke-Gitea-Stage6.ps1 -Trials 3 -PrefixLength 12 -Container gitea-stage1-server -FreezeEvidence
```

Each independent trial creates a new upstream repository and organization fork, verifies fork identity and branch heads, then executes `PrefixLength` upstream commits followed by verified fast-forward merges. It makes one more upstream commit and releases two merge-upstream requests against the fork together. It records HTTP responses, request interval overlap and the final branch SHA. A prefix failure ends that trial. Trial fixtures remain on the isolated research Gitea instance for later inspection.

Read `summary.json` for counts and `http-trace.json` for sequence-local evidence. `run-metadata.json` identifies the driver and its SHA256; `sha256.json` covers the JSON output. The optional review ZIP is saved in the project `evidence/` directory and contains source snapshots, a checksum list and container stdout/stderr logs when available. `PASS` requires an observed overlapping pair, at least one successful merge and the final fork SHA equal to the upstream SHA. A `400` response claiming branch divergence alongside a successful merge is a separate concurrent rejection candidate, even if the final SHA matches. `CANDIDATE` requires independent replay and application analysis before any paper claim. A non-overlapping pair, failed preconditions, or setup error is `INCONCLUSIVE`.

Stage 5.2 baseline: ten of ten valid-fork merge requests succeeded; the non-fork 500s are a robustness control, not evidence that a valid merge is defective. Do not combine Stage 6 counts with the A-2-A Provengo/RESTler/EvoMaster results; the generation method and budget differ.
