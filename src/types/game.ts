export type TimePhase = 'Morning' | 'Day' | 'Night' | 'LateNight';
export type GuestRarity = '普通' | '稀有' | '史诗' | '传说';
export type Gender = 'Male' | 'Female';
export type WealthTier = '贫穷' | '平民' | '富裕' | '贵族';
export type Race = '人类' | '精灵' | '兽人' | '矮人' | '魔族';


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

  id: string;
  text: string;
  response: string;
  checkItemId?: 'durationAssessed' | 'preferenceAssessed' | 'targetAssessed';
}

export interface GuestReceptionData {
  idCard: {
    name: string;
    origin: string;
    profession: string;
    validity: string;
  };
  introText: string; // 客人入住时的一大段陈述
  dialogues: DialogueOption[];
}

export interface GameResources {
  ap: number;
  maxAp: number;
  gold: number;
  materials: number;
  reputation: number;
  alertLevel: number;
}

export interface BaseGuest {
  id: string;
  name: string;
  gender: Gender;
  race: Race; // 新增：种族
  portrait: string; // 新增：专属立绘URL
  rarity: GuestRarity;
  wealthTier: WealthTier;
  stayDuration: number;
  daysStayed: number;
  status: 'Waiting' | 'CheckedIn' | 'Captured' | 'Employed' | 'Left';
  isInvestigated: boolean; // 是否已被调查揭露隐藏情报
  traits: string[]; // 新增：人物多种特点
  reception?: GuestReceptionData;
}

export interface MaleGuest extends BaseGuest {
  gender: 'Male';
  impulse: number;
  combat: number;
  management: number;
  // 隐藏情报
  xpPreferences: string[]; // 偏好的女性特点（性癖）
  assignedAssetId?: string; // 晚上被分配的服务资产ID
}

export interface FemaleGuest extends BaseGuest {
  gender: 'Female';
  combat: number;
  alertness: number;
  willpower: number;
  constitution: number;
  // 资产属性（被捕获后）
  obedience: number;
  charm: number;
  skills: {
    mouth: number;
    breast: number;
    vagina: number;
    anal: number;
  };
}

export type Guest = MaleGuest | FemaleGuest;


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

  id: string;
  name: string;
  level: number;
  type: 'Ground' | 'Underground';
  description: string;
}

export interface SettlementReport {
  day: number;
  roomIncome: number;
  serviceIncome: number;
  salaryExpense: number;
  netProfit: number;
  bankruptGuests: string[]; // 破产被赶走的客人名字
  alertPenalty: number;
}
