#!/usr/bin/env python3
"""Add University Mall restroom (tanning-only swimsuit change) to appearance-dev HTML."""

from __future__ import annotations

import re
from pathlib import Path

from rebake_target import HTML, ROOT

SRC = ROOT / "university-mall"

FACILITY_PASSAGES = ["UniMallRestroom"]
REMOVED_PASSAGES = ["UniMallChangingRoom"]

UNIMALL_RESTROOM_LINK = (
    '&lt;&lt;if !setup.is_springrilsplash_party_time()&gt;&gt;\n'
    '    Near the Thoreau Building end of the mall, a small brick restroom pavilion serves students laying out on the grass.\n'
    '    &lt;br&gt;\n'
    '    &lt;&lt;set _link to {text: &quot;Restrooms&quot;, link: &quot;UniMallRestroom&quot;, emoji: &#39;🚽&#39;}&gt;&gt;\n'
    '    &lt;&lt;link _link&gt;&gt;&lt;&lt;advtime 1&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 1&gt;&gt;\n'
    '    &lt;br&gt;&lt;br&gt;\n'
    '&lt;&lt;/if&gt;&gt;\n'
    '\n'
    '&lt;&lt;set _joglink to {text: &quot;Jog for a bit&quot;, emoji: &#39;👟&#39;}&gt;&gt;'
)

UNIMALL_RESTROOM_LINK_ORIG = '&lt;&lt;set _joglink to {text: &quot;Jog for a bit&quot;, emoji: &#39;👟&#39;}&gt;&gt;'

MALL_FACILITY_SPAWN = (
    '\n'
    '\t\t\t\t\t\t\tif (loc == "UniMallRestroom")\n'
    '\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\tif (hour < 8 || hour > 19)\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "class" && classestoday && hour <= setup.School.last_bell())\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (setup.people.likely_at_work(person))\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "restroom" || slotloc == "showers")\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.12;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "free time")\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.03;\n'
    '\t\t\t\t\t\t\t\telse\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.008;\n'
    '\t\t\t\t\t\t\t}\n'
)

MALL_SPAWN_ANCHOR = '\t\t\t\t\t\t\tif (loc == "UniMall" && badweather)'
MALL_SPAWN_OLD = (
    '\n'
    '\t\t\t\t\t\t\tif (loc == "UniMallRestroom" || loc == "UniMallChangingRoom")\n'
    '\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\tif (hour < 8 || hour > 19)\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "class" && classestoday && hour <= setup.School.last_bell())\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (setup.people.likely_at_work(person))\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "restroom" || slotloc == "showers")\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.12;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "free time")\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.03;\n'
    '\t\t\t\t\t\t\t\telse\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.008;\n'
    '\t\t\t\t\t\t\t}\n'
    '\n'
    + MALL_SPAWN_ANCHOR
)


def escape_twee(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def passage_from_twee(text: str, name: str) -> str:
    raw = (SRC / "university-mall-facilities.twee").read_text(encoding="utf-8")
    chunk = None
    for block in re.split(r"\n:: ", "\n" + raw):
        if block.startswith(name + " "):
            chunk = block
            break
    if not chunk:
        raise RuntimeError(f"Passage {name} not found in university-mall-facilities.twee")
    lines = chunk.splitlines()
    header = lines[0]
    body = "\n".join(lines[1:]).strip()
    tags_m = re.search(r"\[([^\]]*)\]", header)
    tags = tags_m.group(1) if tags_m else "nobr"
    pids = [int(m) for m in re.findall(r'pid="(\d+)"', text)]
    pid = max(pids) + 1 if pids else 900100
    return (
        f'<tw-passagedata pid="{pid}" name="{name}" tags="{tags}" '
        f'position="100,100" size="100,100">{escape_twee(body)}</tw-passagedata>'
    )


def patch_passages(text: str) -> str:
    for name in FACILITY_PASSAGES:
        passage = passage_from_twee(text, name)
        pattern = rf'<tw-passagedata pid="\d+" name="{name}"[\s\S]*?</tw-passagedata>'
        if re.search(pattern, text):
            text = re.sub(pattern, passage, text, count=1)
        else:
            text = text.replace("</tw-storydata>", passage + "\n</tw-storydata>", 1)
    for name in REMOVED_PASSAGES:
        pattern = rf'<tw-passagedata pid="\d+" name="{name}"[\s\S]*?</tw-passagedata>\n?'
        text = re.sub(pattern, "", text, count=1)
    return text


def patch_unimall_link(text: str) -> str:
    if UNIMALL_RESTROOM_LINK in text:
        return text
    if UNIMALL_RESTROOM_LINK_ORIG not in text:
        raise RuntimeError("UniMall jog link anchor not found")
    return text.replace(UNIMALL_RESTROOM_LINK_ORIG, UNIMALL_RESTROOM_LINK, 1)


def patch_spawn(text: str) -> str:
    if MALL_SPAWN_OLD in text:
        return text.replace(MALL_SPAWN_OLD, MALL_FACILITY_SPAWN + "\n" + MALL_SPAWN_ANCHOR, 1)
    if 'loc == "UniMallRestroom"' in text and 'UniMallChangingRoom' not in text:
        return text
    if MALL_SPAWN_ANCHOR not in text:
        raise RuntimeError("UniMall spawn anchor not found")
    return text.replace(MALL_SPAWN_ANCHOR, MALL_FACILITY_SPAWN + "\n" + MALL_SPAWN_ANCHOR, 1)


def main() -> None:
    text = HTML.read_text(encoding="utf-8")
    text = patch_passages(text)
    text = patch_unimall_link(text)
    text = patch_spawn(text)
    HTML.write_text(text, encoding="utf-8")
    print(f"Patched University Mall restroom into {HTML.name}")


if __name__ == "__main__":
    main()