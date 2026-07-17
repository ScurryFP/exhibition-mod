#!/usr/bin/env python3
"""One-click Exhibition mod uninstaller — restores game HTML and removes launchers."""

from __future__ import annotations

import argparse
import json
import platform
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKUP_DIR = ROOT / "backup"
RECORD_PATH = BACKUP_DIR / "install-record.json"

# Same discovery rules as install.py
GAME_HTML_PREFERRED = "CourseOfTemptationtest.html"
GAME_HTML_FALLBACKS = ("CourseOfTemptation.html",)
SKIP_HTML_NAMES = frozenset(
	{
		"CourseOfTemptation-Exhibition-appearance-dev.html",
		"CourseOfTemptation-Exhibition-installer.html",
	}
)

LAUNCHER_SH = ROOT / "Exhibition Paperdoll Editor.sh"
LAUNCHER_BAT = ROOT / "Exhibition Paperdoll Editor.bat"

# Optional full purge (only with --purge). Does not delete this uninstall script's parent package
# unless --purge-package is set.
PURGE_DIRS = (
	"exhibition-paperdoll",
	"exhibition-sidebar",
	"exhibition-tanning",
	"exhibition-wear-defaults",
	"display-npc-appearance",
	"npc-exhibition-outfits",
	"university-lake",
	"university-mall",
	"lake-beach-npcs",
	"lake-tanning",
	"social-people-fix",
	"paperdoll-npc-subject",
	"rebake",
)

# Engine / feature markers injected into game HTML (best-effort strip if no backup)
ENGINE_MARKERS = (
	"/* === Exhibition Paperdoll Engine === */",
	"/* === Exhibition Paperdoll (standalone) === */",
	"/* === DisplayNPC Appearance tab === */",
	"/* === DisplayNPC Appearance CSS === */",
	"/* === Exhibition Face Picker CSS === */",
	"/* === Exhibition Sidebar (clothing status tweaks) === */",
)

PAPERDOLL_PASSAGE_NAMES = (
	"PaperdollUtil",
	"ExhibitionPaperdollUtil",
	"PaperdollMirror",
	"PaperdollMirrorPassage",
	"ExhibitionFacePickerWidgets",
	"PaperdollFace",
	"PaperdollFacePassage",
	"DisplayNPCAppearanceWidgets",
)


def log(msg: str) -> None:
	print(msg, flush=True)


def find_game_html(explicit: str | None = None) -> Path | None:
	if explicit:
		path = Path(explicit)
		if not path.is_absolute():
			path = ROOT / path
		return path.resolve() if path.is_file() else None

	record = load_record()
	if record and record.get("gameHtml"):
		cand = ROOT / record["gameHtml"]
		if cand.is_file():
			return cand.resolve()

	preferred = ROOT / GAME_HTML_PREFERRED
	if preferred.is_file():
		return preferred.resolve()

	for name in GAME_HTML_FALLBACKS:
		candidate = ROOT / name
		if candidate.is_file():
			return candidate.resolve()

	for path in sorted(ROOT.glob("CourseOfTemptation*.html")):
		if path.name not in SKIP_HTML_NAMES:
			return path.resolve()
	return None


def load_record() -> dict | None:
	if not RECORD_PATH.is_file():
		return None
	try:
		return json.loads(RECORD_PATH.read_text(encoding="utf-8"))
	except (OSError, json.JSONDecodeError):
		return None


def find_backup(html_path: Path | None) -> Path | None:
	record = load_record()
	if record and record.get("backup"):
		cand = ROOT / record["backup"]
		if cand.is_file():
			return cand

	if html_path:
		primary = BACKUP_DIR / f"{html_path.stem}.install-backup.html"
		if primary.is_file():
			return primary
		# Older / rebake backups
		for pattern in (
			f"{html_path.stem}.install-backup.html",
			f"{html_path.stem}.rebake-backup.html",
			f"{html_path.name}.install-backup.html",
		):
			cand = BACKUP_DIR / pattern
			if cand.is_file():
				return cand

	if BACKUP_DIR.is_dir():
		backups = sorted(
			BACKUP_DIR.glob("*.install-backup.html"),
			key=lambda p: p.stat().st_mtime,
			reverse=True,
		)
		if backups:
			return backups[0]
	return None


