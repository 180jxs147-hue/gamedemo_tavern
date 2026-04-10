import { GuestRarity, MaleGuest, FemaleGuest, Gender, GuestReceptionData, WealthTier } from '../types/game';

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

const getWealthTier = (rarity: GuestRarity): WealthTier => {
  switch (rarity) {
    case 'N': return '贫穷';
    case 'R': return '平民';
    case 'SR': return '富裕';
    case 'SSR': return '贵族';
  }
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const generateReceptionData = (name: string, isMale: boolean, xpPreference: string, trait: string, stayDuration: number): GuestReceptionData => {
  
  // 对话1: 询问居住天数
  const q1 = {
    id: 'q1',
    text: "您打算在迷迭香酒馆下榻几晚？",
    response: `我会在这里住上 ${stayDuration} 天。`,
    checkItemId: 'durationAssessed' as const
  };

  // 对话2: 询问特殊偏好/癖好
  let q2_response = "";
  if (xpPreference === '服从') q2_response = "我喜欢乖巧听话的人，这能让我感到平静。";
  else if (xpPreference === '痛苦') q2_response = "我追求极致的刺激，越是狂烈的痛楚越能让我满足。";
  else if (xpPreference === '支配') q2_response = "我习惯了发号施令，在这里我同样需要绝对的掌控权。";
  else if (xpPreference === '温柔') q2_response = "长途跋涉让我疲惫，我只需要一点温柔的抚慰。";
  else if (xpPreference === '狂野') q2_response = "规矩是用来打破的，我喜欢不被束缚的狂野体验。";

  const q2 = {
    id: 'q2',
    text: "您平时在私下里有什么特别的爱好吗？",
    response: q2_response,
    checkItemId: 'preferenceAssessed' as const
  };

  // 对话3: 根据性别评估 特殊服务意向(男) 或 诱捕难度(女)
  let q3_text = "";
  let q3_response = "";
  if (isMale) {
    q3_text = "我们这里提供一些'特别'的深夜服务，您有兴趣吗？";
    q3_response = "哦？如果是真的，我倒是不介意花点钱体验一下。";
  } else {
    q3_text = "您独自一人旅行，夜间需要我们加强安保吗？";
    if (trait === '贪婪' || trait === '虚荣') {
      q3_response = "哼，只要你们的服务配得上我的身份就行，别的不用你操心。";
    } else if (trait === '胆怯' || trait === '孤僻') {
      q3_response = "不...不用了，我习惯一个人呆着，请不要让人打扰我。";
    } else {
      q3_response = "我自己能照顾好自己，不需要多余的安保。";
    }
  }

  const q3 = {
    id: 'q3',
    text: q3_text,
    response: q3_response,
    checkItemId: 'targetAssessed' as const
  };

  return {
    idCard: {
      name: name,
      origin: randomItem(["边境村落", "王都", "黑市", "迷雾森林", "北地港口"]),
      profession: randomItem(["旅行商人", "流浪骑士", "药剂师", "寻宝者", "吟游诗人"]),
      validity: "王国历 812年 12月"
    },
    dialogues: [q1, q2, q3],
    checklist: {
      durationAssessed: false,
      preferenceAssessed: false,
      targetAssessed: false,
    },
    rumorText: isMale 
      ? `酒馆情报网：这位客人似乎对【${xpPreference}】有着特别的偏好，如果能投其所好，或许能从他身上大赚一笔。` 
      : `酒馆情报网：暗中观察发现，她性格上有着明显的【${trait}】特征。如果打算在深夜行动，这或许是一个可以利用的弱点。`,
    encyclopediaEntry: {
      title: isMale ? "潜在客户档案" : "目标诱捕档案",
      desc: isMale 
        ? "男性客人。评估其财力与特殊服务倾向是前台接待的重点。财力越雄厚的客人，能承受的服务消费越高。" 
        : "女性客人。除了住宿收益外，也可以在深夜尝试将其捕获为酒馆资产。需要注意对方的防备心与战斗力。",
      image: isMale ? "/assets/icons/status/gold.png" : "/assets/icons/professions/thief.png"
    }
  };
};

export const generateMaleGuest = (rarity: GuestRarity): MaleGuest => {
  const statRange = getStatRange(rarity);
  const name = randomItem(MALE_NAMES);
  const xpPreference = randomItem(XP_PREFS);
  const stayDuration = randomInt(1, 5);
  const wealthTier = getWealthTier(rarity);
  
  return {
    id: generateId(),
    name,
    gender: 'Male',
    rarity,
    wealthTier,
    stayDuration,
    daysStayed: 0,
    status: 'Waiting',
    isInvestigated: false,
    impulse: randomInt(statRange.min, statRange.max),
    combat: randomInt(statRange.min, statRange.max),
    management: randomInt(statRange.min, statRange.max),
    xpPreference,
    reception: generateReceptionData(name, true, xpPreference, '', stayDuration)
  };
};

export const generateFemaleGuest = (rarity: GuestRarity): FemaleGuest => {
  const statRange = getStatRange(rarity);
  const name = randomItem(FEMALE_NAMES);
  const xpPreference = randomItem(XP_PREFS);
  const weakness = randomItem(WEAKNESSES);
  const stayDuration = randomInt(1, 5);
  const wealthTier = getWealthTier(rarity);
  
  return {
    id: generateId(),
    name,
    gender: 'Female',
    rarity,
    wealthTier,
    stayDuration,
    daysStayed: 0,
    status: 'Waiting',
    isInvestigated: false,
    combat: randomInt(statRange.min, statRange.max),
    alertness: randomInt(statRange.min, statRange.max),
    willpower: randomInt(statRange.min, statRange.max),
    constitution: randomInt(statRange.min, statRange.max),
    weakness,
    xpPreference,
    // 默认被捕获后属性为 0
    obedience: 0,
    charm: 0,
    skill: 0,
    reception: generateReceptionData(name, false, xpPreference, weakness, stayDuration)
  };
};

export const generateDailyQueue = (reputation: number, capacity: number) => {
  const queueSize = randomInt(3, 5);
  const queue: (MaleGuest | FemaleGuest)[] = [];
  
  for (let i = 0; i < queueSize; i++) {
    const r = Math.random() * 100;
    let rarity: GuestRarity = 'N';
    if (r < reputation * 0.1) rarity = 'SSR';
    else if (r < reputation * 0.3 + 10) rarity = 'SR';
    else if (r < reputation * 0.6 + 30) rarity = 'R';
    
    if (Math.random() > 0.5) {
      queue.push(generateMaleGuest(rarity));
    } else {
      queue.push(generateFemaleGuest(rarity));
    }
  }
  return queue;
};