import os

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

content = read_file('src/store/gameStore.ts')

# 1. Update investigate restriction (Day only)
content = content.replace(
    "if (resources.ap < 1) return false;",
    "if (resources.ap < 1 || get().timePhase !== 'Day') return false;"
)

# 2. Update capture restriction (Night only)
content = content.replace(
    "if (timePhase !== 'Night' && timePhase !== 'LateNight') return 'failure';",
    "if (timePhase !== 'Night') return 'failure';"
)

# 3. Update train restriction (Day only)
# Wait, let's find the specific line in trainAsset
train_old = """      trainAsset: (assetId) => {
        const { resources, assets, addLog } = get();
        if (resources.ap < 1) return false;"""
train_new = """      trainAsset: (assetId) => {
        const { resources, assets, addLog } = get();
        if (resources.ap < 1 || get().timePhase !== 'Day') return false;"""
content = content.replace(train_old, train_new)

# 4. Update assignService restriction (Night only)
assign_old = """      assignService: (maleId, assetId) => {
        const { guests } = get();"""
assign_new = """      assignService: (maleId, assetId) => {
        const { guests, timePhase } = get();
        if (timePhase !== 'Night') return;"""
content = content.replace(assign_old, assign_new)

# 5. Rewrite nextPhase LateNight logic
late_night_old = """        if (timePhase === 'LateNight') {
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

          const finalGuests = updatedGuests;

          const report: SettlementReport = {
            day: get().day,
            roomIncome,
            serviceIncome,
            salaryExpense,
            netProfit,
            bankruptGuests
          };"""

late_night_new = """        if (timePhase === 'LateNight') {
          let roomIncome = 0;
          let serviceIncome = 0;
          const departedGuests: string[] = [];
          const serviceRecords: import('../types/game').ServiceRecord[] = [];
          
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
            roomIncome += getRoomFee(updated.wealthTier);

            if (updated.gender === 'Male') {
              const male = updated as typeof updated & { xpPreferences: string[], impulse: number, assignedAssetId?: string };
              if (male.assignedAssetId) {
                const asset = assets.find(a => a.id === male.assignedAssetId);
                if (asset) {
                  const matchCount = asset.traits.filter(t => male.xpPreferences.includes(t)).length;
                  const matchMultiplier = 1 + (matchCount * 0.5);
                  const fee = Math.floor(getServiceFee(male.wealthTier, asset.charm, male.impulse) * matchMultiplier);
                  serviceIncome += fee;
                  
                  let review = '';
                  if (matchCount >= 2) {
                    review = `完美契合了我的多种癖好，这正是我想在迷迭香酒馆寻找的极致体验！`;
                    addLog(`【服务结算】[${male.name}] 体验了 [${asset.name}] 的服务。完美契合了他的多种癖好，他非常满意地支付了 ${fee} G。`, 'success');
                  } else if (matchCount === 1) {
                    review = `还算不错，部分满足了我的喜好，度过了一个愉快的夜晚。`;
                    addLog(`【服务结算】[${male.name}] 体验了 [${asset.name}] 的服务。部分满足了他的癖好，他支付了 ${fee} G。`, 'info');
                  } else {
                    review = `服务态度尚可，但完全不是我喜欢的类型，勉强凑合吧。`;
                    addLog(`【服务结算】[${male.name}] 体验了 [${asset.name}] 的服务。虽然不对胃口，但他还是勉强支付了 ${fee} G。`, 'warning');
                  }

                  serviceRecords.push({
                    guestName: male.name,
                    assetName: asset.name,
                    matchCount,
                    fee,
                    review
                  });
                }
              }
              male.assignedAssetId = undefined;
            }
            return updated;
          }).filter(g => {
            if (g.daysStayed >= g.stayDuration) {
              departedGuests.push(`${g.name}`);
              return false;
            }
            return true;
          });

          const finalGuests = updatedGuests;

          const report: import('../types/game').SettlementReport = {
            day: get().day,
            roomIncome,
            serviceIncome,
            salaryExpense,
            netProfit,
            departedGuests,
            serviceRecords
          };"""

content = content.replace(late_night_old, late_night_new)
write_file('src/store/gameStore.ts', content)
print("Updated gameStore.ts")
