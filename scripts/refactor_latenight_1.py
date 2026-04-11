import os

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Update types/game.ts
types_content = read_file('src/types/game.ts')

new_interfaces = """
export interface ServiceRecord {
  guestName: string;
  assetName: string;
  matchCount: number;
  fee: number;
  review: string;
}

export interface SettlementReport {
  day: number;
  roomIncome: number;
  serviceIncome: number;
  salaryExpense: number;
  netProfit: number;
  departedGuests: string[]; // 到期搬离的客人
  serviceRecords: ServiceRecord[]; // 深夜特殊服务评价
}

export interface TavernUpgrade {
"""

types_content = types_content.replace("""export interface SettlementReport {
  day: number;
  roomIncome: number;
  serviceIncome: number;
  salaryExpense: number;
  netProfit: number;
  bankruptGuests: string[];
}

export interface TavernUpgrade {""", new_interfaces)

write_file('src/types/game.ts', types_content)
print("Updated types/game.ts")
