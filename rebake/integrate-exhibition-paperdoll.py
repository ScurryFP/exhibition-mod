#!/usr/bin/env python3
"""Bake Exhibition Paperdoll engine into appearance-dev HTML (replaces CoT-Paperdoll)."""

from __future__ import annotations

import json
import re
from pathlib import Path

from rebake_target import HTML, ROOT

EP = ROOT / "exhibition-paperdoll"

MARKER = "/* === Exhibition Paperdoll Engine === */"

JS_ORDER = [
    "core/transforms.js",
    "core/masks.js",
    "core/poses.js",
    "core/body-variants.js",
    "core/lod.js",
    "core/loader.js",
    "core/tint.js",
    "core/composer.js",
    "core/backgrounds.js",
    "core/mod-registry.js",
    "runtime/cot-mapper.js",
    "runtime/clothing-flags.js",
    "runtime/overlay-mapper.js",
    "runtime/index.js",
    "runtime/base-faces.js",
    "runtime/face-picker.js",
    "runtime/face-mirror.js",
]

TWEE_FILES = [
    EP / "twee/panel.twee",
    EP / "twee/mirror.twee",
    EP / "twee/face-picker.twee",
    EP / "twee/face-dialog.twee",
]

FACE_PICKER_CSS_MARKER = "/* === Exhibition Face Picker CSS === */"


def build_asset_manifest() -> list[str]:
    paths: list[str] = []
    for base in [EP / "base-pack", EP / "mods"]:
        if not base.exists():
            continue
        for p in sorted(base.rglob("*")):
            if p.suffix.lower() in (".png", ".webp", ".jpg", ".jpeg"):
                paths.append(p.relative_to(ROOT).as_posix())
    return paths


def prefix_asset_path(path: str, prefix: str) -> str:
    if not path or path.startswith("exhibition-paperdoll/"):
        return path
    if path.startswith("base-pack/") or path.startswith("mods/"):
        return "exhibition-paperdoll/" + path
    return prefix + "/" + path.lstrip("/")


def normalize_pose_sources(pose_def: dict, prefix: str) -> dict:
    if not isinstance(pose_def, dict):
        return pose_def
    out = dict(pose_def)
    if "asset" in out:
        out["asset"] = prefix_asset_path(out["asset"], prefix)
    if isinstance(out.get("sources"), dict):
        out["sources"] = {
            str(tier): prefix_asset_path(src, prefix)
            for tier, src in out["sources"].items()
            if src
        }
    if isinstance(out.get("colorMask"), dict):
        out["colorMask"] = {
            str(tier): prefix_asset_path(src, prefix)
            for tier, src in out["colorMask"].items()
            if src
        }
    if isinstance(out.get("displacements"), dict):
        displacements = {}
        for disp_id, disp in out["displacements"].items():
            if not isinstance(disp, dict):
                continue
            entry = dict(disp)
            for kind in ("mask", "depth", "sources"):
                if isinstance(entry.get(kind), dict):
                    entry[kind] = {
                        str(tier): prefix_asset_path(src, prefix)
                        for tier, src in entry[kind].items()
                        if src
                    }
            displacements[disp_id] = entry
        out["displacements"] = displacements
    return out


def normalize_pack_assets(pack: dict, prefix: str) -> dict:
    pack = dict(pack)
    for layer in pack.get("layers") or []:
        if not isinstance(layer, dict):
            continue
        poses = layer.get("poses") or {}
        layer["poses"] = {
            pose_id: normalize_pose_sources(pose_def, prefix)
            for pose_id, pose_def in poses.items()
        }
    overlays = pack.get("overlays") or []
    normalized_overlays = []
    for ov in overlays:
        if not isinstance(ov, dict):
            continue
        ov = dict(ov)
        poses = ov.get("poses") or {}
        ov["poses"] = {
            pose_id: normalize_pose_sources(pose_def, prefix)
            for pose_id, pose_def in poses.items()
        }
        normalized_overlays.append(ov)
    if normalized_overlays:
        pack["overlays"] = normalized_overlays
    normalized_items = []
    for item in pack.get("items") or []:
        if not isinstance(item, dict):
            continue
        item = dict(item)
        poses = item.get("poses") or {}
        item["poses"] = {
            pose_id: normalize_pose_sources(pose_def, prefix)
            for pose_id, pose_def in poses.items()
        }
        normalized_items.append(item)
    if normalized_items:
        pack["items"] = normalized_items
    return pack


