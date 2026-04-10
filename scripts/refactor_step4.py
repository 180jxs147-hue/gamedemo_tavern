import os
import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

content = read_file('src/store/gameStore.ts')

# Step 1: Update imports
content = content.replace(
    "import { GameResources, TimePhase, MaleGuest, FemaleGuest, Guest, SettlementReport, Facility } from '../types/game';",
    "import { GameResources, TimePhase, MaleGuest, FemaleGuest, Guest, SettlementReport, Facility, LogEntry, InventoryItem } from '../types/game';"
)

# Step 2: Add logs and inventory to GameState
state_interface_old = """interface GameState {
  day: number;
  timePhase: TimePhase;
  resources: GameResources;
  
  queue: Guest[]; // 晨间候客队列"""
state_interface_new = """interface GameState {
  day: number;
  timePhase: TimePhase;
  resources: GameResources;
  
  logs: LogEntry[];
  inventory: InventoryItem[];
  
  queue: Guest[]; // 晨间候客队列"""
content = content.replace(state_interface_old, state_interface_new)

# Step 3: Add addLog to GameState
state_interface_old2 = """  // 接待大厅状态
  checkReceptionItem: (guestId: string, itemId: keyof NonNullable<Guest['reception']>['checklist']) => void;
}"""
state_interface_new2 = """  // 接待大厅状态
  checkReceptionItem: (guestId: string, itemId: any) => void;
  
  addLog: (message: string, type?: LogEntry['type']) => void;
}"""
content = content.replace(state_interface_old2, state_interface_new2)

# Step 4: Add initial values
initial_values_old = """      day: 1,
      timePhase: 'Morning',
      resources: { ...INITIAL_RESOURCES },
      queue: generateDailyQueue(10, MAX_GUESTS),"""
initial_values_new = """      day: 1,
      timePhase: 'Morning',
      resources: { ...INITIAL_RESOURCES },
      logs: [{ id: 'init', timestamp: new Date().toLocaleTimeString(), message: '游戏开始。', type: 'info' }],
      inventory: [],
      queue: generateDailyQueue(10, MAX_GUESTS),"""
content = content.replace(initial_values_old, initial_values_new)

# Step 5: Add addLog implementation
add_log_old = """      setSelectedEntity: (entity) => set({ selectedEntity: entity }),"""
add_log_new = """      addLog: (message, type = 'info') => set(state => ({
        logs: [...state.logs, {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          message,
          type
        }].slice(-50) // 保留最近50条
      })),

      setSelectedEntity: (entity) => set({ selectedEntity: entity }),"""
content = content.replace(add_log_old, add_log_new)

# Step 6: Rewrite capture logic with D20
capture_old = """      capture: (id, method) => {
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
      },"""

capture_new = """      capture: (id, method) => {
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
      },"""
content = content.replace(capture_old, capture_new)

# Step 7: Update Settlement to log service satisfaction
settlement_old = """            // 服务费结算 (仅限男客)
            if (updated.gender === 'Male') {
              const male = updated as typeof updated & { impulse: number, assignedAssetId?: string };
              if (male.assignedAssetId) {
                const asset = assets.find(a => a.id === male.assignedAssetId);
                if (asset) {
                  serviceIncome += getServiceFee(male.wealthTier, asset.charm, male.impulse);
                }
              }
              male.assignedAssetId = undefined; // 清空服务分配
            }"""
settlement_new = """            // 服务费结算 (仅限男客)
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
            }"""
content = content.replace(settlement_old, settlement_new)

write_file('src/store/gameStore.ts', content)
print("Updated gameStore.ts")
