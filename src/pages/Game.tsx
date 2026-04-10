import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Topbar } from '../components/Topbar';
import { QueuePanel } from '../components/QueuePanel';
import { GuestList } from '../components/GuestList';
import { AssetsPanel } from '../components/AssetsPanel';
import { MainScene } from '../components/MainScene';
import { SettlementModal } from '../components/SettlementModal';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Clock } from 'lucide-react';

export const Game: React.FC = () => {
  const { timePhase, nextPhase, latestReport } = useGameStore();

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-300 font-sans overflow-hidden">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Assets & Facilities */}
        <aside className="w-80 bg-zinc-900/80 border-r border-amber-900/30 flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar shadow-[inset_-10px_0_20px_rgba(0,0,0,0.5)]">
          <AssetsPanel />
        </aside>

        {/* Center: Main Scene */}
        <main className="flex-1 relative flex flex-col">
          <MainScene />
          
          {/* Action Bar (Bottom Center) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <button
              onClick={nextPhase}
              className={clsx(
                "group relative px-8 py-3 bg-zinc-900/90 border-2 rounded-sm overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105",
                timePhase === 'LateNight' ? "border-red-900 hover:border-red-500" : "border-amber-900 hover:border-amber-500"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="flex items-center space-x-3">
                <Clock className={clsx("w-5 h-5", timePhase === 'LateNight' ? "text-red-500" : "text-amber-500")} />
                <span className={clsx("font-serif font-bold tracking-widest", timePhase === 'LateNight' ? "text-red-500" : "text-amber-500")}>
                  {timePhase === 'LateNight' ? '结束营业 (深夜结算)' : '推进时间'}
                </span>
              </div>
            </button>
          </div>
        </main>

        {/* Right Sidebar: Guests & Queue */}
        <aside className="w-80 bg-zinc-900/80 border-l border-amber-900/30 flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)]">
          {timePhase === 'Morning' && <QueuePanel />}
          <GuestList />
        </aside>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {latestReport && <SettlementModal report={latestReport} />}
      </AnimatePresence>
    </div>
  );
};
