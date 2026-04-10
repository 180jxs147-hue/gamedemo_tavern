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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="bg-zinc-900 border-2 border-amber-900 shadow-[0_0_50px_rgba(184,151,69,0.2)] max-w-md w-full rounded-sm overflow-hidden flex flex-col relative"
      >
        <div className="absolute inset-0 bg-[url('https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=old%20parchment%20paper%20texture%20dark%20elegant&image_size=square')] opacity-10 pointer-events-none mix-blend-overlay" />

        <div className="p-8 relative z-10 flex flex-col space-y-6">
          <div className="text-center border-b border-amber-900/50 pb-4">
            <h2 className="text-2xl font-serif font-bold text-amber-500 tracking-[0.2em]">深夜结算账单</h2>
            <p className="text-zinc-500 font-serif text-sm mt-1">第 {report.day} 天营业结束</p>
          </div>

          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center bg-zinc-950/50 p-3 border border-zinc-800 rounded-sm">
              <span className="text-zinc-400">基础房费收入</span>
              <span className="text-green-400 flex items-center"><Coins className="w-4 h-4 mr-1" /> +{report.roomIncome} G</span>
            </div>
            
            <div className="flex justify-between items-center bg-zinc-950/50 p-3 border border-zinc-800 rounded-sm">
              <span className="text-zinc-400">特殊服务费收入</span>
              <span className="text-green-400 flex items-center"><Coins className="w-4 h-4 mr-1" /> +{report.serviceIncome} G</span>
            </div>

            <div className="flex justify-between items-center bg-zinc-950/50 p-3 border border-zinc-800 rounded-sm">
              <span className="text-zinc-400">员工薪资支出</span>
              <span className="text-red-400 flex items-center"><Coins className="w-4 h-4 mr-1" /> -{report.salaryExpense} G</span>
            </div>

            <div className="border-t border-dashed border-zinc-700 pt-4 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300 font-bold font-serif text-lg">今日净利润</span>
                <span className={clsx("font-bold text-xl flex items-center", report.netProfit >= 0 ? "text-amber-500" : "text-red-500")}>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {report.netProfit >= 0 ? '+' : ''}{report.netProfit} G
                </span>
              </div>
            </div>
          </div>

          {report.bankruptGuests.length > 0 && (
            <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-sm">
              <div className="flex items-center text-red-500 font-bold text-sm mb-2">
                <Skull className="w-4 h-4 mr-2" />
                破产驱逐 ({report.bankruptGuests.length} 人)
              </div>
              <p className="text-xs text-red-400/80">
                {report.bankruptGuests.join('，')} 已被榨干财力，丢出门外。
              </p>
            </div>
          )}

          <button
            onClick={resetReport}
            className="mt-6 w-full py-3 bg-amber-900 hover:bg-amber-800 text-amber-50 font-serif font-bold tracking-widest flex items-center justify-center transition-colors shadow-lg"
          >
            开启新的一天 <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
