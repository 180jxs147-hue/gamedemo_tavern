import os
import random
from dataclasses import dataclass

from PIL import Image, ImageDraw, ImageFilter


random.seed(1337)


def ensure_dirs():
    os.makedirs("public/assets/backgrounds", exist_ok=True)
    os.makedirs("public/assets/portraits", exist_ok=True)
    os.makedirs("public/assets/textures", exist_ok=True)


def save_jpg(img: Image.Image, path: str, quality: int = 92):
    img.save(path, format="JPEG", quality=quality, subsampling=0, optimize=True)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def lerp_color(c1, c2, t: float):
    return (
        int(lerp(c1[0], c2[0], t)),
        int(lerp(c1[1], c2[1], t)),
        int(lerp(c1[2], c2[2], t)),
    )


def gradient(w: int, h: int, top, bottom) -> Image.Image:
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line([(0, y), (w, y)], fill=lerp_color(top, bottom, t))
    return img


def pixelate(img: Image.Image, factor: int) -> Image.Image:
    w, h = img.size
    small = img.resize((max(1, w // factor), max(1, h // factor)), Image.Resampling.NEAREST)
    return small.resize((w, h), Image.Resampling.NEAREST)


def add_vignette(img: Image.Image, strength: float = 0.7) -> Image.Image:
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([-(w * 0.15), -(h * 0.25), w * 1.15, h * 1.25], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.08)))
    dark = Image.new("RGB", (w, h), (0, 0, 0))
    return Image.composite(img, dark, Image.eval(mask, lambda p: int(255 - p * strength)))


def tavern_background(path: str, mode: str):
    w, h = 1920, 1080
    if mode == "day":
        base = gradient(w, h, (53, 33, 19), (18, 12, 8))
        glow = gradient(w, h, (140, 97, 52), (18, 12, 8)).filter(ImageFilter.GaussianBlur(120))
        base = Image.blend(base, glow, 0.35)
        accent = (198, 150, 92)
        lamp = (235, 210, 160)
    else:
        base = gradient(w, h, (26, 16, 10), (10, 7, 6))
        glow = gradient(w, h, (85, 55, 30), (10, 7, 6)).filter(ImageFilter.GaussianBlur(140))
        base = Image.blend(base, glow, 0.28)
        accent = (170, 120, 70)
        lamp = (220, 170, 110)

    d = ImageDraw.Draw(base)

    # Wooden wall planks
    for y in range(0, h, 18):
        shade = random.randint(-10, 10)
        col = (max(0, 60 + shade), max(0, 38 + shade), max(0, 22 + shade))
        d.rectangle([0, y, w, y + 10], fill=col)

    # Bar counter
    d.rectangle([0, int(h * 0.68), w, h], fill=(35, 22, 14))
    d.rectangle([0, int(h * 0.68), w, int(h * 0.70)], fill=(70, 45, 24))

    # Shelves
    for i in range(4):
        sy = int(h * 0.22 + i * 110)
        d.rectangle([int(w * 0.12), sy, int(w * 0.55), sy + 18], fill=(62, 40, 22))
        # bottles
        for b in range(14):
            bx = int(w * 0.14 + b * 28)
            by = sy - 40
            bw = 12
            bh = random.randint(28, 45)
            bc = (random.randint(70, 110), random.randint(50, 95), random.randint(35, 75))
            d.rectangle([bx, by + 40 - bh, bx + bw, by + 40], fill=bc)

    # Windows / light panels
    for i in range(3):
        wx = int(w * (0.62 + i * 0.12))
        wy = int(h * 0.18)
        ww, wh = int(w * 0.08), int(h * 0.22)
        frame = (55, 34, 18)
        d.rectangle([wx, wy, wx + ww, wy + wh], fill=frame)
        inner = [wx + 10, wy + 10, wx + ww - 10, wy + wh - 10]
        d.rectangle(inner, fill=lamp if mode == "day" else (110, 80, 50))
        # mullions
        d.line([wx + ww // 2, wy + 10, wx + ww // 2, wy + wh - 10], fill=frame, width=6)
        d.line([wx + 10, wy + wh // 2, wx + ww - 10, wy + wh // 2], fill=frame, width=6)

    # Hanging lamps
    for i in range(5):
        lx = int(w * (0.18 + i * 0.15))
        d.line([lx, 0, lx, int(h * 0.18)], fill=(25, 16, 11), width=5)
        d.ellipse([lx - 18, int(h * 0.18) - 10, lx + 18, int(h * 0.18) + 26], fill=(45, 30, 18))
        d.ellipse([lx - 10, int(h * 0.18) + 2, lx + 10, int(h * 0.18) + 20], fill=lamp)

    # Decorative border frame
    border = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(border)
    bc = (accent[0], accent[1], accent[2], 120)
    bd.rectangle([18, 18, w - 18, h - 18], outline=bc, width=6)
    bd.rectangle([42, 42, w - 42, h - 42], outline=(accent[0], accent[1], accent[2], 70), width=3)
    base = Image.alpha_composite(base.convert("RGBA"), border).convert("RGB")

    base = pixelate(base, 6 if mode == "day" else 7)
    base = add_vignette(base, 0.6)
    save_jpg(base, path)


def parchment_texture(path: str):
    w, h = 1024, 1024
    base = gradient(w, h, (222, 198, 160), (190, 162, 120))
    # add noise
    px = base.load()
    for y in range(h):
        for x in range(w):
            n = random.randint(-14, 14)
            r, g, b = px[x, y]
            px[x, y] = (max(0, min(255, r + n)), max(0, min(255, g + n)), max(0, min(255, b + n)))
    # stains
    d = ImageDraw.Draw(base)
    for _ in range(40):
        cx = random.randint(0, w)
        cy = random.randint(0, h)
        rr = random.randint(40, 160)
        col = (160, 120, 80, random.randint(20, 60))
        stain = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        sd = ImageDraw.Draw(stain)
        sd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=col)
        stain = stain.filter(ImageFilter.GaussianBlur(radius=18))
        base = Image.alpha_composite(base.convert("RGBA"), stain).convert("RGB")
    base = add_vignette(base, 0.25)
    save_jpg(base, path)


def silhouette_square(path: str, kind: str):
    w, h = 1024, 1024
    bg = gradient(w, h, (38, 24, 14), (12, 9, 7))
    bg = add_vignette(bg, 0.45)
    d = ImageDraw.Draw(bg)

    accent = (202, 163, 93)
    frame = (120, 79, 43)
    d.rectangle([34, 34, w - 34, h - 34], outline=frame, width=10)
    d.rectangle([68, 68, w - 68, h - 68], outline=(accent[0], accent[1], accent[2]), width=3)

    # body silhouette
    if kind == "male":
        head_r = 120
        shoulder_w = 520
        color = (20, 14, 10)
    elif kind == "female":
        head_r = 110
        shoulder_w = 500
        color = (18, 12, 10)
    else:
        head_r = 110
        shoulder_w = 520
        color = (22, 12, 18)  # slight purple tint

    cx, cy = w // 2, int(h * 0.42)
    d.ellipse([cx - head_r, cy - head_r, cx + head_r, cy + head_r], fill=color)
    d.rounded_rectangle(
        [cx - shoulder_w // 2, cy + head_r - 30, cx + shoulder_w // 2, int(h * 0.86)],
        radius=120,
        fill=color,
    )

    # highlight glow
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([cx - head_r - 30, cy - head_r - 30, cx + head_r + 30, cy + head_r + 30], outline=(accent[0], accent[1], accent[2], 90), width=8)
    glow = glow.filter(ImageFilter.GaussianBlur(8))
    bg = Image.alpha_composite(bg.convert("RGBA"), glow).convert("RGB")

    bg = pixelate(bg, 8)
    save_jpg(bg, path)


def detailed_portrait(path: str, gender: str):
    w, h = 768, 1024
    bg = gradient(w, h, (44, 28, 16), (12, 9, 7))
    bg = add_vignette(bg, 0.55)
    d = ImageDraw.Draw(bg)

    accent = (202, 163, 93)
    frame = (120, 79, 43)
    d.rectangle([22, 22, w - 22, h - 22], outline=frame, width=10)
    d.rectangle([52, 52, w - 52, h - 52], outline=(accent[0], accent[1], accent[2]), width=4)

    # silhouette bust
    cx = w // 2
    head_r = 120 if gender == "male" else 112
    color = (18, 12, 9) if gender != "asset" else (22, 14, 20)
    cy = int(h * 0.36)
    d.ellipse([cx - head_r, cy - head_r, cx + head_r, cy + head_r], fill=color)
    d.rounded_rectangle([cx - 280, cy + head_r - 20, cx + 280, int(h * 0.92)], radius=160, fill=color)

    # simple collar
    collar = (30, 20, 14) if gender != "asset" else (30, 18, 30)
    d.polygon([(cx - 120, cy + head_r + 40), (cx + 120, cy + head_r + 40), (cx, cy + head_r + 160)], fill=collar)

    # rune / emblem
    ex, ey = cx, int(h * 0.80)
    d.ellipse([ex - 42, ey - 42, ex + 42, ey + 42], outline=accent, width=4)
    d.line([ex, ey - 22, ex, ey + 22], fill=accent, width=4)
    d.line([ex - 18, ey, ex + 18, ey], fill=accent, width=4)

    bg = pixelate(bg, 6)
    save_jpg(bg, path)


def main():
    ensure_dirs()
    tavern_background("public/assets/backgrounds/tavern_day.jpg", "day")
    tavern_background("public/assets/backgrounds/tavern_night.jpg", "night")
    parchment_texture("public/assets/textures/parchment.jpg")

    silhouette_square("public/assets/portraits/silhouette_male.jpg", "male")
    silhouette_square("public/assets/portraits/silhouette_female.jpg", "female")
    silhouette_square("public/assets/portraits/silhouette_asset.jpg", "asset")

    detailed_portrait("public/assets/portraits/detailed_male.jpg", "male")
    detailed_portrait("public/assets/portraits/detailed_female.jpg", "female")
    detailed_portrait("public/assets/portraits/detailed_asset.jpg", "asset")


if __name__ == "__main__":
    main()

