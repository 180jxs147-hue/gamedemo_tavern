import os
import time
import urllib.parse
import urllib.request
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


def is_placeholder_image(path: str, image_size: str) -> tuple[bool, str]:
    try:
        img = Image.open(path)
        w, h = img.size
        ratio = w / h if h else 1.0
        exp = _expected_ratio(image_size)
        if abs(ratio - exp) > 0.12:
            return True, f"aspect_mismatch w={w} h={h} ratio={ratio:.2f} exp={exp:.2f}"

        dh = _dhash(img)
        dist = _hamming_distance(dh, PLACEHOLDER_DHASH)
        if dist <= 10:
            return True, f"placeholder_hash dist={dist}"
        return False, "ok"
    except Exception as e:
        return True, f"unreadable {e}"


@dataclass(frozen=True)
class AssetItem:
    prompt: str
    size: str
    filename: str


images_to_download: list[AssetItem] = [
    # Backgrounds
    AssetItem(
        prompt="elegant fantasy tavern interior, warm sunlight, oak wood, brass details, cozy atmosphere, highly detailed, masterpiece",
        size="landscape_16_9",
        filename="public/assets/backgrounds/tavern_day.jpg",
    ),
    AssetItem(
        prompt="elegant fantasy tavern interior, dim candlelight, mysterious atmosphere, crimson and gold accents, luxurious gothic, highly detailed, masterpiece",
        size="landscape_16_9",
        filename="public/assets/backgrounds/tavern_night.jpg",
    ),
    
    # Textures
    AssetItem(
        prompt="old parchment paper texture, warm brown tones, elegant",
        size="square",
        filename="public/assets/textures/parchment.jpg",
    ),

    # Portraits - Silhouettes (for lists/queues)
    AssetItem(
        prompt="elegant fantasy portrait silhouette Male guest, warm tavern lighting, brown tones",
        size="square",
        filename="public/assets/portraits/silhouette_male.jpg",
    ),
    AssetItem(
        prompt="elegant fantasy portrait silhouette Female guest, warm tavern lighting, brown tones",
        size="square",
        filename="public/assets/portraits/silhouette_female.jpg",
    ),
    AssetItem(
        prompt="elegant fantasy portrait silhouette Female asset, warm tavern lighting, purple and brown tones, elegant",
        size="square",
        filename="public/assets/portraits/silhouette_asset.jpg",
    ),

    # Portraits - Detailed (for detail views)
    AssetItem(
        prompt="elegant fantasy portrait, handsome man, tavern light, warm brown tones, highly detailed, masterpiece",
        size="portrait_4_3",
        filename="public/assets/portraits/detailed_male.jpg",
    ),
    AssetItem(
        prompt="elegant fantasy portrait, beautiful woman, tavern light, warm brown tones, highly detailed, masterpiece",
        size="portrait_4_3",
        filename="public/assets/portraits/detailed_female.jpg",
    ),
    AssetItem(
        prompt="elegant fantasy portrait, beautiful woman asset, dim tavern light, purple glow, warm brown tones, highly detailed, masterpiece",
        size="portrait_4_3",
        filename="public/assets/portraits/detailed_asset.jpg",
    ),
]

def _url_for(item: AssetItem) -> str:
    return (
        "https://coreva-normal.trae.ai/api/ide/v1/text_to_image"
        f"?prompt={urllib.parse.quote(item.prompt)}&image_size={item.size}"
    )


def _ensure_dirs():
    os.makedirs("public/assets/backgrounds", exist_ok=True)
    os.makedirs("public/assets/portraits", exist_ok=True)
    os.makedirs("public/assets/textures", exist_ok=True)


def download_and_verify_all(max_cycles: int = 30, cycle_sleep_s: float = 4.0):
    _ensure_dirs()

    pending: list[AssetItem] = []
    for item in images_to_download:
        if os.path.exists(item.filename):
            is_bad, reason = is_placeholder_image(item.filename, item.size)
            if not is_bad:
                continue
        pending.append(item)

    if not pending:
        print("All assets already valid.")
        return True

    print(f"Need to (re)generate {len(pending)} assets...")

    for cycle in range(max_cycles):
        print(f"Cycle {cycle + 1}/{max_cycles} ... pending={len(pending)}")
        next_pending: list[AssetItem] = []
        for item in pending:
            url = _url_for(item)
            tmp_path = f"{item.filename}.tmp"
            try:
                urllib.request.urlretrieve(url, tmp_path)
                try:
                    with open(tmp_path, "rb") as f:
                        head = f.read(64).lstrip()
                    if head.startswith(b"{") or head.startswith(b"["):
                        os.remove(tmp_path)
                        next_pending.append(item)
                        print(f"  waiting: {item.filename} (auth_or_json_response)")
                        continue
                except Exception:
                    pass
                bad, reason = is_placeholder_image(tmp_path, item.size)
                if bad:
                    os.remove(tmp_path)
                    next_pending.append(item)
                    print(f"  waiting: {item.filename} ({reason})")
                else:
                    os.replace(tmp_path, item.filename)
                    print(f"  ok: {item.filename}")
            except Exception as e:
                try:
                    if os.path.exists(tmp_path):
                        os.remove(tmp_path)
                except Exception:
                    pass
                next_pending.append(item)
                print(f"  error: {item.filename} ({e})")

        pending = next_pending
        if not pending:
            print("All assets generated and verified.")
            return True
        time.sleep(cycle_sleep_s)

    print("Timeout: some assets are still placeholders.")
    for item in pending:
        print(f"  still bad: {item.filename}")
    return False

if __name__ == "__main__":
    print("Starting static assets generation with verification...")
    ok = download_and_verify_all()
    print("Done!" if ok else "Done (with failures).")
