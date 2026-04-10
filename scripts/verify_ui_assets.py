import os
from dataclasses import dataclass

from PIL import Image


@dataclass(frozen=True)
class Asset:
    path: str
    size: tuple[int, int]
    mode: str | None = None


ASSETS: list[Asset] = [
    Asset("public/assets/ui/buttons/btn_primary.png", (320, 96), "RGBA"),
    Asset("public/assets/ui/buttons/btn_secondary.png", (320, 96), "RGBA"),
    Asset("public/assets/ui/buttons/btn_danger.png", (320, 96), "RGBA"),
    Asset("public/assets/ui/buttons/btn_small_primary.png", (220, 72), "RGBA"),
    Asset("public/assets/ui/buttons/btn_small_secondary.png", (220, 72), "RGBA"),
    Asset("public/assets/ui/tiles/tile_wood_64.png", (64, 64), "RGBA"),
    Asset("public/assets/ui/tiles/tile_stone_64.png", (64, 64), "RGBA"),
]

for name in [
    "panel_bronze_corner_tl.png",
    "panel_bronze_corner_tr.png",
    "panel_bronze_corner_bl.png",
    "panel_bronze_corner_br.png",
    "panel_bronze_edge_top.png",
    "panel_bronze_edge_bottom.png",
    "panel_bronze_edge_left.png",
    "panel_bronze_edge_right.png",
    "panel_bronze_center.png",
    "panel_gold_corner_tl.png",
    "panel_gold_corner_tr.png",
    "panel_gold_corner_bl.png",
    "panel_gold_corner_br.png",
    "panel_gold_edge_top.png",
    "panel_gold_edge_bottom.png",
    "panel_gold_edge_left.png",
    "panel_gold_edge_right.png",
    "panel_gold_center.png",
]:
    p = f"public/assets/ui/frames/{name}"
    if "corner" in name:
        ASSETS.append(Asset(p, (28, 28), "RGBA"))
    elif "edge_top" in name or "edge_bottom" in name:
        ASSETS.append(Asset(p, (64, 28), "RGBA"))
    elif "edge_left" in name or "edge_right" in name:
        ASSETS.append(Asset(p, (28, 64), "RGBA"))
    else:
        ASSETS.append(Asset(p, (64, 64), "RGBA"))

for p in ["bartender", "mercenary", "alchemist", "noble", "thief", "priest", "hunter", "mage", "guard", "sailor"]:
    ASSETS.append(Asset(f"public/assets/icons/professions/{p}.png", (64, 64), "RGBA"))
for r in ["human", "elf", "dwarf", "orc", "tiefling", "vampire", "undead", "beastkin"]:
    ASSETS.append(Asset(f"public/assets/icons/races/{r}.png", (64, 64), "RGBA"))
    ASSETS.append(Asset(f"public/assets/portraits/races/{r}.png", (384, 512), "RGBA"))
for p in ["bartender", "mercenary", "alchemist", "noble", "thief", "priest", "hunter", "mage"]:
    ASSETS.append(Asset(f"public/assets/portraits/professions/{p}.png", (384, 512), "RGBA"))
for s in ["ap", "gold", "reputation", "alert"]:
    ASSETS.append(Asset(f"public/assets/icons/status/{s}.png", (64, 64), "RGBA"))


def alpha_nonempty(img: Image.Image) -> bool:
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    return bbox is not None


if __name__ == "__main__":
    ok = 0
    bad = 0
    for a in ASSETS:
        if not os.path.exists(a.path):
            print(f"BAD missing {a.path}")
            bad += 1
            continue
        try:
            img = Image.open(a.path)
            if img.size != a.size:
                print(f"BAD size {a.path} got={img.size} exp={a.size}")
                bad += 1
                continue
            if a.mode and img.mode != a.mode:
                img = img.convert(a.mode)
            if a.mode == "RGBA" and not alpha_nonempty(img):
                print(f"BAD alpha_empty {a.path}")
                bad += 1
                continue
            ok += 1
        except Exception as e:
            print(f"BAD unreadable {a.path} {e}")
            bad += 1
    print(f"Summary: ok={ok} bad={bad} total={len(ASSETS)}")

