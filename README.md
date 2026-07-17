# Exhibition Mod — Alpha

**Version:** see [VERSION](VERSION) (`0.1.0-alpha.1`)

An **appearance / paperdoll extension** for **Course of Temptation** desktop HTML builds, plus a **standalone clothing & face editor** that saves image packs into the game folder.

> **Alpha:** expect rough edges. Pack format and UI may change. Back up your game HTML before installing.

---

## What you get

| Piece | Purpose |
|--------|---------|
| **Paperdoll engine** | Draws PC/NPC body, clothes, face, makeup, displacements |
| **Standalone editor** | Author clothing skins, base faces, makeup, backgrounds |
| **Install scripts** | Patch your game HTML + set up folders (Linux & Windows) |
| **In-game features** | Appearance sidebar, Face mirror, NPC Appearance tab, tanning, lake, etc. |

**Not included:** the Course of Temptation game itself. You must already own a desktop HTML build.

---

## Install (players) — Linux

1. Copy/unzip this mod **into the same folder** as your game HTML  
   (e.g. next to `CourseOfTemptationtest.html`).
2. Open a terminal in that folder.
3. Run:

```bash
chmod +x install.sh
./install.sh
```

4. Needs **Python 3**.  
5. Open your **game** HTML (not the installer page) and hard-refresh: **Ctrl+Shift+R**.

Optional: `./install.sh /path/to/CourseOfTemptationtest.html`

### Uninstall (Linux)

**Easiest:** double-click **`Uninstall Exhibition Mod.desktop`** or **`uninstall.sh`**  
(no terminal typing required).

You’ll get **popup Yes/No questions**:
1. **Uninstall Exhibition Mod?** — restores game HTML + removes editor shortcuts  
2. **Remove mod folders too?** — **Yes** = full clean; **No** = keep files so you can reinstall later  

Optional silent (power users only):

```bash
./uninstall.sh -y          # restore HTML, keep folders
./uninstall.sh -y --purge  # full clean, no questions
```

Popups use **zenity** / **kdialog** / **tkinter** (whichever is available).  
Most desktop Linux installs already have one of these.

---

## Install (players) — Windows

1. Unzip this mod into the folder that contains your game `.html`.
2. Double-click **`install.bat`**  
   (or build/run `install.exe` via `build-install-exe.bat` if you ship that).
3. Requires **Python 3** on PATH unless you use a built `install.exe`.
4. Open the game HTML → **Ctrl+Shift+R**.

### Uninstall (Windows)

Double-click **`uninstall.bat`** (uses popups; no command line).

1. **Uninstall?** — Yes/No  
2. **Also delete mod folders?** — Yes = full clean; No = keep files for later  

No terminal window needed when Python includes `pythonw` (normal install).

---

## What the installer does

1. Backs up your game HTML under `backup/`.
2. **Rebakes** exhibition features into that HTML (paperdoll engine, sidebar, tanning, NPC appearance, lake/mall hooks, etc.).
3. Ensures **`exhibition-paperdoll/`** exists with:
   - `base-pack/` — body poses  
   - `mods/` + `manifest.json` — clothing/face packs  
   - `standalone/` — the asset editor  
   - `backgrounds/` — mirror background images  
4. Writes launchers:
   - Linux: `Exhibition Paperdoll Editor.sh`  
   - Windows: `Exhibition Paperdoll Editor.bat`

If install fails, it restores the backup HTML.

### What the uninstaller does

1. **Popup:** “Uninstall Exhibition Mod?” (Yes/No).
2. **Popup:** “Remove mod folders too?” (Yes = full clean, No = keep files for later).
3. Restores your game HTML from `backup/<name>.install-backup.html` (created on install).
4. Removes `Exhibition Paperdoll Editor.sh` / `.bat` launchers.
5. If you chose Yes on folders: deletes mod source folders from the game directory.
6. Leaves install backups under `backup/` so you still have a recovery copy.
7. Shows a final “Uninstall complete” popup.

If no backup exists (manual copy, old install), it tries a best-effort strip of injected exhibition blocks and keeps a safety copy under `backup/`.

---

## Standalone clothing / face editor

**Chrome or Edge** recommended (Save to game uses the File System Access API).

1. Run the launcher, or open:

   `exhibition-paperdoll/standalone/CoT-Body-Pose-Editor.html`