def load_mods() -> tuple[
    list[dict],
    list[dict],
    list[dict],
    list[dict],
    list[dict],
    list[dict],
    list[dict],
    list[dict],
    list[dict],
]:
    mods: list[dict] = []
    base_overlays: list[dict] = []
    skin_overlays: list[dict] = []
    base_face_overlays: list[dict] = []
    face_overlays: list[dict] = []
    hair_overlays: list[dict] = []
    makeup_overlays: list[dict] = []
    body_writing_overlays: list[dict] = []
    effect_overlays: list[dict] = []
    mods_dir = EP / "mods"
    if not mods_dir.is_dir():
        return (
            mods,
            base_overlays,
            skin_overlays,
            base_face_overlays,
            face_overlays,
            hair_overlays,
            makeup_overlays,
            body_writing_overlays,
            effect_overlays,
        )
    for mod_dir in sorted(mods_dir.iterdir()):
        if not mod_dir.is_dir():
            continue
        pack_path = mod_dir / "pack.json"
        if not pack_path.is_file():
            continue
        try:
            data = json.loads(pack_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict) and data.get("enabled") is False:
            continue
        # Asset paths must be under exhibition-paperdoll/ for the game loader
        folder_prefix = "mods/" + mod_dir.name
        prefix = "exhibition-paperdoll/" + folder_prefix
        if isinstance(data, dict) and data.get("type") == "base-overlay":
            entry = normalize_pack_assets(data, prefix)
            entry["prefix"] = folder_prefix
            base_overlays.append(entry)
            continue
        if isinstance(data, dict) and data.get("type") == "skin-overlay":
            entry = normalize_pack_assets(data, prefix)
            entry["prefix"] = folder_prefix
            skin_overlays.append(entry)
            continue
        if isinstance(data, dict) and data.get("type") == "base-face-overlay":
            entry = normalize_pack_assets(data, prefix)
            entry["prefix"] = folder_prefix
            base_face_overlays.append(entry)
            continue
        if isinstance(data, dict) and data.get("type") == "face-overlay":
            entry = normalize_pack_assets(data, prefix)
            entry["prefix"] = folder_prefix
            face_overlays.append(entry)
            continue
        if isinstance(data, dict) and data.get("type") == "hair-overlay":
            entry = normalize_pack_assets(data, prefix)
            entry["prefix"] = folder_prefix
            hair_overlays.append(entry)
            continue
        if isinstance(data, dict) and data.get("type") == "makeup-overlay":
            entry = normalize_pack_assets(data, prefix)
            entry["prefix"] = folder_prefix
            makeup_overlays.append(entry)
            continue
        if isinstance(data, dict) and data.get("type") == "body-writing-overlay":
            entry = normalize_pack_assets(data, prefix)
            entry["prefix"] = folder_prefix
            body_writing_overlays.append(entry)
            continue
        if isinstance(data, dict) and data.get("type") == "effect-overlay":
            entry = normalize_pack_assets(data, prefix)
            entry["prefix"] = folder_prefix
            effect_overlays.append(entry)
            continue
        if isinstance(data, dict) and data.get("type") == "appearance":
            pack_id = data.get("id", mod_dir.name)
            clothing = data.get("clothing") or {}
            skin = data.get("skinOverlay") or data.get("skin-overlay") or {}
            base_face = data.get("baseFaceOverlay") or data.get("base-face-overlay") or {}
            face = data.get("faceOverlay") or data.get("face-overlay") or {}
            hair = data.get("hairOverlay") or data.get("hair-overlay") or {}
            makeup = data.get("makeupOverlay") or data.get("makeup-overlay") or {}
            body_writing = data.get("bodyWritingOverlay") or data.get("body-writing-overlay") or {}
            effect = data.get("effectOverlay") or data.get("effect-overlay") or {}
            if clothing.get("items"):
                norm = normalize_pack_assets({"items": clothing["items"]}, prefix)
                mods.append({"id": pack_id, "prefix": folder_prefix, "items": norm["items"]})
            if skin.get("items"):
                entry = normalize_pack_assets(
                    {"id": pack_id, "type": "skin-overlay", "items": skin["items"]},
                    prefix,
                )
                entry["prefix"] = folder_prefix
                skin_overlays.append(entry)
            if base_face.get("items"):
                entry = normalize_pack_assets(
                    {"id": pack_id, "type": "base-face-overlay", "items": base_face["items"]},
                    prefix,
                )
                entry["prefix"] = folder_prefix
                base_face_overlays.append(entry)
            if face.get("items"):
                entry = normalize_pack_assets(
                    {"id": pack_id, "type": "face-overlay", "items": face["items"]},
                    prefix,
                )
                entry["prefix"] = folder_prefix
                face_overlays.append(entry)
            if hair.get("items"):
                entry = normalize_pack_assets(
                    {"id": pack_id, "type": "hair-overlay", "items": hair["items"]},
                    prefix,
                )
                entry["prefix"] = folder_prefix
                hair_overlays.append(entry)
            if makeup.get("items"):
                entry = normalize_pack_assets(
                    {"id": pack_id, "type": "makeup-overlay", "items": makeup["items"]},
                    prefix,
                )
                entry["prefix"] = folder_prefix
                makeup_overlays.append(entry)
            if body_writing.get("items"):
                entry = normalize_pack_assets(
                    {"id": pack_id, "type": "body-writing-overlay", "items": body_writing["items"]},
                    prefix,
                )
                entry["prefix"] = folder_prefix
                body_writing_overlays.append(entry)
            if effect.get("items"):
                entry = normalize_pack_assets(
                    {"id": pack_id, "type": "effect-overlay", "items": effect["items"]},
                    prefix,
                )
                entry["prefix"] = folder_prefix
                if effect.get("effect"):
                    entry["effect"] = effect["effect"]
                effect_overlays.append(entry)
            continue
        if isinstance(data, dict) and "items" in data:
            norm = normalize_pack_assets({"items": data["items"]}, prefix)
            mods.append({"id": data.get("id", mod_dir.name), "prefix": folder_prefix, "items": norm["items"]})
        elif isinstance(data, list):
            mods.append({"id": mod_dir.name, "prefix": folder_prefix, "items": data})
        else:
            mods.append({"id": mod_dir.name, "prefix": folder_prefix, "items": [normalize_pack_assets(data, prefix)]})
    return (
        mods,
        base_overlays,
        skin_overlays,
        base_face_overlays,
        face_overlays,
        hair_overlays,
        makeup_overlays,
        body_writing_overlays,
        effect_overlays,
    )


