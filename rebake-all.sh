#!/usr/bin/env bash
# Rebake all mod integrations into the game HTML (default: CourseOfTemptationtest.html).
# Modders: use ./rebake-dev.sh to target the dev working copy instead.
# Run: ./rebake-all.sh
#
# Fail-safe: backs up the HTML before starting and restores it if any step fails.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REBAKE_DIR="$ROOT/rebake"
cd "$ROOT"

# shellcheck source=rebake/rebake-common.sh
source "$REBAKE_DIR/rebake-common.sh"
rebake_enable_failsafe

run_step() {
	local script="$1"
	local label="$2"
	if [[ ! -x "$script" ]]; then
		chmod +x "$script"
	fi
	echo "=== $label ==="
	REBAKE_FAILED_STEP="$label"
	REBAKE_ORCHESTRATED=1 "$script"
	echo
}

run_step "$REBAKE_DIR/integrate-exhibition-paperdoll.sh" "Exhibition Paperdoll"
run_step "$REBAKE_DIR/integrate-exhibition-tanning.sh" "Exhibition tanning"
run_step "$REBAKE_DIR/integrate-university-mall.sh" "University Mall facilities"
run_step "$REBAKE_DIR/integrate-exhibition-sidebar.sh" "Exhibition sidebar"
run_step "$REBAKE_DIR/integrate-exhibition-wear-defaults.sh" "Exhibition wear defaults"
run_step "$REBAKE_DIR/integrate-npc-exhibition-outfits.sh" "NPC exhibition outfit gating"
run_step "$REBAKE_DIR/integrate-display-npc-appearance.sh" "DisplayNPC Appearance tab"
run_step "$REBAKE_DIR/integrate-university-lake.sh" "University lake beach"
run_step "$REBAKE_DIR/integrate-social-people-fix.sh" "Social People tab fix"

rebake_sanitize_html

echo "All rebakes finished."
rebake_success_message