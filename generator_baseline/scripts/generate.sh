#!/usr/bin/env bash
# Thin wrapper around `python -m openapi_to_sbt`. Forwards all arguments.
# Usage: ./scripts/generate.sh --openapi PATH --output DIR --name NAME --base-url URL --seed 1
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."
PYTHON_BIN="${PYTHON_BIN:-python3}"
exec "$PYTHON_BIN" -m openapi_to_sbt generate "$@"
