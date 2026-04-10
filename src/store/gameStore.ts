import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameResources, TimePhase, MaleGuest, FemaleGuest, Guest, SettlementReport, Facility, LogEntry, InventoryItem } from '../types/game';
import { generateDailyQueue } from '../utils/generators';

interface GameState {
  day: number;
  timePhase: TimePhase;
  resources: GameResources;
  
  logs: LogEntry[];
  inventory: InventoryItem[];
  
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
  trainAsset: (assetId: string) => boolean;
  assignService: (maleId: string, assetId: string) => void;
  resetGame: () => void;
  
  // 交互选择状态
  selectedEntity: { type: 'guest' | 'asset'; id: string } | null;
  setSelectedEntity: (entity: { type: 'guest' | 'asset'; id: string } | null) => void;

  // 接待大厅状态
  checkReceptionItem: (guestId: string, itemId: string) => void;
  
  addLog: (message: string, type?: LogEntry['type']) => void;
}

const INITIAL_RESOURCES: GameResources = {
  ap: 5,
  maxAp: 5,
  gold: 100,
  materials: 0,
  reputation: 10,
  alertLevel: 0
};

const getNextPhase = (current: TimePhase): TimePhase => {
  switch (current) {
    case 'Morning': return 'Day';
    case 'Day': return 'Night';
    case 'Night': return 'LateNight';
    case 'LateNight': return 'Morning';
  }
};

const MAX_GUESTS = 3; // 初始大堂吧台容量

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      day: 1,
      timePhase: 'Morning',
      resources: { ...INITIAL_RESOURCES },
      logs: [{ id: 'init', timestamp: new Date().toLocaleTimeString(), message: '游戏开始。', type: 'info' }],
      inventory: [],
      queue: generateDailyQueue(10, MAX_GUESTS),
      guests: [],
      assets: [],
      facilities: [],
      latestReport: null,
      selectedEntity: null,

      addLog: (message, type = 'info') => set(state => ({
        logs: [...state.logs, {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          message,
          type
        }].slice(-50) // 保留最近50条
      })),

      setSelectedEntity: (entity) => set({ selectedEntity: entity }),

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
              const male = updated as typeof updated & { xpPreference: string, impulse: number, assignedAssetId?: string };
              if (male.assignedAssetId) {
                const asset = assets.find(a => a.id === male.assignedAssetId);
                if (asset) {
                  const fee = getServiceFee(male.wealthTier, asset.charm, male.impulse);
                  serviceIncome += fee;
                  
                  // 根据xp生成满意度日志
                  const { addLog } = get();
                  // 简化：这里假设有一定概率满足
                  const isMatch = Math.random() > 0.3; // 70%概率满足
                  if (isMatch) {
                    addLog(`【服务结算】[${male.name}] 体验了 [${asset.name}] 的服务。完美契合了他的【${male.xpPreference}】癖好，他非常满意地支付了 ${fee} G。`, 'success');
                  } else {
                    addLog(`【服务结算】[${male.name}] 体验了 [${asset.name}] 的服务。虽然未完全满足他的癖好，但他依然支付了 ${fee} G。`, 'info');
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

          const netProfit = roomIncome + serviceIncome;
          
          const report: SettlementReport = {
            day,
            roomIncome,
            serviceIncome,
            salaryExpense: 0,
            netProfit,
            bankruptGuests,
            alertPenalty: 0
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
        if (resources.ap < 1) return false;

        // 可能在队列中或已入住
        const updateGuest = (g: Guest) => g.id === id ? { ...g, isInvestigated: true } : g;

        set({
          resources: { ...resources, ap: resources.ap - 1 },
          guests: guests.map(updateGuest),
          queue: queue.map(updateGuest)
        });
        return true;
      },

      capture: (id, method) => {
        const { resources, guests, assets, timePhase, addLog } = get();
        if (timePhase !== 'Night' && timePhase !== 'LateNight') return 'failure';
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
              charm: Math.floor(Math.random() * 20) + 10,
              skill: 0
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

      trainAsset: (assetId) => {
        const { resources, assets } = get();
        if (resources.ap < 1) return false;

        set({
          resources: { ...resources, ap: resources.ap - 1 },
          assets: assets.map(a => a.id === assetId ? {
            ...a,
            obedience: Math.min(100, a.obedience + 10),
            charm: Math.min(100, a.charm + 5),
            skill: Math.min(100, a.skill + 5)
          } : a)
        });
        return true;
      },

      assignService: (maleId, assetId) => {
        const { guests } = get();
        set({
          guests: guests.map(g => g.id === maleId ? { ...g, assignedAssetId: assetId } : g)
        });
      },

      resetGame: () => {
        set({
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
