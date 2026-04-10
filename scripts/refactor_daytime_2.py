import os

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Update src/store/gameStore.ts
content = read_file('src/store/gameStore.ts')

content = content.replace(
    "import { GameResources, TimePhase, MaleGuest, FemaleGuest, Guest, SettlementReport, Facility, LogEntry, InventoryItem } from '../types/game';",
    "import { GameResources, TimePhase, MaleGuest, FemaleGuest, Guest, SettlementReport, Facility, LogEntry, InventoryItem, TavernUpgrade, ResearchItem, ShopItem } from '../types/game';"
)

state_interface_old = """  inventory: InventoryItem[];
  
  queue: Guest[]; // 晨间候客队列"""
state_interface_new = """  inventory: InventoryItem[];
  
  upgrades: TavernUpgrade[];
  researches: ResearchItem[];
  shopItems: ShopItem[];
  
  queue: Guest[]; // 晨间候客队列"""
content = content.replace(state_interface_old, state_interface_new)

actions_old = """  addLog: (message: string, type?: LogEntry['type']) => void;
}"""
actions_new = """  addLog: (message: string, type?: LogEntry['type']) => void;

  buyUpgrade: (id: string) => void;
  buyResearch: (id: string) => void;
  buyShopItem: (id: string) => void;
}"""
content = content.replace(actions_old, actions_new)

initial_values_old = """      inventory: [],
      queue: generateDailyQueue(10, MAX_GUESTS),"""
initial_values_new = """      inventory: [],
      upgrades: [
        { id: 'u1', name: '扩建吧台', desc: '增加每日接待客人的数量上限。', cost: 150, level: 0, maxLevel: 3 },
        { id: 'u2', name: '奢华装潢', desc: '提升酒馆声望，吸引更富裕的客人。', cost: 300, level: 0, maxLevel: 5 },
        { id: 'u3', name: '地下隔音', desc: '降低深夜行动被发现的警戒度惩罚。', cost: 500, level: 0, maxLevel: 3 },
      ],
      researches: [
        { id: 'r1', name: '神经毒素', desc: '使目标虚弱，大幅降低诱捕难度。', cost: 200, isUnlocked: false },
        { id: 'r2', name: '媚药改良', desc: '提升资产的魅力，增加服务费收入。', cost: 250, isUnlocked: false },
        { id: 'r3', name: '强效吐真剂', desc: '在盘问时更容易获取隐藏情报。', cost: 150, isUnlocked: false },
      ],
      shopItems: [
        { id: 's1', name: '特制镣铐', desc: '用于控制资产的道具，增加服从度。', cost: 50, icon: '/assets/icons/status/alert.png' },
        { id: 's2', name: '安神香', desc: '降低酒馆的整体警戒度。', cost: 80, icon: '/assets/icons/status/reputation.png' },
        { id: 's3', name: '迷幻药剂', desc: '一次性消耗品，强制捕获成功率+20%。', cost: 120, icon: '/assets/icons/professions/alchemist.png' },
      ],
      queue: generateDailyQueue(10, MAX_GUESTS),"""
content = content.replace(initial_values_old, initial_values_new)

methods_old = """      setSelectedEntity: (entity) => set({ selectedEntity: entity }),"""
methods_new = """      setSelectedEntity: (entity) => set({ selectedEntity: entity }),

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
      },"""
content = content.replace(methods_old, methods_new)

write_file('src/store/gameStore.ts', content)
print("Updated src/store/gameStore.ts")
