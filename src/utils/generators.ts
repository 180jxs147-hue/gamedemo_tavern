import { GuestRarity, MaleGuest, FemaleGuest, Gender, GuestReceptionData } from '../types/game';

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

const generateReceptionData = (name: string, isMale: boolean, isGoodGuy: boolean): GuestReceptionData => {
  return {
    idCard: {
      name: name,
      origin: randomItem(["边境村落", "王都", "黑市", "迷雾森林"]),
      profession: randomItem(["旅行商人", "流浪骑士", "药剂师", "寻宝者"]),
      validity: "王国历 812年 12月"
    },
    itemVisible: Math.random() > 0.5 ? {
      name: isGoodGuy ? "神秘卷轴" : "带血的匕首",
      desc: isGoodGuy ? "封印着某种神圣力量的卷轴。" : "上面还残留着未干的血迹，散发着危险的气息。",
      icon: isGoodGuy ? "Scroll" : "Sword"
    } : undefined,
    dialogues: [
      {
        id: 'q1',
        text: "请出示您的身份证明与通行证。",
        response: "这是我的执照，你可以仔细检查，完全合法。",
        checkItemId: 'idChecked'
      },
      {
        id: 'q2',
        text: "您来迷迭香酒馆有什么目的？",
        response: isGoodGuy ? "只是赶路累了，需要一个安静的房间休息。" : "少管闲事，给我一间地下室，越隐蔽越好。",
        checkItemId: 'purposeVerified'
      },
      {
        id: 'q3',
        text: "您随身携带的物品似乎有些特别？",
        response: isGoodGuy ? "这是我的防身之物，在这世道很正常吧？" : "这可是好东西...最好别多问。",
        checkItemId: 'dangerAssessed'
      }
    ],
    checklist: {
      idChecked: false,
      purposeVerified: false,
      dangerAssessed: false,
    },
    rumorText: isGoodGuy ? "传闻附近有一批王城骑士在搜寻丢失的圣物。" : "暗网悬赏：一名极度危险的逃犯近期在迷迭香酒馆附近出没，带有明显的血迹。",
    encyclopediaEntry: {
      title: isGoodGuy ? "王城近卫军" : "血色兄弟会",
      desc: isGoodGuy ? "王城精锐，通常装备精良，出手阔绰，但极度警惕。" : "地下暗杀组织，成员往往携带有毒物品，极度危险。",
      image: isGoodGuy ? "/assets/icons/professions/guard.png" : "/assets/icons/professions/thief.png"
    }
  };
};

export const generateMaleGuest = (rarity: GuestRarity): MaleGuest => {
  const statRange = getStatRange(rarity);
  const wealthRange = getWealthRange(rarity);
  const maxWealth = randomInt(wealthRange.min, wealthRange.max);
  const name = randomItem(MALE_NAMES);
  const isGoodGuy = Math.random() > 0.5;
  
  return {
    id: generateId(),
    name,
    gender: 'Male',
    rarity,
    status: 'Waiting',
    isInvestigated: false,
    wealth: maxWealth,
    maxWealth,
    impulse: randomInt(statRange.min, statRange.max),
    combat: randomInt(statRange.min, statRange.max),
    management: randomInt(statRange.min, statRange.max),
    isGoodGuy,
    xpPreference: randomItem(XP_PREFS),
    reception: generateReceptionData(name, true, isGoodGuy)
  };
};

export const generateFemaleGuest = (rarity: GuestRarity): FemaleGuest => {
  const statRange = getStatRange(rarity);
  const name = randomItem(FEMALE_NAMES);
  
  return {
    id: generateId(),
    name,
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
    skill: 0,
    reception: generateReceptionData(name, false, Math.random() > 0.5)
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
