import os
import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

content = read_file('src/store/gameStore.ts')

initials = """const INITIAL_UPGRADES: TavernUpgrade[] = [
  { id: 'u1', name: '扩建吧台', desc: '增加每日早晨排队客人的数量上限。', cost: 150, level: 0, maxLevel: 3 },
  { id: 'u2', name: '奢华装潢', desc: '提升酒馆声望，吸引更富裕和高稀有度的客人。', cost: 300, level: 0, maxLevel: 5 },
  { id: 'u3', name: '地下隔音', desc: '降低深夜行动被发现的警戒度惩罚。', cost: 500, level: 0, maxLevel: 3 },
];

const INITIAL_RESEARCHES: ResearchItem[] = [
  { id: 'r1', name: '神经毒素', desc: '使目标虚弱，大幅降低所有诱捕判定的难度(DC-3)。', cost: 300, isUnlocked: false },
  { id: 'r2', name: '高级媚药', desc: '大幅提升资产的初始魅力，增加服务费收入。', cost: 450, isUnlocked: false },
  { id: 'r3', name: '强效吐真剂', desc: '在盘问时更容易获取隐藏情报，并且客人会停留更久。', cost: 250, isUnlocked: false },
];

const INITIAL_SHOP_ITEMS: ShopItem[] = [
  { id: 's1', name: '特制镣铐', desc: '用于控制资产的道具，增加大量服从度。', cost: 80, icon: '/assets/icons/status/alert.png' },
  { id: 's2', name: '安神香', desc: '一次性消耗品，降低酒馆整体警戒度20点。', cost: 120, icon: '/assets/icons/status/reputation.png' },
  { id: 's3', name: '迷幻药剂', desc: '一次性消耗品，强制捕获成功率极大幅度提升。', cost: 200, icon: '/assets/icons/professions/alchemist.png' },
];

const MAX_GUESTS = 3; // 初始大堂吧台容量"""

content = content.replace("const MAX_GUESTS = 3; // 初始大堂吧台容量", initials)

init_state_old = """      upgrades: [
        { id: 'u1', name: '扩建吧台', desc: '增加每日早晨排队客人的数量上限。', cost: 150, level: 0, maxLevel: 3 },
        { id: 'u2', name: '奢华装潢', desc: '提升酒馆声望，吸引更富裕和高稀有度的客人。', cost: 300, level: 0, maxLevel: 5 },
        { id: 'u3', name: '地下隔音', desc: '降低深夜行动被发现的警戒度惩罚。', cost: 500, level: 0, maxLevel: 3 },
      ],
      researches: [
        { id: 'r1', name: '神经毒素', desc: '使目标虚弱，大幅降低所有诱捕判定的难度(DC-3)。', cost: 300, isUnlocked: false },
        { id: 'r2', name: '高级媚药', desc: '大幅提升资产的初始魅力，增加服务费收入。', cost: 450, isUnlocked: false },
        { id: 'r3', name: '强效吐真剂', desc: '在盘问时更容易获取隐藏情报，并且客人会停留更久。', cost: 250, isUnlocked: false },
      ],
      shopItems: [
        { id: 's1', name: '特制镣铐', desc: '用于控制资产的道具，增加大量服从度。', cost: 80, icon: '/assets/icons/status/alert.png' },
        { id: 's2', name: '安神香', desc: '一次性消耗品，降低酒馆整体警戒度20点。', cost: 120, icon: '/assets/icons/status/reputation.png' },
        { id: 's3', name: '迷幻药剂', desc: '一次性消耗品，强制捕获成功率极大幅度提升。', cost: 200, icon: '/assets/icons/professions/alchemist.png' },
      ],"""

init_state_new = """      upgrades: JSON.parse(JSON.stringify(INITIAL_UPGRADES)),
      researches: JSON.parse(JSON.stringify(INITIAL_RESEARCHES)),
      shopItems: JSON.parse(JSON.stringify(INITIAL_SHOP_ITEMS)),"""

content = content.replace(init_state_old, init_state_new)

start_game_old = """      startGame: () => {
        set({
          gameState: 'playing',
          day: 1,
          timePhase: 'Morning',
          resources: { ...INITIAL_RESOURCES },
          logs: [{ id: 'init', timestamp: new Date().toLocaleTimeString(), message: '新的经营开始了。', type: 'info' }],
          inventory: [],
          queue: generateDailyQueue(10, MAX_GUESTS),
          guests: [],
          assets: [],
          latestReport: null,
          selectedEntity: null
        });
      },"""

start_game_new = """      startGame: () => {
        set({
          gameState: 'playing',
          day: 1,
          timePhase: 'Morning',
          resources: { ...INITIAL_RESOURCES },
          logs: [{ id: 'init', timestamp: new Date().toLocaleTimeString(), message: '新的经营开始了。', type: 'info' }],
          inventory: [],
          upgrades: JSON.parse(JSON.stringify(INITIAL_UPGRADES)),
          researches: JSON.parse(JSON.stringify(INITIAL_RESEARCHES)),
          shopItems: JSON.parse(JSON.stringify(INITIAL_SHOP_ITEMS)),
          queue: generateDailyQueue(10, MAX_GUESTS),
          guests: [],
          assets: [],
          facilities: [],
          latestReport: null,
          selectedEntity: null
        });
      },"""

content = content.replace(start_game_old, start_game_new)

write_file('src/store/gameStore.ts', content)
print("Updated gameStore.ts with reset logic.")

