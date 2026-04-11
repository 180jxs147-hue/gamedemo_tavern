import os
import re

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find all <img ... /> tags and add loading="lazy" if not present
                # Simple regex replace: match <img up to > or />, insert loading="lazy"
                # To be safe, let's just do a naive replacement
                new_content = re.sub(r'<img([^>]+)>', lambda m: f'<img{m.group(1)} loading="lazy">' if 'loading=' not in m.group(1) else m.group(0), content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Added lazy loading to {path}")

process_directory('src/components')
process_directory('src/pages')

