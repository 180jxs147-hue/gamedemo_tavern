import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameResources, TimePhase, MaleGuest, FemaleGuest, Guest, SettlementReport, Facility, LogEntry, InventoryItem, TavernUpgrade, ResearchItem, ShopItem, TavernTier } from '../types/game';
import { generateDailyQueue, generateFemaleGuest } from '../utils/generators';

interface GameState {
  gameState: 'menu' | 'playing';
  day: number;
  timePhase: TimePhase;
  resources: GameResources;
  tavernTier: TavernTier;
  upgradeTavernTier: () => void;
  
  logs: LogEntry[];
  inventory: InventoryItem[];
  
  upgrades: TavernUpgrade[];
  researches: ResearchItem[];
  shopItems: ShopItem[];
  
  queue: Guest[]; // 晨间候客队列
  guests: Guest[]; // 已入住的客人
  assets: FemaleGuest[]; // 已捕获的资产
  facilities: Facility[];
  
  latestReport: SettlementReport | null;
  
  // 核心操作
  nextPhase: () => void;
  acceptGuest: (id: string) => boolean; // 返回是否成功（容量限制）
  rejectGuest: (id: string) => void;
  investigate: (id: string) => boolean; // 返回是否成功（AP限制）
  capture: (id: string, method: 'alchemy' | 'force' | 'seduce') => 'success' | 'failure' | 'no_ap';
  trainAsset: (assetId: string, part: 'mouth' | 'breast' | 'vagina' | 'anal', intensity: 'heal' | 'normal' | 'harsh') => boolean;
  assignService: (maleId: string, assetId: string) => void;
  startGame: () => void;
  continueGame: () => void;
  backToMenu: () => void;
  resetGame: () => void;
  
  // 捕获遭遇战
  activeEncounterId: string | null;
  encounterLogs: string[];
  startEncounter: (id: string) => void;
  fleeEncounter: () => void;
  executeCaptureAction: (type: 'force' | 'seduce' | 'drug') => void;
  attemptCapture: () => void;

  useItemInEncounter: (itemId: string) => void;
  isDungeonOpen: boolean;
  setDungeonOpen: (isOpen: boolean) => void;
  // 交互选择状态
  selectedEntity: { type: 'guest' | 'asset'; id: string } | null;
  setSelectedEntity: (entity: { type: 'guest' | 'asset'; id: string } | null) => void;

  // 接待大厅状态
  checkReceptionItem: (guestId: string, itemId: string) => void;
  
  addLog: (message: string, type?: LogEntry['type']) => void;

  buyUpgrade: (id: string) => void;
  buyResearch: (id: string) => void;
  buyShopItem: (id: string) => void;
}

const INITIAL_RESOURCES: GameResources = {
  ap: 5,
  maxAp: 5,
  gold: 100,
  materials: 0,
  reputation: 10,
  alertLevel: 0,
  force: 15,
  charm: 15,
  alcohol: 15
};

const getNextPhase = (current: TimePhase): TimePhase => {
  switch (current) {
    case 'Morning': return 'Day';
    case 'Day': return 'Night';
    case 'Night': return 'LateNight';
    case 'LateNight': return 'Morning';
  }
};

const INITIAL_UPGRADES: TavernUpgrade[] = [
  // Reception
  { id: 'u1', name: '吧台扩建', desc: '增加每日早晨排队客人的数量上限。', cost: 150, level: 0, maxLevel: 3, category: 'reception', tierReq: 1 },
  { id: 'u2', name: '驻唱舞台', desc: '每天自动增加声望，吸引更富裕的客人。', cost: 500, level: 0, maxLevel: 3, category: 'reception', tierReq: 2, prerequisiteId: 'u1' },
  { id: 'u3', name: '豪华卡座', desc: '延长客人的居住天数上限。', cost: 1200, level: 0, maxLevel: 3, category: 'reception', tierReq: 3, prerequisiteId: 'u2' },
  // Dungeon
  { id: 'u4', name: '隔音墙壁', desc: '降低深夜行动被发现的警戒度惩罚。', cost: 300, level: 0, maxLevel: 3, category: 'dungeon', tierReq: 1 },
  { id: 'u5', name: '专业刑具', desc: '提升调教时经验值和服从度的获取效率。', cost: 800, level: 0, maxLevel: 3, category: 'dungeon', tierReq: 2, prerequisiteId: 'u4' },
  { id: 'u6', name: '医疗恢复舱', desc: '调教时造成的健康值损耗大幅降低。', cost: 2000, level: 0, maxLevel: 3, category: 'dungeon', tierReq: 3, prerequisiteId: 'u5' },
  // Security
  { id: 'u7', name: '隐蔽暗哨', desc: '增加酒馆武力，提升武力压制的成功率。', cost: 400, level: 0, maxLevel: 3, category: 'security', tierReq: 1 },
  { id: 'u8', name: '地下密道', desc: '每天结算时自动降低酒馆的大警戒度。', cost: 1000, level: 0, maxLevel: 3, category: 'security', tierReq: 2, prerequisiteId: 'u7' },
];

