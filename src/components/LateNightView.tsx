import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SettlementReport } from '../types/game';
import { motion } from 'framer-motion';
import { Moon, MessageSquare, Coins, ArrowRight, UserCheck } from 'lucide-react';
import { SettlementModal } from './SettlementModal';
import { clsx } from 'clsx';

export const LateNightView: React.FC<{ report: SettlementReport }> = ({ report }) => {
  const [step, setStep] = useState<'reviews' | 'summary'>('reviews');

  if (step === 'summary') {
    return <SettlementModal report={report} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-[#161211] text-[#d4c4b7] font-serif flex flex-col items-center justify-center p-8"
    >
      <div className="absolute inset-0 bg-[url('/assets/backgrounds/tavern_night.jpg')] opacity-20 object-cover mix-blend-luminosity" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#161211] via-[#161211]/90 to-[#161211]/40" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col h-full py-12">
        <div className="text-center mb-10">
          <Moon className="w-12 h-12 mx-auto text-[#e6b36e] mb-4" />
          <h2 className="text-4xl font-bold text-[#e6b36e] tracking-widest drop-shadow-[0_0_15px_rgba(230,179,110,0.5)]">
            深夜 · 特殊服务评估
          </h2>
          <p className="text-[#a09081] mt-2 text-lg">客人们正对今晚的“服务”打出评价...</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6">
          {report.serviceRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#8c7a6b]">
              <UserCheck className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-xl">今夜没有任何客人享受特殊服务。</p>
            </div>
          ) : (
            report.serviceRecords.map((record, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.2 }}
                className={clsx(
                  "bg-[#1d1715] border-2 rounded-md p-6 shadow-xl relative overflow-hidden",
                  record.matchCount >= 2 ? "border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.15)]" : 
                  record.matchCount === 1 ? "border-[#e6b36e]/50" : "border-[#543b2b]"
                )}
              >
                {record.matchCount >= 2 && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(236,72,153,0.15),transparent)] pointer-events-none" />}
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center text-lg">
                    <span className="font-bold text-[#e6b36e]">{record.guestName}</span>
                    <span className="mx-3 text-[#543b2b]">点评了</span>
                    <span className="font-bold text-pink-400">{record.assetName}</span>
                  </div>
                  <div className="flex items-center bg-[#120e0d] border border-[#3e2e25] px-3 py-1 rounded text-amber-400 font-bold">
                    <Coins className="w-4 h-4 mr-2" />
                    + {record.fee} G
                  </div>
                </div>

                <div className="bg-[#161211] border-l-4 border-[#8c3f2b] p-4 rounded-r relative z-10">
                  <MessageSquare className="absolute top-2 right-2 w-12 h-12 text-[#241d1a] opacity-50 pointer-events-none" />
                  <p className="text-[#cbbba9] text-lg italic leading-relaxed">
                    "{record.review}"
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setStep('summary')}
            className="group flex items-center px-8 py-4 bg-[#8c3f2b] hover:bg-[#a64a32] border-2 border-[#e6b36e] text-[#f2e6d9] font-bold rounded shadow-[0_0_20px_rgba(140,63,43,0.6)] text-xl tracking-widest transition-all"
          >
            查看营业账单 <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};