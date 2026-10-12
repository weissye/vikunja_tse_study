# v088 live run analysis and v089 fix

Manifest: 13/13 matching. Native/live execution occurred; status NOT_ACCEPTED.
Exactly one successful authentication HTTP request: session B, HTTP 200. No resource creation/update/negative mutation is present in the gateway journal. Native result ERROR; model error: Key CTX.Entity: session_B does not exist.

Root cause: SessionReady effect used getEntityById on a missing entity as an existence test. This API throws for missing IDs. v089 uses the existing Session.Ready query to locate an existing entity before removal; no throwing lookup.

Secondary issue: native log redaction iterated an empty initial token and used str.replace with that empty string. This inserted REDACTED markers between every character. v089 ignores empty secrets. Its monitor treats native ERROR and ERR lines as fatal, and records actual counts/exit even on early failure.

The original review ZIP is preserved unchanged. Removing the inserted REDACTED markers for diagnosis revealed the error; this is diagnostic decoding, not a replacement original log. No SUT bug, interleaving coverage, successful two-session login, resource creation or recovery acceptance is established by this run.

v089 retains 80 shared resource plans, 160 session workflows and 1380 negative cases, native login and both input files. It is a fresh acceptance, not a resume of the stopped JVM. Local tests execute the actual emitted SessionReady effects with a throwing missing-key API, duplicate readiness and invalidate/re-login; execute the actual log-reader AST with an empty secret, secret masking and ERROR; prior injected native-login/recovery tests and generated syntax pass. Live acceptance remains pending.