2. **Connect** once to the folder that contains `exhibition-paperdoll/` and your game HTML.
3. Workflows:
   - **Clothing** — bind layers to game items; **+ New Skin** for graphic designs (`sub design` text).
   - **Face / hair / makeup** — base faces, distinguishing features, makeup slots.
   - **Backgrounds** — Black / White / Slate / Checker; **+ BG image** then Save to share with in-game mirrors.
4. **Save to game** writes under `exhibition-paperdoll/mods/` (and related folders).
5. Hard-refresh the game. **Asset-only** saves do not need a full reinstall.

After manually adding/removing pack folders:

```bash
./refresh-mods-manifest.sh
```

---

## How it works (base level)

```
┌─────────────────┐     install/rebake      ┌──────────────────┐
│  Your game HTML │ ◄────────────────────── │  rebake/*.py     │
└────────┬────────┘   injects engine + UI   └──────────────────┘
         │ loads at runtime
         ▼
┌─────────────────┐     Save from editor    ┌──────────────────┐
│ exhibition-     │ ◄────────────────────── │ Standalone       │
│ paperdoll/      │   pack.json + PNGs      │ CoT-Body-Pose-   │
│  base-pack/     │                         │ Editor.html      │
│  mods/          │                         └──────────────────┘
│  backgrounds/   │
└─────────────────┘
```

- **Runtime:** game JS draws the doll from `base-pack` + `mods` (+ face/makeup overlays).
- **Editor:** authors PNG layers, binds them to CoT clothing IDs / face IDs / makeup slots.
- **New Skin:** one shop item (e.g. Graphic T-shirt) + many design-specific images matched to shop `sub design` text.
- **Face popup:** close-up + makeup; makeup **edit** only in bathroom / Apply makeup locations (view anywhere).

---

## When you must reinstall / rebake

| Change | Action |
|--------|--------|
| New clothing/face **images** via editor | Save to game + hard-refresh |
| Engine or feature **code** changes | `./install.sh` or `./rebake-dev.sh` |
| New CoT **base game** version | Re-run installer against new HTML |

Modders working on this repo:

```bash
./rebake-dev.sh   # rebakes into appearance-dev HTML only
```

---

## Folder layout (release package)

```
VERSION, LICENSE, README.md, THIRD_PARTY.md
install.py / install.sh / install.bat
rebake/                          # patches game HTML
exhibition-paperdoll/            # engine + editor + packs
exhibition-sidebar/
exhibition-tanning/
exhibition-wear-defaults/
display-npc-appearance/
npc-exhibition-outfits/
university-lake/  university-mall/
lake-beach-npcs/  lake-tanning/
social-people-fix/
```

---

## Building a release archive

From a clean tree (no personal game HTML):

```bash
./prepare-opensource-release.sh
```

Outputs:

- `dist/exhibition-mod-0.1.0-alpha.1.zip`
- `dist/exhibition-mod-0.1.0-alpha.1.tar.gz`
- staged source under `dist/exhibition-mod-src/`

Excluded automatically: game HTML, backups, draft image folders, third-party `PaperDoll/` dumps.

---

## Git / forks

```bash
git init
git add .
git commit -m "Initial import: Exhibition Mod 0.1.0-alpha.1"
# create empty repo on GitHub/GitLab, then:
git remote add origin git@github.com:YOU/exhibition-mod.git
git branch -M main
git push -u origin main
```

Others can **fork**, change engine/editor packs, and open PRs under MIT.

---

## License & “is this my code?”

- **Exhibition Mod source** in this package: **MIT** — you may release/fork it if **you** wrote it or contributors agreed to MIT.
- **JSZip** (editor vendor): third-party MIT/GPL — keep attribution ([THIRD_PARTY.md](THIRD_PARTY.md)).
- **Course of Temptation** game: **not yours to redistribute** — players must own it.

See [THIRD_PARTY.md](THIRD_PARTY.md) before publishing.

---

## Alpha notes / known directions

- Face/makeup/skins/background systems are actively evolving.
- NPC faces can share PC test art until per-NPC face picks are authored.
- Clothing only shows for items with pack art + correct `cotBindings`.

---

## Support

Open an issue on your Git host with: OS, game HTML name, installer log, and whether the problem is **play** or **editor**.
