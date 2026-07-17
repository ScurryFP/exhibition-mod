#!/usr/bin/env bash
# Exhibition mod one-click uninstaller (Linux / macOS).
# Double-click this file, or run: ./uninstall.sh
#   ./uninstall.sh -y          # no confirm (keep folders)
#   ./uninstall.sh -y --purge  # silent full clean
#   ./uninstall.sh --cli       # force terminal prompts

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

PY=""
if command -v python3 >/dev/null 2>&1; then
	PY=python3
elif command -v python >/dev/null 2>&1; then
	PY=python
fi

if [[ -z "$PY" ]]; then
	# Still try a GUI error if possible
	if command -v zenity >/dev/null 2>&1; then
		zenity --error --title="Uninstall failed" --text="Python 3 not found.\nInstall Python 3, then run uninstall again." --width=400
	elif command -v kdialog >/dev/null 2>&1; then
		kdialog --error "Python 3 not found. Install Python 3, then run uninstall again."
	else
		echo "ERROR: python3 not found." >&2
		echo "Install Python 3, then run this script again." >&2
	fi
	exit 1
fi

# When double-clicked from a file manager, stdin is often not a TTY.
# Popups (zenity / tkinter) still work; no terminal interaction needed.
exec "$PY" "$ROOT/uninstall.py" "$@"
