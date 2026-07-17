#!/usr/bin/env bash
# Rebuild base-embed.js from base-pack (standalone editor).
# Run: ./exhibition-paperdoll/standalone/build-embed.sh

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"

# shellcheck source=../../rebake/rebake-common.sh
source "$ROOT/rebake/rebake-common.sh"
rebake_run_python "$DIR/build-embed.py"