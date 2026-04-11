import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Shield, Brain, HeartPulse, Search, Heart, Activity, Flame, X } from 'lucide-react';
import { FemaleGuest } from '../types/game';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { getRarityColor } from '../utils/ui';

export const AssetDetailView: React.FC = () => {
  const { selectedEntity, assets, setSelectedEntity, trainAsset, resources, timePhase } = useGameStore();

  if (selectedEntity?.type !== 'asset') return null;

  const asset = assets.find(a => a.id === selectedEntity.id) as FemaleGuest;
  if (!asset) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="absolute right-0 top-0 bottom-0 w-[400px] bg-[#161211] border-l-2 border-[#543b2b] shadow-2xl flex flex-col font-serif z-50"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-[#3e2e25] bg-[#1a1514]">
        <h2 className="text-[#e6b36e] font-bold text-xl tracking-widest flex items-center">
          <Heart className="w-5 h-5 mr-2 text-pink-500" />
          资产详情
        </h2>
        <button onClick={() => setSelectedEntity(null)} className="text-[#a09081] hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Profile Card */}
        <div className="bg-[#1d1715] border border-[#543b2b] rounded-sm overflow-hidden shadow-lg">
          <div className="h-40 relative">
            <img 
              src={asset.portrait} 
              alt={asset.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1d1715] to-transparent" />
            <div className="absolute bottom-3 left-4">
              <h3 className="text-2xl font-bold text-[#e6b36e]">{asset.name}</h3>
              <div className="flex gap-2 mt-1">
                <span className={clsx("px-2 py-0.5 text-xs border rounded-sm font-bold border-current", getRarityColor(asset.rarity))}>
                  {asset.rarity}
                </span>
                <span className="px-2 py-0.5 text-xs bg-black/50 border border-zinc-700/50 text-[#a09081] rounded-sm">
                  {asset.race}
                </span>
                <span className="px-2 py-0.5 text-xs bg-black/50 border border-zinc-700/50 text-[#a09081] rounded-sm">
                  {asset.traits.join(' / ')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-2 gap-4 bg-[#1a1514]">
            <StatBar label="服从度" value={asset.obedience} color="bg-emerald-500" />
            <StatBar label="魅力值" value={asset.charm} color="bg-pink-500" />
          </div>
        </div>

        {/* Advanced Skills (性器熟练度) */}
        <div className="bg-[#1d1715] border border-[#3e2e25] p-4 rounded-sm">
          <h4 className="text-[#e6b36e] font-bold mb-4 flex items-center text-sm border-b border-[#3e2e25] pb-2">
            <Flame className="w-4 h-4 mr-2 text-orange-500" /> 技巧熟练度
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <ProgressBar label="口 (Mouth)" value={asset.skills.mouth} color="bg-rose-400" />
            <ProgressBar label="乳 (Breast)" value={asset.skills.breast} color="bg-fuchsia-400" />
            <ProgressBar label="阴 (Vagina)" value={asset.skills.vagina} color="bg-purple-500" />
            <ProgressBar label="菊 (Anal)" value={asset.skills.anal} color="bg-indigo-500" />
          </div>
        </div>

        {/* Base Stats */}
        <div className="bg-[#1d1715] border border-[#3e2e25] p-4 rounded-sm">
          <h4 className="text-[#e6b36e] font-bold mb-4 flex items-center text-sm border-b border-[#3e2e25] pb-2">
            <Activity className="w-4 h-4 mr-2 text-blue-400" /> 基础属性
          </h4>
          <div className="space-y-2">
            <StatRow label="战斗" value={asset.combat} icon={<Shield className="w-4 h-4 text-zinc-400" />} />
            <StatRow label="意志" value={asset.willpower} icon={<Brain className="w-4 h-4 text-blue-400" />} />
            <StatRow label="体质" value={asset.constitution} icon={<HeartPulse className="w-4 h-4 text-red-400" />} />
            <StatRow label="警觉" value={asset.alertness} icon={<Search className="w-4 h-4 text-yellow-400" />} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-[#1a1514] border-t border-[#3e2e25] flex justify-center">
        <button
          onClick={() => trainAsset(asset.id)}
          disabled={resources.ap < 1 || timePhase === 'LateNight'}
          className="w-full py-3 bg-[#241d1a] hover:bg-[#3e2e25] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-800 border border-[#543b2b] text-[#e6b36e] font-bold tracking-widest rounded shadow transition-colors flex justify-center items-center"
        >
          <Flame className="w-5 h-5 mr-2" />
          调教 (消耗 1 AP)
        </button>
      </div>
    </motion.div>
  );
};

const StatBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="flex flex-col">
    <div className="flex justify-between text-xs mb-1">
      <span className="text-[#a09081]">{label}</span>
      <span className="text-[#e6b36e] font-bold">{value}/100</span>
    </div>
    <div className="h-1.5 bg-[#120e0d] rounded-full overflow-hidden border border-[#3e2e25]">
      <div className={`h-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  </div>
);

const ProgressBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="flex items-center text-sm">
    <span className="w-24 text-[#8c7a6b] text-xs">{label}</span>
    <div className="flex-1 h-2 bg-[#120e0d] rounded-full overflow-hidden border border-[#3e2e25] mx-2">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
    <span className="w-8 text-right text-[#e6b36e] font-bold text-xs">{value}</span>
  </div>
);

const StatRow = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
  <div className="flex justify-between items-center text-sm">
    <div className="flex items-center text-[#8c7a6b]">
      {icon}
      <span className="ml-2">{label}</span>
    </div>
    <span className="font-bold text-[#cbbba9]">{value}</span>
  </div>
);
