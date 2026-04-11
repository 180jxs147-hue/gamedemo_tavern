import os
import re

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Find `const { a, b } = useGameStore();`
                match = re.search(r'const\s+\{([^}]+)\}\s*=\s*useGameStore\(\);', content)
                if match:
                    props = [p.strip() for p in match.group(1).split(',')]
                    
                    # Ensure useShallow is imported
                    if 'useShallow' not in content:
                        import_stmt = "import { useShallow } from 'zustand/react/shallow';\n"
                        # Insert right after the last import
                        import_matches = list(re.finditer(r'^import .*;', content, re.MULTILINE))
                        if import_matches:
                            last_import_end = import_matches[-1].end()
                            content = content[:last_import_end] + "\n" + import_stmt + content[last_import_end:]
                        else:
                            content = import_stmt + content
                    
                    # Construct the shallow selector
                    props_mapped = ", ".join([f"{p}: state.{p}" for p in props if p])
                    replacement = f"const {{ {match.group(1)} }} = useGameStore(useShallow(state => ({{ {props_mapped} }})));"
                    
                    # Also replace any other occurrences in the same file (e.g., inside other components)
                    content = re.sub(r'const\s+\{([^}]+)\}\s*=\s*useGameStore\(\);', 
                        lambda m: f"const {{ {m.group(1)} }} = useGameStore(useShallow(state => ({{ " + ", ".join([f"{p.strip()}: state.{p.strip()}" for p in m.group(1).split(',') if p.strip()]) + " })));", 
                        content)

                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Refactored selectors in {path}")

process_directory('src/components')
process_directory('src/pages')
process_directory('src/App.tsx')

