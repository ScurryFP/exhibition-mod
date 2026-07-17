#!/usr/bin/env python3
"""Bake CoT-Paperdoll into Exhibition appearance-dev HTML (no ModLoader)."""

from __future__ import annotations

import json
import re
from pathlib import Path

from rebake_target import HTML, ROOT

PD = ROOT / "PaperDoll" / "CoT-Paperdoll-Mod-main"
NPC_SUBJECT = ROOT / "paperdoll-npc-subject"
RES = ROOT / "res" / "paperdoll"

MARKER = "/* === Exhibition Paperdoll (standalone) === */"
RENDER_SUBJECT = "setup.Paperdoll.getRenderSubject()"


def subjectify_paperdoll_js(text: str) -> str:
    """Route paperdoll body/hair/tan layers through the active render subject (PC or NPC)."""
    text = text.replace("V.pc", RENDER_SUBJECT)
    text = text.replace(
        f"for (let dmark of {RENDER_SUBJECT}.distinguishing_marks)",
        f"for (let dmark of ({RENDER_SUBJECT}.distinguishing_marks || []))",
    )
    return text


def build_image_manifest() -> list[str]:
    paths: list[str] = []
    for p in sorted(RES.rglob("*")):
        if p.suffix.lower() in (".png", ".webp"):
            rel = p.relative_to(ROOT).as_posix()
            paths.append(rel)
    return paths


