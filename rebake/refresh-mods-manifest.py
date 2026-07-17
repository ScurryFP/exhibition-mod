#!/usr/bin/env python3
"""Scan mods/ + base-pack and write manifest.json + runtime-packs.js for the game."""

from __future__ import annotations

import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EP = ROOT / "exhibition-paperdoll"
MODS = EP / "mods"
MANIFEST = MODS / "manifest.json"
RUNTIME_PACKS = EP / "runtime-packs.js"
INTEGRATE = Path(__file__).resolve().parent / "integrate-exhibition-paperdoll.py"


def load_integrate():
	spec = importlib.util.spec_from_file_location("integrate_ep", INTEGRATE)
	if not spec or not spec.loader:
		raise RuntimeError(f"Cannot load {INTEGRATE}")
	# Provide rebake_target stubs so integrate imports cleanly when run standalone
	import sys
	import types

	if "rebake_target" not in sys.modules:
		stub = types.ModuleType("rebake_target")
		stub.ROOT = ROOT
		stub.HTML = ROOT / "CourseOfTemptation-Exhibition-appearance-dev.html"
		sys.modules["rebake_target"] = stub

	mod = importlib.util.module_from_spec(spec)
	spec.loader.exec_module(mod)
	return mod


def collect_packs() -> list[str]:
	if not MODS.is_dir():
		return []
	packs: list[str] = []
	for mod_dir in sorted(MODS.iterdir()):
		if not mod_dir.is_dir() or mod_dir.name.startswith("."):
			continue
		if (mod_dir / "pack.json").is_file():
			packs.append(mod_dir.name)
	return packs


def load_base_pack(integrate) -> dict | None:
	pack_path = EP / "base-pack" / "pack.json"
	if not pack_path.is_file():
		return None
	data = json.loads(pack_path.read_text(encoding="utf-8"))
	return integrate.normalize_pack_assets(data, "exhibition-paperdoll/base-pack")


def write_runtime_packs(payload: dict) -> None:
	text = (
		"/* Auto-generated — pack registry for local HTML games (do not edit by hand) */\n"
		"window.__exhibitionPaperdollRuntimePacks = "
		+ json.dumps(payload, separators=(",", ":"))
		+ ";\n"
	)
	RUNTIME_PACKS.write_text(text, encoding="utf-8")


def main() -> int:
	integrate = load_integrate()
	packs = collect_packs()
	(
		mods,
		base_overlays,
		skin_overlays,
		base_face_overlays,
		face_overlays,
		hair_overlays,
		makeup_overlays,
		body_writing_overlays,
		effect_overlays,
	) = integrate.load_mods()
	base_pack = load_base_pack(integrate)

	manifest = {
		"packs": packs,
		"updatedAt": datetime.now(timezone.utc).isoformat(),
	}
	MODS.mkdir(parents=True, exist_ok=True)
	MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

	runtime = {
		"updatedAt": manifest["updatedAt"],
		"basePack": base_pack,
		"mods": mods,
		"baseOverlays": base_overlays,
		"skinOverlays": skin_overlays,
		"baseFaceOverlays": base_face_overlays,
		"faceOverlays": face_overlays,
		"hairOverlays": hair_overlays,
		"makeupOverlays": makeup_overlays,
		"bodyWritingOverlays": body_writing_overlays,
		"effectOverlays": effect_overlays,
	}
	write_runtime_packs(runtime)

	print(f"Wrote {MANIFEST.relative_to(ROOT)} ({len(packs)} pack folder(s))")
	print(f"Wrote {RUNTIME_PACKS.relative_to(ROOT)} ({len(mods)} clothing mod(s))")
	print(f"  base face overlays: {len(base_face_overlays)}")
	print("Hard-refresh the game (Ctrl+Shift+R) to load changes.")
	return 0


if __name__ == "__main__":
	raise SystemExit(main())
