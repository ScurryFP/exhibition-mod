#!/usr/bin/env bash
# Rebake exhibition paperdoll runtime into the game HTML (see rebake/rebake-common.sh).
# Run from project root: ./rebake-paperdoll.sh
#
# (Uses python3 internally — you only need to run this .sh file.)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$ROOT/rebake/integrate-exhibition-paperdoll.sh"

if [[ ! -f "$SCRIPT" ]]; then
	echo "ERROR: missing $SCRIPT" >&2
	exit 1
fi

chmod +x "$SCRIPT"
exec "$SCRIPT"