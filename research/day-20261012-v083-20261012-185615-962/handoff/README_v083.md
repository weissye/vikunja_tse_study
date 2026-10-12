# v083 — Publish today's Vikunja continuation to existing GitHub MAIN

Run Upload-Vikunja-Day-v083.ps1 on the Work PC. It publishes a dated research snapshot to https://github.com/weissye/vikunja_tse_study.git, MAIN, using a non-forced push and exact remote commit verification. No existing working tree or Docker state is changed. No pull/merge/rebase is applied to the current local study tree.

The script collects:
- Vikunja delivery ZIPs v069-v082 present in Downloads (identical package bytes deduplicated by SHA256).
- Dated public review ZIPs v069-v082 from StudyRoot/runs and existing work-v011-*/v/runs directories, including accepted and failed/partial runs.
- The generated source/input/config documents under selected StudyRoot/generated version folders, excluding products/private/cache paths.
- This uploader, the v082 analysis and SHA256 inventory/summary.

The final v082 delivery ZIP and review are mandatory. Missing older packages are visible in the version inventory; they cannot be invented or recovered by the script. This is a defined continuation snapshot, not a blind copy of every repository file or the entire computer. Today’s active work here was Vikunja; Mealie’s prior repository is not pushed or rewritten by this script.

Historical review ZIPs are copied byte-for-byte. Their original internal hashes/results are preserved, including any known historical invalid manifest such as v074's native-log mismatch; the new transfer inventory hashes the original ZIP as an artifact, without claiming that the historical run passed. Duplicate filenames are saved under numbered run names.

Excluded: private DB/files checkpoints, Docker deployments/data, runtime products/databases, JAR binaries and password/token files. Public review archives include the already-exported evidence. Generators/source are also inside the full delivery ZIPs. This preserves code, generated JS, inputs, findings and review evidence for continuation; it cannot migrate a live JVM or private cold checkpoint. Docker at Home/Work remains the existing environment.

A fresh filtered clone with no checkout reads the full MAIN tree into the index; only the research snapshot is added. Existing MAIN content remains tracked without checking it out or downloading all historical blobs. The snapshot .gitattributes preserves exact bytes and disables inherited LFS filtering for the snapshot. Normal git author identity is required. Files >=90MB are refused before staging. No force push is used; a concurrent MAIN advance can reject the push, in which case preserve the printed workspace and retry after reviewing the server state.

Default paths: StudyRoot C:\work\temp\vikunja_tse_study, WorkBase C:\work\temp, Downloads user's Downloads. Output is V083_MAIN_UPLOAD_VERIFIED plus Commit, Snapshot and a local receipt in Downloads. Until that marker is printed, upload is not claimed complete.

The Git index/add/commit/nonforced-push workflow was tested against a local bare repository, including retention of pre-existing MAIN files. The PowerShell script itself and GitHub authentication/push were not executed on the build host; actual publication occurs on the user's computer.
