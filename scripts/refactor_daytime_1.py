import os
import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Update types/game.ts
types_content = read_file('src/types/game.ts')
types_content = types_content.replace(
    "export type GuestRarity = 'N' | 'R' | 'SR' | 'SSR';",
    "export type GuestRarity = '普通' | '稀有' | '史诗' | '传说';"
)

new_structures = """
export interface TavernUpgrade {
  id: string;
  name: string;
  desc: string;
  cost: number;
  level: number;
  maxLevel: number;
}

export interface ResearchItem {
  id: string;
  name: string;
  desc: string;
  cost: number; // AP or Gold
  isUnlocked: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  cost: number;
  icon: string;
}

export interface Facility {
"""
types_content = types_content.replace("export interface Facility {", new_structures)

write_file('src/types/game.ts', types_content)
print("Updated types/game.ts")
