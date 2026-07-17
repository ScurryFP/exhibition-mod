#!/usr/bin/env python3
"""Generate 256x512 reference body PNGs with color-coded nipple tier markers."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
W, H = 256, 512

SKIN = "#e8c4a8"
OUTLINE = "#8b6914"
HAIR = "#5c4033"

NIPPLE_TIERS = [
    ("small", "#FFB6C1"),
    ("medium", "#FFCBA4"),
    ("large", "#E75480"),
    ("xlarge", "#C71585"),
]

DEFAULT_TIER = "medium"


def cx(x: float) -> int:
    return int(W * x)


def cy(y: float) -> int:
    return int(H * y)


def draw_head(draw: ImageDraw.ImageDraw, facing: str) -> None:
    if facing == "back":
        draw.ellipse([cx(0.36), cy(0.06), cx(0.64), cy(0.22)], fill=HAIR, outline=OUTLINE)
        return
    if facing == "down":
        draw.ellipse([cx(0.36), cy(0.78), cx(0.64), cy(0.94)], fill=HAIR, outline=OUTLINE)
        return
    draw.ellipse([cx(0.36), cy(0.06), cx(0.64), cy(0.22)], fill=SKIN, outline=OUTLINE)
    if facing == "front":
        draw.ellipse([cx(0.43), cy(0.13), cx(0.47), cy(0.16)], fill="#4a3728")
        draw.ellipse([cx(0.53), cy(0.13), cx(0.57), cy(0.16)], fill="#4a3728")


def draw_torso_front(draw: ImageDraw.ImageDraw) -> None:
    draw.rounded_rectangle([cx(0.30), cy(0.22), cx(0.70), cy(0.58)], radius=12, fill=SKIN, outline=OUTLINE)
    draw.rounded_rectangle([cx(0.34), cy(0.58), cx(0.66), cy(0.72)], radius=8, fill=SKIN, outline=OUTLINE)


def draw_torso_back(draw: ImageDraw.ImageDraw) -> None:
    draw.rounded_rectangle([cx(0.30), cy(0.22), cx(0.70), cy(0.58)], radius=12, fill=SKIN, outline=OUTLINE)
    draw.line([cx(0.50), cy(0.24), cx(0.50), cy(0.56)], fill=OUTLINE, width=2)
    draw.rounded_rectangle([cx(0.34), cy(0.58), cx(0.66), cy(0.72)], radius=8, fill=SKIN, outline=OUTLINE)


def draw_legs_front(draw: ImageDraw.ImageDraw) -> None:
    draw.rounded_rectangle([cx(0.34), cy(0.70), cx(0.47), cy(0.95)], radius=8, fill=SKIN, outline=OUTLINE)
    draw.rounded_rectangle([cx(0.53), cy(0.70), cx(0.66), cy(0.95)], radius=8, fill=SKIN, outline=OUTLINE)


def draw_legs_back(draw: ImageDraw.ImageDraw) -> None:
    draw.rounded_rectangle([cx(0.34), cy(0.70), cx(0.47), cy(0.95)], radius=8, fill=SKIN, outline=OUTLINE)
    draw.rounded_rectangle([cx(0.53), cy(0.70), cx(0.66), cy(0.95)], radius=8, fill=SKIN, outline=OUTLINE)


def draw_arms_front(draw: ImageDraw.ImageDraw, spread: float = 0.0) -> None:
    draw.rounded_rectangle([cx(0.18 - spread), cy(0.26), cx(0.30 - spread), cy(0.62)], radius=6, fill=SKIN, outline=OUTLINE)
    draw.rounded_rectangle([cx(0.70 + spread), cy(0.26), cx(0.82 + spread), cy(0.62)], radius=6, fill=SKIN, outline=OUTLINE)


def draw_arms_back(draw: ImageDraw.ImageDraw) -> None:
    draw.rounded_rectangle([cx(0.20), cy(0.26), cx(0.30), cy(0.62)], radius=6, fill=SKIN, outline=OUTLINE)
    draw.rounded_rectangle([cx(0.70), cy(0.26), cx(0.80), cy(0.62)], radius=6, fill=SKIN, outline=OUTLINE)


def nipple_radius(tier: str) -> int:
    return {"small": 3, "medium": 4, "large": 6, "xlarge": 8}[tier]


def draw_nipples(draw: ImageDraw.ImageDraw, tier: str = DEFAULT_TIER, back_view: bool = False) -> None:
    color = dict(NIPPLE_TIERS)[tier]
    r = nipple_radius(tier)
    y = cy(0.40) if not back_view else cy(0.38)
    for x in (cx(0.40), cx(0.60)):
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color, outline=OUTLINE)


def draw_tier_legend(draw: ImageDraw.ImageDraw) -> None:
    x0, y0 = cx(0.04), cy(0.30)
    gap = cy(0.05)
    draw.text((x0, cy(0.24)), "NIP", fill=OUTLINE)
    for i, (name, color) in enumerate(NIPPLE_TIERS):
        y = y0 + i * gap
        r = nipple_radius(name)
        draw.ellipse([x0, y - r, x0 + r * 2, y + r], fill=color, outline=OUTLINE)
        draw.text((x0 + r * 2 + 4, y - 5), name[:1].upper(), fill=OUTLINE)


def draw_crotch_zone(draw: ImageDraw.ImageDraw) -> None:
    draw.rounded_rectangle([cx(0.42), cy(0.56), cx(0.58), cy(0.64)], radius=4, outline="#c49a6c", width=1)


def render_pose(pose: str) -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if pose == "front":
        draw_head(draw, "front")
        draw_torso_front(draw)
        draw_arms_front(draw)
        draw_legs_front(draw)
        draw_nipples(draw, DEFAULT_TIER, False)
        draw_crotch_zone(draw)
        draw_tier_legend(draw)
    elif pose == "back":
        draw_head(draw, "back")
        draw_torso_back(draw)
        draw_arms_back(draw)
        draw_legs_back(draw)
    elif pose == "on_back":
        draw_legs_front(draw)
        draw_torso_front(draw)
        draw_arms_front(draw, 0.04)
        draw_head(draw, "front")
        draw_nipples(draw, DEFAULT_TIER, False)
        draw_tier_legend(draw)
    elif pose == "on_stomach":
        draw_legs_back(draw)
        draw_torso_back(draw)
        draw_arms_back(draw)
        draw_head(draw, "down")
    else:
        raise ValueError(pose)

    label = pose.replace("_", " ")
    draw.text((cx(0.34), cy(0.02)), label, fill=OUTLINE)
    return img


def render_reference_sheet() -> Image.Image:
    sw, sh = W * 2, H // 2
    img = Image.new("RGBA", (sw, sh), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((8, 8), "Nipple tier reference (1:2 canvas)", fill=OUTLINE)
    x = 16
    for name, color in NIPPLE_TIERS:
        r = nipple_radius(name)
        y = sh // 2
        draw.ellipse([x, y - r, x + r * 2, y + r], fill=color, outline=OUTLINE)
        draw.text((x, y + r + 4), name, fill=OUTLINE)
        x += 56
    return img


def main() -> None:
    poses = ["front", "back", "on_back", "on_stomach"]
    for pose in poses:
        out_dir = ROOT / "assets" / "poses" / pose
        out_dir.mkdir(parents=True, exist_ok=True)
        img = render_pose(pose)
        path = out_dir / "body_256.png"
        img.save(path, optimize=True)
        legacy = out_dir / "body.png"
        img.save(legacy, optimize=True)
        print(f"Wrote {path.relative_to(ROOT)} ({W}x{H})")

    sheet = render_reference_sheet()
    sheet_path = ROOT / "reference-sheet_256.png"
    sheet.save(sheet_path, optimize=True)
    print(f"Wrote {sheet_path.name}")


if __name__ == "__main__":
    main()