def restore_html(html_path: Path, backup: Path) -> None:
	shutil.copy2(backup, html_path)
	log(f"  Restored {html_path.name} from {backup.relative_to(ROOT)}")


def strip_engine_from_html(html_path: Path) -> bool:
	"""Best-effort remove injected engine when no install backup exists."""
	text = html_path.read_text(encoding="utf-8", errors="replace")
	original = text

	# Drop known injected script blocks up to next major anchor
	for marker in ENGINE_MARKERS:
		if marker not in text:
			continue
		# From marker through next blank line before </script> or next /* ===
		text = re.sub(
			re.escape(marker) + r"[\s\S]*?(?=\n/\* === |\n</script>)",
			"",
			text,
			count=1,
		)

	for name in PAPERDOLL_PASSAGE_NAMES:
		text = re.sub(
			rf'<tw-passagedata[^>]*\bname="{re.escape(name)}"[^>]*>[\s\S]*?</tw-passagedata>\s*',
			"",
			text,
		)

	# Appearance tab injection (DisplayNPC)
	text = text.replace(
		"    &lt;&lt;tab &quot;Appearance&quot;&gt;&gt;\n"
		"\n"
		"        &lt;&lt;displaynpcappearance _personobj&gt;&gt;\n"
		"\n",
		"",
	)

	if text == original:
		return False
	# Safety backup before strip
	BACKUP_DIR.mkdir(parents=True, exist_ok=True)
	safety = BACKUP_DIR / f"{html_path.stem}.pre-uninstall-strip.html"
	shutil.copy2(html_path, safety)
	html_path.write_text(text, encoding="utf-8")
	log(f"  Stripped exhibition injects from {html_path.name}")
	log(f"  Safety copy: {safety.relative_to(ROOT)}")
	return True


def remove_launchers() -> list[str]:
	removed: list[str] = []
	for path in (LAUNCHER_SH, LAUNCHER_BAT):
		if path.is_file():
			path.unlink()
			removed.append(path.name)
			log(f"  Removed launcher: {path.name}")
	return removed


def purge_mod_dirs() -> list[str]:
	removed: list[str] = []
	for name in PURGE_DIRS:
		path = ROOT / name
		if path.is_dir():
			shutil.rmtree(path)
			removed.append(name + "/")
			log(f"  Removed folder: {name}/")
	return removed


_TK_ROOT = None
_GUI_BACKEND: str | None = None  # "tk" | "zenity" | "kdialog" | "powershell" | None


def _which(cmd: str) -> str | None:
	return shutil.which(cmd)


def _tk_available() -> bool:
	try:
		import tkinter  # noqa: F401
		from tkinter import messagebox  # noqa: F401

		return True
	except Exception:
		return False


def _detect_gui_backend() -> str | None:
	"""Pick a Yes/No popup backend (no terminal). Prefer native desktop tools."""
	global _GUI_BACKEND
	if _GUI_BACKEND is not None:
		return _GUI_BACKEND or None

	# 1) tkinter (works well with pythonw on Windows)
	if _tk_available():
		_GUI_BACKEND = "tk"
		return _GUI_BACKEND

	system = platform.system()
	if system == "Windows":
		# PowerShell MessageBox — no extra install on Windows
		if _which("powershell") or _which("powershell.exe"):
			_GUI_BACKEND = "powershell"
			return _GUI_BACKEND
		_GUI_BACKEND = ""
		return None

	# Linux / macOS desktop dialogs (common on player machines)
	if _which("zenity"):
		_GUI_BACKEND = "zenity"
		return _GUI_BACKEND
	if _which("kdialog"):
		_GUI_BACKEND = "kdialog"
		return _GUI_BACKEND
	if _which("yad"):
		_GUI_BACKEND = "yad"
		return _GUI_BACKEND

	_GUI_BACKEND = ""
	return None


