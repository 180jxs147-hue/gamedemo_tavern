import os
import random
from dataclasses import dataclass

from PIL import Image, ImageDraw, ImageFilter


random.seed(20260410)


def ensure_dirs():
    paths = [
        "public/assets/ui/buttons",
        "public/assets/ui/frames",
        "public/assets/ui/tiles",
        "public/assets/icons/professions",
        "public/assets/icons/races",
        "public/assets/icons/status",
        "public/assets/portraits/races",
        "public/assets/portraits/professions",
    ]
    for p in paths:
        os.makedirs(p, exist_ok=True)


def save_png(img: Image.Image, path: str):
    img.save(path, format="PNG", optimize=True)


def clamp(v: int) -> int:
    return max(0, min(255, v))


def add_noise(img: Image.Image, amount: int = 10):
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            n = random.randint(-amount, amount)
            px[x, y] = (clamp(r + n), clamp(g + n), clamp(b + n), a)


def pixelate(img: Image.Image, factor: int) -> Image.Image:
    w, h = img.size
    small = img.resize((max(1, w // factor), max(1, h // factor)), Image.Resampling.NEAREST)
    return small.resize((w, h), Image.Resampling.NEAREST)


def palette():
    return {
        "bg": (14, 10, 8, 255),
        "wood": (46, 29, 17, 255),
        "wood2": (60, 38, 22, 255),
        "bronze": (120, 79, 43, 255),
        "gold": (202, 163, 93, 255),
        "cream": (234, 220, 198, 255),
        "ink": (10, 7, 6, 255),
        "red": (155, 45, 45, 255),
        "blue": (55, 92, 125, 255),
        "green": (58, 117, 82, 255),
        "purple": (86, 60, 100, 255),
    }


def frame_9slice(out_dir: str, name: str, corner: int = 24, edge: int = 24, thickness: int = 5):
    c = palette()
    def mk(size):
        return Image.new("RGBA", size, (0, 0, 0, 0))

    def draw_corner(img: Image.Image, flip_x: bool, flip_y: bool):
        w, h = img.size
        d = ImageDraw.Draw(img)
        outer = c["bronze"]
        inner = c["gold"]
        x0, y0 = 0, 0
        x1, y1 = w - 1, h - 1
        d.rectangle([x0, y0, x1, y1], outline=outer, width=thickness)
        inset = thickness + 3
        d.rectangle([inset, inset, x1 - inset, y1 - inset], outline=inner, width=2)
        for i in range(0, w, 6):
            d.point((i, 0), fill=inner)
            d.point((0, i), fill=inner)
        if flip_x or flip_y:
            img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if flip_x else img
            img = img.transpose(Image.Transpose.FLIP_TOP_BOTTOM) if flip_y else img
        return img

    def draw_edge(img: Image.Image, horizontal: bool):
        w, h = img.size
        d = ImageDraw.Draw(img)
        outer = c["bronze"]
        inner = c["gold"]
        if horizontal:
            d.rectangle([0, 0, w - 1, h - 1], outline=outer, width=thickness)
            d.line([thickness + 2, thickness + 4, w - thickness - 3, thickness + 4], fill=inner, width=2)
            for x in range(6, w - 6, 12):
                d.rectangle([x, thickness + 1, x + 2, thickness + 3], fill=inner)
        else:
            d.rectangle([0, 0, w - 1, h - 1], outline=outer, width=thickness)
            d.line([thickness + 4, thickness + 2, thickness + 4, h - thickness - 3], fill=inner, width=2)
            for y in range(6, h - 6, 12):
                d.rectangle([thickness + 1, y, thickness + 3, y + 2], fill=inner)
        return img

    corners = {
        "tl": draw_corner(mk((corner, corner)), False, False),
        "tr": draw_corner(mk((corner, corner)), True, False),
        "bl": draw_corner(mk((corner, corner)), False, True),
        "br": draw_corner(mk((corner, corner)), True, True),
    }
    edges = {
        "top": draw_edge(mk((edge, corner)), True),
        "bottom": draw_edge(mk((edge, corner)), True).transpose(Image.Transpose.FLIP_TOP_BOTTOM),
        "left": draw_edge(mk((corner, edge)), False),
        "right": draw_edge(mk((corner, edge)), False).transpose(Image.Transpose.FLIP_LEFT_RIGHT),
    }
    center = Image.new("RGBA", (edge, edge), (0, 0, 0, 0))
    cd = ImageDraw.Draw(center)
    cd.rectangle([0, 0, edge - 1, edge - 1], fill=(32, 22, 16, 140))
    add_noise(center, 6)

    for k, im in corners.items():
        save_png(im, os.path.join(out_dir, f"{name}_corner_{k}.png"))
    for k, im in edges.items():
        save_png(im, os.path.join(out_dir, f"{name}_edge_{k}.png"))
    save_png(center, os.path.join(out_dir, f"{name}_center.png"))


def button(out_dir: str, name: str, w: int, h: int, variant: str):
    c = palette()
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if variant == "primary":
        base = (54, 36, 20, 255)
        glow = c["gold"]
        accent = c["bronze"]
    elif variant == "danger":
        base = (56, 18, 14, 255)
        glow = c["red"]
        accent = (110, 45, 32, 255)
    else:
        base = (34, 26, 20, 255)
        glow = c["bronze"]
        accent = (90, 60, 36, 255)

    r = 10
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=base)
    d.rounded_rectangle([2, 2, w - 3, h - 3], radius=r - 2, outline=accent, width=3)
    d.rounded_rectangle([6, 6, w - 7, h - 7], radius=r - 4, outline=glow, width=2)
    for x in range(10, w - 10, 14):
        d.rectangle([x, 4, x + 2, 6], fill=glow)
        d.rectangle([x, h - 7, x + 2, h - 5], fill=glow)
    add_noise(img, 8)
    img = pixelate(img, 2)
    save_png(img, os.path.join(out_dir, f"{name}_{variant}.png"))


def tile(out_dir: str, name: str, size: int, kind: str):
    c = palette()
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if kind == "wood":
        for y in range(0, size, 6):
            shade = random.randint(-10, 10)
            col = (clamp(c["wood"][0] + shade), clamp(c["wood"][1] + shade), clamp(c["wood"][2] + shade), 255)
            d.rectangle([0, y, size, y + 4], fill=col)
        for i in range(0, size, 12):
            d.line([i, 0, i, size], fill=(20, 14, 10, 110), width=1)
    else:
        d.rectangle([0, 0, size - 1, size - 1], fill=(26, 18, 12, 255))
        for _ in range(40):
            x = random.randint(0, size - 1)
            y = random.randint(0, size - 1)
            d.point((x, y), fill=(random.randint(40, 80), random.randint(28, 60), random.randint(18, 40), 180))
    img = pixelate(img, 2)
    save_png(img, os.path.join(out_dir, f"{name}_{kind}_{size}.png"))


def icon_canvas(size: int = 64) -> Image.Image:
    return Image.new("RGBA", (size, size), (0, 0, 0, 0))


def icon_frame(img: Image.Image):
    c = palette()
    d = ImageDraw.Draw(img)
    w, h = img.size
    d.rectangle([2, 2, w - 3, h - 3], outline=(c["bronze"][0], c["bronze"][1], c["bronze"][2], 200), width=3)
    d.rectangle([7, 7, w - 8, h - 8], outline=(c["gold"][0], c["gold"][1], c["gold"][2], 210), width=2)


def draw_glyph(d: ImageDraw.ImageDraw, kind: str, size: int):
    c = palette()
    cx = size // 2
    if kind == "bartender":
        d.rectangle([cx - 16, 18, cx + 16, 26], fill=c["gold"])
        d.rectangle([cx - 6, 26, cx + 6, 44], fill=c["gold"])
        d.ellipse([cx - 10, 44, cx + 10, 58], outline=c["gold"], width=4)
    elif kind == "mercenary":
        d.polygon([(cx, 10), (cx + 14, 26), (cx, 42), (cx - 14, 26)], fill=c["bronze"])
        d.rectangle([cx - 5, 20, cx + 5, 54], fill=c["gold"])
        d.rectangle([cx - 18, 30, cx + 18, 38], fill=c["gold"])
    elif kind == "alchemist":
        d.polygon([(cx - 14, 14), (cx + 14, 14), (cx + 6, 36), (cx + 10, 54), (cx - 10, 54), (cx - 6, 36)], outline=c["gold"], width=4)
        d.ellipse([cx - 10, 36, cx + 10, 54], fill=(c["green"][0], c["green"][1], c["green"][2], 220))
    elif kind == "noble":
        d.polygon([(cx - 22, 42), (cx - 14, 18), (cx, 34), (cx + 14, 18), (cx + 22, 42)], fill=c["gold"])
        d.rectangle([cx - 20, 42, cx + 20, 50], fill=c["bronze"])
    elif kind == "thief":
        d.polygon([(cx - 18, 28), (cx, 14), (cx + 18, 28), (cx, 52)], fill=c["bronze"])
        d.rectangle([cx - 10, 30, cx + 10, 38], fill=c["ink"])
    elif kind == "priest":
        d.rectangle([cx - 6, 14, cx + 6, 54], fill=c["gold"])
        d.rectangle([cx - 18, 26, cx + 18, 34], fill=c["gold"])
        d.ellipse([cx - 12, 40, cx + 12, 58], outline=c["bronze"], width=4)
    elif kind == "hunter":
        d.arc([cx - 22, 14, cx + 22, 58], start=210, end=330, fill=c["gold"], width=5)
        d.line([cx + 8, 20, cx + 18, 50], fill=c["bronze"], width=4)
        d.line([cx - 2, 18, cx + 16, 56], fill=c["gold"], width=3)
    elif kind == "mage":
        d.polygon([(cx, 12), (cx + 16, 26), (cx + 10, 52), (cx - 10, 52), (cx - 16, 26)], fill=c["purple"])
        d.ellipse([cx - 10, 26, cx + 10, 46], outline=c["gold"], width=4)
    elif kind == "guard":
        d.polygon([(cx, 10), (cx + 18, 20), (cx + 14, 56), (cx - 14, 56), (cx - 18, 20)], fill=c["blue"])
        d.line([cx, 18, cx, 54], fill=c["gold"], width=3)
    elif kind == "sailor":
        d.polygon([(cx - 18, 22), (cx + 18, 22), (cx + 8, 54), (cx - 8, 54)], fill=c["bronze"])
        d.line([cx, 10, cx, 54], fill=c["gold"], width=4)
        d.line([cx, 22, cx + 16, 34], fill=c["gold"], width=3)
    else:
        d.ellipse([cx - 16, 18, cx + 16, 50], outline=c["gold"], width=4)


def make_icon(path: str, kind: str, size: int = 64):
    c = palette()
    img = icon_canvas(size)
    d = ImageDraw.Draw(img)
    bg = Image.new("RGBA", (size, size), (c["wood2"][0], c["wood2"][1], c["wood2"][2], 220))
    bg = bg.filter(ImageFilter.GaussianBlur(2))
    img = Image.alpha_composite(img, bg)
    d = ImageDraw.Draw(img)
    icon_frame(img)
    draw_glyph(d, kind, size)
    add_noise(img, 6)
    img = pixelate(img, 2)
    save_png(img, path)


def race_icon(path: str, kind: str, size: int = 64):
    c = palette()
    img = icon_canvas(size)
    d = ImageDraw.Draw(img)
    base = (c["wood"][0], c["wood"][1], c["wood"][2], 220)
    d.rectangle([0, 0, size - 1, size - 1], fill=base)
    icon_frame(img)
    cx = size // 2
    if kind == "human":
        d.ellipse([cx - 14, 18, cx + 14, 46], fill=c["gold"])
        d.rectangle([cx - 10, 46, cx + 10, 56], fill=c["bronze"])
    elif kind == "elf":
        d.polygon([(cx - 14, 20), (cx + 14, 20), (cx, 52)], fill=c["gold"])
        d.polygon([(cx - 22, 28), (cx - 10, 30), (cx - 18, 40)], fill=c["gold"])
        d.polygon([(cx + 22, 28), (cx + 10, 30), (cx + 18, 40)], fill=c["gold"])
    elif kind == "dwarf":
        d.rectangle([cx - 16, 22, cx + 16, 42], fill=c["gold"])
        d.rectangle([cx - 22, 42, cx + 22, 56], fill=c["bronze"])
    elif kind == "orc":
        d.rectangle([cx - 18, 20, cx + 18, 44], fill=(120, 130, 80, 255))
        d.rectangle([cx - 10, 44, cx + 10, 56], fill=c["bronze"])
    elif kind == "tiefling":
        d.polygon([(cx - 18, 46), (cx - 8, 18), (cx, 26), (cx + 8, 18), (cx + 18, 46)], fill=c["red"])
        d.line([cx - 14, 20, cx - 20, 12], fill=c["gold"], width=3)
        d.line([cx + 14, 20, cx + 20, 12], fill=c["gold"], width=3)
    elif kind == "vampire":
        d.polygon([(cx - 16, 20), (cx + 16, 20), (cx + 10, 56), (cx - 10, 56)], fill=c["purple"])
        d.rectangle([cx - 8, 42, cx + 8, 56], fill=c["gold"])
    elif kind == "undead":
        d.ellipse([cx - 18, 18, cx + 18, 50], outline=c["cream"], width=4)
        d.rectangle([cx - 8, 50, cx + 8, 58], fill=c["cream"])
    elif kind == "beastkin":
        d.ellipse([cx - 12, 22, cx + 12, 48], fill=c["gold"])
        d.polygon([(cx - 14, 22), (cx - 4, 10), (cx + 2, 24)], fill=c["gold"])
        d.polygon([(cx + 14, 22), (cx + 4, 10), (cx - 2, 24)], fill=c["gold"])
    else:
        d.ellipse([cx - 16, 18, cx + 16, 50], fill=c["gold"])
    add_noise(img, 6)
    img = pixelate(img, 2)
    save_png(img, path)


def status_icon(path: str, kind: str, size: int = 64):
    c = palette()
    img = icon_canvas(size)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, size - 1, size - 1], fill=(c["wood2"][0], c["wood2"][1], c["wood2"][2], 220))
    icon_frame(img)
    cx = size // 2
    if kind == "ap":
        d.polygon([(cx, 10), (cx + 8, 30), (cx - 2, 30), (cx + 2, 52), (cx - 8, 34), (cx + 2, 34)], fill=(80, 160, 190, 255))
    elif kind == "gold":
        d.ellipse([cx - 18, 18, cx + 18, 54], outline=c["gold"], width=6)
        d.ellipse([cx - 10, 26, cx + 10, 46], outline=c["bronze"], width=4)
    elif kind == "reputation":
        d.polygon([(cx, 12), (cx + 10, 30), (cx + 30, 34), (cx + 14, 48), (cx + 18, 66), (cx, 56), (cx - 18, 66), (cx - 14, 48), (cx - 30, 34), (cx - 10, 30)], fill=c["gold"])
    elif kind == "alert":
        d.polygon([(cx, 12), (cx + 26, 54), (cx - 26, 54)], fill=c["red"])
        d.rectangle([cx - 4, 26, cx + 4, 40], fill=c["cream"])
        d.rectangle([cx - 4, 44, cx + 4, 50], fill=c["cream"])
    else:
        d.ellipse([cx - 14, 18, cx + 14, 46], fill=c["gold"])
    add_noise(img, 6)
    img = pixelate(img, 2)
    save_png(img, path)


