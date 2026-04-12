import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';
import { Shield, Brain, HeartPulse, Crosshair, X, User, PackageOpen, AlertTriangle, Beer } from 'lucide-react';
import { FemaleGuest } from '../types/game';
import { useShallow } from 'zustand/react/shallow';
import { getRarityColor } from '../utils/ui';
import { clsx } from 'clsx';

export const CaptureEncounterView: React.FC = () => {
  const { 
    activeEncounterId, 
    guests, 
    encounterLogs, 
    executeCaptureAction, 
    attemptCapture, 
    fleeEncounter,
    useItemInEncounter,
    inventory,
    resources 
  } = useGameStore(useShallow(state => ({
    activeEncounterId: state.activeEncounterId,
    guests: state.guests,
    encounterLogs: state.encounterLogs,
    executeCaptureAction: state.executeCaptureAction,
    attemptCapture: state.attemptCapture,
    fleeEncounter: state.fleeEncounter,
    useItemInEncounter: state.useItemInEncounter,
    inventory: state.inventory,
    resources: state.resources
  })));

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [encounterLogs]);

  if (!activeEncounterId) return null;

  const target = guests.find(g => g.id === activeEncounterId) as FemaleGuest;
  if (!target) return null;

  const hpPercentage = Math.max(0, (target.resistance / target.maxResistance) * 100);
  const awarenessPercentage = Math.max(0, Math.min(100, (target.awareness / target.maxAwareness) * 100));
  const captureRate = Math.max(5, Math.floor(100 - hpPercentage));

  const hasItemS2 = inventory.find(i => i.id === 's2')?.quantity || 0; // 安神香
  const hasItemS3 = inventory.find(i => i.id === 's3')?.quantity || 0; // 迷幻药剂

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 text-[#d4c4b7] font-serif flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-5xl h-[80vh] flex flex-col md:flex-row bg-[#161211] border-2 border-[#543b2b] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
        
        {/* Left Panel: Target Info & Visual */}
        <div className="flex-1 relative flex flex-col border-r-2 border-[#3e2e25] bg-[#120e0d]">
          <div className="absolute inset-0">
            <img 
              src={target.portrait} 
              alt={target.name}
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161211] via-transparent to-[#161211]/80" />
          </div>
          
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-[#e6b36e] drop-shadow-md">{target.name}</h2>
                <div className="flex gap-2 mt-2">
                  <span className={clsx("px-2 py-0.5 border rounded-sm text-xs font-bold", getRarityColor(target.rarity))}>
                    {target.rarity}
                  </span>
                  <span className="px-2 py-0.5 bg-black/50 border border-zinc-700/50 rounded-sm text-xs text-zinc-400">
                    {target.race}
                  </span>
                </div>
              </div>
              <button onClick={fleeEncounter} className="text-[#a09081] hover:text-white p-2 bg-black/40 rounded border border-[#3e2e25] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-4 bg-[#1a1514]/80 backdrop-blur-md border border-[#3e2e25] p-4 rounded-sm flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2 font-bold">
                  <span className="text-[#e6b36e]">抵抗意志</span>
                  <span className="text-amber-400">{target.resistance} / {target.maxResistance}</span>
                </div>
                <div className="w-full h-3 bg-zinc-900 rounded-sm overflow-hidden border border-[#3e2e25]">
                  <motion.div 
                    initial={{ width: `${hpPercentage}%` }}
                    animate={{ width: `${hpPercentage}%` }}
                    className={clsx(
                      "h-full transition-all duration-500",
                      hpPercentage > 50 ? "bg-emerald-500" : hpPercentage > 20 ? "bg-amber-500" : "bg-red-500"
                    )}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1 text-right">
                  降低抵抗值可大幅提升捕获成功率。
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2 font-bold">
                  <span className="text-red-400 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" />警觉度</span>
                  <span className="text-red-400">{target.awareness} / {target.maxAwareness}</span>
                </div>
                <div className="w-full h-3 bg-zinc-900 rounded-sm overflow-hidden border border-[#3e2e25]">
                  <motion.div 
                    initial={{ width: `${awarenessPercentage}%` }}
                    animate={{ width: `${awarenessPercentage}%` }}
                    className={clsx(
                      "h-full transition-all duration-500",
                      awarenessPercentage > 80 ? "bg-red-600" : awarenessPercentage > 50 ? "bg-orange-500" : "bg-zinc-500"
                    )}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1 text-right">
                  警觉度满时目标将呼救逃跑，导致大警戒度飙升。
                </p>
              </div>
            </div>

            <div className="mt-4 bg-[#1a1514]/80 backdrop-blur-md border border-[#3e2e25] p-4 rounded-sm">
              <h3 className="text-sm font-bold text-[#a09081] mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                性格弱点 (Traits)
              </h3>
              <div className="flex flex-wrap gap-2">
                {target.isInvestigated ? (
                  target.traits.map(t => (
                    <span key={t} className="px-2 py-1 bg-purple-900/30 text-purple-300 border border-purple-700/50 rounded text-xs font-bold">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">情报未解明，建议在白天打探情报。</span>
                )}
              </div>
            </div>

            <div className="mt-auto">
              <div className="bg-black/60 border border-amber-900/50 p-4 rounded flex justify-between items-center">
                <div>
                  <div className="text-sm text-amber-500/80 font-bold mb-1">当前捕获成功率</div>
                  <div className="text-3xl font-bold text-amber-400">{captureRate}%</div>
                </div>
                <button
                  onClick={attemptCapture}
                  disabled={resources.ap < 1}
                  className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xl rounded-sm shadow-[0_0_20px_rgba(217,119,6,0.4)] disabled:opacity-50 transition-all flex items-center"
                >
                  <Crosshair className="w-6 h-6 mr-2" />
                  实施抓捕 (1 AP)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Actions & Log */}
        <div className="w-full md:w-96 bg-[#1a1514] flex flex-col">
          <div className="p-4 border-b border-[#3e2e25] bg-[#241d1a] flex justify-between items-center">
            <span className="font-bold text-[#e6b36e] tracking-widest">遭遇战日志</span>
            <span className="text-sm bg-black/50 px-2 py-1 rounded text-zinc-400 border border-zinc-800">
              剩余 AP: <span className="text-amber-400 font-bold">{resources.ap}</span>
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 text-sm">
            {encounterLogs.map((log, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx} 
                className={clsx(
                  "p-3 rounded-sm border",
                  log.includes('成功') ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400" :
                  log.includes('失败') ? "bg-red-950/30 border-red-900/50 text-red-400" :
                  log.includes('拔群') ? "bg-pink-950/30 border-pink-900/50 text-pink-300" :
                  "bg-[#120e0d] border-[#3e2e25] text-[#cbbba9]"
                )}
              >
                {log}
              </motion.div>
            ))}
            <div ref={logsEndRef} />
          </div>

          <div className="p-4 border-t border-[#3e2e25] bg-[#161211]">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => useItemInEncounter('s2')}
                disabled={hasItemS2 === 0}
                className="py-2 bg-blue-950/20 hover:bg-blue-950/40 border border-blue-900/30 text-blue-400 rounded-sm flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
              >
                <PackageOpen className="w-3 h-3 mr-1" />
                安神香 ({hasItemS2})
              </button>
              <button
                onClick={() => useItemInEncounter('s3')}
                disabled={hasItemS3 === 0}
                className="py-2 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/30 text-purple-400 rounded-sm flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
              >
                <PackageOpen className="w-3 h-3 mr-1" />
                迷幻药剂 ({hasItemS3})
              </button>
            </div>

            <div className="text-xs text-zinc-500 mb-2 text-center">使用克制手段可造成双倍抵抗削减</div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => executeCaptureAction('force')}
                disabled={resources.ap < 1 || hpPercentage === 0}
                className="w-full py-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 rounded-sm flex items-center justify-center transition-colors disabled:opacity-50 font-bold"
              >
                <Shield className="w-4 h-4 mr-2" /> 武力压制 [武力:{resources.force}] (-1 AP)
              </button>
              <button
                onClick={() => executeCaptureAction('seduce')}
                disabled={resources.ap < 1 || hpPercentage === 0}
                className="w-full py-3 bg-pink-950/20 hover:bg-pink-950/40 border border-pink-900/30 text-pink-400 rounded-sm flex items-center justify-center transition-colors disabled:opacity-50 font-bold"
              >
                <Brain className="w-4 h-4 mr-2" /> 言语魅惑 [魅力:{resources.charm}] (-1 AP)
              </button>
              <button
                onClick={() => executeCaptureAction('drug')}
                disabled={resources.ap < 1 || hpPercentage === 0}
                className="w-full py-3 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-900/30 text-amber-400 rounded-sm flex items-center justify-center transition-colors disabled:opacity-50 font-bold"
              >
                <Beer className="w-4 h-4 mr-2" /> 酒精诱惑 [酒水:{resources.alcohol}] (-1 AP)
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};