def gui_available() -> bool:
	return _detect_gui_backend() is not None


def _ensure_tk():
	"""Hidden root so messageboxes work when double-clicked (no terminal)."""
	global _TK_ROOT
	if _TK_ROOT is not None:
		return _TK_ROOT
	import tkinter as tk

	_TK_ROOT = tk.Tk()
	_TK_ROOT.withdraw()
	try:
		_TK_ROOT.attributes("-topmost", True)
	except Exception:
		pass
	return _TK_ROOT


def _run(cmd: list[str], *, timeout: float = 600) -> subprocess.CompletedProcess[str]:
	return subprocess.run(
		cmd,
		capture_output=True,
		text=True,
		timeout=timeout,
		check=False,
	)


def _powershell_yes_no(title: str, message: str, *, default_yes: bool) -> bool | None:
	"""Windows MessageBox Yes/No. Returns None if PowerShell failed."""
	# 6 = Yes, 7 = No  (VB YesNo)
	default_btn = 0 if default_yes else 256  # vbDefaultButton1 / Button2
	# Escape for single-quoted PowerShell string
	t = title.replace("'", "''")
	m = message.replace("'", "''")
	ps = (
		"Add-Type -AssemblyName PresentationFramework; "
		f"$r = [System.Windows.MessageBox]::Show('{m}', '{t}', "
		f"'YesNo', 'Question', '{'Yes' if default_yes else 'No'}'); "
		"if ($r -eq 'Yes') { exit 0 } else { exit 1 }"
	)
	exe = _which("powershell") or _which("powershell.exe")
	if not exe:
		return None
	try:
		r = _run([exe, "-NoProfile", "-STA", "-Command", ps])
		return r.returncode == 0
	except Exception:
		return None


def _powershell_info(title: str, message: str, icon: str = "Information") -> None:
	t = title.replace("'", "''")
	m = message.replace("'", "''")
	ps = (
		"Add-Type -AssemblyName PresentationFramework; "
		f"[System.Windows.MessageBox]::Show('{m}', '{t}', 'OK', '{icon}') | Out-Null"
	)
	exe = _which("powershell") or _which("powershell.exe")
	if not exe:
		return
	try:
		_run([exe, "-NoProfile", "-STA", "-Command", ps])
	except Exception:
		pass


def _zenity_yes_no(title: str, message: str) -> bool | None:
	try:
		r = _run(
			[
				"zenity",
				"--question",
				"--title",
				title,
				"--text",
				message,
				"--ok-label",
				"Yes",
				"--cancel-label",
				"No",
				"--width",
				"420",
			]
		)
		# 0 = Yes, 1 = No, 5 = timeout, 255 = closed
		if r.returncode == 0:
			return True
		if r.returncode in (1, 5, 255):
			return False
		return None
	except Exception:
		return None


def _zenity_info(title: str, message: str, *, error: bool = False) -> None:
	flag = "--error" if error else "--info"
	try:
		_run(
			[
				"zenity",
				flag,
				"--title",
				title,
				"--text",
				message,
				"--width",
				"420",
			]
		)
	except Exception:
		pass


def _kdialog_yes_no(title: str, message: str) -> bool | None:
	try:
		r = _run(["kdialog", "--title", title, "--yesno", message])
		if r.returncode == 0:
			return True
		if r.returncode == 1:
			return False
		return None
	except Exception:
		return None


def _kdialog_info(title: str, message: str, *, error: bool = False) -> None:
	cmd = "error" if error else "msgbox"
	try:
		_run(["kdialog", "--title", title, f"--{cmd}", message])
	except Exception:
		pass


def _yad_yes_no(title: str, message: str) -> bool | None:
	try:
		r = _run(
			[
				"yad",
				"--question",
				"--title",
				title,
				"--text",
				message,
				"--button=Yes:0",
				"--button=No:1",
				"--width=420",
			]
		)
		if r.returncode == 0:
			return True
		if r.returncode == 1:
			return False
		return None
	except Exception:
		return None


