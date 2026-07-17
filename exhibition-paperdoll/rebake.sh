#!/usr/bin/env bash
# Rebake exhibition paperdoll into the game HTML.
# Run: ./exhibition-paperdoll/rebake.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec "$ROOT/rebake-paperdoll.sh"