def portrait(out_path: str, subject: str):
    c = palette()
    w, h = 384, 512
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    base = Image.new("RGBA", (w, h), (28, 18, 12, 255))
    base = base.filter(ImageFilter.GaussianBlur(3))
    img = Image.alpha_composite(img, base)
    d = ImageDraw.Draw(img)
    d.rectangle([12, 12, w - 13, h - 13], outline=c["bronze"], width=8)
    d.rectangle([38, 38, w - 39, h - 39], outline=c["gold"], width=4)

    cx = w // 2
    cy = int(h * 0.38)
    head_r = 64
    if subject in ("elf", "beastkin"):
        head_r = 60
    col = (18, 12, 9, 255) if subject not in ("tiefling", "vampire", "undead") else (22, 14, 20, 255)
    if subject == "orc":
        col = (22, 18, 12, 255)
    if subject == "dwarf":
        col = (20, 14, 10, 255)
    if subject == "undead":
        col = (16, 16, 16, 255)

    d.ellipse([cx - head_r, cy - head_r, cx + head_r, cy + head_r], fill=col)
    d.rounded_rectangle([cx - 160, cy + head_r - 10, cx + 160, int(h * 0.92)], radius=90, fill=col)
    if subject == "elf":
        d.polygon([(cx - head_r - 8, cy - 10), (cx - head_r + 10, cy), (cx - head_r - 2, cy + 18)], fill=c["gold"])
        d.polygon([(cx + head_r + 8, cy - 10), (cx + head_r - 10, cy), (cx + head_r + 2, cy + 18)], fill=c["gold"])
    if subject == "tiefling":
        d.line([cx - 36, cy - head_r + 10, cx - 70, cy - head_r - 26], fill=c["gold"], width=6)
        d.line([cx + 36, cy - head_r + 10, cx + 70, cy - head_r - 26], fill=c["gold"], width=6)
    if subject == "beastkin":
        d.polygon([(cx - 40, cy - head_r + 8), (cx - 16, cy - head_r - 40), (cx + 4, cy - head_r + 14)], fill=c["gold"])
        d.polygon([(cx + 40, cy - head_r + 8), (cx + 16, cy - head_r - 40), (cx - 4, cy - head_r + 14)], fill=c["gold"])

    ex, ey = cx, int(h * 0.82)
    d.ellipse([ex - 24, ey - 24, ex + 24, ey + 24], outline=c["gold"], width=4)
    d.line([ex, ey - 14, ex, ey + 14], fill=c["gold"], width=4)
    d.line([ex - 12, ey, ex + 12, ey], fill=c["gold"], width=4)

    add_noise(img, 6)
    img = pixelate(img, 2)
    save_png(img, out_path)


