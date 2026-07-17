#!/usr/bin/env bash
# Rebake all mods into the modder working copy (dev HTML only).
# Run: ./rebake-dev.sh
#
# Normal players should use ./install-exhibition-mod.sh instead.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# shellcheck source=rebake/rebake-common.sh
source "$ROOT/rebake/rebake-common.sh"

DEV="$REBAKE_ROOT/$REBAKE_DEV_HTML_NAME"
if [[ ! -f "$DEV" ]]; then
	echo "ERROR: Dev HTML not found: $DEV" >&2
	echo "Keep your modding copy as $REBAKE_DEV_HTML_NAME in the project root." >&2
	exit 1
fi

export REBAKE_HTML="$DEV"
echo "Rebaking into modder copy: $(basename "$DEV")…"
echo

exec "$ROOT/rebake-all.sh"