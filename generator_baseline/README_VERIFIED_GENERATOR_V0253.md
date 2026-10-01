# Verified generator 0.25.3

## Why this patch exists

The Vikunja acceptance run `openapi-verified-vikunja-20260922_230339_367`
proved that authentication, tracing and result classification were working,
but the generated positive model was not yet conservative enough.  The trace
contains a successful authenticated `GET /user`, a successful label creation,
and then a rejected project creation.  The project request contained a random
optional `parent_project_id`; Vikunja returned 404 / error code 3001 because
that parent did not exist.  No generated semantic or concurrency oracle was
reached, so the evaluator correctly returned `INCONCLUSIVE` rather than PASS.

## Generic OpenAPI-only correction

Version 0.25.3 changes only contract-derived input policy:

- required path, parameter and request-body values are populated;
- optional query/header/cookie parameters are omitted;
- `readOnly`, nullable, object and array request properties are omitted when
  optional;
- optional identifier fields are never invented; they are populated only
  when dependency inference captured a real generated resource identifier;
- an operation with an unbound required path identifier keeps its generated
  interface and contract verifier, but its invalid positive runtime story is
  suppressed instead of requesting a random resource URL.

The policy contains no Vikunja names, endpoints, fields or business rules.

## Validation performed here

- focused rendering and verifier tests: 36/36 passed;
- full local suite: all available tests passed except the Todoist golden test,
  whose external holdout OpenAPI is not present in this environment;
- the four bundled historical systems passed their existing regressions;
- regenerated Vikunja stories omit `parentProjectId`, server-owned objects and
  optional transport parameters from project creation;
- invalid positive stories using invented task path identifiers are absent;
- the valid nested task-create story remains and is bound to a real generated
  project.

## Windows validation, including Todoist

The supplied matrix script stages the canonical Todoist holdout from the v38
tree named by the experiment, runs the complete regression suite, and generates
verified artifacts for Library, Garage, Pharmacy, NetBox, Todoist and Vikunja:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& ".\scripts\Test-OpenApi-Verified-Generator-Matrix.ps1"
```

Only after that command passes should the Vikunja acceptance run be repeated.
