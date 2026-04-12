import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Heart, ShieldAlert, Activity, ArrowDownAZ, ArrowUpAZ, User } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { clsx } from 'clsx';
import { getRarityColor } from '../utils/ui';
import { AssetDetailView } from './AssetDetailView';

export const DungeonGalleryView: React.FC = () => {
  const { assets, isDungeonOpen, setDungeonOpen, selectedEntity, setSelectedEntity } = useGameStore(useShallow(state => ({ 
    assets: state.assets, 
    isDungeonOpen: state.isDungeonOpen, 
    setDungeonOpen: state.setDungeonOpen,
    selectedEntity: state.selectedEntity,
    setSelectedEntity: state.setSelectedEntity 
  })));

  const [sortBy, setSortBy] = useState<'charm' | 'obedience' | 'rarity'>('charm');
  const [sortDesc, setSortDesc] = useState(true);

  if (!isDungeonOpen) return null;

  const sortedAssets = [...assets].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'charm') diff = a.charm - b.charm;
    else if (sortBy === 'obedience') diff = a.obedience - b.obedience;
    else {
      const rarityMap = { '普通': 1, '稀有': 2, '史诗': 3, '传说': 4 };
      diff = rarityMap[a.rarity] - rarityMap[b.rarity];
    }
    return sortDesc ? -diff : diff;
  });

  const handleCardClick = (id: string) => {
    setSelectedEntity({ type: 'asset', id });
    setDungeonOpen(false);
  };

  const getCharmTitle = (charm: number) => {
    if (charm < 20) return '平淡无奇';
    if (charm < 40) return '楚楚动人';
    if (charm < 60) return '妩媚多姿';
    if (charm < 80) return '风情万种';
    if (charm < 100) return '颠倒众生';
    return '倾国倾城';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-40 bg-[#0d0a09] flex flex-col font-serif"
    >
      {/* Header */}
      <div className="h-20 border-b-2 border-[#3e2e25] bg-[#161211] flex items-center justify-between px-8 shadow-lg shrink-0">
        <div className="flex items-center">
          <Lock className="w-8 h-8 mr-4 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-[#e6b36e] tracking-widest drop-shadow-md">地下暗房画廊 (Dungeon Gallery)</h1>
            <p className="text-xs text-[#a09081] mt-1">目前关押了 {assets.length} 名资产，点击卡牌进行深度调教与管理。</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-[#1a1514] p-1.5 rounded-sm border border-[#3e2e25]">
            <span className="text-xs text-zinc-500 px-2 font-bold uppercase tracking-widest">排序</span>
            {(['charm', 'obedience', 'rarity'] as const).map(type => (
              <button
                key={type}
                onClick={() => {
                  if (sortBy === type) setSortDesc(!sortDesc);
                  else { setSortBy(type); setSortDesc(true); }
                }}
                className={clsx(
                  "px-3 py-1.5 text-xs rounded-sm font-bold flex items-center transition-colors",
                  sortBy === type ? "bg-[#3e2e25] text-[#e6b36e]" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {type === 'charm' ? '魅力' : type === 'obedience' ? '服从' : '稀有度'}
                {sortBy === type && (sortDesc ? <ArrowDownAZ className="w-3 h-3 ml-1" /> : <ArrowUpAZ className="w-3 h-3 ml-1" />)}
              </button>
            ))}
          </div>

          <button 
            onClick={() => {
              setDungeonOpen(false);
              if (selectedEntity?.type === 'asset') {
                setSelectedEntity(null);
              }
            }} 
            className="p-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509023464722-18d996393ca8?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-5 pointer-events-none mix-blend-overlay fixed" />
        
        {assets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600">
            <User className="w-24 h-24 mb-4 opacity-20" />
            <p className="text-xl font-bold tracking-widest">暗房空荡荡的，没有可供欣赏的收藏品。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 relative z-10">
            <AnimatePresence>
              {sortedAssets.map((asset, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={asset.id}
                  onClick={() => handleCardClick(asset.id)}
                  className="bg-[#161211] border-2 border-[#3e2e25] rounded-md overflow-hidden hover:border-[#e6b36e] transition-colors cursor-pointer group shadow-xl hover:shadow-[0_0_30px_rgba(202,163,93,0.2)] flex flex-col h-[400px]"
                >
                  {/* Portrait Area */}
                  <div className="relative h-3/5 w-full overflow-hidden border-b-2 border-[#3e2e25]">
                    <img 
                      src={asset.portrait} 
                      alt={asset.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161211] via-transparent to-transparent" />
                    
                    <div className="absolute top-2 right-2">
                      <span className={clsx("px-2 py-1 text-xs font-bold border rounded-sm shadow-md", getRarityColor(asset.rarity))}>
                        {asset.rarity}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                      <div>
                        <h3 className="text-xl font-bold text-[#e6b36e] drop-shadow-md">{asset.name}</h3>
                        <span className="text-[10px] bg-black/60 px-1.5 py-0.5 rounded-sm text-zinc-400 border border-zinc-800">
                          {asset.race}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-pink-400 bg-black/60 px-2 py-1 rounded border border-pink-900/50">
                        {getCharmTitle(asset.charm)}
                      </div>
                    </div>
                  </div>

                  {/* Stats Area */}
                  <div className="flex-1 p-4 flex flex-col justify-between bg-[#120e0d]">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 mb-1 flex items-center"><ShieldAlert className="w-3 h-3 mr-1" />服从度</span>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, asset.obedience)}%` }} />
                        </div>
                        <span className="text-xs text-emerald-400 font-bold mt-1 text-right">{asset.obedience}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 mb-1 flex items-center"><Heart className="w-3 h-3 mr-1" />魅力值</span>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-pink-500" style={{ width: `${Math.min(100, asset.charm)}%` }} />
                        </div>
                        <span className="text-xs text-pink-400 font-bold mt-1 text-right">{asset.charm}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center border-t border-[#3e2e25] pt-2">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-zinc-500">口</span>
                        <span className="text-xs text-[#cbbba9] font-bold">Lv.{asset.skills.mouth.level}</span>
                      </div>
                      <div className="flex flex-col items-center border-l border-[#3e2e25]">
                        <span className="text-[10px] text-zinc-500">乳</span>
                        <span className="text-xs text-[#cbbba9] font-bold">Lv.{asset.skills.breast.level}</span>
                      </div>
                      <div className="flex flex-col items-center border-l border-[#3e2e25]">
                        <span className="text-[10px] text-zinc-500">阴</span>
                        <span className="text-xs text-[#cbbba9] font-bold">Lv.{asset.skills.vagina.level}</span>
                      </div>
                      <div className="flex flex-col items-center border-l border-[#3e2e25]">
                        <span className="text-[10px] text-zinc-500">菊</span>
                        <span className="text-xs text-[#cbbba9] font-bold">Lv.{asset.skills.anal.level}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#e6b36e]/20 to-transparent group-hover:via-[#e6b36e] transition-colors" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <AnimatePresence>
        {selectedEntity?.type === 'asset' && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-[#0d0a09]"
          >
            <AssetDetailView onBack={() => setSelectedEntity(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
