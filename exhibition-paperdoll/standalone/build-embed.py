#!/usr/bin/env python3
"""Bake base-pack into base-embed.js so the editor works opened as local HTML (file://)."""

from __future__ import annotations

import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / "base-pack"
OUT = Path(__file__).resolve().parent / "base-embed.js"


def main() -> None:
    pack = json.loads((BASE / "pack.json").read_text(encoding="utf-8"))
    images: dict[str, str] = {}

    for layer in pack.get("layers") or []:
        for pose_def in (layer.get("poses") or {}).values():
            sources = pose_def.get("sources") or {}
            if pose_def.get("asset"):
                sources.setdefault("256", pose_def["asset"])
            for path in sources.values():
                if not path or path in images:
                    continue
                rel = path
                if rel.startswith("base-pack/"):
                    file_path = ROOT / rel
                else:
                    file_path = BASE / rel.replace("base-pack/", "", 1)
                if not file_path.is_file():
                    continue
                mime = "image/png" if file_path.suffix.lower() == ".png" else "image/jpeg"
                b64 = base64.b64encode(file_path.read_bytes()).decode("ascii")
                images[path] = f"data:{mime};base64,{b64}"
                images["base-pack/" + rel.split("base-pack/", 1)[-1]] = images[path]

    payload = {"pack": pack, "images": images}
    OUT.write_text(
        "/* Auto-generated — offline base doll preview for the standalone editor */\n"
        "window.__exhibitionEditorBaseEmbed = "
        + json.dumps(payload, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUT.name} ({OUT.stat().st_size / 1024:.1f} KB, {len(images)} images)")


if __name__ == "__main__":
    main()