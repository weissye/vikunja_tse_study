# v093 — continuation-safe overnight templates

v091's live run stopped with native exit 2: Cannot capture continuation from JavaScript code not called directly by executeScriptWithContinuations or callFunctionWithContinuations. The failing request was inside fieldSpecs.forEach's callback at the first field of a work template. This is a model/runtime integration defect, not a SUT finding.

The v091 review manifest matches 14/14. Both model login HTTP requests succeeded. The gateway recorded 16 creations, two independent reads and two logins: 20 real requests total. No positive update or negative recovery was completed.

v093 replaces the suspendable work-template Array.forEach with a normal indexed for loop. Top-level Array.forEach used only to register parameterized bthreads remains: it does not execute HTTP/request/waitFor while in its callback. Pure-value array callbacks also remain. Reusable templates, captured instance parameters and Provengo event selection are preserved; this is not a return to duplicated stories.

A focused local regression harness simulates native array callback frames: v091 fails on request from within a native callback; the emitted v093 template bodies pass for all 80 creation/160 work/1300 negative/2 login instances. Prior model-context, login/recovery, values, actual verifier and redaction tests pass. This harness is NOT the frozen Rhino/JAR; native/live v093 acceptance is still pending.

The runner also reports native ERROR/nonzero exit before a misleading 'workflows incomplete' check and records planned counts on early failure. Expected night plan remains 80 resources, 160 workflow instances, 260 positive updates and 1300 negative checks/restores. The inherited v091 hex/identifier description inference, per-run identifier namespace, native session logins, two input files, strict rollback and v089 evidence fixes remain.

Use Run-Model-v093.ps1, or Start-Night-v094.ps1 to upload source/reviews/config to MAIN, verify remote commit, and only then launch live. The local research password remains in run-config.local.json, including Git as explicitly authorized. Runtime JWTs and private Docker snapshots stay excluded/sanitized. The whole night remains long; all broader coverage/source-authority limitations in README_v091.md still apply.

This is a fresh acceptance, not a resume of the stopped JVM. Old server resources/evidence/snapshots are preserved. Native positive failures remain fatal; no SUT findings are converted to PASS to finish a run.
