#!/usr/bin/env bash
# Build scrubbed open-source Alpha archives (no personal game HTML / drafts).
# Run from project root: ./prepare-opensource-release.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$ROOT/dist"
STAGING="$OUT_DIR/exhibition-mod-src"
VERSION="$(tr -d '[:space:]' < "$ROOT/VERSION" 2>/dev/null || echo "0.1.0-alpha.1")"
ARCHIVE_ZIP="$OUT_DIR/exhibition-mod-${VERSION}.zip"
ARCHIVE_TGZ="$OUT_DIR/exhibition-mod-${VERSION}.tar.gz"

INCLUDE_DIRS=(
	exhibition-paperdoll
	exhibition-sidebar
	exhibition-tanning
	exhibition-wear-defaults
	display-npc-appearance
	npc-exhibition-outfits
	university-lake
	university-mall
	lake-beach-npcs
	lake-tanning
	social-people-fix
	paperdoll-npc-subject
	rebake
)

INCLUDE_FILES=(
	LICENSE
	README.md
	THIRD_PARTY.md
	VERSION
	.gitignore
	install.py
	install.sh
	install.bat
	uninstall.py
	uninstall.sh
	uninstall.bat
	"Uninstall Exhibition Mod.desktop"
	build-install-exe.sh
	build-install-exe.bat
	rebake-all.sh
	rebake-dev.sh
	rebake-paperdoll.sh
	refresh-mods-manifest.sh
	install-exhibition-mod.sh
	prepare-opensource-release.sh
	CourseOfTemptation-Exhibition-installer.html
)

echo "Exhibition Mod release packager"
echo "  Version: $VERSION"
echo "  Staging: $STAGING"
echo ""

rm -rf "$STAGING"
mkdir -p "$STAGING"

copy_tree() {
	local src="$1"
	local dest="$2"
	mkdir -p "$dest"
	if command -v rsync >/dev/null 2>&1; then
		rsync -a \
			--exclude '__pycache__' \
			--exclude '*.pyc' \
			--exclude '.base-pack-staging' \
			--exclude '.git' \
			"$src/" "$dest/"
	else
		cp -a "$src/." "$dest/"
		find "$dest" -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	fi
}

for dir in "${INCLUDE_DIRS[@]}"; do
	if [[ -d "$ROOT/$dir" ]]; then
		echo "  + $dir/"
		copy_tree "$ROOT/$dir" "$STAGING/$dir"
	else
		echo "  ! skip missing $dir/"
	fi
done

for file in "${INCLUDE_FILES[@]}"; do
	if [[ -f "$ROOT/$file" ]]; then
		echo "  + $file"
		cp -a "$ROOT/$file" "$STAGING/$file"
	else
		echo "  ! skip missing $file"
	fi
done

# Never ship personal game HTML if something slipped in
find "$STAGING" -type f \( -name 'CourseOfTemptation*.html' ! -name 'CourseOfTemptation-Exhibition-installer.html' \) -delete 2>/dev/null || true

# Soften machine-specific path examples in pack-io
if [[ -f "$STAGING/exhibition-paperdoll/standalone/pack-io.js" ]]; then
	sed -i 's|course-of-temptation-desktop8.0|your-game-folder|g' \
		"$STAGING/exhibition-paperdoll/standalone/pack-io.js" 2>/dev/null || \
	sed -i '' 's|course-of-temptation-desktop8.0|your-game-folder|g' \
		"$STAGING/exhibition-paperdoll/standalone/pack-io.js" 2>/dev/null || true
fi

# Write release stamp
{
	echo "Exhibition Mod $VERSION"
	echo "Built: $(date -u +%Y-%m-%dT%H:%MZ)"
	echo "Contents: open-source mod sources + install scripts (no base game HTML)."
} > "$STAGING/RELEASE.txt"

chmod +x "$STAGING"/install.sh "$STAGING"/uninstall.sh "$STAGING"/uninstall.py \
	"$STAGING"/rebake-*.sh "$STAGING"/refresh-mods-manifest.sh \
	"$STAGING"/install-exhibition-mod.sh "$STAGING"/prepare-opensource-release.sh \
	"$STAGING"/build-install-exe.sh 2>/dev/null || true
# Desktop launcher: allow execute bit for file managers that require it
chmod +x "$STAGING"/"Uninstall Exhibition Mod.desktop" 2>/dev/null || true

mkdir -p "$OUT_DIR"
rm -f "$ARCHIVE_ZIP" "$ARCHIVE_TGZ"
# keep legacy names as copies for older docs
rm -f "$OUT_DIR/exhibition-mod-opensource.zip" "$OUT_DIR/exhibition-mod-opensource.tar.gz"

CREATED=0

if command -v tar >/dev/null 2>&1; then
	tar -czf "$ARCHIVE_TGZ" -C "$OUT_DIR" "$(basename "$STAGING")"
	cp -f "$ARCHIVE_TGZ" "$OUT_DIR/exhibition-mod-opensource.tar.gz"
	echo "Created: $ARCHIVE_TGZ"
	CREATED=$((CREATED + 1))
fi

create_zip() {
	if command -v zip >/dev/null 2>&1; then
		(cd "$OUT_DIR" && zip -rq "$(basename "$ARCHIVE_ZIP")" "$(basename "$STAGING")")
		return 0
	fi
	if command -v python3 >/dev/null 2>&1; then
		python3 - "$OUT_DIR" "$(basename "$STAGING")" "$ARCHIVE_ZIP" <<'PY'
import sys, zipfile
from pathlib import Path
out_dir = Path(sys.argv[1])
folder = out_dir / sys.argv[2]
archive = Path(sys.argv[3])
with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as zf:
    for path in sorted(folder.rglob("*")):
        if path.is_file():
            zf.write(path, path.relative_to(out_dir))
PY
		return 0
	fi
	return 1
}

if create_zip; then
	cp -f "$ARCHIVE_ZIP" "$OUT_DIR/exhibition-mod-opensource.zip"
	echo "Created: $ARCHIVE_ZIP"
	CREATED=$((CREATED + 1))
fi

if [[ $CREATED -eq 0 ]]; then
	echo "WARNING: no archives created — staged folder at $STAGING" >&2
	exit 1
fi

echo ""
echo "Done. Ship either archive; players unzip into their CoT game folder and run install.sh / install.bat."
echo "Git: init a repo from the project root (or from dist/exhibition-mod-src) and push to your host."
echo "Excluded: personal game HTML, backups, draft folders, PaperDoll third-party dumps."
