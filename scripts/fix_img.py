import os
import re

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check what exactly we inserted
                # e.g., `<img src="..." / loading="lazy">`
                content = content.replace('/ loading="lazy">', ' loading="lazy" />')
                
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)

process_directory('src/components')
process_directory('src/pages')

