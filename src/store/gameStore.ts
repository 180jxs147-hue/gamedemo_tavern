import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameResources, TimePhase, MaleGuest, FemaleGuest, Guest, SettlementReport, Facility } from '../types/game';
import { generateDailyQueue } from '../utils/generators';

interface GameState {
  day: number;
  timePhase: TimePhase;
  resources: GameResources;
  
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
  checkReceptionItem: (guestId: string, itemId: keyof NonNullable<Guest['reception']>['checklist']) => void;
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
      queue: generateDailyQueue(10, MAX_GUESTS),
      guests: [],
      assets: [],
      facilities: [],
      latestReport: null,
      selectedEntity: null,

      setSelectedEntity: (entity) => set({ selectedEntity: entity }),

      checkReceptionItem: (guestId, itemId) => {
        const { queue } = get();
        set({
          queue: queue.map(g => {
            if (g.id === guestId && g.reception) {
              return {
                ...g,
                reception: {
                  ...g.reception,
                  checklist: {
                    ...g.reception.checklist,
                    [itemId]: true
                  }
                }
              };
            }
            return g;
          })
        });
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
              const male = updated as typeof updated & { impulse: number, assignedAssetId?: string };
              if (male.assignedAssetId) {
                const asset = assets.find(a => a.id === male.assignedAssetId);
                if (asset) {
                  serviceIncome += getServiceFee(male.wealthTier, asset.charm, male.impulse);
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
        const { resources, guests, assets, timePhase } = get();
        if (timePhase !== 'Night' && timePhase !== 'LateNight') return 'failure';
        if (resources.ap < 2) return 'no_ap'; // 捕获需要2点AP

        const target = guests.find(g => g.id === id);
        if (!target || target.gender !== 'Female') return 'failure';

        const female = target as FemaleGuest;
        
        // 简单判定逻辑 (1d100 + 玩家加成 vs 目标防御属性)
        const roll = Math.random() * 100;
        let defense = 0;
        switch (method) {
          case 'alchemy': defense = female.constitution; break;
          case 'force': defense = female.combat; break;
          case 'seduce': defense = female.willpower; break;
        }

        const isSuccess = roll > defense; // 如果roll出来的数值大于防御属性则成功（简化）

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
          // 失败惩罚：增加警戒度
          set({
            resources: { 
              ...resources, 
              ap: resources.ap - 2,
              alertLevel: Math.min(100, resources.alertLevel + 20)
            },
            guests: guests.filter(g => g.id !== id) // 逃跑
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
