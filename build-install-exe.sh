#!/usr/bin/env bash
# Build install.exe on Windows (run build-install-exe.bat there).
# On Linux this only builds a local install binary for testing.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ "$(uname -s)" == MINGW* ]] || [[ "$(uname -s)" == MSYS* ]] || [[ -n "${WINDIR:-}" ]]; then
	exec cmd.exe /c build-install-exe.bat
fi

# shellcheck source=rebake/rebake-common.sh
source "$ROOT/rebake/rebake-common.sh"
PY="$(rebake_find_python)"
"$PY" -m pip install --upgrade pyinstaller
"$PY" -m PyInstaller --onefile --console --name install --clean "$ROOT/install.py"
cp -f "$ROOT/dist/install" "$ROOT/install" 2>/dev/null || cp -f "$ROOT/dist/install.exe" "$ROOT/install.exe" 2>/dev/null || true
echo "Built dist/install (Linux test binary)."
echo "For Windows players, run build-install-exe.bat on a Windows PC to create install.exe."