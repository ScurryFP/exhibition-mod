#!/usr/bin/env python3
"""Bake NPC exhibition-gated swimwear outfit picks into appearance-dev HTML."""

from __future__ import annotations

import re
from pathlib import Path

from rebake_target import HTML, ROOT

SRC = ROOT / "npc-exhibition-outfits"

JS_MARKER = "/* === NPC Exhibition outfit gating === */"

OUTFIT_PATCH_OLD = (
    "            if (calc_outfits)\n"
    "            {\n"
    "\n"
    "                if (exhib && swimwear)\n"
    "                    outfit = \"Bold Swimwear\";\n"
    "\n"
    "                else\n"
    "                {\n"
    "                    const filterOutfits = function(outfitlist, condition)\n"
)

OUTFIT_PATCH_NEW = (
    "            if (calc_outfits)\n"
    "            {\n"
    "                const _npcExhibCtx = (swimwear && setup.NpcExhibition && !this.is_pc && !this.temporary)\n"
    "                    ? {\n"
    "                        passage: V.lastlocpassage || V.location,\n"
    "                        loc: V.location,\n"
    "                        locblock: V.locationblock,\n"
    "                    }\n"
    "                    : null;\n"
    "\n"
    "                if (_npcExhibCtx)\n"
    "                {\n"
    "                    setup.NpcExhibition.ensure_clothing_exhib_level(this.person);\n"
    "                    outfitrelfreq = setup.NpcExhibition.filter_swimwear_pool(\n"
    "                        this, outfitrelfreq, _npcExhibCtx.passage, _npcExhibCtx.loc, _npcExhibCtx.locblock);\n"
    "                }\n"
    "\n"
    "                if (exhib && swimwear && _npcExhibCtx)\n"
    "                {\n"
    "                    outfit = setup.NpcExhibition.pick_swimwear_outfit(\n"
    "                        this, outfitrelfreq, true, rng,\n"
    "                        _npcExhibCtx.passage, _npcExhibCtx.loc, _npcExhibCtx.locblock);\n"
    "                }\n"
    "\n"
    "                else if (exhib && swimwear)\n"
    "                    outfit = \"Bold Swimwear\";\n"
    "\n"
    "                else\n"
    "                {\n"
    "                    const filterOutfits = function(outfitlist, condition)\n"
)

BUILD_PATCH_OLD = (
    "                let clothes = setup.build_outfit(this.gender, this.body_parts, outfit, rng, coloroverride, false, V.day, this.person);\n"
    "                if (debuggen) console.log(\"raw clothes\", [...clothes]);"
)

BUILD_PATCH_NEW = (
    "                let clothes = setup.build_outfit(this.gender, this.body_parts, outfit, rng, coloroverride, false, V.day, this.person);\n"
    "                if (swimwear && setup.NpcExhibition && !this.is_pc && !this.temporary)\n"
    "                {\n"
    "                    clothes = setup.NpcExhibition.clamp_built_swimwear(\n"
    "                        this, clothes, V.lastlocpassage || V.location, V.location, V.locationblock);\n"
    "                }\n"
    "                if (debuggen) console.log(\"raw clothes\", [...clothes]);"
)


def patch_js(text: str) -> str:
    ext = (SRC / "npc-exhibition-outfits.js").read_text(encoding="utf-8").strip()
    block = JS_MARKER + "\n" + ext + "\n"

    if JS_MARKER in text:
        text = re.sub(
            re.escape(JS_MARKER) + r"[\s\S]*?(?=\n</script><tw-passagedata pid=\"1\")",
            block.rstrip() + "\n",
            text,
            count=1,
        )
        return text

    anchor = "\n</script><tw-passagedata pid=\"1\""
    if anchor not in text:
        raise RuntimeError("script closing anchor not found for NPC exhibition JS")
    return text.replace(anchor, "\n" + block + anchor, 1)


def patch_outfit_logic(text: str) -> str:
    if "setup.NpcExhibition.ensure_clothing_exhib_level" in text:
        return text
    if OUTFIT_PATCH_OLD not in text:
        raise RuntimeError("NPC outfit calc_outfits anchor not found")
    return text.replace(OUTFIT_PATCH_OLD, OUTFIT_PATCH_NEW, 1)


def patch_build_outfit(text: str) -> str:
    if "setup.NpcExhibition.clamp_built_swimwear" in text:
        return text
    if BUILD_PATCH_OLD not in text:
        raise RuntimeError("build_outfit clamp anchor not found")
    return text.replace(BUILD_PATCH_OLD, BUILD_PATCH_NEW, 1)


def main() -> None:
    text = HTML.read_text(encoding="utf-8")
    text = patch_js(text)
    text = patch_outfit_logic(text)
    text = patch_build_outfit(text)
    HTML.write_text(text, encoding="utf-8")
    print(f"Patched NPC exhibition outfit gating into {HTML.name}")


if __name__ == "__main__":
    main()