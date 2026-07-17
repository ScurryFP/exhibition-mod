# Exhibition Base Doll — Reference Guide

Reference canvas: **256×512** (1:2 aspect). All transforms and clothing alignment use this space.

## LOD tiers

| LOD | Size | Typical use |
|-----|------|-------------|
| 256 | 256×512 | Sidebar thumbnail |
| 512 | 512×1024 | Shop, NPC appearance |
| 1024 | 1024×2048 | High preview |
| 2048 | 2048×4096 | Mirror, selfies, capture |

Ship at least `body_256.png`. Higher tiers are optional and lazy-loaded when a view requests them.

## Nipple tier colors (authoring aid)

Markers on placeholder PNGs are **not** final art — paint over them in production packs.

| Color | Hex | Tier | Circle radius @256 |
|-------|-----|------|-------------------|
| Cool pink | `#FFB6C1` | small | 3px |
| Warm peach | `#FFCBA4` | medium | 4px |
| Rose | `#E75480` | large | 6px |
| Deep magenta | `#C71585` | xlarge | 8px |

Default pose markers use **medium**. The left-edge legend shows all four sizes.

Markers appear on **front** and **on_back** only (poses that expose the chest).

## Crotch alignment

A subtle rounded outline at the pelvis marks the crotch alignment zone on front poses.

## File layout

```
base-pack/assets/poses/{pose}/body_256.png   # required
base-pack/assets/poses/{pose}/body_512.png   # optional
base-pack/assets/poses/{pose}/body_1024.png  # optional
base-pack/assets/poses/{pose}/body_2048.png  # optional
```

`pack.json` uses a `sources` map:

```json
"sources": {
  "256": "base-pack/assets/poses/front/body_256.png",
  "2048": "base-pack/assets/poses/front/body_2048.png"
}
```

## Community hi-res base overlays

Drop a mod in `exhibition-paperdoll/mods/` with `type: "base-overlay"`:

```json
{
  "id": "my-hires-base",
  "type": "base-overlay",
  "name": "My Hi-Res Base Poses",
  "overlays": [
    {
      "layer": "body",
      "poses": {
        "front": {
          "sources": {
            "512": "my-hires-base/assets/poses/front/body_512.png",
            "2048": "my-hires-base/assets/poses/front/body_2048.png"
          }
        }
      }
    }
  ]
}
```

Overlay `sources` merge with the base pack per pose. Mirror and capture request LOD 2048; the engine picks the highest tier you provide.

Regenerate placeholders:

```bash
python3 exhibition-paperdoll/base-pack/generate_reference_bodies.py
```