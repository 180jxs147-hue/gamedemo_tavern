import os

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Update types/game.ts
types_content = read_file('src/types/game.ts')

new_interfaces = """
export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export interface InventoryItem {
  id: string;
  name: string;
  desc: string;
  quantity: number;
  icon: string;
}

export interface DialogueOption {
"""

types_content = types_content.replace("export interface DialogueOption {", new_interfaces)

reception_data_old = """export interface GuestReceptionData {
  idCard: {
    name: string;
    origin: string;
    profession: string;
    validity: string;
  };
  itemVisible?: {
    name: string;
    desc: string;
    icon: string;
  };
  dialogues: DialogueOption[];
  checklist: {
    durationAssessed: boolean;
    preferenceAssessed: boolean;
    targetAssessed: boolean;
  };
  rumorText: string;
  encyclopediaEntry: {
    title: string;
    desc: string;
    image: string;
  };
}"""

reception_data_new = """export interface GuestReceptionData {
  idCard: {
    name: string;
    origin: string;
    profession: string;
    validity: string;
  };
  introText: string; // 客人入住时的一大段陈述
  dialogues: DialogueOption[];
}"""

types_content = types_content.replace(reception_data_old, reception_data_new)
write_file('src/types/game.ts', types_content)

print("Updated types/game.ts")
