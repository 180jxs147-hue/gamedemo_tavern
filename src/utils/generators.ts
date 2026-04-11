import { GuestRarity, MaleGuest, FemaleGuest, Gender, GuestReceptionData, WealthTier, Race } from '../types/game';

const MALE_NAMES = ['亚瑟', '博雷尔', '卡伦', '德莱斯特', '伊利安', '法尔克', '吉迪恩', '哈德良', '伊戈尔', '乔林', '凯尔', '卢锡安', '莫迪凯', '尼文', '奥里昂', '佩林', '奎恩', '罗温', '塞拉斯', '索恩', '乌里安', '瓦莱里乌斯', '威斯坦', '桑德', '约里克', '赞恩'];
const FEMALE_NAMES = ['艾莉亚', '贝娅特丽克丝', '卡西娅', '黛莉亚', '埃拉', '菲奥娜', '吉内薇拉', '海伦娜', '伊索尔德', '朱诺', '基拉', '莉维亚', '摩根娜', '妮娅', '奥菲莉亚', '佩特拉', '奇亚娜', '蕾亚', '塞拉菲娜', '塔莉亚', '乌苏拉', '维斯帕', '雷恩', '塞妮娅', '伊万', '扎拉'];

const SHARED_TRAITS = ['受虐狂', '淫荡', '保守', '贪婪', '傲慢', '胆怯', '虚荣', '孤僻', '温柔', '狂野', '顺从', '高冷', '娇小', '丰满'];

const RACES: Race[] = ['人类', '精灵', '兽人', '矮人', '魔族'];

const MALE_PORTRAITS: Record<Race, string> = {
  '人类': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20handsome%20male%20human%20adventurer%2C%20pixel%20art%20style%20portrait%2C%20RPG%20game%20avatar%2C%20medieval%20fantasy%2C%20high%20quality&image_size=square',
  '精灵': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20handsome%20male%20elf%20ranger%2C%20pixel%20art%20style%20portrait%2C%20hooded%2C%20RPG%20game%20avatar%2C%20medieval%20fantasy%2C%20high%20quality&image_size=square',
  '兽人': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20strong%20male%20beastkin%20warrior%2C%20pixel%20art%20style%20portrait%2C%20muscular%2C%20RPG%20game%20avatar%2C%20medieval%20fantasy%2C%20high%20quality&image_size=square',
  '矮人': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20stout%20male%20dwarf%20blacksmith%2C%20pixel%20art%20style%20portrait%2C%20beard%2C%20RPG%20game%20avatar%2C%20medieval%20fantasy%2C%20high%20quality&image_size=square',
  '魔族': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20handsome%20male%20demon%20warlock%2C%20pixel%20art%20style%20portrait%2C%20glowing%20eyes%2C%20horns%2C%20RPG%20game%20avatar%2C%20medieval%20fantasy%2C%20high%20quality&image_size=square'
};

const FEMALE_PORTRAITS: Record<Race, string> = {
  '人类': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20beautiful%20female%20human%20mage%2C%20pixel%20art%20style%20portrait%2C%20purple%20robe%2C%20RPG%20game%20avatar%2C%20medieval%20fantasy%2C%20high%20quality&image_size=square',
  '精灵': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20beautiful%20female%20elf%20archer%2C%20pixel%20art%20style%20portrait%2C%20green%20hair%2C%20RPG%20game%20avatar%2C%20medieval%20fantasy%2C%20high%20quality&image_size=square',
  '兽人': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20cute%20female%20beastkin%20thief%2C%20pixel%20art%20style%20portrait%2C%20cat%20ears%2C%20RPG%20game%20avatar%2C%20medieval%20fantasy%2C%20high%20quality&image_size=square',
  '矮人': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20beautiful%20female%20dwarf%20cleric%2C%20pixel%20art%20style%20portrait%2C%20blonde%20hair%2C%20RPG%20game%20avatar%2C%20medieval%20fantasy%2C%20high%20quality&image_size=square',
  '魔族': 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20beautiful%20female%20demon%20succubus%2C%20pixel%20art%20style%20portrait%2C%20red%20horns%2C%20RPG%20game%20avatar%2C%20medieval%20fantasy%2C%20high%20quality&image_size=square'
};

const MALE_SPECIFIC_TRAITS = ['粗暴', '多金', '吝啬', '急躁', '变态', '温文尔雅'];

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getStatRange = (rarity: GuestRarity) => {
  switch (rarity) {
    case '普通': return { min: 10, max: 30 };
    case '稀有': return { min: 30, max: 50 };
    case '史诗': return { min: 50, max: 80 };
    case '传说': return { min: 80, max: 100 };
  }
};