def build_standalone_js(manifest: list[str]) -> str:
    parts: list[str] = [MARKER]

    parts.append(
        """
// ModLoader shims for standalone desktop HTML
(function() {
    if (!window.modUtils) window.modUtils = {};
    if (!window.modUtils.pSC2DataManager) {
        const _imgCache = new Map();
        const hook = {
            requestImageBySrc(src) {
                if (!src || typeof src !== "string") return Promise.resolve("");
                if (_imgCache.has(src)) return Promise.resolve(_imgCache.get(src));
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => { _imgCache.set(src, src); resolve(src); };
                    img.onerror = () => { _imgCache.set(src, ""); resolve(""); };
                    img.src = src;
                });
            }
        };
        window.modUtils.pSC2DataManager = { getHtmlTagSrcHook() { return hook; } };
    }
    if (!window.modSweetAlert2Mod) {
        window.modSweetAlert2Mod = { fire() {} };
    }
    const manifest = %s;
    const imgListRef = new Map(manifest.map((p) => [p, true]));
    if (!window.addonBeautySelectorAddon) {
        window.addonBeautySelectorAddon = {
            getTypeOrder() {
                return [{ type: "ExhibitionPaperdollPack", imgListRef }];
            },
            table: new Map()
        };
    }
})();
"""
        % json.dumps(manifest)
    )

    prelude = (NPC_SUBJECT / "paperdoll-subject-prelude.js").read_text(encoding="utf-8").strip()
    postlude = (NPC_SUBJECT / "paperdoll-subject-postlude.js").read_text(encoding="utf-8").strip()

    for rel in [
        "early/tinycolor.js",
        "early/paperDollClass.js",
        "color.js",
        "paperdoll-subject-prelude.js",
        "paperdollModel.js",
        "paperdoll.js",
        "paperdoll-subject-postlude.js",
        "shopModel.js",
    ]:
        if rel == "paperdoll-subject-prelude.js":
            parts.append("\n// --- paperdoll-subject-prelude.js ---\n" + prelude + "\n")
            continue
        if rel == "paperdoll-subject-postlude.js":
            parts.append("\n// --- paperdoll-subject-postlude.js ---\n" + postlude + "\n")
            continue
        text = (PD / rel).read_text(encoding="utf-8")
        if rel == "paperdoll.js":
            # Drop ModLoader-only tail (old pack compat + template warning)
            cut = text.find("\nlet oldversion = false;")
            if cut != -1:
                text = text[:cut].rstrip() + "\n"
        if rel in ("paperdollModel.js", "paperdoll.js"):
            text = subjectify_paperdoll_js(text)
        parts.append(f"\n// --- {rel} ---\n{text}")

    parts.append(
        """
// --- standalone imgSupport ---
if (!("Paperdoll" in setup)) setup.Paperdoll = {};
const webpPaths = new Set();
const dirIndex = new Map();
const tagIndex = new Map();
const tagRegex = /^@([^@]+)@_/;
const paperdollManifest = %s;
for (const path of paperdollManifest) {
    if (path.endsWith(".webp")) webpPaths.add(path);
    const lastSlash = path.lastIndexOf("/");
    if (lastSlash >= 0) {
        const dir = path.substring(0, lastSlash + 1);
        const file = path.substring(lastSlash + 1);
        if (!dirIndex.has(dir)) dirIndex.set(dir, new Set());
        dirIndex.get(dir).add(file);
        const match = file.match(tagRegex);
        if (match) {
            if (!tagIndex.has(dir)) tagIndex.set(dir, new Set());
            tagIndex.get(dir).add(match[1]);
        }
    }
}
setup.Paperdoll._webpPaths = webpPaths;
setup.Paperdoll._dirIndex = dirIndex;
setup.Paperdoll._tagIndex = tagIndex;
console.log("[Paperdoll] Standalone pack loaded:", dirIndex.size, "dirs,", paperdollManifest.length, "images");

// --- standalone SugarCube macros (fallback if widget passages fail to load) ---
(function () {
    function ensurePaperdollState() {
        if (typeof V.optpaperdollopen === "undefined") V.optpaperdollopen = false;
        if (typeof V.optpaperdollview === "undefined") V.optpaperdollview = "front";
    }

    function appendPaperdollPanel(output) {
        ensurePaperdollState();
        const $out = jQuery(output);
        $out.append(
            '<div class="paperdoll-panel">' +
                '<div class="paperdoll-panel-bar">' +
                    '<button type="button" class="paperdoll-panel-toggle" onclick="setup.Paperdoll.togglePanel()" title="Show or hide your character">' +
                        '<span class="paperdoll-panel-chevron">▶</span> Appearance' +
                    "</button>" +
                    '<button type="button" class="paperdoll-panel-view" onclick="setup.Paperdoll.toggleView()" title="Show back view" style="display:none;">Back</button>' +
                    '<button type="button" class="paperdoll-panel-refresh" onclick="refreshPaperdollPC()" title="Refresh sprite" style="display:none;">↻</button>' +
                "</div>" +
                '<div id="paperdoll-panel-body" class="paperdoll-panel-body is-collapsed" hidden style="display:none;height:0;overflow:hidden;"></div>' +
            "</div>"
        );
        window.refreshPaperdollPC = function () {
            setup.Paperdoll.invalidateCache();
            setup.Paperdoll.renderSidebarPC();
        };
        jQuery(document).one(":passageend", () => {
            if (setup.Paperdoll.syncViewButtons) setup.Paperdoll.syncViewButtons();
            if (setup.Paperdoll.syncPanelFromState) setup.Paperdoll.syncPanelFromState();
        });
    }

    function installPaperdollMacros() {
        if (typeof Macro === "undefined") return false;
        if (Macro.has("refreshPaperdollPC")) return true;

        Macro.add("PaperdollPC", {
            handler() {},
        });

        Macro.add("PaperdollPanel", {
            handler() {
                appendPaperdollPanel(this.output);
            },
        });

        Macro.add("refreshPaperdollPC", {
            handler() {
                appendPaperdollPanel(this.output);
            },
        });

        Macro.add("shopModel", {
            handler() {
                const $out = jQuery(this.output);
                $out.append(
                    '<canvas id="shopModel-canvas" style="position: relative;left: 20vw;width: 200px;"></canvas>'
                );
                jQuery(document).one(":passageend", () => {
                    (async function () {
                        const canvas = document.getElementById("shopModel-canvas");
                        await setup.Paperdoll.shopModel(canvas);
                    })();
                });
                T.refreshShopModel = function () {
                    (async function () {
                        const canvas = document.getElementById("shopModel-canvas");
                        await setup.Paperdoll.shopModel(canvas);
                    })();
                };
            },
        });

        console.log("[Paperdoll] Registered sidebar macros (JS fallback)");
        return true;
    }

    jQuery(document).one(":storyready", () => {
        if (!installPaperdollMacros()) {
            console.warn("[Paperdoll] Macro API unavailable; sidebar appearance panel disabled");
        }
    });
})();
"""
        % json.dumps(manifest)
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


def widget_passages(text: str) -> str:
    util = (PD / "util.twee").read_text(encoding="utf-8")
    mirror = (PD / "mirror.twee").read_text(encoding="utf-8")

    blocks = []
    pids = iter(next_passage_pids(text, 8))
    for raw in (util, mirror):
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
                f'position="100,100" size="100,100">'
                f"{escape_twee(body)}</tw-passagedata>"
            )
    return "\n".join(blocks)


