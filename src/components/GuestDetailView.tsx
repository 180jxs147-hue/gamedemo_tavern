import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Guest, FemaleGuest, MaleGuest } from '../types/game';
import { X, Search, Shield, Zap, Skull, HeartHandshake, Eye, EyeOff, Coins, HeartPulse, Brain, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { getRarityColor } from '../utils/ui';
import { useShallow } from 'zustand/react/shallow';


export const GuestDetailView: React.FC = () => {
  const {  selectedEntity, setSelectedEntity, guests, resources, timePhase, investigate, capture, assignService, assets  } = useGameStore(useShallow(state => ({ selectedEntity: state.selectedEntity, setSelectedEntity: state.setSelectedEntity, guests: state.guests, resources: state.resources, timePhase: state.timePhase, investigate: state.investigate, capture: state.capture, assignService: state.assignService, assets: state.assets })));
  const [showAssign, setShowAssign] = useState(false);

  if (!selectedEntity || selectedEntity.type !== 'guest') return null;
  const guest = guests.find(g => g.id === selectedEntity.id);
  
  if (!guest) {
    setSelectedEntity(null);
    return null;
  }

  const isMale = guest.gender === 'Male';
  const female = guest as FemaleGuest;
  const male = guest as MaleGuest;

  const handleInvestigate = () => investigate(guest.id);

  const handleCapture = (method: 'alchemy' | 'force' | 'seduce') => {
    capture(guest.id, method);
  };

  const StatRow = ({ label, value, icon, isHidden }: { label: string, value: string | number, icon?: React.ReactNode, isHidden?: boolean }) => (
    <div className="flex justify-between items-center py-3 border-b border-zinc-800/50">
      <span className="text-zinc-400 text-sm flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </span>
      {isHidden && !guest.isInvestigated ? (
        <span className="text-zinc-600 font-mono text-sm blur-sm select-none">???</span>
      ) : (
        <span className="text-zinc-100 font-bold font-serif">{value}</span>
      )}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col bg-[color:var(--rt-surface-2)] h-full overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_0%,rgba(202,163,93,0.10),transparent_60%)] pointer-events-none" />

      <div className="flex justify-between items-center p-6 border-b border-[color:var(--rt-border)] bg-[color:var(--rt-surface)] z-10">
        <h2 className="text-2xl font-serif font-bold text-[color:var(--rt-accent)] tracking-wider">客人档案</h2>
        <button onClick={() => setSelectedEntity(null)} className="p-2 bg-[color:var(--rt-surface-2)] hover:bg-black/40 text-[color:var(--rt-muted)] hover:text-[color:var(--rt-text)] rounded-sm transition-colors border border-[color:var(--rt-border)]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-y-auto custom-scrollbar z-10 p-6 space-x-8">
        {/* Left Column: Portrait & Basic Info */}
        <div className="w-1/3 flex flex-col space-y-6">
          <div className="aspect-[3/4] rounded-sm border-2 border-[color:var(--rt-border-strong)] overflow-hidden relative bg-[color:var(--rt-bg)] shadow-2xl">
            <img
              src={guest.portrait}
              alt="portrait"
              className="w-full h-full object-cover opacity-85"
             loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--rt-bg)]/90 via-[color:var(--rt-bg)]/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-3xl font-serif font-bold text-[color:var(--rt-accent)] drop-shadow-md tracking-wider">
                {guest.name}
              </h3>
              <div className="flex items-center justify-between mt-2 gap-2">
                <span className={clsx("px-2 py-1 rounded-sm text-xs font-bold border border-current", getRarityColor(guest.rarity))}>
                  稀有度 {guest.rarity}
                </span>
                <span className="text-xs text-[color:var(--rt-muted)] bg-black/50 px-2 py-1 rounded-sm border border-zinc-700/50">
                  {guest.race} {isMale ? '男性' : '女性'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--rt-surface)] border border-[color:var(--rt-border)] p-4 rounded-sm">
            <button
              onClick={handleInvestigate}
              disabled={resources.ap < 1 || guest.isInvestigated || timePhase !== 'Day'}
              className={clsx(
                "w-full py-2.5 rounded-sm font-bold transition-all flex items-center justify-center border",
                timePhase === 'Day' && !guest.isInvestigated && resources.ap >= 1
                  ? "bg-[color:var(--rt-surface)] hover:bg-black/40 text-[color:var(--rt-accent)] border-[color:var(--rt-border-strong)]"
                  : "bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed"
              )}
            >
              <Search className="w-4 h-4 mr-2" />
              {timePhase !== 'Day' ? '情报打探 (仅限白天)' : guest.isInvestigated ? '已获取全部情报' : '打探情报 (1 AP)'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[color:var(--rt-surface)] border border-[color:var(--rt-border)] p-6 rounded-sm">
          <h4 className="text-xl font-serif font-bold text-[color:var(--rt-text)] border-b border-[color:var(--rt-border)] pb-3 mb-6 flex items-center justify-between">
            <span>属性参数</span>
            {isMale && male.assignedAssetId && (
              <span className="text-xs bg-emerald-900/20 text-emerald-300 border border-emerald-900/40 px-3 py-1 rounded-sm">
                已分配服务
              </span>
            )}
          </h4>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1 content-start">
            {isMale ? (
              <>
                <StatRow label="财力评估" value={male.wealthTier} icon={<Coins className="w-4 h-4 text-amber-400" />} />
                <StatRow label="消费冲动" value={male.impulse} icon={<Zap className="w-4 h-4 text-red-400" />} />
                <StatRow label="战斗力" value={male.combat} icon={<Shield className="w-4 h-4 text-zinc-400" />} />
                <StatRow label="管理能力" value={male.management} icon={<Brain className="w-4 h-4 text-blue-400" />} />
                <StatRow label="偏好/癖好" value={male.xpPreferences.join(' / ')} icon={<HeartPulse className="w-4 h-4 text-pink-400" />} isHidden />
              </>
            ) : (
              <>
                <StatRow label="战斗力" value={female.combat} icon={<Shield className="w-4 h-4 text-zinc-400" />} />
                <StatRow label="体质" value={female.constitution} icon={<HeartPulse className="w-4 h-4 text-red-400" />} />
                <StatRow label="意志力" value={female.willpower} icon={<Brain className="w-4 h-4 text-purple-400" />} />
                <StatRow label="警觉度" value={female.alertness} icon={<EyeOff className="w-4 h-4 text-cyan-400" />} />
                <StatRow label="性格/特点" value={female.traits.join(' / ')} isHidden />
              </>
            )}
          </div>

          {/* Interaction Area */}
          <div className="mt-8 pt-6 border-t border-[color:var(--rt-border)]">
            <h4 className="text-sm font-bold text-[color:var(--rt-muted)] mb-4 uppercase tracking-widest">可用互动指令</h4>
            
            {!isMale && (
              <div className="grid grid-cols-3 gap-4">
                <ActionButton 
                    onClick={() => handleCapture('force')} 
                    disabled={resources.ap < 2 || timePhase !== 'Night'} 
                    icon={<Shield className="w-4 h-4 mr-1" />} 
                    label="武力强攻" 
                    desc="对抗战斗 | 2 AP" 
                    colorClass="text-red-400 bg-red-950/20 border-red-900/30 hover:bg-red-950/40"
                  />
                  <ActionButton 
                    onClick={() => handleCapture('alchemy')} 
                    disabled={resources.ap < 2 || timePhase !== 'Night'} 
                    icon={<HeartPulse className="w-4 h-4 mr-1" />} 
                    label="炼金毒素" 
                    desc="对抗体质 | 2 AP" 
                    colorClass="text-purple-400 bg-purple-950/20 border-purple-900/30 hover:bg-purple-950/40"
                  />
                  <ActionButton 
                    onClick={() => handleCapture('seduce')} 
                    disabled={resources.ap < 2 || timePhase !== 'Night'} 
                    icon={<Brain className="w-4 h-4 mr-1" />} 
                    label="魅惑诱捕" 
                    desc="对抗意志 | 2 AP" 
                    colorClass="text-pink-400 bg-pink-950/20 border-pink-900/30 hover:bg-pink-950/40"
                  />
                {(!isMale && (timePhase !== 'Night')) && (
                      <div className="col-span-3 text-xs text-red-500/80 text-center mt-2 bg-red-950/20 py-2 border border-red-900/30 rounded-sm">
                        捕获行动仅在夜间开放
                      </div>
                    )}
              </div>
            )}

            {isMale && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowAssign(!showAssign)}
                  disabled={timePhase !== 'Night' && timePhase !== 'LateNight'}
                  className="w-full py-4 bg-[color:var(--rt-surface-2)] hover:bg-black/40 text-[color:var(--rt-accent)] border border-[color:var(--rt-border-strong)] rounded-sm flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-widest text-lg shadow-inner"
                >
                  <HeartHandshake className="w-6 h-6 mr-3" />
                  分配服务 (夜间开放)
                </button>
                
                {showAssign && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-[color:var(--rt-surface)] border border-[color:var(--rt-border)] rounded-sm p-4 max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    {assets.length === 0 ? (
                      <div className="text-center text-[color:var(--rt-muted)] text-sm py-4">地下暗房空空如也，暂无可用资产。</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {assets.map(asset => (
                          <div 
                            key={asset.id} 
                            className="flex flex-col p-3 border border-[color:var(--rt-border)] hover:border-[color:var(--rt-accent)]/60 bg-[color:var(--rt-surface-2)] hover:bg-black/40 rounded-sm cursor-pointer transition-colors group"
                            onClick={() => {
                              assignService(male.id, asset.id);
                              setShowAssign(false);
                            }}
                          >
                            <span className="text-[color:var(--rt-accent)] font-serif font-bold group-hover:text-[#d7b271]">{asset.name}</span>
                            <span className="text-xs text-[color:var(--rt-muted)] mt-1 flex justify-between">
                              <span>魅力: <span className="text-pink-400">{asset.charm}</span></span>
                              <span>服从: <span className="text-indigo-400">{asset.obedience}</span></span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ActionButton = ({ onClick, disabled, icon, label, desc, colorClass }: { onClick: () => void, disabled: boolean, icon: React.ReactNode, label: string, desc: string, colorClass?: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      "py-3 rounded-sm flex flex-col items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed border",
      colorClass
    )}
  >
    <div className="flex items-center text-sm font-bold mb-1">
      {icon}
      {label}
    </div>
    <span className="text-[10px] opacity-70 bg-black/30 px-2 py-0.5 rounded-sm">
      {desc}
    </span>
  </button>
);
