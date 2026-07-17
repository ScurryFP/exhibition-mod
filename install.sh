#!/usr/bin/env bash
# Exhibition mod one-click installer (Linux / macOS).
# Unzip the mod into your game folder, then run: ./install.sh
#
# Installs all mod changes into your game HTML and sets up the Paperdoll editor.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# shellcheck source=rebake/rebake-common.sh
source "$ROOT/rebake/rebake-common.sh"

PY="$(rebake_find_python || true)"
if [[ -z "$PY" ]]; then
	echo "ERROR: python3 not found." >&2
	echo "Install Python 3, then run this script again." >&2
	exit 1
fi

exec "$PY" "$ROOT/install.py" "$@"