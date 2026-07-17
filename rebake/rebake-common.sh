# Shared fail-safe helpers for rebake scripts.
# Source from rebake-all.sh or individual integrate-*.sh scripts in rebake/.

: "${REBAKE_SCRIPT_DIR:=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
: "${REBAKE_ROOT:=$(cd "$REBAKE_SCRIPT_DIR/.." && pwd)}"
REBAKE_GAME_HTML_NAME="${REBAKE_GAME_HTML_NAME:-CourseOfTemptationtest.html}"
REBAKE_DEV_HTML_NAME="${REBAKE_DEV_HTML_NAME:-CourseOfTemptation-Exhibition-appearance-dev.html}"
REBAKE_HTML="${REBAKE_HTML:-$REBAKE_ROOT/$REBAKE_GAME_HTML_NAME}"
REBAKE_BACKUP_DIR="${REBAKE_BACKUP_DIR:-$REBAKE_ROOT/backup}"
REBAKE_BACKUP_FILE="$REBAKE_BACKUP_DIR/$(basename "$REBAKE_HTML" .html).rebake-backup.html"
export REBAKE_HTML

rebake_ensure_backup_dir() {
	mkdir -p "$REBAKE_BACKUP_DIR"
}

rebake_sanitize_html() {
	local py
	py="$(rebake_find_python || true)"
	if [[ -z "$py" ]]; then
		return 0
	fi
	if [[ ! -f "$REBAKE_SCRIPT_DIR/rebake-sanitize-html.py" ]]; then
		return 0
	fi
	"$py" "$REBAKE_SCRIPT_DIR/rebake-sanitize-html.py" "$REBAKE_HTML"
}

rebake_create_backup() {
	rebake_ensure_backup_dir
	if [[ ! -f "$REBAKE_HTML" ]]; then
		echo "ERROR: HTML not found: $REBAKE_HTML" >&2
		return 1
	fi
	rebake_sanitize_html
	cp -f "$REBAKE_HTML" "$REBAKE_BACKUP_FILE"
	echo "Fail-safe backup: $REBAKE_BACKUP_FILE"
}

rebake_restore_backup() {
	if [[ -f "$REBAKE_BACKUP_FILE" ]]; then
		cp -f "$REBAKE_BACKUP_FILE" "$REBAKE_HTML"
		echo "Restored $REBAKE_HTML from fail-safe backup."
	else
		echo "WARNING: No backup at $REBAKE_BACKUP_FILE — cannot restore." >&2
	fi
}

rebake_remove_backup() {
	rm -f "$REBAKE_BACKUP_FILE"
}

rebake_on_exit() {
	local exit_code=$?
	if [[ "${REBAKE_FAILSAFE_ACTIVE:-0}" != "1" ]]; then
		return 0
	fi
	trap - EXIT
	if [[ $exit_code -ne 0 ]]; then
		echo >&2
		echo "=== REBAKE FAILED (exit $exit_code) ===" >&2
		if [[ -n "${REBAKE_FAILED_STEP:-}" ]]; then
			echo "Failed step: $REBAKE_FAILED_STEP" >&2
		fi
		rebake_restore_backup >&2
		echo "Backup kept at: $REBAKE_BACKUP_FILE" >&2
		exit "$exit_code"
	fi
	rebake_remove_backup
}

rebake_enable_failsafe() {
	REBAKE_FAILSAFE_ACTIVE=1
	rebake_create_backup || exit 1
	trap rebake_on_exit EXIT
}

# Skip per-script backup when rebake-all.sh is orchestrating (parent owns backup).
rebake_maybe_enable_failsafe() {
	if [[ -n "${1:-}" ]]; then
		return 0
	fi
	rebake_enable_failsafe
}

rebake_find_python() {
	local candidate
	for candidate in python3 /usr/bin/python3 /usr/local/bin/python3; do
		if command -v "$candidate" >/dev/null 2>&1; then
			if "$candidate" -c 'import sys; sys.exit(0)' >/dev/null 2>&1; then
				echo "$candidate"
				return 0
			fi
		fi
	done
	return 1
}

rebake_run_python() {
	local script="$1"
	local py
	py="$(rebake_find_python || true)"
	if [[ -z "$py" ]]; then
		echo "ERROR: python3 not found." >&2
		echo "Install Python 3 or ensure /usr/bin/python3 exists, then run this script again." >&2
		exit 1
	fi
	if [[ ! -f "$script" ]]; then
		echo "ERROR: missing $script" >&2
		exit 1
	fi
	export REBAKE_HTML
	"$py" "$script"
}

rebake_success_message() {
	echo "Done. Open $(basename "$REBAKE_HTML") and hard-refresh (Ctrl+Shift+R)."
}