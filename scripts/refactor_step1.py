import os

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Update types/game.ts
content_types = read_file('src/types/game.ts')
content_types = content_types.replace(
    "checkItemId?: 'idChecked' | 'purposeVerified' | 'dangerAssessed';",
    "checkItemId?: 'durationAssessed' | 'preferenceAssessed' | 'targetAssessed';"
)
content_types = content_types.replace(
    """  checklist: {
    idChecked: boolean;
    purposeVerified: boolean;
    dangerAssessed: boolean;
  };""",
    """  checklist: {
    durationAssessed: boolean;
    preferenceAssessed: boolean;
    targetAssessed: boolean;
  };"""
)
content_types = content_types.replace(
    "export type Gender = 'Male' | 'Female';",
    "export type Gender = 'Male' | 'Female';\nexport type WealthTier = '贫穷' | '平民' | '富裕' | '贵族';"
)
content_types = content_types.replace(
    """export interface BaseGuest {
  id: string;
  name: string;
  gender: Gender;
  rarity: GuestRarity;
  status: 'Waiting' | 'CheckedIn' | 'Captured' | 'Employed' | 'Left';
  isInvestigated: boolean; // 是否已被调查揭露隐藏情报
  reception?: GuestReceptionData;
}""",
    """export interface BaseGuest {
  id: string;
  name: string;
  gender: Gender;
  rarity: GuestRarity;
  wealthTier: WealthTier;
  stayDuration: number;
  daysStayed: number;
  status: 'Waiting' | 'CheckedIn' | 'Captured' | 'Employed' | 'Left';
  isInvestigated: boolean; // 是否已被调查揭露隐藏情报
  reception?: GuestReceptionData;
}"""
)
content_types = content_types.replace(
    """export interface MaleGuest extends BaseGuest {
  gender: 'Male';
  wealth: number;
  maxWealth: number;
  impulse: number;
  combat: number;
  management: number;
  // 隐藏情报
  isGoodGuy: boolean;
  xpPreference: string;""",
    """export interface MaleGuest extends BaseGuest {
  gender: 'Male';
  impulse: number;
  combat: number;
  management: number;
  // 隐藏情报
  xpPreference: string;"""
)
write_file('src/types/game.ts', content_types)
print("Updated types/game.ts")
