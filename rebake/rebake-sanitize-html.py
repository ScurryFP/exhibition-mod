#!/usr/bin/env python3
"""Trim orphan bytes after the first closing </html> tag."""

from __future__ import annotations

import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from rebake_target import DEV_HTML_NAME, GAME_HTML_NAME, HTML, ROOT

CLOSE = "</html>"
BUILD_STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def stamp_title(text: str, path: Path) -> tuple[str, bool]:
    if path.name == DEV_HTML_NAME:
        title = f"Course of Temptation — Exhibition Mod Testing (build {BUILD_STAMP})"
    elif path.name == GAME_HTML_NAME:
        title = f"Course of Temptation — Exhibition Mod (build {BUILD_STAMP})"
    else:
        return text, False
    pattern = r"(<title>)(.*?)(</title>)"
    match = re.search(pattern, text, flags=re.I | re.S)
    if not match or match.group(2) == title:
        return text, False
    new_text = f"{text[:match.start(2)]}{title}{text[match.end(2):]}"
    return new_text, True


def sanitize(text: str) -> tuple[str, bool]:
    lower = text.lower()
    end = lower.find(CLOSE)
    if end == -1:
        return text, False
    end += len(CLOSE)
    clean = text[:end]
    if text.endswith("\n"):
        clean += "\n"
    elif not clean.endswith("\n"):
        clean += "\n"
    return clean, len(clean) != len(text)


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else HTML
    stamp = "--no-stamp" not in sys.argv
    text = path.read_text(encoding="utf-8")
    clean, trimmed = sanitize(text)
    stamped = False
    if stamp:
        clean, stamped = stamp_title(clean, path)
    changed = trimmed or stamped
    if changed:
        path.write_text(clean, encoding="utf-8")
        if trimmed:
            removed = len(text) - len(clean)
            print(f"Trimmed {removed} bytes of orphan content after </html> in {path.name}")
        if stamped:
            print(f"Build stamp: {BUILD_STAMP}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())