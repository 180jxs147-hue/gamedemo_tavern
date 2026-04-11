import urllib.parse

def encode_prompt(prompt):
    return urllib.parse.quote(prompt)

male_prompts = {
    '人类': encode_prompt("A handsome male human adventurer, pixel art style portrait, RPG game avatar, medieval fantasy, high quality"),
    '精灵': encode_prompt("A handsome male elf ranger, pixel art style portrait, hooded, RPG game avatar, medieval fantasy, high quality"),
    '兽人': encode_prompt("A strong male beastkin warrior, pixel art style portrait, muscular, RPG game avatar, medieval fantasy, high quality"),
    '矮人': encode_prompt("A stout male dwarf blacksmith, pixel art style portrait, beard, RPG game avatar, medieval fantasy, high quality"),
    '魔族': encode_prompt("A handsome male demon warlock, pixel art style portrait, glowing eyes, horns, RPG game avatar, medieval fantasy, high quality")
}

female_prompts = {
    '人类': encode_prompt("A beautiful female human mage, pixel art style portrait, purple robe, RPG game avatar, medieval fantasy, high quality"),
    '精灵': encode_prompt("A beautiful female elf archer, pixel art style portrait, green hair, RPG game avatar, medieval fantasy, high quality"),
    '兽人': encode_prompt("A cute female beastkin thief, pixel art style portrait, cat ears, RPG game avatar, medieval fantasy, high quality"),
    '矮人': encode_prompt("A beautiful female dwarf cleric, pixel art style portrait, blonde hair, RPG game avatar, medieval fantasy, high quality"),
    '魔族': encode_prompt("A beautiful female demon succubus, pixel art style portrait, red horns, RPG game avatar, medieval fantasy, high quality")
}

male_dict_str = "{\n" + ",\n".join([f"  '{k}': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt={v}&image_size=square'" for k, v in male_prompts.items()]) + "\n}"

female_dict_str = "{\n" + ",\n".join([f"  '{k}': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt={v}&image_size=square'" for k, v in female_prompts.items()]) + "\n}"

with open('src/utils/generators.ts', 'r', encoding='utf-8') as f:
    content = f.read()

import_str = "import { GuestRarity, MaleGuest, FemaleGuest, Gender, GuestReceptionData, WealthTier, Race } from '../types/game';"
content = content.replace("import { GuestRarity, MaleGuest, FemaleGuest, Gender, GuestReceptionData, WealthTier } from '../types/game';", import_str)

race_defs = f"""
const RACES: Race[] = ['人类', '精灵', '兽人', '矮人', '魔族'];

const MALE_PORTRAITS: Record<Race, string> = {male_dict_str};

const FEMALE_PORTRAITS: Record<Race, string> = {female_dict_str};
"""

content = content.replace("const MALE_SPECIFIC_TRAITS", race_defs + "\nconst MALE_SPECIFIC_TRAITS")

male_guest_old = """  const wealthTier = getWealthTier(rarity);
  
  return {
    id: generateId(),
    name,
    gender: 'Male',
    rarity,"""
male_guest_new = """  const wealthTier = getWealthTier(rarity);
  const race = randomItem(RACES);
  const portrait = MALE_PORTRAITS[race];
  
  return {
    id: generateId(),
    name,
    gender: 'Male',
    race,
    portrait,
    rarity,"""
content = content.replace(male_guest_old, male_guest_new)

female_guest_old = """  const wealthTier = getWealthTier(rarity);
  
  return {
    id: generateId(),
    name,
    gender: 'Female',
    rarity,"""
female_guest_new = """  const wealthTier = getWealthTier(rarity);
  const race = randomItem(RACES);
  const portrait = FEMALE_PORTRAITS[race];
  
  return {
    id: generateId(),
    name,
    gender: 'Female',
    race,
    portrait,
    rarity,"""
content = content.replace(female_guest_old, female_guest_new)

with open('src/utils/generators.ts', 'w', encoding='utf-8') as f:
    f.write(content)