@dataclass(frozen=True)
class ManifestItem:
    path: str
    kind: str
    size: list[int]


def main():
    ensure_dirs()

    frame_9slice("public/assets/ui/frames", "panel_bronze", corner=28, edge=64, thickness=6)
    frame_9slice("public/assets/ui/frames", "panel_gold", corner=28, edge=64, thickness=5)

    button("public/assets/ui/buttons", "btn", 320, 96, "primary")
    button("public/assets/ui/buttons", "btn", 320, 96, "secondary")
    button("public/assets/ui/buttons", "btn", 320, 96, "danger")
    button("public/assets/ui/buttons", "btn_small", 220, 72, "primary")
    button("public/assets/ui/buttons", "btn_small", 220, 72, "secondary")

    tile("public/assets/ui/tiles", "tile", 64, "wood")
    tile("public/assets/ui/tiles", "tile", 64, "stone")

    professions = ["bartender", "mercenary", "alchemist", "noble", "thief", "priest", "hunter", "mage", "guard", "sailor"]
    for p in professions:
        make_icon(f"public/assets/icons/professions/{p}.png", p, 64)

    races = ["human", "elf", "dwarf", "orc", "tiefling", "vampire", "undead", "beastkin"]
    for r in races:
        race_icon(f"public/assets/icons/races/{r}.png", r, 64)
        portrait(f"public/assets/portraits/races/{r}.png", r)

    for p in ["bartender", "mercenary", "alchemist", "noble", "thief", "priest", "hunter", "mage"]:
        portrait(f"public/assets/portraits/professions/{p}.png", p)

    for s in ["ap", "gold", "reputation", "alert"]:
        status_icon(f"public/assets/icons/status/{s}.png", s, 64)


if __name__ == "__main__":
    main()