def build_standalone_js(
    manifest: list[str],
    base_pack: dict,
    mods: list[dict],
    base_overlays: list[dict],
    skin_overlays: list[dict],
    base_face_overlays: list[dict],
    face_overlays: list[dict],
    hair_overlays: list[dict],
    makeup_overlays: list[dict],
    body_writing_overlays: list[dict],
    effect_overlays: list[dict],
) -> str:
    parts: list[str] = [MARKER, ""]  # MARKER included in injected output
    for rel in JS_ORDER:
        text = (EP / rel).read_text(encoding="utf-8").strip()
        parts.append(f"// --- {rel} ---\n{text}\n")

    parts.append(
        "window.__exhibitionPaperdollBasePack = %s;\n"
        "window.__exhibitionPaperdollMods = %s;\n"
        "window.__exhibitionPaperdollBaseOverlays = %s;\n"
        "window.__exhibitionPaperdollSkinOverlays = %s;\n"
        "window.__exhibitionPaperdollBaseFaceOverlays = %s;\n"
        "window.__exhibitionPaperdollFaceOverlays = %s;\n"
        "window.__exhibitionPaperdollHairOverlays = %s;\n"
        "window.__exhibitionPaperdollMakeupOverlays = %s;\n"
        "window.__exhibitionPaperdollBodyWritingOverlays = %s;\n"
        "window.__exhibitionPaperdollEffectOverlays = %s;\n"
        "window.__exhibitionPaperdollManifest = %s;\n"
        % (
            json.dumps(base_pack),
            json.dumps(mods),
            json.dumps(base_overlays),
            json.dumps(skin_overlays),
            json.dumps(base_face_overlays),
            json.dumps(face_overlays),
            json.dumps(hair_overlays),
            json.dumps(makeup_overlays),
            json.dumps(body_writing_overlays),
            json.dumps(effect_overlays),
            json.dumps(manifest),
        )
    )

    parts.append(
        """
// Sidebar macro fallback if widget passages fail to load
(function () {
    function appendPanel(output) {
        if (typeof V !== "undefined") {
            if (typeof V.optpaperdollopen === "undefined") V.optpaperdollopen = false;
            if (typeof V.optpaperdollview === "undefined") V.optpaperdollview = "front";
        }
        const $out = jQuery(output);
        $out.append(
            '<div class="paperdoll-panel exhib-paperdoll-panel">' +
                '<div class="paperdoll-panel-bar">' +
                    '<button type="button" class="paperdoll-panel-toggle" onclick="setup.ExhibitionPaperdoll.togglePanel()">' +
                        '<span class="paperdoll-panel-chevron">▶</span> Appearance' +
                    "</button>" +
                    '<button type="button" class="paperdoll-panel-face" onclick="setup.ExhibitionPaperdoll.openFaceDialog()" title="Face close-up, features, and makeup">Face</button>' +
                    '<button type="button" class="exhib-paperdoll-panel-view paperdoll-panel-view" onclick="setup.ExhibitionPaperdoll.toggleView()" title="Show ass (back)" style="display:none;">Ass</button>' +
                    '<button type="button" class="paperdoll-panel-mirror" onclick="setup.ExhibitionPaperdoll.openMirrorDialog()" title="Open full-body mirror" style="display:none;">🪞</button>' +
                "</div>" +
                '<div id="exhib-paperdoll-panel-body" class="paperdoll-panel-body is-collapsed" hidden style="display:none;height:0;overflow:hidden;"></div>' +
            "</div>"
        );
        window.refreshPaperdollPC = function () {
            setup.ExhibitionPaperdoll.invalidate();
            setup.ExhibitionPaperdoll.renderSidebar();
        };
        jQuery(document).one(":passageend", () => {
            if (setup.ExhibitionPaperdoll.syncViewButtons) setup.ExhibitionPaperdoll.syncViewButtons();
            if (setup.ExhibitionPaperdoll.syncPanelFromState) setup.ExhibitionPaperdoll.syncPanelFromState();
        });
    }

    function installMacros() {
        if (typeof Macro === "undefined") return false;
        if (Macro.has("refreshPaperdollPC")) return true;
        Macro.add("PaperdollPC", { handler() {} });
        Macro.add("PaperdollPanel", { handler() { appendPanel(this.output); } });
        Macro.add("refreshPaperdollPC", { handler() { appendPanel(this.output); } });
        Macro.add("shopModel", {
            handler() {
                jQuery(this.output).append('<canvas id="shopModel-canvas" style="position:relative;left:20vw;width:200px;"></canvas>');
                jQuery(document).one(":passageend", () => {
                    (async function () {
                        const canvas = document.getElementById("shopModel-canvas");
                        await setup.ExhibitionPaperdoll.shopPreview(canvas);
                    })();
                });
                T.refreshShopModel = function () {
                    (async function () {
                        const canvas = document.getElementById("shopModel-canvas");
                        await setup.ExhibitionPaperdoll.shopPreview(canvas);
                    })();
                };
            },
        });
        return true;
    }

    jQuery(document).one(":storyready", () => { installMacros(); });
})();
"""
    )
    return "\n".join(parts)


