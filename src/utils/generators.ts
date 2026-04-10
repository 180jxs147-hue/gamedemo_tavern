import { GuestRarity, MaleGuest, FemaleGuest, Gender } from '../types/game';

const MALE_NAMES = ['Aric', 'Borel', 'Caelen', 'Drystan', 'Elian', 'Falk', 'Gideon', 'Hadrian', 'Igor', 'Jorin', 'Kael', 'Lucian', 'Mordecai', 'Niven', 'Orion', 'Perrin', 'Quinn', 'Rowan', 'Silas', 'Thorne', 'Urien', 'Valerius', 'Wystan', 'Xander', 'Yorick', 'Zane'];
const FEMALE_NAMES = ['Aria', 'Beatrix', 'Cassia', 'Delia', 'Eira', 'Fiona', 'Ginevra', 'Helena', 'Isolde', 'Juno', 'Kira', 'Livia', 'Morgana', 'Nia', 'Ophelia', 'Petra', 'Qiana', 'Rhea', 'Seraphina', 'Talia', 'Ursula', 'Vesper', 'Wren', 'Xenia', 'Yvaine', 'Zara'];

const WEAKNESSES = ['贪婪', '傲慢', '胆怯', '虚荣', '孤僻'];
const XP_PREFS = ['服从', '痛苦', '支配', '温柔', '狂野'];

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getStatRange = (rarity: GuestRarity) => {
  switch (rarity) {
    case 'N': return { min: 10, max: 30 };
    case 'R': return { min: 30, max: 50 };
    case 'SR': return { min: 50, max: 80 };
    case 'SSR': return { min: 80, max: 100 };
  }
};

const getWealthRange = (rarity: GuestRarity) => {
  switch (rarity) {
    case 'N': return { min: 20, max: 100 };
    case 'R': return { min: 100, max: 300 };
    case 'SR': return { min: 300, max: 800 };
    case 'SSR': return { min: 800, max: 2000 };
  }
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export const generateMaleGuest = (rarity: GuestRarity): MaleGuest => {
  const statRange = getStatRange(rarity);
  const wealthRange = getWealthRange(rarity);
  const maxWealth = randomInt(wealthRange.min, wealthRange.max);
  
  return {
    id: generateId(),
    name: randomItem(MALE_NAMES),
    gender: 'Male',
    rarity,
    status: 'Waiting',
    isInvestigated: false,
    wealth: maxWealth,
    maxWealth,
    impulse: randomInt(statRange.min, statRange.max),
    combat: randomInt(statRange.min, statRange.max),
    management: randomInt(statRange.min, statRange.max),
    isGoodGuy: Math.random() > 0.5,
    xpPreference: randomItem(XP_PREFS)
  };
};

export const generateFemaleGuest = (rarity: GuestRarity): FemaleGuest => {
  const statRange = getStatRange(rarity);
  
  return {
    id: generateId(),
    name: randomItem(FEMALE_NAMES),
    gender: 'Female',
    rarity,
    status: 'Waiting',
    isInvestigated: false,
    combat: randomInt(statRange.min, statRange.max),
    alertness: randomInt(statRange.min, statRange.max),
    willpower: randomInt(statRange.min, statRange.max),
    constitution: randomInt(statRange.min, statRange.max),
    weakness: randomItem(WEAKNESSES),
    xpPreference: randomItem(XP_PREFS),
    // 默认被捕获后属性为 0
    obedience: 0,
    charm: 0,
    skill: 0
  };
};

export const generateDailyQueue = (reputation: number, capacity: number) => {
  // 根据声望决定高稀有度概率
  const queueSize = randomInt(3, 5);
  const queue: (MaleGuest | FemaleGuest)[] = [];
  
  for (let i = 0; i < queueSize; i++) {
    const r = Math.random() * 100;
    let rarity: GuestRarity = 'N';
    if (r < reputation * 0.1) rarity = 'SSR';
    else if (r < reputation * 0.3 + 10) rarity = 'SR';
    else if (r < reputation * 0.6 + 30) rarity = 'R';
    
    // 50% 概率生成男客，50% 概率生成女客
    if (Math.random() > 0.5) {
      queue.push(generateMaleGuest(rarity));
    } else {
      queue.push(generateFemaleGuest(rarity));
    }
  }
  return queue;
};
