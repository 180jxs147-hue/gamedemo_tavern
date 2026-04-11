import React from 'react';
import { SettlementReport } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';
import { Coins, Skull, ArrowRight, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

interface SettlementModalProps {
  report: SettlementReport;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({ report }) => {
  const resetReport = () => {
    useGameStore.setState({ latestReport: null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="bg-[color:var(--rt-surface)] border-2 border-[color:var(--rt-border-strong)] shadow-[0_0_50px_rgba(202,163,93,0.18)] max-w-md w-full rounded-sm overflow-hidden flex flex-col relative"
      >
        <div className="absolute inset-0 bg-cover bg-center opacity-12 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url(/assets/textures/parchment.jpg)` }} />

        <div className="p-8 relative z-10 flex flex-col space-y-6">
          <div className="text-center border-b border-[color:var(--rt-border)] pb-4">
            <h2 className="text-2xl font-serif font-bold text-[color:var(--rt-accent)] tracking-[0.2em]">深夜结算账单</h2>
            <p className="text-[color:var(--rt-muted)] font-serif text-sm mt-1">第 {report.day} 天营业结束</p>
          </div>

          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center bg-[color:var(--rt-surface-2)] p-3 border border-[color:var(--rt-border)] rounded-sm">
              <span className="text-[color:var(--rt-muted)]">基础房费收入</span>
              <span className="text-green-400 flex items-center"><Coins className="w-4 h-4 mr-1" /> +{report.roomIncome} G</span>
            </div>
            
            <div className="flex justify-between items-center bg-[color:var(--rt-surface-2)] p-3 border border-[color:var(--rt-border)] rounded-sm">
              <span className="text-[color:var(--rt-muted)]">特殊服务费收入</span>
              <span className="text-green-400 flex items-center"><Coins className="w-4 h-4 mr-1" /> +{report.serviceIncome} G</span>
            </div>

            <div className="flex justify-between items-center bg-[color:var(--rt-surface-2)] p-3 border border-[color:var(--rt-border)] rounded-sm">
              <span className="text-[color:var(--rt-muted)]">员工薪资支出</span>
              <span className="text-red-400 flex items-center"><Coins className="w-4 h-4 mr-1" /> -{report.salaryExpense} G</span>
            </div>

            <div className="border-t border-dashed border-[color:var(--rt-border)] pt-4 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-[color:var(--rt-text)] font-bold font-serif text-lg">今日净利润</span>
                <span className={clsx("font-bold text-xl flex items-center", report.netProfit >= 0 ? "text-[color:var(--rt-accent)]" : "text-[color:var(--rt-danger)]")}>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {report.netProfit >= 0 ? '+' : ''}{report.netProfit} G
                </span>
              </div>
            </div>
          </div>

          {report.departedGuests && report.departedGuests.length > 0 && (
            <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-sm">
              <h4 className="text-red-400 text-sm font-bold mb-2">以下客人已到期搬离：</h4>
              <ul className="list-disc list-inside text-red-300/80 text-sm pl-4">
                {report.departedGuests.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={resetReport}
            className="mt-6 w-full py-3 bg-[color:var(--rt-accent-2)] hover:bg-[color:var(--rt-accent)] text-[#1a120c] font-serif font-bold tracking-widest flex items-center justify-center transition-colors shadow-lg"
          >
            开启新的一天 <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
