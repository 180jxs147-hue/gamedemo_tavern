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
  
  // 结合客人的性格/性癖/来源地，生成一段生动的入住自白
  const origins = ["边境村落", "王都", "黑市", "迷雾森林", "北地港口"];
  const origin = randomItem(origins);
  const professions = ["旅行商人", "流浪骑士", "药剂师", "寻宝者", "吟游诗人"];
  const profession = randomItem(professions);

  let introText = "";
  if (isMale) {
    introText = `（推开酒馆沉重的木门，抖落斗篷上的风沙）\n老板，给我来一杯最烈的麦酒！我是从${origin}赶来的${profession}。这世道真是不安生，外面乱得很。我打算在你们这里落脚，预计住上 ${stayDuration} 天。\n（他压低了声音，眼神闪烁）\n听说迷迭香酒馆除了酒水，还提供一些“能让人忘记疲惫”的隐秘乐子？我这人平日里压力大，总需要些特别的方式放松一下...希望能让我这几天的钱花得物有所值。`;
  } else {
    introText = `（她推开门，警惕地环顾四周后才走向前台）\n你这里还有空房间吗？我是来自${origin}的${profession}。我大概需要一间安静的房间休息 ${stayDuration} 天，期间请不要让无关的人来打扰我。\n（她微微皱眉，流露出${trait}的特质）\n我不关心你们这里的其他规矩，我只想要一个安全的落脚点。希望你们的安保能和你们的要价一样可靠。`;
  }

  // 唯一的对话：询问特殊服务
  let serviceResponse = "";
  if (isMale) {
    if (xpPreference === '服从') serviceResponse = "呵，我就喜欢乖巧听话的，这能让我感到自己高高在上。只要能让我满意，赏金少不了你的。";
    else if (xpPreference === '痛苦') serviceResponse = "一般的乐子我已经腻了。我需要更强烈的刺激...懂我的意思吗？越是狂烈的痛楚越好。";
    else if (xpPreference === '支配') serviceResponse = "我习惯了发号施令，我要绝对的掌控权！安排个懂规矩的，别扫我的兴。";
    else if (xpPreference === '温柔') serviceResponse = "长途跋涉让我疲惫不堪，我只需要一点温柔的抚慰。帮我安排一个心思细腻的女孩吧。";
    else if (xpPreference === '狂野') serviceResponse = "哈哈！我就喜欢不被束缚的狂野体验！越辣越好，千万别给我找那些无趣的木头。";
    else serviceResponse = "只要服务到位，我什么都可以试试。";
  } else {
    // 女客对“特殊服务”的反应（通常是警惕或不屑）
    if (trait === '贪婪' || trait === '虚荣') {
      serviceResponse = "哼，特殊服务？除非你能提供配得上我身份的高级享受，否则别拿那些廉价的把戏来烦我。";
    } else if (trait === '胆怯' || trait === '孤僻') {
      serviceResponse = "不...不用了！我什么都不需要，请不要靠近我的房间！";
    } else {
      serviceResponse = "收起你那套说辞，我来这里只为了休息，对你们那些见不得人的勾当没兴趣。";
    }
  }

  const q_special_service = {
    id: 'q_special',
    text: "我们酒馆到了深夜，会提供一些“特殊”的客房服务。请问您有这方面的需求或偏好吗？",
    response: serviceResponse,
  };

  return {
    idCard: {
      name: name,
      origin: origin,
      profession: profession,
      validity: "王国历 812年 12月"
    },
    introText: introText,
    dialogues: [q_special_service],
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