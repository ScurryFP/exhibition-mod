#!/usr/bin/env bash
# Rebake exhibition paperdoll JS + mod packs into the game HTML.
# Prefer running from project root: ./rebake-paperdoll.sh
set -euo pipefail
REBAKE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$REBAKE_DIR/.." && pwd)"
cd "$ROOT"
source "$REBAKE_DIR/rebake-common.sh"
rebake_maybe_enable_failsafe "${REBAKE_ORCHESTRATED:-}"
rebake_run_python "$REBAKE_DIR/integrate-exhibition-paperdoll.py"
rebake_success_message
