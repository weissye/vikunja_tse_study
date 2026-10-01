# OpenAPI-only verified Provengo generator extension

This delta adds a generic verification and concurrency layer to the existing
OpenAPI-to-Provengo generator. It does not contain system names, business
rules, hidden state, seeded faults, or application-specific field choices.

## Generated artifacts

For every non-deprecated OpenAPI operation, the generator emits a response
contract oracle. For state-changing operations it additionally emits a state
oracle only when the contract documents a safe observation path and binding.
It never invents an undocumented `GET`, identifier mapping, absence status, or
business invariant.

The generated files are:

- `interfaces.<name>.js` and `stories.<name>.js` from the existing generator;
- `verification.<name>.js`, a Provengo concurrency overlay;
- `verification-manifest.<name>.json`, the complete machine-readable oracle set;
- `verifier-coverage.<name>.json`, including every contract-only limitation;
- `concurrency-plan.<name>.json`, containing same-field, merge-patch disjoint-field,
  and update/delete candidate histories derived from the contract;
- `SHA256SUMS.verified-generator.csv`.

The concurrency overlay uses one Provengo model and a generic barrier/HTTP
executor. The executor chooses no scenario and contains no SUT semantics; the
generated model and oracle manifest remain the decision owners.

## Run on Vikunja

From the repository root in Windows PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

& ".\scripts\Invoke-OpenApi-Verified-Generator.ps1" `
  -OpenApi ".\model\vikunja-multi-resource-openapi.json" `
  -Output ".\generated\vikunja-verified" `
  -Name "vikunja_verified" `
  -BaseUrl "http://127.0.0.1:3457"
```

Use `-RequireStateVerifierForEveryMutation` only as an intentionally strict
audit. OpenAPI contracts often document actions that have no item-read
observation; such operations remain contract-verified and are explicitly
reported as `CONTRACT_ONLY`, rather than being silently treated as state
verified.

## Evaluate a preserved HTTP trace

```powershell
python -m openapi_to_sbt.evaluate_verifiers `
  --trace ".\runs\<run>\http-trace.jsonl" `
  --manifest ".\generated\vikunja-verified\verification-manifest.vikunja_verified.json" `
  --output ".\runs\<run>\generated-verifier-evaluation.json"
```

Run that command from `generator_baseline`, or set `PYTHONPATH` to that
directory. The PowerShell generation wrapper resolves this directory
automatically and also accepts `-GeneratorRoot` when the repository uses a
different layout.

Exit codes are `0=PASS`, `2=SEMANTIC_ANOMALY`, and `3=INCONCLUSIVE`.

## Vikunja runtime acceptance

Version 0.25.1 includes an application-neutral trace proxy and concurrency
adapter. The adapter validates only transport shape and safety; it contains no
resource paths, field names, or business values. Nested create paths are bound
from documented request-path parameters plus the documented create response,
so a contract such as `POST /projects/{project}/tasks` can safely supply the
identity needed by `GET/PATCH /tasks/{task}`.

From the study repository root, after generating `generated/vikunja-verified`:

```powershell
& ".\scripts\Invoke-OpenApi-Verified-Vikunja-Acceptance.ps1" `
  -Target "http://127.0.0.1:3466" `
  -Generated ".\generated\vikunja-verified"
```

The script starts the generic proxy and barrier executor, creates an isolated
Provengo project, runs the generated model, evaluates the preserved HTTP trace,
and writes a review ZIP under `evidence`. Authentication and the API prefix are
runtime deployment configuration; they are not generator semantic inputs.

## Scientific boundary

OpenAPI can justify response contracts, lifecycle visibility, persistence,
absence, and selected metamorphic concurrency properties. It normally cannot
justify domain business invariants. Any future domain extension must be kept
in a separately labelled manifest and excluded from the OpenAPI-only baseline.