const INITIAL_RESEARCHES: ResearchItem[] = [
  // Alchemy
  { id: 'r1', name: '烈性调酒', desc: '使酒精诱惑额外造成 10 点抵抗削减。', cost: 300, isUnlocked: false, category: 'alchemy', tierReq: 1 },
  { id: 'r2', name: '迷幻香薰', desc: '研制成功后，酒馆酒水属性永久增加 15 点。', cost: 800, isUnlocked: false, category: 'alchemy', tierReq: 2, prerequisiteId: 'r1' },
  { id: 'r3', name: '神经麻痹毒素', desc: '极大幅度降低目标的反制警觉度增长。', cost: 1500, isUnlocked: false, category: 'alchemy', tierReq: 3, prerequisiteId: 'r2' },
  // Mind
  { id: 'r4', name: '强效吐真剂', desc: '在盘问时更容易获取隐藏情报。', cost: 250, isUnlocked: false, category: 'mind', tierReq: 1 },
  { id: 'r5', name: '深度催眠', desc: '酒馆魅力属性永久增加 15 点。', cost: 700, isUnlocked: false, category: 'mind', tierReq: 2, prerequisiteId: 'r4' },
  { id: 'r6', name: '精神烙印', desc: '每次调教后额外获得大量服从度。', cost: 1800, isUnlocked: false, category: 'mind', tierReq: 3, prerequisiteId: 'r5' },
  // Body
  { id: 'r7', name: '初级媚药', desc: '提升新捕获资产的初始魅力。', cost: 400, isUnlocked: false, category: 'body', tierReq: 1 },
  { id: 'r8', name: '敏感体质改造', desc: '每次调教额外获得 50% 经验值加成。', cost: 1000, isUnlocked: false, category: 'body', tierReq: 2, prerequisiteId: 'r7' },
  { id: 'r9', name: '永动机关', desc: '资产每晚提供服务后自动恢复部分健康值。', cost: 2500, isUnlocked: false, category: 'body', tierReq: 3, prerequisiteId: 'r8' },
];

const INITIAL_SHOP_ITEMS: ShopItem[] = [
  { id: 's1', name: '特制镣铐', desc: '用于控制资产的道具，增加大量服从度。', cost: 80, icon: '/assets/icons/status/alert.png' },
  { id: 's2', name: '安神香', desc: '一次性消耗品，降低酒馆整体警戒度20点。', cost: 120, icon: '/assets/icons/status/reputation.png' },
  { id: 's3', name: '迷幻药剂', desc: '一次性消耗品，强制捕获成功率极大幅度提升。', cost: 200, icon: '/assets/icons/professions/alchemist.png' },
];

