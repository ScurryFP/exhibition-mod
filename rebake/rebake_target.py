"""Shared game HTML path for rebake / install scripts."""

from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GAME_HTML_NAME = "CourseOfTemptationtest.html"
DEV_HTML_NAME = "CourseOfTemptation-Exhibition-appearance-dev.html"


def resolve_html_path() -> Path:
    raw = os.environ.get("REBAKE_HTML", "").strip()
    if raw:
        path = Path(raw)
        return path if path.is_absolute() else (ROOT / path).resolve()
    return (ROOT / GAME_HTML_NAME).resolve()


HTML = resolve_html_path()