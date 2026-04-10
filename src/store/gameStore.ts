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

      nextPhase: () => {
        const { timePhase, guests, assets, day, resources } = get();
        
        if (timePhase === 'LateNight') {
          // 执行深夜结算
          let roomIncome = 0;
          let serviceIncome = 0;
          const bankruptGuests: string[] = [];
          
          const updatedGuests = guests.map(g => {
            if (g.gender !== 'Male') return g;
            const male = g as MaleGuest;
            
            // 1. 房费结算
            let cost = 10;
            let currentWealth = male.wealth;
            
            if (currentWealth >= cost) {
              roomIncome += cost;
              currentWealth -= cost;
            } else {
              roomIncome += currentWealth;
              currentWealth = 0;
            }
            
            // 2. 服务费结算
            if (male.assignedAssetId && currentWealth > 0) {
              const asset = assets.find(a => a.id === male.assignedAssetId);
              if (asset) {
                const serviceFee = Math.floor(asset.charm * 1.5 + male.impulse);
                const actualFee = Math.min(serviceFee, currentWealth);
                serviceIncome += actualFee;
                currentWealth -= actualFee;
              }
            }
            
            return { ...male, wealth: currentWealth, assignedAssetId: undefined };
          }).filter(g => {
            if (g.gender === 'Male' && (g as MaleGuest).wealth <= 0) {
              bankruptGuests.push(g.name);
              return false; // 破产离开
            }
            return true;
          });

          // 计算女性客人房费（如果有女性客人在客房且未被捕获）
          // 暂时简单处理：只算男客房费，女客如果不消费也不付房费，或者固定付房费
          // 这里的简化：女客如果不被捕获第二天直接走人，或继续待着。为了游戏性，假设女客最多待1天。
          const finalGuests = updatedGuests.filter(g => g.gender === 'Male');

          const netProfit = roomIncome + serviceIncome; // - salaryExpense
          
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
            guests: finalGuests,
            latestReport: report,
            queue: generateDailyQueue(resources.reputation, MAX_GUESTS) // 新一天的队列
          });
        } else {
          set({ timePhase: getNextPhase(timePhase) });
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
      name: 'rosemary-tavern-storage',
    }
  )
);
