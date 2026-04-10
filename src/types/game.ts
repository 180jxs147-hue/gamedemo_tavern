export type TimePhase = 'Morning' | 'Day' | 'Night' | 'LateNight';
export type GuestRarity = 'N' | 'R' | 'SR' | 'SSR';
export type Gender = 'Male' | 'Female';

export interface DialogueOption {
  id: string;
  text: string;
  response: string;
  checkItemId?: 'idChecked' | 'purposeVerified' | 'dangerAssessed';
}

export interface GuestReceptionData {
  idCard: {
    name: string;
    origin: string;
    profession: string;
    validity: string;
  };
  itemVisible?: {
    name: string;
    desc: string;
    icon: string;
  };
  dialogues: DialogueOption[];
  checklist: {
    idChecked: boolean;
    purposeVerified: boolean;
    dangerAssessed: boolean;
  };
  rumorText: string;
  encyclopediaEntry: {
    title: string;
    desc: string;
    image: string;
  };
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
  rarity: GuestRarity;
  status: 'Waiting' | 'CheckedIn' | 'Captured' | 'Employed' | 'Left';
  isInvestigated: boolean; // 是否已被调查揭露隐藏情报
  reception?: GuestReceptionData;
}

export interface MaleGuest extends BaseGuest {
  gender: 'Male';
  wealth: number;
  maxWealth: number;
  impulse: number;
  combat: number;
  management: number;
  // 隐藏情报
  isGoodGuy: boolean;
  xpPreference: string;
  // 服务状态
  assignedAssetId?: string; // 被分配的服务人员
}

export interface FemaleGuest extends BaseGuest {
  gender: 'Female';
  combat: number;
  alertness: number;
  willpower: number;
  constitution: number;
  // 隐藏情报
  weakness: string;
  xpPreference: string;
  // 资产属性（被捕获后）
  obedience: number;
  charm: number;
  skill: number;
}

export type Guest = MaleGuest | FemaleGuest;

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