def _yad_info(title: str, message: str, *, error: bool = False) -> None:
	icon = "error" if error else "info"
	try:
		_run(
			[
				"yad",
				f"--{icon}",
				"--title",
				title,
				"--text",
				message,
				"--button=OK:0",
				"--width=420",
			]
		)
	except Exception:
		pass


def ask_yes_no(title: str, message: str, *, default_yes: bool = False) -> bool:
	"""Popup Yes/No when possible; falls back to terminal y/N only as last resort."""
	backend = _detect_gui_backend()

	if backend == "tk":
		from tkinter import messagebox

		_ensure_tk()
		if default_yes:
			return bool(messagebox.askyesno(title, message, default=messagebox.YES))
		return bool(messagebox.askyesno(title, message, default=messagebox.NO))

	if backend == "zenity":
		ans = _zenity_yes_no(title, message)
		if ans is not None:
			return ans

	if backend == "kdialog":
		ans = _kdialog_yes_no(title, message)
		if ans is not None:
			return ans

	if backend == "yad":
		ans = _yad_yes_no(title, message)
		if ans is not None:
			return ans

	if backend == "powershell":
		ans = _powershell_yes_no(title, message, default_yes=default_yes)
		if ans is not None:
			return ans

	# Terminal fallback (only if no GUI tool works)
	suffix = " [Y/n] " if default_yes else " [y/N] "
	try:
		ans = input(f"{title}\n{message}{suffix}").strip().lower()
	except EOFError:
		return default_yes
	if not ans:
		return default_yes
	return ans in ("y", "yes")


def show_info(title: str, message: str) -> None:
	backend = _detect_gui_backend()
	if backend == "tk":
		from tkinter import messagebox

		_ensure_tk()
		messagebox.showinfo(title, message)
		return
	if backend == "zenity":
		_zenity_info(title, message, error=False)
		return
	if backend == "kdialog":
		_kdialog_info(title, message, error=False)
		return
	if backend == "yad":
		_yad_info(title, message, error=False)
		return
	if backend == "powershell":
		_powershell_info(title, message, icon="Information")
		return
	log(f"{title}: {message}")


def show_error(title: str, message: str) -> None:
	backend = _detect_gui_backend()
	if backend == "tk":
		from tkinter import messagebox

		_ensure_tk()
		messagebox.showerror(title, message)
		return
	if backend == "zenity":
		_zenity_info(title, message, error=True)
		return
	if backend == "kdialog":
		_kdialog_info(title, message, error=True)
		return
	if backend == "yad":
		_yad_info(title, message, error=True)
		return
	if backend == "powershell":
		_powershell_info(title, message, icon="Error")
		return
	log(f"ERROR — {title}: {message}")


