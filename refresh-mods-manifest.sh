#!/usr/bin/env bash
# Refresh mods/manifest.json + runtime-packs.js after adding/removing packs.
# No game HTML rebake required — hard-refresh the game to load new packs.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=rebake/rebake-common.sh
source "$ROOT/rebake/rebake-common.sh"
rebake_run_python "$ROOT/rebake/refresh-mods-manifest.py"