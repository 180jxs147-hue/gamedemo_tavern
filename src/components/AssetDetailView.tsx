import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Shield, Brain, HeartPulse, Search, Heart, Activity, Flame, X, AlertTriangle, HeartHandshake } from 'lucide-react';
import { FemaleGuest, AssetSkill } from '../types/game';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { getRarityColor } from '../utils/ui';
import { useShallow } from 'zustand/react/shallow';


export const AssetDetailView: React.FC = () => {
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
             loading="lazy" />
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
            <StatBar label="健康值" value={asset.health} color="bg-red-500" />
            <StatBar label="当前情绪" value={asset.mood as unknown as number} color="bg-indigo-400" isText />
            <StatBar label="服从度" value={asset.obedience} color="bg-emerald-500" />
            <StatBar label="魅力值" value={asset.charm} color="bg-pink-500" />
          </div>
        </div>

        {/* Advanced Skills (性器熟练度) */}
        <div className="bg-[#1d1715] border border-[#3e2e25] p-4 rounded-sm">
          <h4 className="text-[#e6b36e] font-bold mb-4 flex items-center text-sm border-b border-[#3e2e25] pb-2">
            <Flame className="w-4 h-4 mr-2 text-orange-500" /> 技巧熟练度 (点击选择)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <SkillRow label="口 (Mouth)" skill={asset.skills.mouth} partId="mouth" />
            <SkillRow label="乳 (Breast)" skill={asset.skills.breast} partId="breast" />
            <SkillRow label="阴 (Vagina)" skill={asset.skills.vagina} partId="vagina" />
            <SkillRow label="菊 (Anal)" skill={asset.skills.anal} partId="anal" />
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

        {/* Training Logs */}
        <div className="bg-[#1d1715] border border-[#3e2e25] p-4 rounded-sm">
          <h4 className="text-[#e6b36e] font-bold mb-4 flex items-center text-sm border-b border-[#3e2e25] pb-2">
            调教记录
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
            {asset.trainingLogs && asset.trainingLogs.length > 0 ? (
              asset.trainingLogs.map((log, idx) => (
                <div key={idx} className="text-xs text-[#a09081] border-b border-[#3e2e25] pb-1 last:border-0">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-600 text-center italic">暂无记录</div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-[#1a1514] border-t border-[#3e2e25] flex flex-col gap-2">
        <div className="text-xs text-center text-[#a09081] mb-1">
          {timePhase === 'Day' ? '选择上方部位并指定调教强度 (-1 AP)' : '调教限日间阶段'}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => trainAsset(asset.id, selectedPart, 'heal')}
            disabled={resources.ap < 1 || timePhase !== 'Day' || asset.health === asset.maxHealth}
            className="py-2 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-900/50 text-emerald-400 rounded-sm text-xs font-bold transition-colors disabled:opacity-30"
          >
            温柔安抚 (恢复健康)
          </button>
          <button
            onClick={() => trainAsset(asset.id, selectedPart, 'normal')}
            disabled={resources.ap < 1 || timePhase !== 'Day' || asset.health < 20}
            className="py-2 bg-blue-950/30 hover:bg-blue-900/50 border border-blue-900/50 text-blue-400 rounded-sm text-xs font-bold transition-colors disabled:opacity-30"
          >
            标准开发
          </button>
          <button
            onClick={() => trainAsset(asset.id, selectedPart, 'harsh')}
            disabled={resources.ap < 1 || timePhase !== 'Day' || asset.health < 40}
            className="py-2 bg-red-950/30 hover:bg-red-900/50 border border-red-900/50 text-red-400 rounded-sm text-xs font-bold transition-colors disabled:opacity-30"
          >
            严厉鞭挞
          </button>
        </div>
      </div>
    </motion.div>
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
