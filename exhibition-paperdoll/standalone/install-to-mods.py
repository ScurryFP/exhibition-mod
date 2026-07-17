#!/usr/bin/env python3
"""Install an exported asset-pack ZIP into exhibition-paperdoll/mods/."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GAME_ROOT = ROOT.parent
MODS = ROOT / "mods"
REFRESH_MANIFEST = GAME_ROOT / "rebake" / "refresh-mods-manifest.py"
REBAKE_DEV = GAME_ROOT / "rebake-dev.sh"


def install_zip(zip_path: Path) -> Path:
    if not zip_path.is_file():
        raise FileNotFoundError(zip_path)

    with zipfile.ZipFile(zip_path) as zf:
        pack_entries = [n for n in zf.namelist() if n.endswith("pack.json") and not n.endswith("/")]
        if not pack_entries:
            raise RuntimeError("No pack.json found in ZIP")
        pack_rel = pack_entries[0]
        pack = json.loads(zf.read(pack_rel))
        mod_slug = pack.get("id") or pack_rel.split("/")[0]
        if not mod_slug:
            raise RuntimeError("Could not determine mod folder name from pack.json")

        dest = MODS / mod_slug
        if dest.exists():
            shutil.rmtree(dest)
        dest.mkdir(parents=True, exist_ok=True)

        prefix = pack_rel.rsplit("pack.json", 1)[0]
        for name in zf.namelist():
            if name.endswith("/"):
                continue
            if prefix and not name.startswith(prefix):
                continue
            rel = name[len(prefix) :] if prefix else name
            if not rel or rel == "pack.json":
                target = dest / "pack.json"
            else:
                target = dest / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(zf.read(name))

    return dest


def refresh_manifest() -> None:
    if not REFRESH_MANIFEST.is_file():
        print(f"WARNING: {REFRESH_MANIFEST} not found — skip manifest refresh.", file=sys.stderr)
        return
    print("=== Refreshing mods/manifest.json ===")
    subprocess.run([sys.executable, str(REFRESH_MANIFEST)], check=True, cwd=str(GAME_ROOT))


def maybe_rebake_base() -> None:
    if not REBAKE_DEV.is_file():
        return
    print("=== Rebaking game HTML (base poses changed) ===")
    subprocess.run(["bash", str(REBAKE_DEV)], check=True, cwd=str(GAME_ROOT))


def main() -> None:
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <asset-pack.zip>", file=sys.stderr)
        print(f"Installs into: {MODS}/<pack-id>/", file=sys.stderr)
        sys.exit(1)

    zip_path = Path(sys.argv[1]).resolve()
    with zipfile.ZipFile(zip_path) as zf:
        pack_entries = [n for n in zf.namelist() if n.endswith("pack.json") and not n.endswith("/")]
        pack = json.loads(zf.read(pack_entries[0]))
        pack_type = pack.get("type", "clothing")

    dest = install_zip(zip_path)
    print(f"Installed to {dest}")

    if pack_type == "base":
        maybe_rebake_base()
    else:
        refresh_manifest()
        print("Done. Hard-refresh the game (Ctrl+Shift+R) to load the new clothing pack.")
        print("No HTML rebake needed — packs load from exhibition-paperdoll/mods/ at runtime.")


if __name__ == "__main__":
    main()