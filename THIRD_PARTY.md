# Third-party components and your rights to release

This document explains what you can redistribute as **Exhibition Mod** and what you must not ship as if it were yours.

## Base game (Course of Temptation)

**Not included in this package.**

Course of Temptation is a separate product with its own license and rights holders. This mod:

- Is designed to be **installed next to** a game HTML the player already owns
- **Patches** that HTML via rebake scripts during install
- Does **not** redistribute the base game story, images, or HTML

Do **not** put the vanilla or modded full game HTML into a public Git repo or release ZIP unless you have explicit permission from the game authors.

## Exhibition Mod source (this repository)

Code and assets under folders such as:

- `exhibition-paperdoll/` (engine, standalone editor, packs you authored)
- `exhibition-sidebar/`, `exhibition-tanning/`, `exhibition-wear-defaults/`
- `display-npc-appearance/`, `npc-exhibition-outfits/`
- `university-lake/`, `university-mall/`, `lake-beach-npcs/`, `lake-tanning/`
- `social-people-fix/`, `rebake/`, `install.py`, docs

…were written or assembled for this exhibition/paperdoll project and are released under the **MIT License** (see [LICENSE](LICENSE)).

You may fork, modify, and redistribute **this mod’s source** under MIT. Contributors should only submit work they have the right to license under MIT.

## Bundled third-party library

### JSZip (MIT or GPLv3)

- Path: `exhibition-paperdoll/standalone/vendor/jszip.min.js`
- Project: <https://stuk.github.io/jszip/>
- Used by the standalone editor for import/export of asset-pack ZIPs
- Keep the vendor file and attribution when redistributing

## Not part of the open-source release (excluded)

These may exist in a private working tree but are **stripped** from release archives:

| Path | Why excluded |
|------|----------------|
| `CourseOfTemptation*.html` (except installer page) | Base / personal game HTML |
| `backup/` | Local install backups |
| `old edits/`, `Images foe edit/`, `Zips/` | Local drafts |
| `PaperDoll/` | Upstream CoT-Paperdoll reference, not this engine |
| `res/paperdoll/` | Legacy paperdoll image packs if present |

## Alpha disclaimer

This is an **alpha** build. APIs, pack formats, and install steps may change. Report issues via your project’s Git host.

## Summary for “is this my code?”

| Component | Can you MIT-release it? |
|-----------|-------------------------|
| Exhibition paperdoll engine, editor, rebake scripts, feature modules you wrote | **Yes** (this LICENSE) |
| JSZip vendor file | **Yes**, with attribution (already MIT-compatible) |
| Base CoT game HTML / story / official assets | **No** — player must own the game |
| Random assets copied from other mods without permission | **No** — only ship art/code you created or have rights to |

If you authored the paperdoll system, clothing editor, face/makeup UI, skins, and install tooling in this tree, you can open-source **the mod**. Always keep the game itself separate.
