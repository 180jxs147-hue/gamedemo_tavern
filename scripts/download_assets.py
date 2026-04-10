import urllib.parse
import urllib.request
import os

images_to_download = [
    # Backgrounds
    {
        "prompt": "elegant fantasy tavern interior, warm sunlight, oak wood, brass details, cozy atmosphere, highly detailed, masterpiece",
        "size": "landscape_16_9",
        "filename": "public/assets/backgrounds/tavern_day.jpg"
    },
    {
        "prompt": "elegant fantasy tavern interior, dim candlelight, mysterious atmosphere, crimson and gold accents, luxurious gothic, highly detailed, masterpiece",
        "size": "landscape_16_9",
        "filename": "public/assets/backgrounds/tavern_night.jpg"
    },
    
    # Textures
    {
        "prompt": "old parchment paper texture, warm brown tones, elegant",
        "size": "square",
        "filename": "public/assets/textures/parchment.jpg"
    },

    # Portraits - Silhouettes (for lists/queues)
    {
        "prompt": "elegant fantasy portrait silhouette Male guest, warm tavern lighting, brown tones",
        "size": "square",
        "filename": "public/assets/portraits/silhouette_male.jpg"
    },
    {
        "prompt": "elegant fantasy portrait silhouette Female guest, warm tavern lighting, brown tones",
        "size": "square",
        "filename": "public/assets/portraits/silhouette_female.jpg"
    },
    {
        "prompt": "elegant fantasy portrait silhouette Female asset, warm tavern lighting, purple and brown tones, elegant",
        "size": "square",
        "filename": "public/assets/portraits/silhouette_asset.jpg"
    },

    # Portraits - Detailed (for detail views)
    {
        "prompt": "elegant fantasy portrait, handsome man, tavern light, warm brown tones, highly detailed, masterpiece",
        "size": "portrait_4_3",
        "filename": "public/assets/portraits/detailed_male.jpg"
    },
    {
        "prompt": "elegant fantasy portrait, beautiful woman, tavern light, warm brown tones, highly detailed, masterpiece",
        "size": "portrait_4_3",
        "filename": "public/assets/portraits/detailed_female.jpg"
    },
    {
        "prompt": "elegant fantasy portrait, beautiful woman asset, dim tavern light, purple glow, warm brown tones, highly detailed, masterpiece",
        "size": "portrait_4_3",
        "filename": "public/assets/portraits/detailed_asset.jpg"
    }
]

def download_image(item):
    url = f"https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt={urllib.parse.quote(item['prompt'])}&image_size={item['size']}"
    filename = item['filename']
    print(f"Generating and downloading: {filename}")
    try:
        urllib.request.urlretrieve(url, filename)
        print(f"Success: {filename}")
    except Exception as e:
        print(f"Failed: {filename} - {e}")

if __name__ == "__main__":
    print("Starting static assets generation...")
    for item in images_to_download:
        if not os.path.exists(item['filename']):
            download_image(item)
        else:
            print(f"Skipping {item['filename']}, already exists.")
    print("Done!")
