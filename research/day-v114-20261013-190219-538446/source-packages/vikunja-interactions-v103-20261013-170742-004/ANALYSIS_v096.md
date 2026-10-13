# v096 live evidence analysis

Input: Vikunja_v096_Incomplete_Evidence_v098-20261013-103143.zip.
COLLECTION manifest: all 15 file hashes verified.

First native error at 07:16:49.409 (native local timestamps):
ERROR: Illegal character in path at index 32:
http://127.0.0.1:50210/projects/{project}/views/554.
The selected negative_prepare GET for ModelsProjectView_3 retained {project}.
Normal detail routes substitute child and parent RTVs; negative_schema substituted
only the child. This is an emitter defect. The rejected URL was never actuated at SUT.

Provengo entered Test Fail Mode and skipped subsequent actuation. Post-failure events
and Context markers are not evidence of successful SUT coverage.

Actual coverage before first failure:
- 16/24 created resources: projects, labels, saved filters, teams: 3 each;
  tasks, task comments, project views, link sharing: 1 each.
- 20/78 positive HTTP updates: A=11, B=9; responses all HTTP 200.
  These are accepted HTTP writes, not a claim that every write's oracle completed.
- 10/48 workflow-completion markers before failure: saved filters 6,
  task comments 2, link sharing 1, team 1. Others not claimed complete.
- 5/8 negative checks: all HTTP 400, PASS, unchanged observed state.
- 5 recovery checks: snapshot_restored and api_prefix_equal true.
- 22 native login requests.
- 20 later workflow-completion markers excluded (30 total log markers).
- No confirmed new SUT bug in this evidence. Known historical findings unaffected.

The UI heartbeat showed 4, but the preserved evidence contains a fifth completed
negative and recovery before failure. The earlier UI count is superseded.
No time-budget closure is shown: boundary markers remain expired=false.
The shutdown error in Python masked the original native cause and prevented sealing.
Evidence does not determine precisely why the old log-reader thread stayed active.

v099 corrective scope:
1. Shared generic child/parent detail-route expression used by positive and negative
   templates; unresolved route parameters explicitly rejected during generation.
2. Native stdout written directly to an excluded private file, with bounded polling
   into redacted public log. No pipe-reading thread or inherited-pipe EOF join.
3. Native ERROR/Test Fail Mode promptly detected. Main error retained even if cleanup
   also fails; public counters/ledger/review preserved when storage permits.
4. Count markers and sampling history only before the first native failure.
5. Default sample unchanged: 24 resources, 48 workflows, 78 writes, 8 negatives.
6. Short profile minimum free disk 1 GB, larger profiles 2 GB; no automatic deletion.

Local generated-route, multi-parent/unbound-parent, log-redaction/error-prefix,
inherited stdout handle, sampling/budget and v093 protocol regression tests pass.
Live frozen Provengo acceptance remains pending on user's Windows Docker environment.
