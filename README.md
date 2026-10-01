# Parallel CRUD dependency and opaque-body follow-up

Apply over `keycloak_parallel_crud_generator_delta.zip` (the previous delta); the previous archive already supplies `reference/keycloak-stage2-openapi.json` and `scripts/audit_parallel_crud.py`. This archive changes seven generator files and adds one regression test. Existing unrelated project files are untouched.

The OpenAPI create-body descriptions require two extra prerequisites: organization members need an existing user, and organization identity providers need an existing identity provider. The generated graph now contains 39 edges (previously 37). Parent choices are dynamically selected among live instances in the **same realm**, and parent deletion waits for the dependent workers.

The two association endpoints receive their documented parent identifiers as primitive JSON strings. The realm import uses the JSON object `{realm: <unique generated name>, enabled: true}` established by the earlier empirical Keycloak fixture. These bindings use the operation and request descriptions from the supplied contract plus the previously observed realm fixture; they are confined to the opt-in `parallel-crud` profile.

Check after extraction:

```powershell
cd C:\work\temp\vikunja_tse_study
$env:PYTHONPATH = Join-Path (Get-Location) 'generator_baseline'
python -m unittest discover -s .\tests -p test_opaque_associations.py
if ($LASTEXITCODE -ne 0) { throw 'Opaque-association regression failed' }
$out = Join-Path (Get-Location) "runs\keycloak-parallel-crud-v2-$([guid]::NewGuid().ToString('N'))"
python -m openapi_to_sbt generate `
  --openapi '.\reference\keycloak-stage2-openapi.json' `
  --output $out --name keycloak_stage2 `
  --base-url 'http://127.0.0.1:9938' --seed 20261902 `
  --instances-per-entity 8 --logical-processes 2 `
  --story-profile parallel-crud --auth-token-env KC_STAGE2_ACCESS_TOKEN
if ($LASTEXITCODE -ne 0) { throw 'Generation failed' }
python .\scripts\audit_parallel_crud.py `
  --stories (Join-Path $out 'stories.keycloak_stage2.js') `
  --graph (Join-Path $out 'dependency_graph.json') --processes 2 --instances 8
if ($LASTEXITCODE -ne 0) { throw 'Topology audit failed' }
python -m openapi_to_sbt validate `
  --openapi '.\reference\keycloak-stage2-openapi.json' --generated $out `
  > (Join-Path $out 'validation.json')
if ($LASTEXITCODE -ne 0) { throw 'Static contract validation failed' }
"OUTPUT=$out"
```

Local checks: one regression test passed; 25 entity types, 39 dependency edges, 400 workers, 400 per-worker verifiers, 64 optional lookup verifiers; `node --check` on both generated JS files and static OpenAPI validation passed (413/413 **interface definitions**, not 413 successful HTTP calls).

**Live status: NOT_RUN.** This is a structural and static correction. No live HTTP request, 8-way overlap, Keycloak response, or oracle verdict is established. Before using a generated scenario as evidence, run a small isolated pilot and confirm actual create results and interval overlap; other nominally optional fields in the OpenAPI can still be required by the live server.
