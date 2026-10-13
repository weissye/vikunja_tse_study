# v090 — reusable behavior templates, independent bthread instances

This version refactors v089's model generation, not the running copy on the user's machine.

## Changes

Each resource type now has ONE creation template, ONE per-session work template, and (where supported) ONE negative-test template. Login has ONE shared template. Small data arrays instantiate these templates. There are no duplicated WORK_A/WORK_B bodies, no copied creation bodies per instance, and no copied negative-rule bodies per session/resource.

Factory arguments are fresh function-local lexical bindings. Each resulting bthread retains its own session/resource/rule identity and instruction position. There is no mutable global currentSession/currentResource. All instances remain in one Provengo project and one Context, with three JS files. The engine selects the interleaving.

Counts stay unchanged: 80 creation bthreads, 160 work bthreads, 1380 negative bthreads, two native login bthreads, plus the existing Context verifier and blocker templates. Stories source size: 1,513,919 -> 117,458 bytes in the inspection fixture. Runtime search complexity is not reduced; only code duplication is removed.

Login remains a native model behavior. A login template is instantiated once for each configured session, and work awaits its Session.Ready state. v089's missing-entity lookup and empty-token redaction fixes are retained. Recovery still uses native re-login after cold snapshots, original finding evidence, strict storage/API validation and the same JVM.

The shared work template updates all currently supported auto-selected fields, releasing its operation window after every update/readback. Instances for saved filters, task comments and project shares currently READ ONLY: their creation occurs in a separate creation template. Do not call these per-session readers full CRUD lifecycles. Deletion and additional write mappings are not added by this refactor.

## Evidence and limitations

Local tests execute the actual generated Stories registration, enumerate the resulting 80/160/1380/2 instances, and execute every finite body against injected operations to check distinct captured IDs, field lists and per-operation releases. They also exercise actual Context SessionReady effects, native readiness/recovery blockers, gateway login/recovery protocol, original negative callbacks, log redaction and JS syntax.

Native Provengo/JAR acceptance and live v090 execution have NOT been performed in the build environment. A successful v088/v089 running campaign does not establish v090 acceptance. No ongoing run is modified, replaced or resumed by this package.

All broader v088 limitations remain: eight selected types rather than every contract entity/action; explicit historical saved-filter creation mapping; blocked unsupported fields/rules; per-operation observation isolation; whole-server business pause during cold rollback; positive failures fatal; no live 429 backoff. Read README_v088.md and REQUIREMENTS_AUDIT_v088.json. Full pure-contract-only coverage is not claimed.

## Run

Run-Model-v090.ps1 without RunLive: static generation only. Add RunLive for a fresh local acceptance after the current campaign ends. Avoid starting two cold-rollback campaigns on the same server at once, because each restores the whole local database/files.

The user-provided local configuration is retained. Generated JS and exported review evidence do not contain the literal password. The delivery ZIP contains run-config.local.json and must not be uploaded unchanged as a credential-free Git artifact.

Default home root: D:\Yeshayahu\Temp\vikunja_tse_study. Frozen runtime/contract checks and the existing storage backends are retained. Full 1380-case acceptance remains long; reducing code size does not shorten authentication pacing or rollback costs.

Development tests: Test-Model-v090.py and Test-Log-Redaction-v090.py (Python + Node). Historical tests remain references and may assert older literal source shape; do not interpret their old counts as v090's registration method.
