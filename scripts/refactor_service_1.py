import os

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Update types/game.ts
types_content = read_file('src/types/game.ts')

base_guest_old = """export interface BaseGuest {
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
base_guest_new = """export interface BaseGuest {
  id: string;
  name: string;
  gender: Gender;
  rarity: GuestRarity;
  wealthTier: WealthTier;
  stayDuration: number;
  daysStayed: number;
  status: 'Waiting' | 'CheckedIn' | 'Captured' | 'Employed' | 'Left';
  isInvestigated: boolean; // 是否已被调查揭露隐藏情报
  traits: string[]; // 新增：人物多种特点
  reception?: GuestReceptionData;
}"""
types_content = types_content.replace(base_guest_old, base_guest_new)

male_guest_old = """export interface MaleGuest extends BaseGuest {
  gender: 'Male';
  impulse: number;
  combat: number;
  management: number;
  // 隐藏情报
  xpPreference: string;
  assignedAssetId?: string; // 晚上被分配的服务资产ID
}"""
male_guest_new = """export interface MaleGuest extends BaseGuest {
  gender: 'Male';
  impulse: number;
  combat: number;
  management: number;
  // 隐藏情报
  xpPreferences: string[]; // 偏好的女性特点（性癖）
  assignedAssetId?: string; // 晚上被分配的服务资产ID
}"""
types_content = types_content.replace(male_guest_old, male_guest_new)

female_guest_old = """export interface FemaleGuest extends BaseGuest {
  gender: 'Female';
  combat: number;
  alertness: number;
  willpower: number;
  constitution: number;
  // 隐藏情报
  weakness: string;
  xpPreference: string;
  // 资产属性（被捕获后）"""
female_guest_new = """export interface FemaleGuest extends BaseGuest {
  gender: 'Female';
  combat: number;
  alertness: number;
  willpower: number;
  constitution: number;
  // 资产属性（被捕获后）"""
types_content = types_content.replace(female_guest_old, female_guest_new)

write_file('src/types/game.ts', types_content)
print("Updated types/game.ts")
