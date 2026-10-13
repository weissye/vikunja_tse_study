# v091 — overnight model, description-derived values

Base: v090 shared templates, v089 Context/log fixes, frozen local server/contract/JAR. One project, three JS, one Context, 80 shared resources, 160 session workflow instances, two native login bthreads. Factory parameters keep distinct identity. Provengo selects interleavings. The password is in the user's requested LOCAL runtime configuration; generated JS/exported review do not contain it.

## v089 findings and correction

The v089 manifest matched 15/15 files. Live run created 41/80 resources, completed 22/160 workflows and 11 positive updates. Exactly 98 negative checks/restores completed: 78 HTTP400, 20 HTTP412; all rejection/state checks passed and all storage/API restorations were verified. Twenty 412 codes were undocumented, a separate status finding. Both sessions updated resources: A five writes, B six. Stop was a positive colour update: ModelsLabel_6 sent hex_color='sbt-B-M', response and independent GET observed 'sbt-B-'. The contract description says hex format. This is not a confirmed SUT semantic bug: the generator's alleged positive input was not a hex colour.

v091's preprocessing reads field descriptions and annotates value_domains in contract IR. Generic emission reads these annotations, not application-specific fields or paths:

- Hex descriptions -> deterministic six-digit lowercase hexadecimal update values.
- Unique short identifier descriptions -> distinct uppercase alphanumeric values, length checked, for both sessions/resources.
- Identifiers described as based on another resource/index -> observation-derived candidates; direct positive/negative mutation is blocked pending writable-semantics confirmation.

These are explicitly DESCRIPTION_INFERENCE, with exact description pointers. Six-digit colour shape and identifier handling are inference policies, not formal schema constraints. No existing contract statement is overwritten. Each launch adds an external research fixture namespace based on its run directory, preventing repeated fresh runs from reusing the same unique project identifier. The equality verifier is not weakened. Task identifier observation remains in server readback but its derivation relationship is not yet an independent semantic oracle.

The generic templates and Context recovery stay intact. Positive per-operation windows release after each field's update/verification. Other resources remain interleavable; no whole-workflow lock. Cold rollback pauses whole-server business requests until both native re-logins and strict prefix verification; this limitation remains disclosed.

## Planned overnight acceptance

80 creations; 160 shared-session workflows; 260 positive updates; 1,300 negative cases and verified recoveries. Reducing 280 -> 260 updates and 1,380 -> 1,300 negatives comes solely from blocking mutation of the description-derived task identifier. Blocked rules remain in negative_catalog.json with reasons. The older counts in historical v088/v090 READMEs are not the v091 plan.

Full run remains long. Four paced logins per negative window can add about ten hours at login_interval_seconds=7, plus snapshots/API checks. timeout_seconds=86,400 and model event budget=200,000. Keep the local server/disk/PC available. Auto 429 retry and positive-operation recovery are still not implemented; such failures stop and preserve evidence. The 2GB initial free-space guard is only a minimum, not a full capacity estimate.

## Source/coverage boundaries

Eight SELECTED contract types, not every API entity/action. The inherited validated external saved-filter creation mapping remains necessary because its complete schema is missing from the frozen contract. Read REQUIREMENTS_AUDIT_v091.json: all_requirements_satisfied remains false. Unsupported fields/actions/rules are not silently counted as tested.

## Local tests

Actual emitted formatter: 60 valid hex values across three types/two sessions/ten instances; 20 distinct short identifiers; description-pointer provenance. Actual template instantiation: 80 creation/160 workflow/1,300 negative/2 login, every finite callback executed against injected operations with distinct factory bindings. Actual Context/recovery gate/oracle/log-reader tests and syntax pass. NO frozen-JAR native or live v091 acceptance is claimed.

## Run and Git

Run-Model-v091.ps1 without RunLive produces the static review and complete generated inputs/JS. Add RunLive for a fresh overnight acceptance after Git upload confirmation. This does not resume v089's dead JVM or reuse its Context IDs. Prior evidence/private checkpoints remain untouched; old partially created server resources are not deleted by the launcher.

v092 uploads continuation copies to MAIN first, including run-config.local.json as explicitly authorized by the user. Runtime JWTs and unrelated local credentials remain sanitized/excluded. The live run uses the original local package/config. Source package and sanitized Git copy have different hashes if unrelated local files or runtime-token logs are removed; source hashes and changes are recorded. The user explicitly authorized uploading the local research password; this supersedes older historical README exclusion wording for that one file. The result of the upcoming night run is not on Git before it exists; upload it after completion.
