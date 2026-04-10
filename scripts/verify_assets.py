import os
from dataclasses import dataclass

from PIL import Image


PLACEHOLDER_DHASH = 0x454D717171714941


def _hamming_distance(a: int, b: int) -> int:
    return (a ^ b).bit_count()


def _dhash(image: Image.Image, hash_size: int = 8) -> int:
    img = image.convert("L").resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
    pixels = list(img.getdata())
    rows = [pixels[i * (hash_size + 1) : (i + 1) * (hash_size + 1)] for i in range(hash_size)]
    bits = []
    for row in rows:
        for col in range(hash_size):
            bits.append(1 if row[col] > row[col + 1] else 0)
    val = 0
    for bit in bits:
        val = (val << 1) | bit
    return val


def _expected_ratio(image_size: str) -> float:
    mapping = {
        "square_hd": 1.0,
        "square": 1.0,
        "portrait_4_3": 3 / 4,
        "portrait_16_9": 9 / 16,
        "landscape_4_3": 4 / 3,
        "landscape_16_9": 16 / 9,
    }
    return mapping.get(image_size, 1.0)


def check_one(path: str, image_size: str) -> tuple[bool, str]:
    if not os.path.exists(path):
        return False, "missing"
    try:
        img = Image.open(path)
        w, h = img.size
        ratio = w / h if h else 1.0
        exp = _expected_ratio(image_size)
        if abs(ratio - exp) > 0.12:
            return False, f"aspect_mismatch w={w} h={h} ratio={ratio:.2f} exp={exp:.2f}"
        dh = _dhash(img)
        dist = _hamming_distance(dh, PLACEHOLDER_DHASH)
        if dist <= 10:
            return False, f"placeholder_hash dist={dist}"
        return True, "ok"
    except Exception as e:
        return False, f"unreadable {e}"


@dataclass(frozen=True)
class AssetItem:
    size: str
    filename: str


ASSETS: list[AssetItem] = [
    AssetItem(size="landscape_16_9", filename="public/assets/backgrounds/tavern_day.jpg"),
    AssetItem(size="landscape_16_9", filename="public/assets/backgrounds/tavern_night.jpg"),
    AssetItem(size="square", filename="public/assets/textures/parchment.jpg"),
    AssetItem(size="square", filename="public/assets/portraits/silhouette_male.jpg"),
    AssetItem(size="square", filename="public/assets/portraits/silhouette_female.jpg"),
    AssetItem(size="square", filename="public/assets/portraits/silhouette_asset.jpg"),
    AssetItem(size="portrait_4_3", filename="public/assets/portraits/detailed_male.jpg"),
    AssetItem(size="portrait_4_3", filename="public/assets/portraits/detailed_female.jpg"),
    AssetItem(size="portrait_4_3", filename="public/assets/portraits/detailed_asset.jpg"),
]


if __name__ == "__main__":
    ok_count = 0
    bad_count = 0
    for item in ASSETS:
        ok, reason = check_one(item.filename, item.size)
        if ok:
            ok_count += 1
            print(f"OK  {item.filename}")
        else:
            bad_count += 1
            print(f"BAD {item.filename} -> {reason}")
    print(f"Summary: ok={ok_count} bad={bad_count} total={len(ASSETS)}")

