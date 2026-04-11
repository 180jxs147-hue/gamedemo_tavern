import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { MaleGuest } from '../types/game';
import { motion } from 'framer-motion';
import { Heart, X, CheckCircle, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { getRarityColor } from '../utils/ui';
import { useShallow } from 'zustand/react/shallow';


interface Props {
  onClose: () => void;
}

export const ServiceAssignmentView: React.FC<Props> = ({ onClose }) => {
  const {  guests, assets, assignService  } = useGameStore(useShallow(state => ({ guests: state.guests, assets: state.assets, assignService: state.assignService })));
  const maleGuests = guests.filter(g => g.gender === 'Male') as MaleGuest[];
  
  const [selectedMaleId, setSelectedMaleId] = useState<string | null>(maleGuests[0]?.id || null);

  const selectedMale = maleGuests.find(g => g.id === selectedMaleId);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#161211] text-[#d4c4b7] font-serif flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b-2 border-[#543b2b] bg-[#1a1514] shadow-lg relative z-10">
        <h2 className="text-2xl font-bold text-[#e6b36e] tracking-widest flex items-center">
          <Heart className="w-6 h-6 mr-3 text-pink-500" />
          特殊服务安排
        </h2>
        <button onClick={onClose} className="p-2 text-[#a09081] hover:text-white transition-colors bg-[#120e0d] border border-[#3e2e25] rounded">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Male Guests */}
        <div className="w-[300px] bg-[#1d1715] border-r-2 border-[#3e2e25] flex flex-col z-10 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
          <div className="p-4 bg-[#241d1a] border-b border-[#3e2e25] text-[#e6b36e] font-bold tracking-widest">
            待服务客房
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {maleGuests.length === 0 ? (
              <div className="text-[#a09081] text-sm text-center mt-10">当前没有入住的男客。</div>
            ) : (
              maleGuests.map(male => {
                const isSelected = male.id === selectedMaleId;
                const assignedAsset = male.assignedAssetId ? assets.find(a => a.id === male.assignedAssetId) : null;
                
                return (
                  <div 
                    key={male.id}
                    onClick={() => setSelectedMaleId(male.id)}
                    className={clsx(
                      "p-3 border rounded cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden",
                      isSelected 
                        ? "bg-[#2a2220] border-[#8c3f2b] shadow-[0_0_15px_rgba(140,63,43,0.3)]" 
                        : "bg-[#1a1514] border-[#3e2e25] hover:border-[#543b2b]"
                    )}
                  >
                    {isSelected && <div className="absolute inset-y-0 left-0 w-1 bg-[#8c3f2b]" />}
                    
                    <div className="flex justify-between items-baseline pl-1">
                      <span className="font-bold text-[#e6b36e]">{male.name}</span>
                      <span className="text-xs text-[#a09081]">{male.wealthTier}</span>
                    </div>

                    <div className="text-xs flex flex-wrap gap-1 pl-1">
                      {male.isInvestigated ? (
                        male.xpPreferences.map(xp => (
                          <span key={xp} className="bg-pink-950/40 text-pink-400 border border-pink-900/50 px-1 rounded">{xp}</span>
                        ))
                      ) : (
                        <span className="text-[#8c7a6b] flex items-center"><Search className="w-3 h-3 mr-1"/>偏好未知</span>
                      )}
                    </div>

                    {assignedAsset && (
                      <div className="mt-2 text-xs bg-[#120e0d] border border-[#3e2e25] p-1.5 rounded flex items-center text-[#cbbba9]">
                        <CheckCircle className="w-3 h-3 text-emerald-500 mr-1" />
                        已指派: <span className="text-[#e6b36e] ml-1 font-bold">{assignedAsset.name}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Assets Grid */}
        <div className="flex-1 bg-[#161211] p-6 overflow-y-auto custom-scrollbar relative">
          <div className="absolute inset-0 bg-[url('/assets/textures/parchment.jpg')] opacity-5 pointer-events-none mix-blend-overlay" />
          
          {!selectedMale ? (
            <div className="h-full flex items-center justify-center text-[#8c7a6b] text-xl tracking-widest">
              请在左侧选择需要服务的客人
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
              {assets.map(asset => {
                const isAssignedToCurrent = selectedMale.assignedAssetId === asset.id;
                const isAssignedToOther = maleGuests.some(m => m.id !== selectedMale.id && m.assignedAssetId === asset.id);
                
                return (
                  <div 
                    key={asset.id} 
                    className={clsx(
                      "relative rounded-sm border-2 overflow-hidden flex flex-col bg-[#1a1514] transition-all duration-300",
                      isAssignedToCurrent ? "border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] scale-[1.02]" : "border-[#3e2e25] hover:border-[#543b2b]"
                    )}
                  >
                    {/* Large Portrait */}
                    <div className="aspect-[3/4] w-full relative bg-[#120e0d]">
                      <img 
                        src={asset.portrait} 
                        alt={asset.name}
                        className={clsx(
                          "w-full h-full object-cover transition-all duration-500",
                          isAssignedToOther ? "opacity-30 grayscale" : "opacity-80"
                        )}
                       loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#161211] via-[#161211]/40 to-transparent" />
                      
                      {/* Traits Tags (Glowing logic) */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        {asset.traits.map(t => {
                          const isMatch = selectedMale.isInvestigated && selectedMale.xpPreferences.includes(t);
                          return (
                            <span 
                              key={t} 
                              className={clsx(
                                "px-2 py-1 text-xs font-bold rounded shadow-lg transition-all duration-500",
                                isMatch 
                                  ? "bg-pink-600 text-white border border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.8)] scale-110" 
                                  : "bg-[#120e0d]/80 text-[#a09081] border border-[#3e2e25]"
                              )}
                            >
                              {t}
                            </span>
                          );
                        })}
                      </div>

                      {isAssignedToOther && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <span className="text-zinc-400 font-bold border border-zinc-600 px-3 py-1 rounded bg-zinc-900/80">已服务他人</span>
                        </div>
                      )}
                    </div>

                    {/* Info & Actions */}
                    <div className="p-4 flex flex-col gap-3 relative z-10 bg-gradient-to-t from-[#161211] to-transparent">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-xl font-bold text-[#e6b36e]">{asset.name}</h3>
                        <span className={clsx("text-xs font-bold", getRarityColor(asset.rarity))}>{asset.rarity}</span>
                      </div>

                      <div className="flex justify-between text-xs text-[#a09081] border-b border-[#3e2e25] pb-2">
                        <span>魅力: <span className="text-pink-400">{asset.charm}</span></span>
                        <span>服从: <span className="text-emerald-400">{asset.obedience}</span></span>
                      </div>

                      <button
                        onClick={() => assignService(selectedMale.id, isAssignedToCurrent ? undefined : asset.id)}
                        disabled={isAssignedToOther}
                        className={clsx(
                          "w-full py-2.5 rounded font-bold tracking-widest text-sm transition-all",
                          isAssignedToCurrent 
                            ? "bg-transparent border border-pink-500 text-pink-400 hover:bg-pink-950/30" 
                            : isAssignedToOther
                              ? "bg-[#120e0d] text-zinc-600 border border-[#3e2e25] cursor-not-allowed"
                              : "bg-[#241d1a] border border-[#543b2b] text-[#e6b36e] hover:bg-[#8c3f2b] hover:text-[#f2e6d9]"
                        )}
                      >
                        {isAssignedToCurrent ? '取消指派' : isAssignedToOther ? '忙碌中' : '指派给她'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};