def patch_paperdoll_css(text: str) -> str:
    """Keep appearance sprite box at 120px for default (16px) font."""
    text = text.replace(
        ".paperdoll-panel-body {\n"
        "    display: flex;\n"
        "    flex-direction: column;\n"
        "    flex: 1 1 auto;\n"
        "    min-height: 0;\n"
        "    height: auto;\n"
        "    overflow: hidden;\n"
        "}\n"
        ".paperdoll-panel-body.is-collapsed,",
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
        ".paperdoll-panel-body.is-collapsed,",
    )
    text = text.replace(
        ".paperdoll-panel-viewport {\n"
        "    position: relative;\n"
        "    flex: 1 1 auto;\n"
        "    min-height: 0;\n"
        "    height: 120px;\n",
        ".paperdoll-panel-viewport {\n"
        "    position: relative;\n"
        "    flex: 0 0 120px;\n"
        "    min-height: 120px;\n"
        "    height: 120px;\n",
    )
    return text


def normalize_story_caption_paperdoll(text: str) -> str:
    """Keep StoryCaption layout: base locimgcontainer + paperdoll under clothing-status."""
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
    text = text.replace(
        '&lt;div class=&quot;todimg&quot; style=&quot;left: 10px;top: 0px;position: absolute;&quot;&gt;',
        '&lt;div class=&quot;todimg&quot;&gt;',
    )
    text = text.replace(
        ' &lt;div class=&quot;locimg&quot; style=&quot;left: -30px;top: 115px;position: absolute;&quot;&gt;',
        '&lt;div class=&quot;locimg&quot;&gt;',
    )
    text = text.replace(
        '&lt;img @src=&quot;_nodeimg&quot; width=&quot;75px&quot;&gt;',
        '&lt;img @src=&quot;_nodeimg&quot;&gt;',
    )

    text = re.sub(
        r'        &lt;&lt;unset _tempimg&gt;&gt;\s*\n\s*&lt;/div&gt;\s*\n(?:\s*&lt;/div&gt;\s*\n)+\s*&lt;div class=&quot;essential-stats&quot;&gt;',
        '        &lt;&lt;unset _tempimg&gt;&gt;\n\n    &lt;/div&gt;\n\n    &lt;div class=&quot;essential-stats&quot;&gt;',
        text,
        count=1,
    )

    text = text.replace(
        '&lt;&lt;refreshPaperdollPC&gt;&gt;&lt;div class=&quot;essential-stats-class-status&quot;&gt;',
        '&lt;div class=&quot;essential-stats-class-status&quot;&gt;',
    )
    text = text.replace(
        '    &lt;&lt;PaperdollPanel&gt;&gt;\n    &lt;div class=&quot;uibar&quot;&gt;',
        '    &lt;div class=&quot;uibar&quot;&gt;',
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

    text = re.sub(
        r"(&lt;&lt;refreshPaperdollPC&gt;&gt;\s*)+",
        "&lt;&lt;refreshPaperdollPC&gt;&gt;\n    ",
        text,
    )
    return text


MIRROR_LINK = (
    '&lt;&lt;link &#39;🪞&#39; PaperdollMirrorPassage&gt;&gt;&lt;&lt;/link&gt;&gt;'
)
CLOTHES_MENU_ANCHOR = (
    '&lt;&lt;include ClothesMenu&gt;&gt;</tw-passagedata><tw-passagedata pid="341"'
)
CLOTHINGFLAGS_BLOCK = (
    '        &lt;&lt;clothingflags $shopitem.item&gt;&gt;\n        &lt;br&gt;'
)
SHOPMODEL_BLOCK = '&lt;&lt;shopModel&gt;&gt;\n        &lt;br&gt;'
SHOP_SUBS_OLD = "            T.subs[sub] = opt;\n            document.getElementById"
SHOP_SUBS_NEW = (
    "            T.subs[sub] = opt;if (V.shopitem.type=='clothes'){T.refreshShopModel();}\n"
    "            document.getElementById"
)


def normalize_paperdoll_passage_patches(text: str) -> str:
    """Collapse duplicate mirror/shop patches from earlier rebake runs."""
    text = re.sub(
        r"(?:"
        + re.escape(MIRROR_LINK)
        + r")+(?="
        + re.escape("&lt;&lt;include ClothesMenu&gt;&gt;")
        + ")",
        MIRROR_LINK,
        text,
    )
    text = re.sub(
        r"("
        + re.escape(CLOTHINGFLAGS_BLOCK)
        + r")(?:"
        + re.escape(SHOPMODEL_BLOCK)
        + r")+",
        r"\1" + SHOPMODEL_BLOCK,
        text,
    )
    text = re.sub(
        r"T\.subs\[sub\] = opt;(if \(V\.shopitem\.type=='clothes'\)\{T\.refreshShopModel\(\);\})+",
        "T.subs[sub] = opt;if (V.shopitem.type=='clothes'){T.refreshShopModel();}",
        text,
    )
    return text


def patch_paperdoll_passage_hooks(text: str) -> str:
    text = normalize_paperdoll_passage_patches(text)

    if MIRROR_LINK + "&lt;&lt;include ClothesMenu&gt;&gt;" not in text:
        if CLOTHES_MENU_ANCHOR not in text:
            raise RuntimeError(
                "HTML patch target not found: "
                f"{CLOTHES_MENU_ANCHOR[:80]!r}..."
            )
        text = text.replace(
            CLOTHES_MENU_ANCHOR,
            MIRROR_LINK + CLOTHES_MENU_ANCHOR,
            1,
        )

    if CLOTHINGFLAGS_BLOCK + SHOPMODEL_BLOCK not in text:
        if CLOTHINGFLAGS_BLOCK not in text:
            raise RuntimeError(
                "HTML patch target not found: "
                f"{CLOTHINGFLAGS_BLOCK[:80]!r}..."
            )
        text = text.replace(
            CLOTHINGFLAGS_BLOCK,
            CLOTHINGFLAGS_BLOCK + SHOPMODEL_BLOCK,
            1,
        )

    if SHOP_SUBS_NEW not in text:
        if SHOP_SUBS_OLD not in text:
            raise RuntimeError(
                "HTML patch target not found: "
                f"{SHOP_SUBS_OLD[:80]!r}..."
            )
        text = text.replace(SHOP_SUBS_OLD, SHOP_SUBS_NEW, 1)

    return text


def patch_html(text: str, js: str) -> str:
    text = patch_paperdoll_css(text)
    text = normalize_story_caption_paperdoll(text)
    anchor = '        }\n};\n\n/* === Exhibition Paperdoll (standalone) === */'
    end = '\n</script><tw-passagedata pid="1"'

    paperdoll_js = js.split(MARKER, 1)[1].lstrip()
    shim_anchor = "// ModLoader shims for standalone desktop HTML"
    end_pattern = r'(?=\n</script><tw-passagedata pid="1")'

    if MARKER in text:
        text = re.sub(
            re.escape(MARKER) + r"[\s\S]*?" + end_pattern,
            lambda _m: paperdoll_js,
            text,
            count=1,
        )
        text = re.sub(
            r'(\s+"pearlnecklace": \{[\s\S]*?addinclinations: \["Cumslut", "Facializer"\],\s+\})\s*/\* === Exhibition Paperdoll',
            r'\1\n};\n\n/* === Exhibition Paperdoll',
            text,
            count=1,
        )
    elif shim_anchor in text:
        text = re.sub(
            re.escape(shim_anchor) + r"[\s\S]*?" + end_pattern,
            lambda _m: paperdoll_js,
            text,
            count=1,
        )
    elif anchor.replace(MARKER, MARKER) in text:
        text = text.replace(anchor, anchor + "\n" + js.split(MARKER, 1)[1].lstrip(), 1)
    else:
        text = text.replace(
            '        }\n};</script><tw-passagedata pid="1"',
            '        }\n};\n\n' + js.rstrip() + end,
            1,
        )

    text = patch_paperdoll_passage_hooks(text)

    text = normalize_story_caption_paperdoll(text)
    text = patch_paperdoll_css(text)

    passages = widget_passages(text)
    paperdoll_passage_re = (
        r'<tw-passagedata pid="(?:PDPaperdollUtil|\d+)" name="PaperdollUtil"[\s\S]*?</tw-passagedata>\s*'
        r'(?:<tw-passagedata pid="(?:PDPaperdollMirror|\d+)" name="PaperdollMirror"[\s\S]*?</tw-passagedata>\s*)?'
        r'<tw-passagedata pid="(?:PDPaperdollMirrorPassage|\d+)" name="PaperdollMirrorPassage"[\s\S]*?</tw-passagedata>'
    )
    if 'name="PaperdollUtil"' in text:
        text = re.sub(paperdoll_passage_re, passages + "\n", text, count=1)
    else:
        text = text.replace("</tw-storydata>", passages + "\n</tw-storydata>", 1)

    return text


def main() -> None:
    manifest = build_image_manifest()
    js = build_standalone_js(manifest)
    html = HTML.read_text(encoding="utf-8")
    patched = patch_html(html, js)
    HTML.write_text(patched, encoding="utf-8")
    print(f"Integrated paperdoll into {HTML.name}")
    print(f"  images in manifest: {len(manifest)}")
    print(f"  injected JS size: {len(js) / 1024:.1f} KB")


if __name__ == "__main__":
    main()