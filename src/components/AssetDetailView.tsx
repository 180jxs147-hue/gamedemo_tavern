import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Shield, Brain, HeartPulse, Search, Heart, Activity, Flame, X, AlertTriangle, HeartHandshake, ChevronLeft } from 'lucide-react';
import { FemaleGuest, AssetSkill } from '../types/game';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { getRarityColor } from '../utils/ui';
import { useShallow } from 'zustand/react/shallow';


export const AssetDetailView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const {  selectedEntity, assets, setSelectedEntity, trainAsset, resources, timePhase  } = useGameStore(useShallow(state => ({ selectedEntity: state.selectedEntity, assets: state.assets, setSelectedEntity: state.setSelectedEntity, trainAsset: state.trainAsset, resources: state.resources, timePhase: state.timePhase })));
  
  const [selectedPart, setSelectedPart] = useState<'mouth' | 'breast' | 'vagina' | 'anal'>('mouth');

  const getSkillTitle = (part: 'mouth' | 'breast' | 'vagina' | 'anal', level: number) => {
    if (level === 0) return '未经开发';
    
    const titles = {
      mouth: ['生涩之吻', '顺从之吻', '灵巧舌技', '缠绵口技', '深喉吞吐', '迷幻咽喉', '销魂之口', '极乐神吻', '魔幻巧舌', '绝世尤物'],
      breast: ['生涩双峰', '敏感乳首', '顺从夹弄', '柔情乳交', '沉沦峰峦', '迷幻双球', '销魂乳浪', '极乐雪峰', '魔幻玉乳', '绝世尤物'],
      vagina: ['生涩幽谷', '敏感花穴', '顺从之壶', '柔情春水', '沉沦深渊', '迷幻桃花', '销魂名器', '极乐神壶', '魔幻水仙', '绝世尤物'],
      anal: ['生涩后庭', '敏感暗穴', '顺从菊门', '柔情秘洞', '沉沦幽径', '迷幻花蕊', '销魂后穴', '极乐神菊', '魔幻暗渊', '绝世尤物']
    };
    
    return titles[part][Math.min(9, level - 1)];
  };

  const getCharmTitle = (charm: number) => {
    if (charm < 20) return '平淡无奇';
    if (charm < 40) return '楚楚动人';
    if (charm < 60) return '妩媚多姿';
    if (charm < 80) return '风情万种';
    if (charm < 100) return '颠倒众生';
    return '倾国倾城';
  };

  const SkillRow = ({ label, skill, partId }: { label: string, skill: AssetSkill, partId: 'mouth' | 'breast' | 'vagina' | 'anal' }) => {
    const isSelected = selectedPart === partId;
    const progress = (skill.exp / skill.maxExp) * 100;
    const title = getSkillTitle(partId, skill.level);
    
    return (
      <div 
        onClick={() => setSelectedPart(partId)}
        className={clsx(
          "flex flex-col py-2 px-3 border rounded-sm cursor-pointer transition-colors",
          isSelected ? "bg-[#3e2e25] border-[#e6b36e]" : "bg-black/30 border-zinc-800 hover:border-[#543b2b]"
        )}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-[#cbbba9] text-sm font-bold">{label}</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-pink-400 opacity-80">{title}</span>
            <span className="text-[#e6b36e] font-serif font-bold">Lv.{skill.level}</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-zinc-900 rounded-sm overflow-hidden">
          <div 
            className="h-full bg-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[10px] text-right mt-0.5 text-zinc-500">
          {skill.level === 10 ? 'MAX' : `${skill.exp} / ${skill.maxExp}`}
        </div>
      </div>
    );
  };

  if (selectedEntity?.type !== 'asset') return null;

  const asset = assets.find(a => a.id === selectedEntity.id) as FemaleGuest;
  if (!asset) return null;

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#0d0a09]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-20 blur-2xl pointer-events-none"
        style={{ backgroundImage: `url(${asset.portrait})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      
      {/* Header */}
      <div className="p-4 border-b border-[#3e2e25] flex justify-between items-center bg-[#161211]/80 backdrop-blur z-10 relative">
        <div className="flex items-center">
          {onBack && (
            <button 
              onClick={onBack}
              className="mr-4 p-2 bg-[#1a1514] hover:bg-[#3e2e25] border border-[#3e2e25] rounded-sm text-[#e6b36e] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-xl font-bold font-serif text-[#e6b36e] flex items-center">
            {asset.name}
            <span className={clsx("ml-3 px-2 py-0.5 text-[10px] font-bold border rounded-sm shadow-md", getRarityColor(asset.rarity))}>
              {asset.rarity}
            </span>
          </h2>
        </div>
        {!onBack && (
          <button onClick={() => setSelectedEntity(null)} className="text-[#a09081] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex relative z-10">
        {/* Left: Portrait & Stats */}
        <div className="w-1/3 min-w-[300px] border-r border-[#3e2e25] flex flex-col bg-[#120e0d]/90 backdrop-blur">
          <div className="w-full aspect-[3/4] relative border-b border-[#3e2e25] overflow-hidden">
            <img src={asset.portrait} alt={asset.name} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120e0d] to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <span className="text-xs font-bold text-pink-400 bg-black/60 px-2 py-1 rounded border border-pink-900/50">
                {getCharmTitle(asset.charm)}
              </span>
              <span className="text-xs bg-black/60 px-1.5 py-0.5 rounded-sm text-[#e6b36e] border border-amber-900/50">
                {asset.race}
              </span>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 bg-[#1a1514]/80 flex-1">
            <StatBar label="健康值" value={asset.health} color="bg-red-500" />
            <StatBar label="当前情绪" value={asset.mood as unknown as number} color="bg-indigo-400" isText />
            <StatBar label="服从度" value={asset.obedience} color="bg-emerald-500" />
            <StatBar label="魅力" value={`${asset.charm}`} color="bg-pink-500" isText />
          </div>
        </div>

        {/* Right: Training & Logs */}
        <div className="flex-1 flex flex-col bg-[#161211]/90 backdrop-blur">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Skills */}
            <div className="bg-[#1d1715]/80 border border-[#3e2e25] p-4 rounded-sm">
              <h4 className="text-[#e6b36e] font-bold mb-4 flex items-center text-sm border-b border-[#3e2e25] pb-2">
                <Flame className="w-4 h-4 mr-2 text-orange-500" /> 技巧熟练度 (点击选择)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <SkillRow label="口 (Mouth)" skill={asset.skills.mouth} partId="mouth" />
                <SkillRow label="乳 (Breast)" skill={asset.skills.breast} partId="breast" />
                <SkillRow label="阴 (Vagina)" skill={asset.skills.vagina} partId="vagina" />
                <SkillRow label="菊 (Anal)" skill={asset.skills.anal} partId="anal" />
              </div>
            </div>

            {/* Base Stats */}
            <div className="bg-[#1d1715]/80 border border-[#3e2e25] p-4 rounded-sm">
              <h4 className="text-[#e6b36e] font-bold mb-4 flex items-center text-sm border-b border-[#3e2e25] pb-2">
                <Activity className="w-4 h-4 mr-2 text-blue-400" /> 基础属性
              </h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <StatRow label="战斗" value={asset.combat} icon={<Shield className="w-4 h-4 text-zinc-400" />} />
                <StatRow label="意志" value={asset.willpower} icon={<Brain className="w-4 h-4 text-blue-400" />} />
                <StatRow label="体质" value={asset.constitution} icon={<HeartPulse className="w-4 h-4 text-red-400" />} />
                <StatRow label="警觉" value={asset.alertness} icon={<Search className="w-4 h-4 text-yellow-400" />} />
              </div>
            </div>

            {/* Training Logs */}
            <div className="bg-[#1d1715]/80 border border-[#3e2e25] p-4 rounded-sm flex-1 flex flex-col min-h-[200px]">
              <h4 className="text-[#e6b36e] font-bold mb-4 flex items-center text-sm border-b border-[#3e2e25] pb-2 shrink-0">
                调教记录
              </h4>
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {asset.trainingLogs && asset.trainingLogs.length > 0 ? (
                  asset.trainingLogs.map((log, idx) => (
                    <div key={idx} className="text-sm text-[#a09081] border-b border-[#3e2e25] pb-2 last:border-0 leading-relaxed">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-zinc-600 text-center italic mt-10">暂无记录</div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-[#1a1514] border-t-2 border-[#3e2e25] flex flex-col gap-3 shrink-0">
            <div className="text-sm text-center text-[#e6b36e] mb-2 font-bold tracking-widest">
              {timePhase === 'Day' ? '选择上方部位并指定调教强度 (-1 AP)' : '调教限日间阶段 (Day)'}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => trainAsset(asset.id, selectedPart, 'heal')}
                disabled={resources.ap < 1 || timePhase !== 'Day' || asset.health === asset.maxHealth}
                className="py-4 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/50 text-emerald-400 rounded-sm text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                温柔安抚 (恢复健康)
              </button>
              <button
                onClick={() => trainAsset(asset.id, selectedPart, 'normal')}
                disabled={resources.ap < 1 || timePhase !== 'Day' || asset.health < 20}
                className="py-4 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-900/50 text-blue-400 rounded-sm text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                标准开发 (消耗 15 健康)
              </button>
              <button
                onClick={() => trainAsset(asset.id, selectedPart, 'harsh')}
                disabled={resources.ap < 1 || timePhase !== 'Day' || asset.health < 40}
                className="py-4 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 rounded-sm text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                严厉鞭挞 (消耗 30 健康)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBar = ({ label, value, color, isText }: { label: string, value: number | string, color: string, isText?: boolean }) => (
  <div className="flex flex-col">
    <div className="flex justify-between text-xs mb-1">
      <span className="text-[#a09081]">{label}</span>
      <span className={clsx("font-bold", isText ? color : "text-[#e6b36e]")}>{isText ? value : `${value}/100`}</span>
    </div>
    {!isText && (
      <div className="h-1.5 bg-[#120e0d] rounded-full overflow-hidden border border-[#3e2e25]">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, Number(value))}%` }} />
      </div>
    )}
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
