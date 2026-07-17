#!/usr/bin/env python3
"""Bake wear-default exposure reset + saved exposure presets into appearance-dev HTML."""

from __future__ import annotations

import re
from pathlib import Path

from rebake_target import HTML, ROOT

SRC = ROOT / "exhibition-wear-defaults"

JS_MARKER = "/* === Exhibition Wear Defaults === */"
PRESET_MARKER = "<!-- === Exhibition exposure presets (ChangeClothingConfig) === -->"


PRESET_CLOSERS = (
    "    &lt;&lt;if !_hasexhibadj&gt;&gt;\n"
    "        &lt;tr&gt;&lt;td colspan=2 class=&quot;small&quot;&gt;Nothing you&#39;re wearing can be tweaked for more exposure right now.&lt;/td&gt;&lt;/tr&gt;\n"
    "    &lt;&lt;/if&gt;&gt;\n"
    "&lt;&lt;/if&gt;&gt;\n"
)

PRESET_ANCHOR = (
    "    &lt;&lt;if !_hasexhibadj&gt;&gt;\n"
    "        &lt;tr&gt;&lt;td colspan=2 class=&quot;small&quot;&gt;Nothing you&#39;re wearing can be tweaked for more exposure right now.&lt;/td&gt;&lt;/tr&gt;\n"
    "    &lt;&lt;/if&gt;&gt;\n"
    "&lt;&lt;/if&gt;&gt;\n"
    "&lt;/table&gt;&lt;br&gt;&lt;br&gt;"
)

EXPOSURE_TWEAKS_HEADER_OLD = (
    "&lt;tr&gt;&lt;td class=&quot;clothing-table-item&quot; colspan=2&gt;&lt;b&gt;Exposure Tweaks&lt;/b&gt; "
    "&lt;span class=&quot;small&quot;&gt;(subtle at Exhib 1 — stronger steps need higher skill)&lt;/span&gt;&lt;/td&gt;&lt;/tr&gt;"
)
EXPOSURE_TWEAKS_HEADER_NEW = (
    "&lt;tr&gt;&lt;td class=&quot;clothing-table-item&quot; colspan=2&gt;&lt;b&gt;Exposure Tweaks&lt;/b&gt; "
    "&lt;span class=&quot;small&quot;&gt;(▲ show more · ▼ cover up — levels run step/max, e.g. 3/6; bolder steps need higher Exhibitionism)&lt;/span&gt;&lt;/td&gt;&lt;/tr&gt;"
)


def escape_twee_for_html(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def patch_js(text: str) -> str:
    ext = (SRC / "exhibition-wear-defaults.js").read_text(encoding="utf-8").strip()
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
        raise RuntimeError("script closing anchor not found for wear-defaults JS")
    return text.replace(anchor, "\n" + block + anchor, 1)


def patch_exposure_tweaks_header(text: str) -> str:
    if EXPOSURE_TWEAKS_HEADER_NEW in text:
        return text
    if EXPOSURE_TWEAKS_HEADER_OLD not in text:
        raise RuntimeError("ChangeClothingConfig Exposure Tweaks header not found")
    return text.replace(EXPOSURE_TWEAKS_HEADER_OLD, EXPOSURE_TWEAKS_HEADER_NEW, 1)


def patch_change_clothing_config(text: str) -> str:
    preset_body = (SRC / "change-clothing-exposure-presets.twee").read_text(encoding="utf-8").strip()
    preset_html = PRESET_MARKER + "\n" + escape_twee_for_html(preset_body) + "\n"

    if PRESET_MARKER in text:
        text = re.sub(
            re.escape(PRESET_MARKER) + r"[\s\S]*?(?=\n&lt;/table&gt;&lt;br&gt;&lt;br&gt;)",
            preset_html.rstrip() + "\n" + PRESET_CLOSERS,
            text,
            count=1,
        )
        return text

    if PRESET_ANCHOR not in text:
        raise RuntimeError("ChangeClothingConfig exposure preset anchor not found")
    return text.replace(PRESET_ANCHOR, preset_html + PRESET_ANCHOR, 1)


def main() -> None:
    text = HTML.read_text(encoding="utf-8")
    text = patch_js(text)
    text = patch_exposure_tweaks_header(text)
    text = patch_change_clothing_config(text)
    HTML.write_text(text, encoding="utf-8")
    print(f"Patched exhibition wear defaults into {HTML.name}")


if __name__ == "__main__":
    main()