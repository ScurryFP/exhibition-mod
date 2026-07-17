#!/usr/bin/env bash
# Install an exported pack ZIP and rebake the full game HTML.
# Run: ./exhibition-paperdoll/standalone/save-to-game.sh path/to/pack.zip

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"

# shellcheck source=../../rebake/rebake-common.sh
source "$ROOT/rebake/rebake-common.sh"

if [[ $# -lt 1 ]]; then
	echo "Usage: $0 <asset-pack.zip>" >&2
	echo "Installs into exhibition-paperdoll/mods/ or base-pack/, then rebakes your dev HTML." >&2
	exit 1
fi

ZIP="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
if [[ ! -f "$ZIP" ]]; then
	echo "ERROR: ZIP not found: $ZIP" >&2
	exit 1
fi

PY="$(rebake_find_python)"
PACK_TYPE="clothing"
if [[ -n "$PY" ]]; then
	PACK_TYPE="$("$PY" -c "
import json, zipfile, sys
with zipfile.ZipFile(sys.argv[1]) as zf:
    name = next(n for n in zf.namelist() if n.endswith('pack.json'))
    print(json.loads(zf.read(name)).get('type', 'clothing'))
" "$ZIP" 2>/dev/null || echo clothing)"
fi

if [[ "$PACK_TYPE" == "base" ]]; then
	rebake_run_python "$DIR/save-base-pack.py" "$ZIP"
else
	rebake_run_python "$DIR/install-to-mods.py" "$ZIP"
fi