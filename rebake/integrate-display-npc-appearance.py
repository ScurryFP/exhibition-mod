#!/usr/bin/env python3
"""Add DisplayNPC Appearance tab (mirror preview, exposure chips, tan lines)."""

from __future__ import annotations

import re
from pathlib import Path

from rebake_target import HTML, ROOT

SRC = ROOT / "display-npc-appearance"
LAKE_NPC_JS = ROOT / "lake-beach-npcs" / "lake-beach-npcs.js"

JS_MARKER = "/* === DisplayNPC Appearance tab === */"
CSS_MARKER = "/* === DisplayNPC Appearance CSS === */"
FACE_PICKER_CSS_MARKER = "/* === Exhibition Face Picker CSS === */"
WIDGET_PASSAGE = "DisplayNPCAppearanceWidgets"

DISPLAY_TAB_OLD = (
    "    &lt;&lt;tab &quot;Physical&quot;&gt;&gt;\n"
    "\n"
    "        &lt;&lt;displaynpcdescription&gt;&gt;\n"
    "\n"
    "    &lt;&lt;tab &quot;Memories&quot;&gt;&gt;"
)

DISPLAY_TAB_NEW = (
    "    &lt;&lt;tab &quot;Physical&quot;&gt;&gt;\n"
    "\n"
    "        &lt;&lt;displaynpcdescription&gt;&gt;\n"
    "\n"
    "    &lt;&lt;tab &quot;Appearance&quot;&gt;&gt;\n"
    "\n"
    "        &lt;&lt;displaynpcappearance _personobj&gt;&gt;\n"
    "\n"
    "    &lt;&lt;tab &quot;Memories&quot;&gt;&gt;"
)


def escape_twee(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def widget_passage(text: str) -> str:
    raw = (SRC / "display-npc-appearance.twee").read_text(encoding="utf-8").strip()
    lines = raw.splitlines()
    header = lines[0]
    body = "\n".join(lines[1:]).strip()
    tags_m = re.search(r"\[([^\]]*)\]", header)
    tags = tags_m.group(1) if tags_m else "widget nobr"
    pids = [int(m) for m in re.findall(r'pid="(\d+)"', text)]
    pid = max(pids) + 1 if pids else 900100
    return (
        f'<tw-passagedata pid="{pid}" name="{WIDGET_PASSAGE}" tags="{tags}" '
        f'position="100,100" size="100,100">{escape_twee(body)}</tw-passagedata>'
    )


def patch_js(text: str) -> str:
    ext = (SRC / "display-npc-appearance.js").read_text(encoding="utf-8").strip()
    block = JS_MARKER + "\n" + ext + "\n"

    if JS_MARKER in text:
        # lambda repl — JS may contain \s etc. which re.sub would misread as backrefs
        text = re.sub(
            re.escape(JS_MARKER) + r"[\s\S]*?(?=\n</script><tw-passagedata pid=\"1\")",
            lambda _m: block.rstrip() + "\n",
            text,
            count=1,
        )
        return text

    anchor = "\n</script><tw-passagedata pid=\"1\""
    if anchor not in text:
        raise RuntimeError("script closing anchor not found for DisplayNPC appearance JS")
    return text.replace(anchor, "\n" + block + anchor, 1)


def patch_css(text: str) -> str:
    ext = (SRC / "display-npc-appearance.css").read_text(encoding="utf-8").strip()
    block = CSS_MARKER + "\n" + ext + "\n"

    if CSS_MARKER in text:
        text = re.sub(
            re.escape(CSS_MARKER)
            + r"[\s\S]*?(?=\n"
            + re.escape(FACE_PICKER_CSS_MARKER)
            + r"|\n\.tabgroup)",
            lambda _m: block.rstrip() + "\n\n",
            text,
            count=1,
        )
        return text

    if FACE_PICKER_CSS_MARKER in text:
        return text.replace(
            "\n" + FACE_PICKER_CSS_MARKER,
            "\n" + block.rstrip() + "\n\n" + FACE_PICKER_CSS_MARKER,
            1,
        )

    anchor = "\n.tabgroup {"
    if anchor not in text:
        anchor = "\n.npc-display-header {"
    if anchor not in text:
        raise RuntimeError("CSS anchor not found for DisplayNPC appearance styles")
    return text.replace(anchor, "\n" + block + anchor, 1)


def patch_display_npc_tab(text: str) -> str:
    if 'tab &quot;Appearance&quot;' in text and "displaynpcappearance" in text:
        return text
    if DISPLAY_TAB_OLD not in text:
        raise RuntimeError("DisplayNPC tab anchor not found")
    return text.replace(DISPLAY_TAB_OLD, DISPLAY_TAB_NEW, 1)


def patch_widget_passage(text: str) -> str:
    if f'name="{WIDGET_PASSAGE}"' in text:
        text = re.sub(
            rf'<tw-passagedata pid="\d+" name="{WIDGET_PASSAGE}"[^>]*>[\s\S]*?</tw-passagedata>',
            widget_passage(text),
            text,
            count=1,
        )
        return text
    insert_before = '<tw-passagedata pid="375" name="DisplayNPCWidgets"'
    if insert_before not in text:
        raise RuntimeError("DisplayNPCWidgets passage anchor not found")
    return text.replace(insert_before, widget_passage(text) + insert_before, 1)


def patch_lake_beach_tan_tick() -> None:
    if not LAKE_NPC_JS.exists():
        return
    js = LAKE_NPC_JS.read_text(encoding="utf-8")
    anchor = "\t\tfor (const p of people)\n\t\t{\n\t\t\tif (!V.lakebeachactivities[p])\n\t\t\t\tV.lakebeachactivities[p] = this.pick_activity(p, weights);\n\t\t}\n\t},"
    insert = (
        "\t\tfor (const p of people)\n\t\t{\n\t\t\tif (!V.lakebeachactivities[p])\n\t\t\t\tV.lakebeachactivities[p] = this.pick_activity(p, weights);\n\t\t}\n"
        "\t\tif (setup.NpcTanning && setup.NpcTanning.apply_beach_tick_for_name)\n\t\t{\n"
        "\t\t\tfor (const p of people)\n\t\t\t{\n"
        "\t\t\t\tif (this.get_activity(p) === \"tanning\")\n"
        "\t\t\t\t\tsetup.NpcTanning.apply_beach_tick_for_name(p);\n"
        "\t\t\t}\n"
        "\t\t}\n\t},"
    )
    if "apply_beach_tick_for_name" in js:
        return
    if anchor not in js:
        raise RuntimeError("lake-beach-npcs refresh_activities anchor not found")
    LAKE_NPC_JS.write_text(js.replace(anchor, insert, 1), encoding="utf-8")


def main() -> None:
    patch_lake_beach_tan_tick()
    text = HTML.read_text(encoding="utf-8")
    text = patch_js(text)
    text = patch_css(text)
    text = patch_display_npc_tab(text)
    text = patch_widget_passage(text)
    HTML.write_text(text, encoding="utf-8")
    print(f"Patched DisplayNPC Appearance tab into {HTML.name}")


if __name__ == "__main__":
    main()