const getWealthTier = (rarity: GuestRarity): WealthTier => {
  switch (rarity) {
    case '普通': return '贫穷';
    case '稀有': return '平民';
    case '史诗': return '富裕';
    case '传说': return '贵族';
  }
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const generateReceptionData = (name: string, isMale: boolean, mainXpOrTrait: string, stayDuration: number): GuestReceptionData => {
  
  // 结合客人的性格/性癖/来源地，生成一段生动的入住自白
  const origins = ["边境村落", "王都", "黑市", "迷雾森林", "北地港口"];
  const origin = randomItem(origins);
  const professions = ["旅行商人", "流浪骑士", "药剂师", "寻宝者", "吟游诗人"];
  const profession = randomItem(professions);

  let introText = "";
  if (isMale) {
    introText = `（推开酒馆沉重的木门，抖落斗篷上的风沙）\n老板，给我来一杯最烈的麦酒！我是从${origin}赶来的${profession}。这世道真是不安生，外面乱得很。我打算在你们这里落脚，预计住上 ${stayDuration} 天。\n（他压低了声音，眼神闪烁）\n听说迷迭香酒馆除了酒水，还提供一些“能让人忘记疲惫”的隐秘乐子？我这人平日里压力大，总需要些特别的方式放松一下...希望能让我这几天的钱花得物有所值。`;
  } else {
    introText = `（她推开门，警惕地环顾四周后才走向前台）\n你这里还有空房间吗？我是来自${origin}的${profession}。我大概需要一间安静的房间休息 ${stayDuration} 天，期间请不要让无关的人来打扰我。\n（她微微皱眉，流露出${mainXpOrTrait}的特质）\n我不关心你们这里的其他规矩，我只想要一个安全的落脚点。希望你们的安保能和你们的要价一样可靠。`;
  }

  // 唯一的对话：询问特殊服务
  let serviceResponse = "";
  if (isMale) {
    if (mainXpOrTrait === '顺从' || mainXpOrTrait === '温柔') serviceResponse = "呵，我就喜欢乖巧听话的，这能让我感到自己高高在上。只要能让我满意，赏金少不了你的。";
    else if (mainXpOrTrait === '受虐狂') serviceResponse = "一般的乐子我已经腻了。我需要更强烈的刺激...懂我的意思吗？越是狂烈的痛楚越好。";
    else if (mainXpOrTrait === '狂野') serviceResponse = "哈哈！我就喜欢不被束缚的狂野体验！越辣越好，千万别给我找那些无趣的木头。";
    else serviceResponse = "只要服务到位，我什么都可以试试。";
  } else {
    // 女客对“特殊服务”的反应
    if (mainXpOrTrait === '贪婪' || mainXpOrTrait === '虚荣') {
      serviceResponse = "哼，特殊服务？除非你能提供配得上我身份的高级享受，否则别拿那些廉价的把戏来烦我。";
    } else if (mainXpOrTrait === '胆怯' || mainXpOrTrait === '孤僻') {
      serviceResponse = "不...不用了！我什么都不需要，请不要靠近我的房间！";
    } else if (mainXpOrTrait === '受虐狂') {
      serviceResponse = "哦？如果你们的服务足够‘粗暴’的话，我倒是不介意体验一下...（她脸颊微红，舔了舔嘴唇）";
    } else if (mainXpOrTrait === '淫荡') {
      serviceResponse = "呵呵，看来我来对地方了。只要你们的人足够强壮，今晚的门就不会上锁。";
    } else if (mainXpOrTrait === '保守') {
      serviceResponse = "你在胡说什么？！我可是清白人家的女孩，请你放尊重点！";
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
  const xpPreferences = randomItems(SHARED_TRAITS, randomInt(1, 3));
  const traits = randomItems(MALE_SPECIFIC_TRAITS, randomInt(1, 2));
  const stayDuration = randomInt(1, 5);
  const wealthTier = getWealthTier(rarity);
  const race = randomItem(RACES);
  const portrait = MALE_PORTRAITS[race];
  
  return {
    id: generateId(),
    name,
    gender: 'Male',
    race,
    portrait,
    rarity,
    wealthTier,
    stayDuration,
    daysStayed: 0,
    status: 'Waiting',
    isInvestigated: false,
    impulse: randomInt(statRange.min, statRange.max),
    combat: randomInt(statRange.min, statRange.max),
    management: randomInt(statRange.min, statRange.max),
    xpPreferences,
    traits,
    reception: generateReceptionData(name, true, xpPreferences[0], stayDuration)
  };
};

export const generateFemaleGuest = (rarity: GuestRarity): FemaleGuest => {
  const statRange = getStatRange(rarity);
  const name = randomItem(FEMALE_NAMES);
  const traits = randomItems(SHARED_TRAITS, randomInt(2, 4));
  const stayDuration = randomInt(1, 5);
  const wealthTier = getWealthTier(rarity);
  const race = randomItem(RACES);
  const portrait = FEMALE_PORTRAITS[race];
  
  return {
    id: generateId(),
    name,
    gender: 'Female',
    race,
    portrait,
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
    traits,
    // 默认被捕获后属性为 0
    obedience: 0,
    charm: 0,
    skills: {
      mouth: 0,
      breast: 0,
      vagina: 0,
      anal: 0
    },
    reception: generateReceptionData(name, false, traits[0], stayDuration)
  };
};

export const generateDailyQueue = (reputation: number, capacity: number) => {
  const queueSize = randomInt(3, 5);
  const queue: (MaleGuest | FemaleGuest)[] = [];
  
  for (let i = 0; i < queueSize; i++) {
    const r = Math.random() * 100;
    let rarity: GuestRarity = '普通';
    if (r < reputation * 0.1) rarity = '传说';
    else if (r < reputation * 0.3 + 10) rarity = '史诗';
    else if (r < reputation * 0.6 + 30) rarity = '稀有';
    
    if (Math.random() > 0.5) {
      queue.push(generateMaleGuest(rarity));
    } else {
      queue.push(generateFemaleGuest(rarity));
    }
  }
  return queue;
};