#!/usr/bin/env python3
"""One-click Exhibition mod installer — rebakes game HTML and sets up the Paperdoll editor."""

from __future__ import annotations

import json
import os
import platform
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REBAKE_DIR = ROOT / "rebake"
BACKUP_DIR = ROOT / "backup"
RECORD_PATH = BACKUP_DIR / "install-record.json"
EP_STANDALONE = ROOT / "exhibition-paperdoll" / "standalone"
BUILD_EMBED = EP_STANDALONE / "build-embed.py"
VERSION_PATH = ROOT / "VERSION"

GAME_HTML_PREFERRED = "CourseOfTemptationtest.html"
GAME_HTML_FALLBACKS = ("CourseOfTemptation.html",)
SKIP_HTML_NAMES = frozenset(
    {
        "CourseOfTemptation-Exhibition-appearance-dev.html",
        "CourseOfTemptation-Exhibition-installer.html",
    }
)

REBAKE_STEPS: list[tuple[str, str]] = [
    ("integrate-exhibition-paperdoll.py", "Exhibition Paperdoll"),
    ("integrate-exhibition-tanning.py", "Exhibition tanning"),
    ("integrate-university-mall.py", "University Mall facilities"),
    ("integrate-exhibition-sidebar.py", "Exhibition sidebar"),
    ("integrate-exhibition-wear-defaults.py", "Exhibition wear defaults"),
    ("integrate-npc-exhibition-outfits.py", "NPC exhibition outfit gating"),
    ("integrate-display-npc-appearance.py", "DisplayNPC Appearance tab"),
    ("integrate-university-lake.py", "University lake beach"),
    ("integrate-social-people-fix.py", "Social People tab fix"),
]

LAUNCHER_SH = ROOT / "Exhibition Paperdoll Editor.sh"
LAUNCHER_BAT = ROOT / "Exhibition Paperdoll Editor.bat"


def log(msg: str) -> None:
    print(msg, flush=True)


def find_game_html(explicit: str | None = None) -> Path:
    if explicit:
        path = Path(explicit)
        if not path.is_absolute():
            path = ROOT / path
        if not path.is_file():
            raise FileNotFoundError(f"Game HTML not found: {path}")
        return path.resolve()

    preferred = ROOT / GAME_HTML_PREFERRED
    if preferred.is_file():
        return preferred.resolve()

    for name in GAME_HTML_FALLBACKS:
        candidate = ROOT / name
        if candidate.is_file():
            log(f"Using {candidate.name} (rename to {GAME_HTML_PREFERRED} if you prefer).")
            return candidate.resolve()

    for path in sorted(ROOT.glob("CourseOfTemptation*.html")):
        if path.name not in SKIP_HTML_NAMES:
            log(f"Using {path.name} as game HTML.")
            return path.resolve()

    dev = ROOT / "CourseOfTemptation-Exhibition-appearance-dev.html"
    hint = ""
    if dev.is_file():
        hint = (
            f"\n  (Found {dev.name} — that's the modder copy, not the player file.\n"
            f"   Copy your normal game HTML here as {GAME_HTML_PREFERRED}.)"
        )

    raise FileNotFoundError(
        "No game HTML found in this folder.\n"
        f"  Copy your Course of Temptation game file here and name it:\n"
        f"    {GAME_HTML_PREFERRED}"
        f"{hint}\n"
        "  Then run the installer again."
    )


def backup_html(html_path: Path) -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backup = BACKUP_DIR / f"{html_path.stem}.install-backup.html"
    shutil.copy2(html_path, backup)
    log(f"Backup: {backup.relative_to(ROOT)}")
    return backup


def restore_backup(html_path: Path, backup: Path) -> None:
    if backup.is_file():
        shutil.copy2(backup, html_path)
        log(f"Restored {html_path.name} from backup.")


def rebake_env(html_path: Path) -> dict[str, str]:
    env = os.environ.copy()
    env["REBAKE_HTML"] = str(html_path)
    return env


def run_rebake(py: str, html_path: Path) -> None:
    env = rebake_env(html_path)
    for script, label in REBAKE_STEPS:
        path = REBAKE_DIR / script
        if not path.is_file():
            raise FileNotFoundError(f"Missing rebake script: {path}")
        log(f"=== {label} ===")
        subprocess.run([py, str(path)], check=True, cwd=str(ROOT), env=env)

    sanitize = REBAKE_DIR / "rebake-sanitize-html.py"
    if sanitize.is_file():
        subprocess.run([py, str(sanitize), str(html_path)], check=True, cwd=str(ROOT), env=env)


