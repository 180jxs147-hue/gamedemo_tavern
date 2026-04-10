import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Guest, FemaleGuest, MaleGuest } from '../types/game';
import { getImageUrl } from '../utils/imageHelper';
import { X, Search, Shield, Zap, Skull, HeartHandshake, Eye, EyeOff, Coins, HeartPulse, Brain, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export const GuestDetailView: React.FC = () => {
  const { selectedEntity, setSelectedEntity, guests, resources, timePhase, investigate, capture, assignService, assets } = useGameStore();
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
      className="flex-1 flex flex-col bg-zinc-950 h-full overflow-hidden relative"
    >
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-zinc-800/80 bg-zinc-900/50 z-10">
        <h2 className="text-2xl font-serif font-bold text-amber-500 tracking-wider">客人档案</h2>
        <button onClick={() => setSelectedEntity(null)} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-sm transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-y-auto custom-scrollbar z-10 p-6 space-x-8">
        {/* Left Column: Portrait & Basic Info */}
        <div className="w-1/3 flex flex-col space-y-6">
          <div className="aspect-[3/4] rounded-sm border-2 border-zinc-800 overflow-hidden relative bg-zinc-950 shadow-2xl">
            <img
              src={getImageUrl(`elegant dark fantasy portrait ${guest.gender} ${guest.rarity} guest detailed masterpiece`, 'portrait_4_3')}
              alt="portrait"
              className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-3xl font-serif font-bold text-amber-500 drop-shadow-md tracking-wider">
                {guest.name}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="bg-black/60 px-2 py-1 border border-amber-900/50 rounded-sm text-xs font-bold text-amber-400">
                  稀有度 {guest.rarity}
                </span>
                <span className="text-zinc-400 text-sm font-serif">
                  {isMale ? '客源' : '猎物'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-sm">
            {!guest.isInvestigated ? (
              <button
                onClick={handleInvestigate}
                disabled={resources.ap < 1}
                className="w-full py-3 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-900/50 rounded-sm flex items-center justify-center transition-colors disabled:opacity-50 font-bold"
              >
                <Search className="w-5 h-5 mr-2" />
                调查隐藏情报 (-1 AP)
              </button>
            ) : (
              <div className="w-full py-3 bg-zinc-800/50 text-cyan-500 border border-zinc-700 rounded-sm flex items-center justify-center text-sm font-bold tracking-widest">
                <Eye className="w-5 h-5 mr-2" />
                情报已完全揭露
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stats & Actions */}
        <div className="flex-1 flex flex-col bg-zinc-900/30 border border-zinc-800 p-6 rounded-sm">
          <h4 className="text-xl font-serif font-bold text-zinc-300 border-b border-amber-900/30 pb-3 mb-6 flex items-center justify-between">
            <span>属性参数</span>
            {isMale && male.assignedAssetId && (
              <span className="text-xs bg-green-900/30 text-green-400 border border-green-900/50 px-3 py-1 rounded-sm">
                已分配服务
              </span>
            )}
          </h4>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1 content-start">
            {isMale ? (
              <>
                <StatRow label="当前财力" value={`${male.wealth} G`} icon={<Coins className="w-4 h-4 text-amber-400" />} />
                <StatRow label="消费冲动" value={male.impulse} icon={<Zap className="w-4 h-4 text-red-400" />} />
                <StatRow label="战斗力" value={male.combat} icon={<Shield className="w-4 h-4 text-zinc-400" />} />
                <StatRow label="管理能力" value={male.management} icon={<Brain className="w-4 h-4 text-blue-400" />} />
                <StatRow label="阵营" value={male.isGoodGuy ? '好人' : '恶徒'} isHidden />
                <StatRow label="XP偏好" value={male.xpPreference} isHidden />
              </>
            ) : (
              <>
                <StatRow label="战斗力" value={female.combat} icon={<Shield className="w-4 h-4 text-zinc-400" />} />
                <StatRow label="体质" value={female.constitution} icon={<HeartPulse className="w-4 h-4 text-red-400" />} />
                <StatRow label="意志力" value={female.willpower} icon={<Brain className="w-4 h-4 text-purple-400" />} />
                <StatRow label="警觉度" value={female.alertness} icon={<EyeOff className="w-4 h-4 text-cyan-400" />} />
                <StatRow label="致命弱点" value={female.weakness} isHidden />
                <StatRow label="XP偏好" value={female.xpPreference} isHidden />
              </>
            )}
          </div>

          {/* Interaction Area */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <h4 className="text-sm font-bold text-zinc-500 mb-4 uppercase tracking-widest">可用互动指令</h4>
            
            {!isMale && (
              <div className="grid grid-cols-3 gap-4">
                <ActionButton 
                  label="武力强制" icon={<Skull />} 
                  onClick={() => handleCapture('force')} 
                  disabled={resources.ap < 2 || (timePhase !== 'Night' && timePhase !== 'LateNight')} 
                  desc="对抗战斗力 | 消耗 2 AP" 
                />
                <ActionButton 
                  label="炼金下药" icon={<FlaskConical />} 
                  onClick={() => handleCapture('alchemy')} 
                  disabled={resources.ap < 2 || (timePhase !== 'Night' && timePhase !== 'LateNight')} 
                  desc="对抗体质 | 消耗 2 AP" 
                />
                <ActionButton 
                  label="精神诱骗" icon={<Brain />} 
                  onClick={() => handleCapture('seduce')} 
                  disabled={resources.ap < 2 || (timePhase !== 'Night' && timePhase !== 'LateNight')} 
                  desc="对抗意志 | 消耗 2 AP" 
                />
                {(!isMale && (timePhase === 'Morning' || timePhase === 'Day')) && (
                  <div className="col-span-3 text-xs text-red-500/80 text-center mt-2 bg-red-950/20 py-2 border border-red-900/30 rounded-sm">
                    捕获行动仅在夜间或深夜开放
                  </div>
                )}
              </div>
            )}

            {isMale && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowAssign(!showAssign)}
                  disabled={timePhase !== 'Night' && timePhase !== 'LateNight'}
                  className="w-full py-4 bg-amber-900/10 hover:bg-amber-900/30 text-amber-500 border border-amber-900/50 rounded-sm flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-widest text-lg shadow-inner"
                >
                  <HeartHandshake className="w-6 h-6 mr-3" />
                  分配服务 (夜间开放)
                </button>
                
                {showAssign && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-zinc-900/80 border border-amber-900/30 rounded-sm p-4 max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    {assets.length === 0 ? (
                      <div className="text-center text-zinc-500 text-sm py-4">地下暗房空空如也，暂无可用资产。</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {assets.map(asset => (
                          <div 
                            key={asset.id} 
                            className="flex flex-col p-3 border border-zinc-700 hover:border-amber-500/50 bg-zinc-950 hover:bg-zinc-800 rounded-sm cursor-pointer transition-colors group"
                            onClick={() => {
                              assignService(male.id, asset.id);
                              setShowAssign(false);
                            }}
                          >
                            <span className="text-amber-500 font-serif font-bold group-hover:text-amber-400">{asset.name}</span>
                            <span className="text-xs text-zinc-400 mt-1 flex justify-between">
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

const ActionButton = ({ label, icon, onClick, disabled, desc }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex flex-col items-center justify-center py-4 bg-red-950/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative shadow-inner"
  >
    <div className="mb-2">{React.cloneElement(icon, { className: "w-6 h-6" })}</div>
    <span className="text-base font-bold tracking-wider">{label}</span>
    <span className="text-xs text-red-400/70 mt-2 font-mono bg-red-950/50 px-2 py-0.5 rounded-sm border border-red-900/30">{desc}</span>
  </button>
);