def main(argv: list[str] | None = None) -> int:
	parser = argparse.ArgumentParser(
		description="Uninstall Exhibition Mod from this game folder."
	)
	parser.add_argument(
		"html",
		nargs="?",
		help="Optional path to game HTML (default: auto-detect)",
	)
	parser.add_argument(
		"-y",
		"--yes",
		action="store_true",
		help="Skip popups (assume Yes for uninstall; folders kept unless --purge)",
	)
	parser.add_argument(
		"--purge",
		action="store_true",
		help="Delete mod folders without asking (use with -y for full silent purge)",
	)
	parser.add_argument(
		"--keep-html",
		action="store_true",
		help="Do not restore/strip game HTML (only remove launchers / optional purge)",
	)
	parser.add_argument(
		"--cli",
		action="store_true",
		help="Force terminal prompts instead of GUI popups",
	)
	args = parser.parse_args(argv)

	# GUI popups by default (double-click friendly); --cli forces terminal
	use_gui = (not args.cli) and gui_available()

	def ask(title: str, message: str, default_yes: bool = False) -> bool:
		if args.yes:
			return True
		# ask_yes_no already falls back to terminal if needed
		return ask_yes_no(title, message, default_yes=default_yes)

	log("Exhibition Mod Uninstaller")
	log(f"  Folder: {ROOT}")
	if use_gui:
		log(f"  Popups: {_detect_gui_backend()}")
	else:
		log("  Popups: terminal only (install zenity or python3-tk for GUI)")
	log("")

	html_path = find_game_html(args.html)
	backup = find_backup(html_path)

	# --- Popup 1: confirm uninstall ---
	if backup and html_path:
		html_plan = f"Restore {html_path.name} from the install backup."
	elif html_path:
		html_plan = (
			f"No install backup found for {html_path.name}.\n"
			"Will try to strip exhibition code (less clean)."
		)
	else:
		html_plan = "No game HTML found — will only clean launchers / folders."

	if not args.yes:
		ok = ask(
			"Uninstall Exhibition Mod?",
			"This will:\n\n"
			f"• {html_plan}\n"
			"• Remove Paperdoll editor shortcuts (if present)\n\n"
			"Continue?",
			default_yes=False,
		)
		if not ok:
			log("Cancelled.")
			if use_gui:
				show_info("Uninstall cancelled", "Nothing was changed.")
			return 0

	# --- Popup 2: remove mod folders? (always ask unless -y or --purge already set) ---
	do_purge = bool(args.purge)
	if not args.yes and not args.purge:
		do_purge = ask(
			"Remove mod folders too?",
			"Also delete Exhibition mod folders from this directory?\n\n"
			"This removes things like:\n"
			"  • exhibition-paperdoll (engine + clothing editor + your pack images)\n"
			"  • rebake scripts and other feature modules\n\n"
			"Choose YES for a full clean.\n"
			"Choose NO to only restore the game HTML and leave files\n"
			"(so you can run install again later without re-downloading).\n\n"
			"Install/uninstall scripts stay either way.",
			default_yes=False,
		)

	log("")
	log("=== Uninstalling ===")
	log(f"  Purge folders: {'yes' if do_purge else 'no'}")

	# 1) HTML
	if not args.keep_html and html_path and html_path.is_file():
		if backup and backup.is_file():
			restore_html(html_path, backup)
		else:
			log("  No install backup — attempting strip of injected blocks…")
			if not strip_engine_from_html(html_path):
				log(
					"  WARNING: Could not strip cleanly. "
					"Restore a manual backup of your game HTML if needed."
				)
	elif not args.keep_html and not html_path:
		log("  WARNING: No game HTML to restore.")

	# 2) Launchers
	remove_launchers()

	# 3) Optional purge of mod directories
	if do_purge:
		purge_mod_dirs()
		log("  Left install/uninstall scripts in place (re-extract zip to reinstall).")

	# 4) Clear install record (keep HTML backups)
	if RECORD_PATH.is_file():
		try:
			RECORD_PATH.unlink()
			log("  Removed install-record.json")
		except OSError:
			pass

	# Write small log
	BACKUP_DIR.mkdir(parents=True, exist_ok=True)
	log_path = BACKUP_DIR / "last-uninstall.txt"
	log_path.write_text(
		f"Uninstalled at {datetime.now(timezone.utc).isoformat()}\n"
		f"HTML: {html_path.name if html_path else '(none)'}\n"
		f"Backup used: {backup.name if backup else '(none / strip)'}\n"
		f"Purge: {do_purge}\n",
		encoding="utf-8",
	)

	log("")
	log("=== Uninstall complete ===")
	summary = "Exhibition Mod has been uninstalled.\n\n"
	if html_path:
		summary += f"Game file: {html_path.name}\n"
		summary += "Hard-refresh the browser (Ctrl+Shift+R) if it still looks modded.\n\n"
	if do_purge:
		summary += "Mod folders were deleted.\n"
	else:
		summary += (
			"Mod folders were kept on disk.\n"
			"Delete the unzipped folder manually if you want them gone too.\n"
		)
	summary += "\nPre-install backup (if any) is still under backup/."

	if use_gui and not args.yes:
		show_info("Uninstall complete", summary)
	else:
		log(summary.replace("\n\n", "\n"))

	return 0


if __name__ == "__main__":
	raise SystemExit(main())