def install_paperdoll_standalone(py: str) -> None:
    if not EP_STANDALONE.is_dir():
        raise FileNotFoundError(f"Missing paperdoll editor folder: {EP_STANDALONE}")

    editor_html = EP_STANDALONE / "CoT-Body-Pose-Editor.html"
    if not editor_html.is_file():
        raise FileNotFoundError(f"Missing editor entry point: {editor_html}")

    if BUILD_EMBED.is_file():
        log("=== Paperdoll editor (rebuild offline assets) ===")
        subprocess.run([py, str(BUILD_EMBED)], check=True, cwd=str(EP_STANDALONE))

    manifest_script = REBAKE_DIR / "refresh-mods-manifest.py"
    if manifest_script.is_file():
        log("=== Paperdoll clothing packs (refresh mods/manifest.json) ===")
        subprocess.run([py, str(manifest_script)], check=True, cwd=str(ROOT))

    log("=== Paperdoll editor (launchers) ===")
    editor_rel = "exhibition-paperdoll/standalone/CoT-Body-Pose-Editor.html"

    LAUNCHER_SH.write_text(
        "#!/usr/bin/env bash\n"
        "ROOT=\"$(cd \"$(dirname \"${BASH_SOURCE[0]}\")\" && pwd)\"\n"
        f"TARGET=\"$ROOT/{editor_rel}\"\n"
        "if command -v xdg-open >/dev/null 2>&1; then\n"
        "  xdg-open \"$TARGET\"\n"
        "elif command -v open >/dev/null 2>&1; then\n"
        "  open \"$TARGET\"\n"
        "else\n"
        "  echo \"Open this file in Chrome or Edge:\"\n"
        "  echo \"  $TARGET\"\n"
        "fi\n",
        encoding="utf-8",
    )
    LAUNCHER_SH.chmod(0o755)

    LAUNCHER_BAT.write_text(
        "@echo off\r\n"
        "cd /d \"%~dp0\"\r\n"
        f"start \"\" \"%~dp0{editor_rel.replace('/', chr(92))}\"\r\n",
        encoding="utf-8",
    )

    log(f"  Editor: {editor_rel}")
    log(f"  Linux launcher: {LAUNCHER_SH.name}")
    log(f"  Windows launcher: {LAUNCHER_BAT.name}")


def success_message(html_path: Path) -> None:
    log("")
    log("=== Installation complete ===")
    log(f"  Play the game: open {html_path.name} and hard-refresh (Ctrl+Shift+R).")
    system = platform.system()
    if system == "Windows":
        log(f"  Paperdoll editor: double-click \"{LAUNCHER_BAT.name}\"")
        log("  Uninstall: double-click uninstall.bat")
    else:
        log(f"  Paperdoll editor: run ./{LAUNCHER_SH.name}")
        log("  Uninstall: run ./uninstall.sh")
    log("  (Chrome or Edge recommended for Save to game in the editor.)")


def write_install_record(html_path: Path, backup: Path) -> None:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    version = "unknown"
    if VERSION_PATH.is_file():
        version = VERSION_PATH.read_text(encoding="utf-8").strip() or version
    record = {
        "version": version,
        "installedAt": datetime.now(timezone.utc).isoformat(),
        "gameHtml": html_path.name,
        "backup": str(backup.relative_to(ROOT)).replace("\\", "/"),
        "launchers": [LAUNCHER_SH.name, LAUNCHER_BAT.name],
    }
    RECORD_PATH.write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    log(f"Install record: {RECORD_PATH.relative_to(ROOT)}")


def main(argv: list[str] | None = None) -> int:
    argv = list(argv or sys.argv[1:])
    html_arg = None
    if argv and not argv[0].startswith("-"):
        html_arg = argv[0]

    py = sys.executable
    log("Exhibition Mod Installer")
    log(f"  Folder: {ROOT}")
    log(f"  Python: {py}")
    log("")

    try:
        html_path = find_game_html(html_arg)
    except FileNotFoundError as exc:
        log(f"ERROR: {exc}")
        return 1

    if not (REBAKE_DIR / "rebake_target.py").is_file():
        log(f"ERROR: Incomplete mod package (missing {REBAKE_DIR.name}/).")
        return 1

    log(f"Target game HTML: {html_path.name}")
    backup = backup_html(html_path)
    log("")

    try:
        run_rebake(py, html_path)
        install_paperdoll_standalone(py)
        write_install_record(html_path, backup)
    except (subprocess.CalledProcessError, FileNotFoundError, OSError) as exc:
        log("")
        log(f"ERROR: Installation failed — {exc}")
        restore_backup(html_path, backup)
        log(f"Backup kept at: {backup}")
        return 1

    success_message(html_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())