#!/usr/bin/env bash
set -euo pipefail

REBAKE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$REBAKE_DIR/.." && pwd)"
cd "$ROOT"

# shellcheck source=rebake-common.sh
source "$REBAKE_DIR/rebake-common.sh"
rebake_maybe_enable_failsafe "${REBAKE_ORCHESTRATED:-}"

rebake_run_python "$REBAKE_DIR/integrate-exhibition-wear-defaults.py"
rebake_success_message
