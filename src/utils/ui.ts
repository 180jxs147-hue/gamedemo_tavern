export const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case '普通': return 'text-zinc-400';
    case '稀有': return 'text-blue-400';
    case '史诗': return 'text-purple-400';
    case '传说': return 'text-orange-400';
    default: return 'text-zinc-400';
  }
};
