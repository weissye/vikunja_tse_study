#!/usr/bin/env bash
set -euo pipefail

study_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
generator="$study_root/generator_baseline"
phase="$study_root/phase1"

python3 "$study_root/scripts/build_vikunja_core_projection.py" \
  --input "$study_root/vikunja-openapi-3.0.json" \
  --output "$phase/vikunja-core-openapi.json" \
  --manifest "$phase/projection-manifest.json"

cd "$generator"
python3 -m openapi_to_sbt inspect \
  --openapi "$phase/vikunja-core-openapi.json" \
  --report "$phase/core-inspect"

python3 -m openapi_to_sbt generate \
  --openapi "$phase/vikunja-core-openapi.json" \
  --output "$phase/core-generated" \
  --name vikunja \
  --base-url http://127.0.0.1:3457 \
  --seed 1 \
  --instances-per-entity 1 \
  --instances-per-action 1 \
  --force

python3 -m openapi_to_sbt validate \
  --openapi "$phase/vikunja-core-openapi.json" \
  --generated "$phase/core-generated" \
  > "$phase/core-validation.json"

echo "Generated and validated: $phase/core-generated"

