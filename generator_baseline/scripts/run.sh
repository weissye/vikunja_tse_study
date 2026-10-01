#!/usr/bin/env bash
# Generic wrapper: ./scripts/run.sh <generate|inspect|validate|compare-reference> ...args
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."
PYTHON_BIN="${PYTHON_BIN:-python3}"
exec "$PYTHON_BIN" -m openapi_to_sbt "$@"
