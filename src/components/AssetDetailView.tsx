import React from 'react';
import { useGameStore } from '../store/gameStore';
import { X, Heart, Activity, BookOpen, Star, Shield, Gem, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const AssetDetailView: React.FC = () => {
  const { selectedEntity, setSelectedEntity, assets, resources, trainAsset } = useGameStore();

  if (!selectedEntity || selectedEntity.type !== 'asset') return null;
  const asset = assets.find(a => a.id === selectedEntity.id);
  
  if (!asset) {
    setSelectedEntity(null);
    return null;
  }

  const handleTrain = () => trainAsset(asset.id);

  const StatRow = ({ label, value, icon, colorClass }: { label: string, value: string | number, icon?: React.ReactNode, colorClass: string }) => (
    <div className={`flex justify-between items-center py-3 border-b border-zinc-800/50 ${colorClass}`}>
      <span className="text-sm flex items-center opacity-80">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </span>
      <span className="font-bold font-serif text-lg">{value}</span>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col bg-[color:var(--rt-surface-2)] h-full overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(900px_700px_at_70%_0%,rgba(202,163,93,0.12),transparent_60%)] pointer-events-none" />

      <div className="flex justify-between items-center p-6 border-b border-[color:var(--rt-border)] bg-[color:var(--rt-surface)] z-10">
        <h2 className="text-2xl font-serif font-bold text-[color:var(--rt-accent)] tracking-wider flex items-center">
          <Gem className="w-6 h-6 mr-3 text-[#a57b3c]" />
          资产档案
        </h2>
        <button onClick={() => setSelectedEntity(null)} className="p-2 bg-[color:var(--rt-surface-2)] hover:bg-black/40 text-[color:var(--rt-muted)] hover:text-[color:var(--rt-text)] rounded-sm transition-colors border border-[color:var(--rt-border)]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-y-auto custom-scrollbar z-10 p-6 space-x-8">
        {/* Left Column: Portrait & Basic Info */}
        <div className="w-1/3 flex flex-col space-y-6">
          <div className="aspect-[3/4] rounded-sm border-2 border-[color:var(--rt-accent)]/50 overflow-hidden relative bg-[color:var(--rt-bg)] shadow-[0_0_30px_rgba(217,119,6,0.15)]">
            <img
              src="/assets/portraits/detailed_asset.jpg"
              alt="portrait"
              className="w-full h-full object-cover opacity-90 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--rt-bg)]/90 via-[color:var(--rt-bg)]/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-3xl font-serif font-bold text-[color:var(--rt-accent)] drop-shadow-md tracking-wider">
                {asset.name}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="bg-black/50 px-2 py-1 border border-[color:var(--rt-border)] rounded-sm text-xs font-bold text-[color:var(--rt-accent)] flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  {asset.rarity} 级资产
                </span>
                <span className="text-[color:var(--rt-muted)] text-sm font-serif">
                  已捕获
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Actions */}
        <div className="flex-1 flex flex-col bg-[color:var(--rt-surface)] border border-[color:var(--rt-border)] p-6 rounded-sm">
          <h4 className="text-xl font-serif font-bold text-[color:var(--rt-text)] border-b border-[color:var(--rt-border)] pb-3 mb-6">
            服从度与技巧
          </h4>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1 content-start">
            <StatRow label="魅力值 (Charm)" value={asset.charm} icon={<Heart className="w-4 h-4" />} colorClass="text-pink-400" />
            <StatRow label="服从度 (Obedience)" value={asset.obedience} icon={<Activity className="w-4 h-4" />} colorClass="text-indigo-400" />
            <StatRow label="技巧值 (Skill)" value={asset.skill} icon={<Star className="w-4 h-4" />} colorClass="text-[#a57b3c]" />
            <StatRow label="原战斗力" value={asset.combat} icon={<Shield className="w-4 h-4" />} colorClass="text-zinc-500" />
            <StatRow label="原警觉度" value={asset.alertness} icon={<AlertTriangle className="w-4 h-4" />} colorClass="text-zinc-500" />
          </div>

          {/* Interaction Area */}
          <div className="mt-8 pt-6 border-t border-[color:var(--rt-border)]">
            <h4 className="text-sm font-bold text-[color:var(--rt-muted)] mb-4 uppercase tracking-widest">资产管理</h4>
            
            <div className="space-y-4">
              <button
                onClick={handleTrain}
                disabled={resources.ap < 1}
                className="w-full py-5 bg-[color:var(--rt-surface-2)] hover:bg-black/40 text-[color:var(--rt-accent)] border border-[color:var(--rt-border-strong)] rounded-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-inner group"
              >
                <div className="flex items-center text-xl font-serif font-bold tracking-widest mb-2 group-hover:text-[#d7b271]">
                  <BookOpen className="w-6 h-6 mr-3" />
                  执行调教训练
                </div>
                <span className="text-xs font-mono bg-black/20 px-3 py-1 rounded-sm border border-[color:var(--rt-border)]">
                  消耗 1 AP | 提升魅力与服从
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