def escape_twee(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def next_passage_pids(text: str, count: int) -> list[int]:
    pids = [int(m) for m in re.findall(r'pid="(\d+)"', text)]
    start = max(pids) + 1 if pids else 900000
    return list(range(start, start + count))


# All exhibition paperdoll passages we inject — strip every copy before re-inject
# so rebakes never accumulate duplicates (Face dialog was stacking 5× after restarts).
PAPERDOLL_PASSAGE_NAMES = (
	"PaperdollUtil",
	"ExhibitionPaperdollUtil",
	"PaperdollMirror",
	"PaperdollMirrorPassage",
	"ExhibitionFacePickerWidgets",
	"PaperdollFace",
	"PaperdollFacePassage",
)


def strip_paperdoll_passages(text: str) -> str:
	"""Remove every injected paperdoll/face passage (all duplicates)."""
	for name in PAPERDOLL_PASSAGE_NAMES:
		text = re.sub(
			rf'<tw-passagedata[^>]*\bname="{re.escape(name)}"[^>]*>[\s\S]*?</tw-passagedata>\s*',
			"",
			text,
		)
	return text


def widget_passages(text: str) -> str:
	blocks = []
	pids = iter(next_passage_pids(text, 16))
	for twee_path in TWEE_FILES:
		raw = twee_path.read_text(encoding="utf-8")
		for chunk in re.split(r"(?=^:: )", raw, flags=re.MULTILINE):
			chunk = chunk.strip()
			if not chunk.startswith("::"):
				continue
			lines = chunk.splitlines()
			header = lines[0]
			body = "\n".join(lines[1:]).strip()
			m = re.match(r"::\s+(\S+)", header)
			if not m:
				continue
			name = m.group(1)
			tags_m = re.search(r"\[([^\]]*)\]", header)
			tags = tags_m.group(1) if tags_m else "nobr"
			pid = next(pids)
			blocks.append(
				f'<tw-passagedata pid="{pid}" name="{name}" tags="{tags}" '
				f'position="100,100" size="100,100">{escape_twee(body)}</tw-passagedata>'
			)
	return "\n".join(blocks)


# Reuse CSS / StoryCaption patches from old integrator
def patch_face_picker_css(text: str) -> str:
    css_path = EP / "face-picker.css"
    if not css_path.is_file():
        return text
    ext = css_path.read_text(encoding="utf-8").strip()
    block = FACE_PICKER_CSS_MARKER + "\n" + ext + "\n"

    if FACE_PICKER_CSS_MARKER in text:
        return re.sub(
            re.escape(FACE_PICKER_CSS_MARKER) + r"[\s\S]*?(?=\n\.paperdoll-mirror-layout|\n\.exhib-face-picker|\n\.tabgroup)",
            block.rstrip() + "\n\n",
            text,
            count=1,
        )

    for anchor in ("\n.paperdoll-mirror-layout {", "\n.exhib-face-picker {", "\n.tabgroup {"):
        if anchor in text:
            return text.replace(anchor, "\n" + block + anchor, 1)
    return text


def patch_paperdoll_css(text: str) -> str:
    old = (
        ".paperdoll-panel-body {\n"
        "    display: flex;\n"
        "    flex-direction: column;\n"
        "    flex: 1 1 auto;\n"
        "    min-height: 0;\n"
        "    height: auto;\n"
        "    overflow: hidden;\n"
        "}\n"
        ".paperdoll-panel-body.is-collapsed,"
    )
    new = (
        ".paperdoll-panel-body {\n"
        "    display: flex;\n"
        "    flex-direction: column;\n"
        "    flex: 1 1 auto;\n"
        "    min-height: 0;\n"
        "    height: auto;\n"
        "    overflow: hidden;\n"
        "}\n"
        ".paperdoll-panel-body:not(.is-collapsed):not([hidden]) {\n"
        "    min-height: 120px;\n"
        "}\n"
        ".paperdoll-panel-body.is-collapsed,"
    )
    if old in text:
        text = text.replace(old, new)
    return text


def normalize_story_caption_paperdoll(text: str) -> str:
    if 'name="StoryCaption"' not in text:
        return text
    text = text.replace(
        '&lt;div style=&quot;display:grid&quot;&gt;&lt;div class=&quot;locimgcontainer&quot; style=&quot;height: 180px; z-index:0&quot;&gt;&lt;&lt;PaperdollPC&gt;&gt;',
        '&lt;div class=&quot;locimgcontainer&quot;&gt;',
    )
    text = text.replace(
        '&lt;div style=&quot;display:grid&quot;&gt;&lt;div class=&quot;locimgcontainer&quot; style=&quot;height: 180px; z-index:0&quot;&gt;',
        '&lt;div class=&quot;locimgcontainer&quot;&gt;',
    )
    paperdoll_anchor = (
        '        &lt;&lt;unset _toys&gt;&gt;\n'
        '    &lt;/div&gt;\n'
        '    &lt;div class=&quot;uibar&quot;&gt;&lt;/div&gt;\n'
        '    &lt;&lt;refreshPaperdollPC&gt;&gt;\n\n'
        '    &lt;&lt;if !$prevneeds&gt;&gt;'
    )
    paperdoll_missing = (
        '        &lt;&lt;unset _toys&gt;&gt;\n'
        '    &lt;/div&gt;\n'
        '    &lt;div class=&quot;uibar&quot;&gt;&lt;/div&gt;\n\n'
        '    &lt;&lt;if !$prevneeds&gt;&gt;'
    )
    if paperdoll_anchor not in text and paperdoll_missing in text:
        text = text.replace(paperdoll_missing, paperdoll_anchor, 1)
    return text


MIRROR_LINK = '&lt;&lt;link &#39;🪞&#39; PaperdollMirrorPassage&gt;&gt;&lt;&lt;/link&gt;&gt;'
CLOTHES_MENU_ANCHOR = '&lt;&lt;include ClothesMenu&gt;&gt;</tw-passagedata><tw-passagedata pid="341"'
CLOTHINGFLAGS_BLOCK = '        &lt;&lt;clothingflags $shopitem.item&gt;&gt;\n        &lt;br&gt;'
SHOPMODEL_BLOCK = '&lt;&lt;shopModel&gt;&gt;\n        &lt;br&gt;'
SHOP_SUBS_OLD = "            T.subs[sub] = opt;\n            document.getElementById"
SHOP_SUBS_NEW = (
    "            T.subs[sub] = opt;if (V.shopitem.type=='clothes'){T.refreshShopModel();}\n"
    "            document.getElementById"
)


def patch_passage_hooks(text: str) -> str:
    if MIRROR_LINK + "&lt;&lt;include ClothesMenu&gt;&gt;" not in text:
        if CLOTHES_MENU_ANCHOR in text:
            text = text.replace(CLOTHES_MENU_ANCHOR, MIRROR_LINK + CLOTHES_MENU_ANCHOR, 1)
    if CLOTHINGFLAGS_BLOCK + SHOPMODEL_BLOCK not in text:
        if CLOTHINGFLAGS_BLOCK in text:
            text = text.replace(CLOTHINGFLAGS_BLOCK, CLOTHINGFLAGS_BLOCK + SHOPMODEL_BLOCK, 1)
    if SHOP_SUBS_NEW not in text and SHOP_SUBS_OLD in text:
        text = text.replace(SHOP_SUBS_OLD, SHOP_SUBS_NEW, 1)
    return text


def strip_old_cot_paperdoll_js(text: str) -> str:
    """Remove old CoT bundle and any prior Exhibition Paperdoll engine injections."""
    end_anchor = "/* === Exhibition Sidebar (clothing status tweaks) === */"
    legacy_marker = "/* === Exhibition Paperdoll (standalone) === */"
    unmarked = "// --- core/transforms.js ---"
    for start in (MARKER, legacy_marker, unmarked):
        if start in text:
            text = re.sub(
                re.escape(start) + r"[\s\S]*?(?=\n" + re.escape(end_anchor) + r")",
                "",
                text,
                count=1,
            )
    shim = "// ModLoader shims for standalone desktop HTML"
    if shim in text:
        text = re.sub(
            re.escape(shim) + r"[\s\S]*?(?=\n" + re.escape(end_anchor) + r")",
            "",
            text,
            count=1,
        )
    return text


def patch_html(text: str, js: str) -> str:
    text = strip_old_cot_paperdoll_js(text)
    text = patch_paperdoll_css(text)
    text = patch_face_picker_css(text)
    text = normalize_story_caption_paperdoll(text)

    paperdoll_js = js.split(MARKER, 1)[1].lstrip() if MARKER in js else js
    end = '\n</script><tw-passagedata pid="1"'
    anchor = '        }\n};\n\n/* === Exhibition Paperdoll (standalone) === */'

    inject_anchor = "/* === Exhibition Sidebar (clothing status tweaks) === */"
    bundle = (MARKER + "\n" + paperdoll_js).rstrip() + "\n\n"
    if inject_anchor in text:
        text = text.replace(inject_anchor, bundle + inject_anchor, 1)
    elif MARKER in text:
        end_pattern = r'(?=\n</script><tw-passagedata pid="1")'
        text = re.sub(re.escape(MARKER) + r"[\s\S]*?" + end_pattern, lambda _m: paperdoll_js, text, count=1)
    else:
        text = text.replace('        }\n};</script><tw-passagedata pid="1"', '        }\n};\n\n' + js.rstrip() + end, 1)

    text = patch_passage_hooks(text)
    text = normalize_story_caption_paperdoll(text)
    text = patch_paperdoll_css(text)

    # Always strip all prior copies (Face/Mirror/Util), then inject a single clean set
    text = strip_paperdoll_passages(text)
    passages = widget_passages(text)
    if "</tw-storydata>" in text:
        text = text.replace("</tw-storydata>", passages + "\n</tw-storydata>", 1)
    else:
        text = text + "\n" + passages + "\n"

    return text


def rebuild_standalone_embed() -> None:
    script = EP / "standalone/build-embed.py"
    if not script.is_file():
        return
    import subprocess
    import sys

    subprocess.run([sys.executable, str(script)], check=True, cwd=str(EP))


def main() -> None:
    rebuild_standalone_embed()
    base_pack_path = EP / "base-pack/pack.json"
    base_pack = normalize_pack_assets(
        json.loads(base_pack_path.read_text(encoding="utf-8")),
        "exhibition-paperdoll/base-pack",
    )
    manifest = build_asset_manifest()
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
    ) = load_mods()
    js = build_standalone_js(
        manifest,
        base_pack,
        mods,
        base_overlays,
        skin_overlays,
        base_face_overlays,
        face_overlays,
        hair_overlays,
        makeup_overlays,
        body_writing_overlays,
        effect_overlays,
    )
    html = HTML.read_text(encoding="utf-8")
    patched = patch_html(html, js)
    HTML.write_text(patched, encoding="utf-8")
    print(f"Integrated Exhibition Paperdoll into {HTML.name}")
    print(f"  assets in manifest: {len(manifest)}")
    print(f"  clothing mods: {len(mods)}")
    print(f"  base overlays: {len(base_overlays)}")
    print(f"  injected JS size: {len(js) / 1024:.1f} KB")


if __name__ == "__main__":
    main()
