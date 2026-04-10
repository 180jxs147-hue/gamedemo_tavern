import os
import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

content = read_file('src/store/gameStore.ts')

new_logic = """
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
"""

# 使用正则替换掉从 if (timePhase === 'LateNight') 到 const netProfit = roomIncome + serviceIncome; 之间的内容
# 但由于这部分代码很长，可以直接使用简单的字符串替换。

old_logic_start = """        if (timePhase === 'LateNight') {"""
old_logic_end = """          const netProfit = roomIncome + serviceIncome; // - salaryExpense"""

start_idx = content.find(old_logic_start)
end_idx = content.find(old_logic_end) + len(old_logic_end)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_logic.strip() + content[end_idx:]
    write_file('src/store/gameStore.ts', content)
    print("Updated src/store/gameStore.ts")
else:
    print("Failed to find logic block in src/store/gameStore.ts")

