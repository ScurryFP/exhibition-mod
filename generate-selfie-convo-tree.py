#!/usr/bin/env python3
"""Generate human-readable selfie convo response tree from selfie-convo-pools.js."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
POOLS_JS = ROOT / "exhibition-tanning" / "selfie-convo-pools.js"
OUT_TXT = ROOT / "exhibition-tanning" / "selfie-convo-tree.txt"


def _strip_js_comments(text: str) -> str:
    return re.sub(r"//.*?$", "", text, flags=re.M)


def _js_to_json(blob: str) -> dict:
    blob = _strip_js_comments(blob)
    blob = re.sub(r"(\b[a-zA-Z_][\w]*)\s*:", r'"\1":', blob)
    blob = re.sub(r",\s*}", "}", blob)
    blob = re.sub(r",\s*]", "]", blob)
    return json.loads(blob)


def _extract_braced_object(text: str, start: int) -> str:
    if start >= len(text) or text[start] != "{":
        raise RuntimeError("expected '{' at pool object start")
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
    raise RuntimeError("unterminated pool object")


def load_pools() -> dict:
    code = POOLS_JS.read_text(encoding="utf-8")
    key = "SelfieConvoPools:"
    idx = code.find(key)
    if idx < 0:
        raise RuntimeError("SelfieConvoPools block not found in pools JS")
    brace = code.find("{", idx + len(key))
    blob = _extract_braced_object(code, brace)
    return _js_to_json(blob)


def fmt_req(req: dict | None) -> str:
    if not req:
        return ""
    parts = []
    for k, v in sorted(req.items()):
        if isinstance(v, bool):
            parts.append(f"{k}" if v else f"!{k}")
        else:
            parts.append(f"{k}>={v}" if k != "encouraged" else "encouraged")
    return f"  req: {', '.join(parts)}"


def fmt_effects(entry: dict) -> str:
    bits = []
    for stat in ("friendship", "lust", "romance", "control"):
        if stat in entry:
            bits.append(f"{stat}{entry[stat]:+d}")
    if entry.get("action"):
        bits.append(f"action={entry['action']}")
    if entry.get("ctx"):
        bits.append(f"ctx={entry['ctx']}")
    if entry.get("dynamic"):
        bits.append(f"dynamic={entry['dynamic']}")
    if entry.get("tone"):
        bits.append(f"tone={entry['tone']}")
    if entry.get("tags"):
        bits.append(f"tags={entry['tags']}")
    return f"  ({', '.join(bits)})" if bits else ""


def fmt_entry(entry: dict) -> str:
    line = f'    [{entry.get("id", "?")}] "{entry.get("text", "")}"'
    extra = fmt_effects(entry)
    req = fmt_req(entry.get("req"))
    return "\n".join(x for x in (line + extra, req) if x)


def resolve_lane(lanes: dict, lane: str, seen: set[str] | None = None) -> dict:
    seen = seen or set()
    if lane in seen or lane not in lanes:
        return {}
    seen.add(lane)
    raw = lanes[lane]
    if "extends" not in raw:
        return raw
    parent = resolve_lane(lanes, raw["extends"], seen)
    moods: dict[str, list] = {k: list(v) for k, v in (parent.get("moods") or {}).items()}
    for k, entries in (raw.get("moods") or {}).items():
        moods.setdefault(k, []).extend(entries)
    for k, entries in (raw.get("moodExtra") or {}).items():
        moods.setdefault(k, []).extend(entries)
    wrapup: dict[str, list] = {k: list(v) for k, v in (parent.get("wrapup") or {}).items()}
    for k, entries in (raw.get("wrapup") or {}).items():
        wrapup.setdefault(k, []).extend(entries)
    wrapup_extra = list(raw.get("wrapupExtra") or [])
    return {
        "label": raw.get("label") or parent.get("label", lane),
        "moods": moods,
        "wrapup": wrapup,
        "wrapupExtra": wrapup_extra,
        "bias": raw.get("bias") or parent.get("bias"),
    }


def render_tree(pools: dict) -> str:
    lines = [
        "SELFIE CONVO RESPONSE TREE",
        "=" * 60,
        "Edit pools: exhibition-tanning/selfie-convo-pools.js",
        "Regenerate:  python3 generate-selfie-convo-tree.py",
        "Rebake game: ./rebake/integrate-exhibition-tanning.sh",
        "",
        "LANE PICK ORDER (first match wins)",
        "-" * 40,
    ]
    for lane in pools.get("laneOrder", []):
        label = pools.get("lanes", {}).get(lane, {}).get("label", lane)
        lines.append(f"  {lane}: {label}")

    lines.extend(["", "ATTITUDE TIERS (used by entry req: { lust: \"high\" } etc.)", "-" * 40])
    for stat, tiers in pools.get("attitudeTiers", {}).items():
        tier_str = ", ".join(f"{k}={v}" for k, v in tiers.items())
        lines.append(f"  {stat}: {tier_str}")

    lines.extend(["", "ATTITUDE BONUS POOLS (merged when req matches)", "-" * 40])
    for name, bonus in pools.get("attitudeBonus", {}).items():
        moods = ", ".join(bonus.get("mood", []))
        lines.append(f"  {name}  moods=[{moods}]")
        for entry in bonus.get("entries", []):
            lines.append(fmt_entry(entry))

    lanes = pools.get("lanes", {})
    lines.extend(["", "LANE POOLS", "=" * 60])
    for lane in pools.get("laneOrder", []):
        if lane not in lanes:
            continue
        data = resolve_lane(lanes, lane)
        if not data:
            continue
        lines.append("")
        lines.append(f"## {lane.upper()} — {data.get('label', lane)}")
        if data.get("bias"):
            lines.append(f"   bias: {data['bias']}")
        moods = data.get("moods") or {}
        if moods:
            lines.append("   MOODS:")
            for mood, entries in sorted(moods.items()):
                lines.append(f"     [{mood}] ({len(entries)} options)")
                for entry in entries:
                    lines.append(fmt_entry(entry))
        wrapup = data.get("wrapup") or {}
        if wrapup or data.get("wrapupExtra"):
            lines.append("   WRAPUP:")
            for key, entries in sorted(wrapup.items()):
                lines.append(f"     [{key}] ({len(entries)} options)")
                for entry in entries:
                    lines.append(fmt_entry(entry))
            if data.get("wrapupExtra"):
                lines.append("     [extra]")
                for entry in data["wrapupExtra"]:
                    lines.append(fmt_entry(entry))

    lines.append("")
    lines.append("ADDING NEW LINES")
    lines.append("-" * 40)
    lines.append("  Copy any entry block above into the matching lane/mood in selfie-convo-pools.js.")
    lines.append("  Fields: id, text, tone?, tags?, action? (bolder|safer|casual), ctx? (phone|tanning),")
    lines.append("          friendship/lust/romance/control deltas, req? { lust: \"high\", attracted: true, ... }")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    pools = load_pools()
    OUT_TXT.write_text(render_tree(pools) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_TXT} ({OUT_TXT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()