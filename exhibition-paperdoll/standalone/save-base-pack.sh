#!/usr/bin/env bash
# Save base-poses pack from editor export (Falkon fallback).
# Run: ./exhibition-paperdoll/standalone/save-base-pack.sh path/to/export.zip

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"

# shellcheck source=../../rebake/rebake-common.sh
source "$ROOT/rebake/rebake-common.sh"
rebake_run_python "$DIR/save-base-pack.py" "$@"