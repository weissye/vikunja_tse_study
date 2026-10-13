# v099 short-run correction

Read ANALYSIS_v096.md for the verified failure and actual coverage.
Current entrypoint: Run-Model-v099.ps1. Current research input:
input-source/research-config-v099.json. Runtime credentials: run-config.local.json.

One generic emitter / IR + research input / one project / three JS files / shared
Context / one native JVM / two native login sessions for one user. Provengo chooses
interleavings. Independent reusable behavior factories remain unchanged.
Default 3 instances per each selected type = 24 resources, 48 session workflows,
78 positive updates, 8 negatives selected from 390. Sampling/time budgets are unchanged
from v096 (600 seconds admission cutoff + 300 drain allowance). Runtime/authentication
and cold snapshot restoration limitations remain unchanged. This is selected-scope
sampled coverage, not all-contract coverage or exhaustive state-space exploration.

The code now shares detail route binding for negative and positive operations.
Native output uses file-backed collection rather than a blocking pipe-reader thread.
Raw output stays under excluded .private-snapshots; review includes redacted native.log.
Post-Test-Fail-Mode markers are excluded from successful coverage/history.
Cleanup errors are separate from original native failure; unsafe or partial failures
remain NOT_ACCEPTED. A stable budget partial is explicitly distinct from completion.

Sampling history remains StudyRoot/sampling-history-v096.json for continuity. Only
verified pre-failure recovery IDs advance it; no original failed run is overwritten.
No live restart from the previous JVM is claimed. Use a fresh run on same local SUT.

Short default requires >=1 GB free space; larger profiles retain >=2 GB. Available
space is not a guarantee of successful storage writes. No files/volumes are deleted.
Exact 15 minute end-to-end duration is not guaranteed; closure/packaging add overhead.

Local tests pass; no frozen native/JAR or live server acceptance was performed here.
