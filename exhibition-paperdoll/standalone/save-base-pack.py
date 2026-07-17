#!/usr/bin/env python3
"""Install an exported base-poses ZIP into exhibition-paperdoll/base-pack/."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / "base-pack"
STANDALONE = Path(__file__).resolve().parent


def install_zip(zip_path: Path) -> None:
    if not zip_path.is_file():
        raise FileNotFoundError(zip_path)

    with zipfile.ZipFile(zip_path) as zf:
        pack_entries = [n for n in zf.namelist() if n.endswith("pack.json") and not n.endswith("/")]
        if not pack_entries:
            raise RuntimeError("No pack.json found in ZIP")
        pack_rel = pack_entries[0]
        pack = json.loads(zf.read(pack_rel))
        if pack.get("type") not in (None, "base"):
            raise RuntimeError("ZIP is not a base-poses pack (type must be base)")

        prefix = pack_rel.rsplit("pack.json", 1)[0]
        staging = BASE.parent / ".base-pack-staging"
        if staging.exists():
            shutil.rmtree(staging)
        staging.mkdir(parents=True)

        for name in zf.namelist():
            if name.endswith("/"):
                continue
            if prefix and not name.startswith(prefix):
                continue
            rel = name[len(prefix) :] if prefix else name
            if not rel:
                continue
            target = staging / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(zf.read(name))

        if staging.exists():
            if BASE.exists():
                shutil.rmtree(BASE)
            shutil.move(str(staging), str(BASE))


def rebuild_editor_embed() -> None:
    embed = STANDALONE / "build-embed.py"
    if embed.is_file():
        print("=== Rebuilding standalone editor preview (base-embed.js) ===")
        subprocess.run([sys.executable, str(embed)], check=True, cwd=str(STANDALONE))


def main() -> None:
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <base-poses-pack.zip>", file=sys.stderr)
        print(f"Installs into: {BASE}/", file=sys.stderr)
        sys.exit(1)

    install_zip(Path(sys.argv[1]).resolve())
    print(f"Installed base poses to {BASE}/")
    rebuild_editor_embed()
    print("Done. Hard-refresh the game (Ctrl+Shift+R) to load new base poses.")
    print("No HTML rebake needed — base-pack loads at runtime.")


if __name__ == "__main__":
    main()