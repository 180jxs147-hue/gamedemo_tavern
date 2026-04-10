import asyncio
import sys
import os
import urllib.request
import traceback

sys.path.append("/data/user/skills/byted-seedream-image-generate/scripts")
from seedream_image_generate import seedream_generate

async def main():
    try:
        result = await seedream_generate([{
            "prompt": "elegant fantasy tavern interior, warm sunlight, oak wood",
            "size": "1024x1024",
            "watermark": False
        }], version="4.0")
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())