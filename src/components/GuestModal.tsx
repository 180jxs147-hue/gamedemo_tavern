import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Guest, FemaleGuest, MaleGuest } from '../types/game';
import { X, Search, Shield, Zap, Skull, HeartHandshake, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface GuestModalProps {
  guest: Guest;
  onClose: () => void;
}

export const GuestModal: React.FC<GuestModalProps> = ({ guest, onClose }) => {
  const { resources, timePhase, investigate, capture, assignService, assets } = useGameStore();
  const [showAssign, setShowAssign] = useState(false);

  const isMale = guest.gender === 'Male';
  const female = guest as FemaleGuest;
  const male = guest as MaleGuest;

  const handleInvestigate = () => {
    if (investigate(guest.id)) {
      // 成功
    }
  };

  const handleCapture = (method: 'alchemy' | 'force' | 'seduce') => {
    const res = capture(guest.id, method);
    if (res === 'success' || res === 'failure') {
      onClose(); // 成功或失败后关闭
    }
  };

  const StatRow = ({ label, value, icon, isHidden }: { label: string, value: string | number, icon?: React.ReactNode, isHidden?: boolean }) => (
    <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-zinc-950 border border-amber-900/50 rounded-sm shadow-2xl shadow-black max-w-2xl w-full flex overflow-hidden relative"
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-red-900/10 pointer-events-none" />

        {/* 左侧：立绘与基础信息 */}
        <div className="w-1/3 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col items-center">
          <div className="w-full aspect-[3/4] mb-4 rounded-sm border-2 border-zinc-800 overflow-hidden relative bg-zinc-950">
            <img
              src={`https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=elegant%20dark%20fantasy%20portrait%20${guest.gender}%20${guest.rarity}%20guest%20detailed&image_size=portrait_4_3`}
              alt="portrait"
              className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-2 left-2 text-xl font-serif font-bold text-amber-500 drop-shadow-md">
              {guest.name}
            </div>
            <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 border border-amber-900/50 rounded-sm text-xs font-bold text-amber-400">
              {guest.rarity}
            </div>
          </div>
          
          {!guest.isInvestigated && (
            <button
              onClick={handleInvestigate}
              disabled={resources.ap < 1}
              className="w-full py-2 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-900/50 rounded-sm flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Search className="w-4 h-4 mr-2" />
              调查情报 (-1 AP)
            </button>
          )}
          {guest.isInvestigated && (
            <div className="w-full py-2 bg-zinc-800/50 text-cyan-500 border border-zinc-700 rounded-sm flex items-center justify-center text-sm">
              <Eye className="w-4 h-4 mr-2" />
              情报已揭露
            </div>
          )}
        </div>

        {/* 右侧：属性与操作 */}
        <div className="w-2/3 p-6 flex flex-col relative z-10">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-serif font-bold text-amber-500 border-b border-amber-900/30 pb-2 mb-4 flex items-center">
            {isMale ? '客源属性' : '猎物属性'}
            {isMale && male.assignedAssetId && (
              <span className="ml-3 text-xs bg-green-900/30 text-green-400 border border-green-900/50 px-2 py-0.5 rounded-sm">
                已分配服务
              </span>
            )}
          </h3>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-6">
            {isMale ? (
              <>
                <StatRow label="当前财力" value={`${male.wealth} G`} icon={<Coins className="w-4 h-4 text-amber-400" />} />
                <StatRow label="消费冲动" value={male.impulse} icon={<Zap className="w-4 h-4 text-red-400" />} />
                <StatRow label="战斗力" value={male.combat} icon={<Shield className="w-4 h-4 text-zinc-400" />} />
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

          <div className="mt-auto space-y-3">
            <h4 className="text-sm font-bold text-zinc-500 mb-2 uppercase tracking-widest border-b border-zinc-800 pb-1">互动指令</h4>
            
            {/* Female Actions */}
            {!isMale && (
              <div className="grid grid-cols-3 gap-2">
                <ActionButton 
                  label="武力强制" icon={<Skull />} 
                  onClick={() => handleCapture('force')} 
                  disabled={resources.ap < 2 || (timePhase !== 'Night' && timePhase !== 'LateNight')} 
                  desc="对抗:战斗力 (-2 AP)" 
                />
                <ActionButton 
                  label="炼金下药" icon={<FlaskConical />} 
                  onClick={() => handleCapture('alchemy')} 
                  disabled={resources.ap < 2 || (timePhase !== 'Night' && timePhase !== 'LateNight')} 
                  desc="对抗:体质 (-2 AP)" 
                />
                <ActionButton 
                  label="精神诱骗" icon={<Brain />} 
                  onClick={() => handleCapture('seduce')} 
                  disabled={resources.ap < 2 || (timePhase !== 'Night' && timePhase !== 'LateNight')} 
                  desc="对抗:意志 (-2 AP)" 
                />
              </div>
            )}

            {/* Male Actions */}
            {isMale && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowAssign(!showAssign)}
                  disabled={timePhase !== 'Night' && timePhase !== 'LateNight'}
                  className="w-full py-3 bg-amber-900/10 hover:bg-amber-900/30 text-amber-500 border border-amber-900/50 rounded-sm flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HeartHandshake className="w-5 h-5 mr-2" />
                  分配服务 (夜间可用)
                </button>
                
                {showAssign && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-2 mt-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {assets.length === 0 ? (
                      <div className="text-center text-zinc-500 text-sm py-2">无可用资产</div>
                    ) : (
                      assets.map(asset => (
                        <div key={asset.id} className="flex justify-between items-center p-2 hover:bg-zinc-800 rounded-sm cursor-pointer" onClick={() => {
                          assignService(male.id, asset.id);
                          setShowAssign(false);
                        }}>
                          <span className="text-amber-500 font-serif">{asset.name}</span>
                          <span className="text-xs text-zinc-400">魅力: {asset.charm}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            
            {(!isMale && (timePhase === 'Morning' || timePhase === 'Day')) && (
              <p className="text-xs text-red-500/80 text-center mt-2">捕获行动仅在夜间或深夜开放</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Helper Components & Icons ---
const ActionButton = ({ label, icon, onClick, disabled, desc }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex flex-col items-center justify-center py-2 bg-red-950/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
  >
    <div className="mb-1">{React.cloneElement(icon, { className: "w-5 h-5" })}</div>
    <span className="text-sm font-bold">{label}</span>
    <span className="text-[10px] text-red-400/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">{desc}</span>
  </button>
);

const Coins = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>;
const HeartPulse = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>;
const Brain = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/></svg>;
const FlaskConical = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>;
