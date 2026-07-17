#!/usr/bin/env python3
"""Bake exhibition sidebar status (outfit tweaks in clothing panel) into appearance-dev HTML."""

from __future__ import annotations

import json
import re
from pathlib import Path

from rebake_target import HTML, ROOT

SRC = ROOT / "exhibition-sidebar"

JS_MARKER = "/* === Exhibition Sidebar (clothing status tweaks) === */"
CSS_MARKER = "/* === Exhibition Sidebar CSS === */"

STORY_CAPTION_SNIPPET = (
    "        &lt;&lt;if $pc.cum_covering&gt;&gt;\n"
    "            &lt;span class=&quot;sexy&quot;&gt;&lt;&lt;= $pc.show_cum_covering()&gt;&gt;&lt;/span&gt;\n"
    "        &lt;&lt;/if&gt;&gt;\n"
    "         &lt;&lt;set _exhibExposure to setup.ExhibitionAdjustment.format_clothing_status_exposure($pc)&gt;&gt;\n"
    "         &lt;&lt;if _exhibExposure&gt;&gt;\n"
    "            &lt;span class=&quot;clothing-exposure-status sexy&quot;&gt;&lt;&lt;= _exhibExposure&gt;&gt;&lt;/span&gt;\n"
    "         &lt;&lt;/if&gt;&gt;\n"
    "         &lt;&lt;if !$pc.has_storage_sized(&quot;phone&quot;) and !($pc.in_encounter() or tags().includes(&quot;preencounter&quot;))&gt;&gt;"
)

STORY_CAPTION_OLD = (
    "        &lt;&lt;if $pc.cum_covering&gt;&gt;\n"
    "            &lt;span class=&quot;sexy&quot;&gt;&lt;&lt;= $pc.show_cum_covering()&gt;&gt;&lt;/span&gt;\n"
    "        &lt;&lt;/if&gt;&gt;\n"
    "         &lt;&lt;if !$pc.has_storage_sized(&quot;phone&quot;) and !($pc.in_encounter() or tags().includes(&quot;preencounter&quot;))&gt;&gt;"
)

LABELS_FILE = SRC / "sidebar-chip-labels.txt"
LABELS_INJECT = "/* INJECT_SIDEBAR_CHIP_LABELS */"


def parse_sidebar_chip_labels(path: Path) -> dict[str, dict[int, str]]:
    labels: dict[str, dict[int, str]] = {}
    section: str | None = None

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("[") and line.endswith("]"):
            section = line[1:-1].strip()
            labels.setdefault(section, {})
            continue
        match = re.match(r"^level([1-5])=(.*)$", line, flags=re.IGNORECASE)
        if match and section:
            level = int(match.group(1))
            value = match.group(2).strip()
            if value:
                labels[section][level] = value
    return labels


def labels_to_js(labels: dict[str, dict[int, str]]) -> str:
    parts: list[str] = ["\tEA.SIDEBAR_CHIP_LABELS = {"]
    for part in sorted(labels):
        levels = labels[part]
        if not levels:
            continue
        entries = ", ".join(f'{level}: {json_escape(levels[level])}' for level in sorted(levels))
        parts.append(f"\t\t{json_key(part)}: {{ {entries} }},")
    parts.append("\t};")
    return "\n".join(parts)


def json_escape(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def json_key(key: str) -> str:
    if re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", key):
        return key
    return json.dumps(key, ensure_ascii=False)


def inject_sidebar_labels(js: str) -> str:
    if LABELS_INJECT not in js:
        raise RuntimeError("sidebar JS missing INJECT_SIDEBAR_CHIP_LABELS marker")
    if not LABELS_FILE.exists():
        raise RuntimeError(f"Missing labels file: {LABELS_FILE}")
    labels = parse_sidebar_chip_labels(LABELS_FILE)
    if not labels:
        raise RuntimeError(f"No labels parsed from {LABELS_FILE}")
    return js.replace(LABELS_INJECT, labels_to_js(labels))


def patch_js(text: str) -> str:
    ext = inject_sidebar_labels((SRC / "exhibition-sidebar.js").read_text(encoding="utf-8").strip())
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
        raise RuntimeError("script closing anchor not found for sidebar JS")
    return text.replace(anchor, "\n" + block + anchor, 1)


def patch_css(text: str) -> str:
    ext = (SRC / "exhibition-sidebar.css").read_text(encoding="utf-8").strip()
    block = CSS_MARKER + "\n" + ext + "\n"

    if CSS_MARKER in text:
        text = re.sub(
            re.escape(CSS_MARKER) + r"[\s\S]*?(?=\n#title \{)",
            block.rstrip() + "\n\n",
            text,
            count=1,
        )
        return text

    anchor = "\n#title {\n    text-align: left;"
    if anchor not in text:
        raise RuntimeError("CSS anchor not found for sidebar styles")
    return text.replace(anchor, "\n" + block + anchor, 1)


def patch_story_caption(text: str) -> str:
    if "_exhibExposure to setup.ExhibitionAdjustment.format_clothing_status_exposure" in text:
        return text
    if STORY_CAPTION_OLD not in text:
        raise RuntimeError("StoryCaption clothing-status patch target not found")
    return text.replace(STORY_CAPTION_OLD, STORY_CAPTION_SNIPPET, 1)


def main() -> None:
    text = HTML.read_text(encoding="utf-8")
    text = patch_js(text)
    text = patch_css(text)
    text = patch_story_caption(text)
    HTML.write_text(text, encoding="utf-8")
    print(f"Patched exhibition sidebar into {HTML.name}")


if __name__ == "__main__":
    main()