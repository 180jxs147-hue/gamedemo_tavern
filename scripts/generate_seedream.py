import asyncio
import sys
import os
import urllib.request

# 添加 seedream 脚本路径
sys.path.append("/data/user/skills/byted-seedream-image-generate/scripts")
from seedream_image_generate import seedream_generate

images_to_generate = [
    # Backgrounds
    {
        "prompt": "elegant fantasy tavern interior, warm sunlight, oak wood, brass details, cozy atmosphere, highly detailed, masterpiece",
        "size": "1024x576", # 16:9 接近的比例
        "filename": "public/assets/backgrounds/tavern_day.jpg"
    },
    {
        "prompt": "elegant fantasy tavern interior, dim candlelight, mysterious atmosphere, crimson and gold accents, luxurious gothic, highly detailed, masterpiece",
        "size": "1024x576",
        "filename": "public/assets/backgrounds/tavern_night.jpg"
    },
    
    # Textures
    {
        "prompt": "old parchment paper texture, warm brown tones, elegant",
        "size": "1024x1024",
        "filename": "public/assets/textures/parchment.jpg"
    },

    # Portraits - Silhouettes
    {
        "prompt": "elegant fantasy portrait silhouette Male guest, warm tavern lighting, brown tones",
        "size": "1024x1024",
        "filename": "public/assets/portraits/silhouette_male.jpg"
    },
    {
        "prompt": "elegant fantasy portrait silhouette Female guest, warm tavern lighting, brown tones",
        "size": "1024x1024",
        "filename": "public/assets/portraits/silhouette_female.jpg"
    },
    {
        "prompt": "elegant fantasy portrait silhouette Female asset, warm tavern lighting, purple and brown tones, elegant",
        "size": "1024x1024",
        "filename": "public/assets/portraits/silhouette_asset.jpg"
    },

    # Portraits - Detailed
    {
        "prompt": "elegant fantasy portrait, handsome man, tavern light, warm brown tones, highly detailed, masterpiece",
        "size": "768x1024", # 3:4
        "filename": "public/assets/portraits/detailed_male.jpg"
    },
    {
        "prompt": "elegant fantasy portrait, beautiful woman, tavern light, warm brown tones, highly detailed, masterpiece",
        "size": "768x1024",
        "filename": "public/assets/portraits/detailed_female.jpg"
    },
    {
        "prompt": "elegant fantasy portrait, beautiful woman asset, dim tavern light, purple glow, warm brown tones, highly detailed, masterpiece",
        "size": "768x1024",
        "filename": "public/assets/portraits/detailed_asset.jpg"
    }
]

async def main():
    print("Starting seedream image generation...")
    for item in images_to_generate:
        print(f"Generating: {item['filename']}...")
        try:
            result = await seedream_generate([{
                "prompt": item["prompt"],
                "size": item["size"],
                "watermark": False
            }], version="5.0")
            
            if result and len(result) > 0 and "url" in result[0]:
                url = result[0]["url"]
                print(f"Got URL: {url}")
                urllib.request.urlretrieve(url, item['filename'])
                print(f"Successfully saved to {item['filename']}")
            else:
                print(f"Failed to get URL for {item['filename']}. Result: {result}")
        except Exception as e:
            print(f"Error generating {item['filename']}: {e}")

if __name__ == "__main__":
    # Ensure directories exist
    os.makedirs("public/assets/backgrounds", exist_ok=True)
    os.makedirs("public/assets/portraits", exist_ok=True)
    os.makedirs("public/assets/textures", exist_ok=True)
    
    asyncio.run(main())
