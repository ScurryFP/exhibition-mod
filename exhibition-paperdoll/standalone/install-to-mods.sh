#!/usr/bin/env bash
# Install a clothing/skin pack ZIP into mods/ (Falkon fallback when Save is unavailable).
# Run: ./exhibition-paperdoll/standalone/install-to-mods.sh path/to/pack.zip

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"

# shellcheck source=../../rebake/rebake-common.sh
source "$ROOT/rebake/rebake-common.sh"
rebake_run_python "$DIR/install-to-mods.py" "$@"