const MAX_GUESTS = 3; // 初始大堂吧台容量

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gameState: 'menu',
      day: 1,
      timePhase: 'Morning',
      resources: { ...INITIAL_RESOURCES },
      tavernTier: 1,
      logs: [{ id: 'init', timestamp: new Date().toLocaleTimeString(), message: '游戏开始。', type: 'info' }],
      inventory: [],
      upgrades: JSON.parse(JSON.stringify(INITIAL_UPGRADES)),
      researches: JSON.parse(JSON.stringify(INITIAL_RESEARCHES)),
      shopItems: JSON.parse(JSON.stringify(INITIAL_SHOP_ITEMS)),
      queue: generateDailyQueue(10, MAX_GUESTS),
      guests: [],
      assets: [],
      facilities: [],
      latestReport: null,
      selectedEntity: null,
      activeEncounterId: null,
      encounterLogs: [],
      isDungeonOpen: false,
      setDungeonOpen: (isOpen) => set({ isDungeonOpen: isOpen }),

      addLog: (message, type = 'info') => set(state => ({
        logs: [...state.logs, {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          message,
          type
        }].slice(-50) // 保留最近50条
      })),

      setSelectedEntity: (entity) => set({ selectedEntity: entity }),

      buyUpgrade: (id) => {
        const { resources, upgrades, addLog } = get();
        const upgrade = upgrades.find(u => u.id === id);
        if (!upgrade || upgrade.level >= upgrade.maxLevel || resources.gold < upgrade.cost) return;

        set({
          resources: { ...resources, gold: resources.gold - upgrade.cost },
          upgrades: upgrades.map(u => u.id === id ? { ...u, level: u.level + 1, cost: Math.floor(u.cost * 1.5) } : u)
        });
        addLog(`【酒馆建设】花费 ${upgrade.cost}G 升级了 [${upgrade.name}] 至 Lv.${upgrade.level + 1}。`, 'success');
      },

      buyResearch: (id) => {
        const { resources, researches, addLog } = get();
        const research = researches.find(r => r.id === id);
        if (!research || research.isUnlocked || resources.gold < research.cost) return;

        set({
          resources: { ...resources, gold: resources.gold - research.cost },
          researches: researches.map(r => r.id === id ? { ...r, isUnlocked: true } : r)
        });
        addLog(`【炼金科研】花费 ${research.cost}G 成功研发了 [${research.name}]。`, 'success');
      },

      buyShopItem: (id) => {
        const { resources, shopItems, inventory, addLog } = get();
        const item = shopItems.find(s => s.id === id);
        if (!item || resources.gold < item.cost) return;

        const existingItem = inventory.find(i => i.id === id);
        let newInventory;
        if (existingItem) {
          newInventory = inventory.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
          newInventory = [...inventory, { id: item.id, name: item.name, desc: item.desc, quantity: 1, icon: item.icon }];
        }

        set({
          resources: { ...resources, gold: resources.gold - item.cost },
          inventory: newInventory
        });
        addLog(`【黑市交易】花费 ${item.cost}G 购买了 [${item.name}]。`, 'info');
      },

      checkReceptionItem: (guestId, itemId) => {
        // no-op, checklist removed
      },

      nextPhase: () => {
        const { timePhase, guests, assets, day, resources } = get();
        
if (timePhase === 'LateNight') {
          // 执行深夜结算
          let roomIncome = 0;
          let serviceIncome = 0;
          const bankruptGuests: string[] = []; // 这里复用此字段作为离开的客人记录
          
          const getRoomFee = (tier: string) => {
            switch(tier) {
              case '贫穷': return 5;
              case '平民': return 15;
              case '富裕': return 40;
              case '贵族': return 100;
              default: return 10;
            }
          };

          const getServiceFee = (tier: string, charm: number, impulse: number) => {
            const base = Math.floor(charm * 1.5 + impulse);
            switch(tier) {
              case '贫穷': return Math.min(base, 20);
              case '平民': return Math.min(base, 60);
              case '富裕': return Math.min(base, 150);
              case '贵族': return base * 2;
              default: return base;
            }
          };

          const updatedGuests = guests.map(g => {
            const updated = { ...g, daysStayed: g.daysStayed + 1 };
            
            // 房费结算
            roomIncome += getRoomFee(updated.wealthTier);

            // 服务费结算 (仅限男客)
            if (updated.gender === 'Male') {
              const male = updated as typeof updated & { xpPreferences: string[], impulse: number, assignedAssetId?: string };
              if (male.assignedAssetId) {
                const asset = assets.find(a => a.id === male.assignedAssetId);
                if (asset) {
                  const matchCount = asset.traits.filter(t => male.xpPreferences.includes(t)).length;
                  const matchMultiplier = 1 + (matchCount * 0.5); // 每个匹配特征增加50%收益
                  
                  const fee = Math.floor(getServiceFee(male.wealthTier, asset.charm, male.impulse) * matchMultiplier);
                  serviceIncome += fee;
                  
                  const { addLog } = get();
                  if (matchCount >= 2) {
                    addLog(`【服务结算】[${male.name}] 体验了 [${asset.name}] 的服务。完美契合了他的多种癖好，他非常满意地支付了 ${fee} G。`, 'success');
                  } else if (matchCount === 1) {
                    addLog(`【服务结算】[${male.name}] 体验了 [${asset.name}] 的服务。部分满足了他的癖好，他支付了 ${fee} G。`, 'info');
                  } else {
                    addLog(`【服务结算】[${male.name}] 体验了 [${asset.name}] 的服务。虽然不对胃口，但他还是勉强支付了 ${fee} G。`, 'warning');
                  }
                }
              }
              male.assignedAssetId = undefined; // 清空服务分配
            }
            return updated;
          }).filter(g => {
            if (g.daysStayed >= g.stayDuration) {
              bankruptGuests.push(`${g.name} (到期搬离)`);
              return false; // 到期离开
            }
            return true;
          });

          let salaryExpense = 0;
          const netProfit = roomIncome + serviceIncome;
          
          const report: import('../types/game').SettlementReport = {
            day: get().day,
            roomIncome,
            serviceIncome,
            salaryExpense,
            netProfit,
            departedGuests: bankruptGuests,
            serviceRecords: [],
            alertPenalty: 0,
          };

          set({
            day: day + 1,
            timePhase: 'Morning',
            resources: {
              ...resources,
              ap: resources.maxAp, // 恢复行动力
              gold: resources.gold + netProfit
            },
            guests: updatedGuests,
            latestReport: report,
            queue: generateDailyQueue(resources.reputation, MAX_GUESTS), // 新一天的队列
            selectedEntity: null
          });
        } else {
          set({ timePhase: getNextPhase(timePhase), selectedEntity: null });
        }
      },

      acceptGuest: (id) => {
        const { queue, guests } = get();
        if (guests.length >= MAX_GUESTS) return false; // 客满
        
        const target = queue.find(g => g.id === id);
        if (!target) return false;

        set({
          queue: queue.filter(g => g.id !== id),
          guests: [...guests, { ...target, status: 'CheckedIn' }]
        });
        return true;
      },

      rejectGuest: (id) => {
        const { queue } = get();
        set({ queue: queue.filter(g => g.id !== id) });
      },

      investigate: (id) => {
        const { resources, guests, queue } = get();
        if (resources.ap < 1 || get().timePhase !== 'Day') return false;

        // 可能在队列中或已入住
        const updateGuest = (g: Guest) => g.id === id ? { ...g, isInvestigated: true } : g;

        set({
          resources: { ...resources, ap: resources.ap - 1 },
          guests: guests.map(updateGuest),
          queue: queue.map(updateGuest)
        });
        return true;
      },

      startEncounter: (id) => set(state => ({ 
        activeEncounterId: id, 
        encounterLogs: ['你悄悄潜入了目标的房间，她似乎还没有察觉。'],
        guests: state.guests.map(g => g.id === id ? { ...g, awareness: 0 } : g)
      })),
      fleeEncounter: () => set({ activeEncounterId: null, encounterLogs: [] }),

      useItemInEncounter: (itemId) => {
        const { inventory, activeEncounterId, guests, encounterLogs } = get();
        if (!activeEncounterId) return;

        const target = guests.find(g => g.id === activeEncounterId) as FemaleGuest;
        const item = inventory.find(i => i.id === itemId && i.quantity > 0);
        if (!target || !item) return;

        let effectMsg = "";
        let newResistance = target.resistance;
        let newAwareness = target.awareness;

        if (itemId === 's2') { // 安神香
          newAwareness = Math.max(0, target.awareness - 30);
          effectMsg = "点燃了安神香，目标的警觉大幅度下降了！";
        } else if (itemId === 's3') { // 迷幻药剂
          newResistance = Math.max(0, target.resistance - 50);
          effectMsg = "使用了迷幻药剂，目标的抵抗意志崩溃了！";
        } else {
          return; // 不可用的道具
        }

        set(state => ({
          inventory: state.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i),
          guests: state.guests.map(g => g.id === activeEncounterId ? { ...g, resistance: newResistance, awareness: newAwareness } : g),
          encounterLogs: [...state.encounterLogs, `【物品】你使用了 ${item.name}。${effectMsg}`]
        }));
      },

      executeCaptureAction: (type) => {
        const { resources, activeEncounterId, guests, researches, addLog } = get();
        if (resources.ap < 1 || !activeEncounterId) return;

        const target = guests.find(g => g.id === activeEncounterId) as FemaleGuest;
        if (!target) return;

        let multiplier = 1;
        const traits = target.traits;
        let effectiveText = "效果一般。";

        if (type === 'force') {
            if (traits.some(t => ['胆怯', '受虐狂', '娇小'].includes(t))) multiplier = 2;
            else if (traits.some(t => ['狂野', '傲慢', '丰满'].includes(t))) multiplier = 0.5;
        } else if (type === 'seduce') {
            if (traits.some(t => ['淫荡', '虚荣', '温柔'].includes(t))) multiplier = 2;
            else if (traits.some(t => ['保守', '高冷', '孤僻'].includes(t))) multiplier = 0.5;
        } else if (type === 'drug') {
            if (traits.some(t => ['贪婪', '傲慢', '狂野'].includes(t))) multiplier = 2;
            else if (traits.some(t => ['胆怯', '顺从'].includes(t))) multiplier = 0.5;
        }

        if (multiplier === 2) effectiveText = "效果拔群！目标显然对这种手段缺乏防备！";
        if (multiplier === 0.5) effectiveText = "收效甚微... 目标对此有很强的抗性。";

        const hasToxin = researches.find(r => r.id === 'r1')?.isUnlocked;
        let statVal = 10;
        if (type === 'force') statVal = resources.force;
        else if (type === 'seduce') statVal = resources.charm;
        else if (type === 'drug') statVal = resources.alcohol;

        const baseDmg = statVal + Math.floor(Math.random() * 11); // stat + 0~10
        let finalDmg = Math.floor(baseDmg * multiplier);
        if (type === 'drug' && hasToxin) finalDmg += 10;

        const newResistance = Math.max(0, target.resistance - finalDmg);
        
        // Target's counter-reaction (Awareness increase)
        const awarenessGain = Math.floor(target.alertness / 2) + Math.floor(Math.random() * 10);
        const newAwareness = target.awareness + awarenessGain;
        
        const typeName = type === 'force' ? '武力压制' : type === 'seduce' ? '言语魅惑' : '酒精诱惑';

        const actionLog = `使用了【${typeName}】，造成了 ${finalDmg} 点抵抗削减。${effectiveText}`;
        const reactionLog = `【警觉】目标的警觉度上升了 ${awarenessGain} 点！`;

        const newLogs = [...get().encounterLogs, actionLog, reactionLog];

        if (newAwareness >= target.maxAwareness) {
            // Flee condition met
            newLogs.push("【惊醒】目标完全清醒并大声呼救！你不得不放弃捕获并逃离现场！");
            set(state => ({
                resources: { 
                  ...state.resources, 
                  ap: state.resources.ap - 1,
                  alertLevel: Math.min(100, state.resources.alertLevel + 30) // 大幅度增加酒馆警戒
                },
                activeEncounterId: null,
                encounterLogs: [],
                guests: state.guests.filter(g => g.id !== activeEncounterId) // 目标逃离酒馆
            }));
            addLog(`【捕获失败】抓捕 [${target.name}] 时动静过大，目标逃跑了，酒馆警戒度大幅上升！`, 'danger');
        } else {
            set(state => ({
                resources: { ...state.resources, ap: state.resources.ap - 1 },
                guests: state.guests.map(g => g.id === activeEncounterId ? { ...g, resistance: newResistance, awareness: newAwareness } : g),
                encounterLogs: newLogs
            }));
        }
      },

      attemptCapture: () => {
        const { resources, activeEncounterId, guests, assets, addLog } = get();
        if (resources.ap < 1 || !activeEncounterId) return;

        const target = guests.find(g => g.id === activeEncounterId) as FemaleGuest;
        if (!target) return;

        const successRate = Math.max(5, Math.floor(100 - (target.resistance / target.maxResistance) * 100));
        const roll = Math.floor(Math.random() * 100) + 1;

        const isSuccess = roll <= successRate;

        if (isSuccess) {
            set(state => ({
                resources: { ...state.resources, ap: state.resources.ap - 1 },
                guests: state.guests.filter(g => g.id !== activeEncounterId),
                assets: [...state.assets, {
                    ...target,
                    status: 'Captured',
                    obedience: Math.floor(Math.random() * 20),
                    maxObedience: 100,
                    charm: Math.floor(Math.random() * 20) + 10,
                    health: 100,
                    maxHealth: 100,
                    mood: '抵抗',
                    skills: {
                      mouth: { level: 0, exp: 0, maxExp: 100 },
                      breast: { level: 0, exp: 0, maxExp: 100 },
                      vagina: { level: 0, exp: 0, maxExp: 100 },
                      anal: { level: 0, exp: 0, maxExp: 100 }
                    },
                    trainingLogs: [`[Day ${state.day}] 被你强行拖入了地下暗房，眼神中充满恐惧与仇恨。`]
                }],
                activeEncounterId: null,
                encounterLogs: []
            }));
            addLog(`【捕获成功】你成功将 [${target.name}] 拘禁入地下暗房！(成功率: ${successRate}%, 掷骰: ${roll})`, 'success');
        } else {
            set(state => ({
                resources: {
                    ...state.resources,
                    ap: state.resources.ap - 1,
                    alertLevel: Math.min(100, state.resources.alertLevel + 20)
                },
                encounterLogs: [...state.encounterLogs, `抛出锁链失败！(成功率: ${successRate}%, 掷骰: ${roll}) 目标的挣扎导致酒馆警戒度上升 20 点！`]
            }));
            addLog(`【捕获失败】试图抓捕 [${target.name}] 失败，警戒度大幅上升！`, 'danger');
        }
      },

      capture: (id, method) => {
        const { resources, guests, assets, timePhase, addLog } = get();
        if (timePhase !== 'Night') return 'failure';
        if (resources.ap < 2) return 'no_ap';

        const target = guests.find(g => g.id === id);
        if (!target || target.gender !== 'Female') return 'failure';

        const female = target as FemaleGuest;
        
        // D20 判定逻辑
        const d20 = Math.floor(Math.random() * 20) + 1;
        const playerModifier = 0; // 未来可根据设施/科研加成
        const totalRoll = d20 + playerModifier;
        
        let dc = 10;
        let statName = "";
        switch (method) {
          case 'alchemy': dc = 10 + Math.floor(female.constitution / 10); statName = "体质"; break;
          case 'force': dc = 10 + Math.floor(female.combat / 10); statName = "战斗"; break;
          case 'seduce': dc = 10 + Math.floor(female.willpower / 10); statName = "意志"; break;
        }

        const isSuccess = totalRoll >= dc;
        
        const logMsg = `【捕获判定】对 [${female.name}] 使用 ${method} 方式。判定属性: ${statName} (DC: ${dc})。掷骰: 1D20(${d20}) + 加值(${playerModifier}) = ${totalRoll}。${isSuccess ? '★ 判定成功！' : '判定失败！目标惊觉逃脱！'}`;
        addLog(logMsg, isSuccess ? 'success' : 'danger');

        if (isSuccess) {
          set({
            resources: { ...resources, ap: resources.ap - 2 },
            guests: guests.filter(g => g.id !== id),
            assets: [...assets, { 
              ...female, 
              status: 'Captured', 
              obedience: Math.floor(Math.random() * 20),
              maxObedience: 100,
              charm: Math.floor(Math.random() * 20) + 10,
              health: 100,
              maxHealth: 100,
              mood: '抵抗',
              skills: {
                mouth: { level: 0, exp: 0, maxExp: 100 },
                breast: { level: 0, exp: 0, maxExp: 100 },
                vagina: { level: 0, exp: 0, maxExp: 100 },
                anal: { level: 0, exp: 0, maxExp: 100 }
              },
              trainingLogs: [`[Day ${get().day}] 被你使用手段拘禁入了地下暗房。`]
            }]
          });
          return 'success';
        } else {
          set({
            resources: { 
              ...resources, 
              ap: resources.ap - 2,
              alertLevel: Math.min(100, resources.alertLevel + 20)
            },
            guests: guests.filter(g => g.id !== id)
          });
          return 'failure';
        }
      },

      trainAsset: (assetId, part, intensity) => {
        const { resources, assets, addLog, day } = get();
        if (resources.ap < 1 || get().timePhase !== 'Day') return false;

        const asset = assets.find(a => a.id === assetId);
        if (!asset) return false;

        let expGain = 0;
        let obdGain = 0;
        let healthCost = 0;
        let charmGain = 0;
        let logMsg = "";
        let isHealing = false;

        const traits = asset.traits;
        let isResistant = traits.includes('保守') || traits.includes('高冷') || traits.includes('傲慢');
        let isMaso = traits.includes('受虐狂');
        let isNympho = traits.includes('淫荡') || traits.includes('狂野');

        if (intensity === 'heal') {
            isHealing = true;
            expGain = 0; // 不增加经验
            obdGain = isResistant ? 10 : 5;
            healthCost = -30; // 恢复 30 点健康
            charmGain = 1;
            logMsg = `你暂时放下了调教的鞭子，温柔地安抚和照料了她。`;
        } else if (intensity === 'normal') {
            expGain = 20;
            obdGain = 5;
            healthCost = 15;
            charmGain = 0;
            logMsg = `你以标准的流程对她的【${part}】进行了开发。`;
        } else if (intensity === 'harsh') {
            expGain = 35;
            obdGain = isMaso ? 15 : -5;
            healthCost = 30;
            charmGain = -1;
            logMsg = `你毫不留情地强行开发了她的【${part}】！`;
            if (isMaso) logMsg += "她对此感到异常兴奋。";
            else if (!isNympho) logMsg += "她痛苦地挣扎，眼中闪过一丝抗拒。";
        }

        // Apply bonus/penalty based on traits (only if not healing)
        if (!isHealing && isNympho) {
            expGain = Math.floor(expGain * 1.5);
            logMsg += "天生的体质让她很快进入了状态。";
        }

        let newHealth = Math.min(asset.maxHealth, Math.max(0, asset.health - healthCost));
        let newObedience = Math.max(0, Math.min(asset.maxObedience, asset.obedience + obdGain));
        let newCharm = Math.max(0, asset.charm + charmGain);
        
        let mood = asset.mood;
        if (newObedience < 20) mood = '抵抗';
        else if (newObedience < 50) mood = '屈服';
        else if (newObedience < 80) mood = isMaso ? '享受' : '绝望';
        else mood = '沉沦';

        const skill = asset.skills[part];
        let newExp = skill.exp + expGain;
        let newLevel = skill.level;
        let newMaxExp = skill.maxExp;
        
        let levelUpMsg = "";
        while (newExp >= newMaxExp && newLevel < 10) {
            newExp -= newMaxExp;
            newLevel++;
            newMaxExp = Math.floor(newMaxExp * 1.5);
            levelUpMsg = `【等级提升】她的 [${part}] 技巧提升到了 Lv.${newLevel}！`;
        }

        if (newLevel === 10) {
            newExp = newMaxExp; // Cap exp
        }

        const finalLog = `[Day ${day}] ${logMsg} (Exp +${expGain}, 服从度 ${obdGain > 0 ? '+' : ''}${obdGain}, 健康 -${healthCost}) ${levelUpMsg}`;

        set({
          resources: { ...resources, ap: resources.ap - 1 },
          assets: assets.map(a => a.id === assetId ? {
            ...a,
            health: newHealth,
            obedience: newObedience,
            charm: newCharm,
            mood,
            skills: {
              ...a.skills,
              [part]: { level: newLevel, exp: newExp, maxExp: newMaxExp }
            },
            trainingLogs: [finalLog, ...a.trainingLogs].slice(0, 20)
          } : a)
        });
        
        addLog(`【资产调教】消耗 1 AP 调教了 [${asset.name}]。${levelUpMsg}`, 'success');
        return true;
      },

      startGame: () => {
        const initialAsset = generateFemaleGuest('普通');
        const assetObj = {
          ...initialAsset,
          status: 'Captured' as const,
          obedience: 50,
          maxObedience: 100,
          charm: 30,
          health: 100,
          maxHealth: 100,
          mood: '屈服' as const,
          skills: { 
            mouth: { level: 1, exp: 0, maxExp: 100 }, 
            breast: { level: 1, exp: 0, maxExp: 100 }, 
            vagina: { level: 1, exp: 0, maxExp: 100 }, 
            anal: { level: 0, exp: 0, maxExp: 100 } 
          },
          trainingLogs: ['这是你带到酒馆的初始资产，对你已经有了一定的服从度。']
        };

        set({
          gameState: 'playing',
          day: 1,
          timePhase: 'Morning',
          resources: { ...INITIAL_RESOURCES },
          tavernTier: 1,
          logs: [
            { id: 'init1', timestamp: new Date().toLocaleTimeString(), message: '新的经营开始了。', type: 'info' },
            { id: 'init2', timestamp: new Date().toLocaleTimeString(), message: `【初始资产】你带来了一名名叫 [${initialAsset.name}] 的普通女奴。`, type: 'success' }
          ],
          inventory: [],
          upgrades: JSON.parse(JSON.stringify(INITIAL_UPGRADES)),
          researches: JSON.parse(JSON.stringify(INITIAL_RESEARCHES)),
          shopItems: JSON.parse(JSON.stringify(INITIAL_SHOP_ITEMS)),
          queue: generateDailyQueue(10, MAX_GUESTS),
          guests: [],
          assets: [assetObj],
          facilities: [],
          latestReport: null,
          selectedEntity: null
        });
      },

      continueGame: () => set({ gameState: 'playing' }),

      assignService: (maleId, assetId) => {
        const { guests, timePhase } = get();
        if (timePhase !== 'Night') return;
        // 保证每个女客只能同时服务一名男客，如果之前已分配给别人，则从别人那里取消
        set({
          guests: guests.map(g => {
            if (g.gender === 'Male') {
              const male = g as MaleGuest;
              if (male.id === maleId) {
                return { ...male, assignedAssetId: assetId };
              } else if (male.assignedAssetId === assetId) {
                return { ...male, assignedAssetId: undefined };
              }
            }
            return g;
          })
        });
      },

      backToMenu: () => {
        set({ gameState: 'menu' });
      },

      upgradeTavernTier: () => {
        const { tavernTier, resources, addLog } = get();
        if (tavernTier >= 5) return;

        const upgradeCosts = {
          1: { gold: 1000, rep: 100 },
          2: { gold: 3000, rep: 300 },
          3: { gold: 8000, rep: 600 },
          4: { gold: 20000, rep: 1000 },
        };

        const cost = upgradeCosts[tavernTier as 1|2|3|4];
        if (resources.gold >= cost.gold && resources.reputation >= cost.rep) {
          const nextTier = (tavernTier + 1) as TavernTier;
          set(state => ({
            tavernTier: nextTier,
            resources: {
              ...state.resources,
              gold: state.resources.gold - cost.gold,
              maxAp: state.resources.maxAp + 1,
              ap: state.resources.maxAp + 1,
              force: state.resources.force + 15,
              charm: state.resources.charm + 15,
              alcohol: state.resources.alcohol + 15
            }
          }));
          addLog(`【酒馆升阶】花费了 ${cost.gold} 金币，酒馆晋升为 ${nextTier} 阶！获得了全方位属性提升，并解锁了更高级的设施和科技树。`, 'success');
        }
      },

      resetGame: () => {
        set({
          gameState: 'menu',
          day: 1,
          timePhase: 'Morning',
          resources: { ...INITIAL_RESOURCES },
          queue: generateDailyQueue(10, MAX_GUESTS),
          guests: [],
          assets: [],
          facilities: [],
          latestReport: null
        });
      }
    }),
    {
      name: 'rosemary-tavern-storage-v2',
      version: 1,
    }
  )
);
