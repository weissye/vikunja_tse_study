# Generator verification and campaign profiles — release candidate

## Install into the existing Windows project

Extract the ZIP at `C:\work\temp\vikunja_tse_study` with `Expand-Archive -Force`.
The ZIP contains only tree-relative changed files. It requires the existing
`generator_baseline`, Immich spec/deployment, and the already installed Immich
pilot dependencies. Do not replace the entire generator directory.

## Scope and evidence policy

The verifier now treats an ambiguous 400/409/422 item observation following an
acknowledged create as INCONCLUSIVE. A separate confirmed list-vs-item mismatch
requires same-user and identity evidence; the historical Immich targeted
confirmation remains independent, and is not silently promoted into an
OpenAPI-only generated verdict.

`--json-disjoint` is opt-in: for PATCH application/json it derives only fields
documented both in the update request and the item GET response. For each
pair/triple it runs a serial control in both field orders, then a concurrent
barrier epoch and post-join GET. An unsuccessful or unobservable serial order
produces INCONCLUSIVE. The default prior generator behavior is byte-stable.
The legacy merge-patch disjoint oracle remains unchanged.

## One-command runs

In the same PowerShell project root as the deployed Immich pilot:

```powershell
cd C:\work\temp\vikunja_tse_study
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile parallel -PreflightOnly
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile parallel
```

The preflight performs static generation and creates a review ZIP without
contacting the application. The live run requires the local Immich v3.2.0
server, Provengo and the pilot research identity. Avoid simultaneous profiles
against the same isolated server; their writes would confound the observations.
The `parallel` run is the first live test of these new JSON disjoint candidates.

| Profile | Change from baseline | What to compare |
| --- | --- | --- |
| baseline | Existing values (2 runs, 3–6 rounds, 4 field pairs) | Prior campaign compatibility |
| coverage | 3 runs, 3 entity instances, 2 action instances, 8 field pairs | Observed operations, executable oracles, completed stories |
| depth | 3 runs, 7–10 rounds, 45,000 selection budget | Completed long rounds, skipped stories and observations |
| parallel | 2 runs, JSON disjoint opt-in, 4 field pairs | Both serial orders, real overlap, valid epochs and post-join state |

`MaxLength` controls Provengo's selection budget, not per-story rounds.
`InstancesPerAction` controls repeated action stories, not the number of
simultaneous workers. JSON disjoint pairs have width 2; triples have width 3.
Each run records its parameter values, seed, source hash and generated reports.

## Interpreting results

Evaluate generated contract, state, and concurrency layers separately. A
contract mismatch does not certify a semantic state bug. For concurrency,
require both successful serial orders, real overlap at both adapter and proxy,
documented successful responses, and an independent final read. Count
`INCONCLUSIVE` and skipped dependencies rather than hiding them. Reproduce
each candidate with an independent serial/parallel control before including
it among confirmed findings.

## Architecture to freeze across systems

Keep one immutable `generator_baseline` revision and verification semantics.
Separate four versioned, machine-readable inputs: (1) experiment profile
(selection budget, seed range, entity/action instances, rounds, pair cap,
enabled generic oracle families); (2) system adapter (OpenAPI hash, isolated
deployment URL, setup and identity guard); (3) evidence policy (trace and
redaction); (4) acceptance thresholds (coverage and valid overlap). Adapt each
system only at its deployment/identity boundary; avoid modifying generator
logic to fit one result. Persist hashes of the code, OpenAPI projection and
profile in every evidence package. Before declaring the cross-system freeze,
run the unchanged profile+generator against Vikunja, Gitea and Immich, record
static generation and live witness coverage, and retain old fixture comparisons.

This ZIP provides the generic generator changes and a working Immich profile
adapter. The system-independent campaign launcher and cross-system live
regression remain the next freeze gate; static checks alone do not certify
runtime correctness across three deployments.
