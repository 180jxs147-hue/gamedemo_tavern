import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Topbar } from '../components/Topbar';
import { QueuePanel } from '../components/QueuePanel';
import { GuestList } from '../components/GuestList';
import { AssetsPanel } from '../components/AssetsPanel';
import { TavernOverview } from '../components/TavernOverview';
import { GuestDetailView } from '../components/GuestDetailView';
import { AssetDetailView } from '../components/AssetDetailView';
import { SettlementModal } from '../components/SettlementModal';
import { AnimatePresence } from 'framer-motion';

export const Game: React.FC = () => {
  const { timePhase, latestReport, selectedEntity } = useGameStore();

  return (
    <div className="flex flex-col h-screen w-screen bg-[color:var(--rt-bg)] text-[color:var(--rt-text)] font-sans overflow-hidden">
      <Topbar />

      <div className="flex flex-1 overflow-hidden bg-[color:var(--rt-surface-2)]">
        {/* Left Sidebar: Guests & Queue */}
        <aside className="w-80 bg-[color:var(--rt-surface)] border-r border-[color:var(--rt-border)] flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar shadow-[inset_-10px_0_20px_rgba(0,0,0,0.5)] z-20">
          {timePhase === 'Morning' && <QueuePanel />}
          <GuestList />
        </aside>

        {/* Center: Main Dashboard / Detail View */}
        <main className="flex-1 relative flex flex-col z-10 bg-[color:var(--rt-surface-2)]">
          {selectedEntity === null && <TavernOverview />}
          {selectedEntity?.type === 'guest' && <GuestDetailView />}
          {selectedEntity?.type === 'asset' && <AssetDetailView />}
        </main>

        {/* Right Sidebar: Assets & Facilities */}
        <aside className="w-80 bg-[color:var(--rt-surface)] border-l border-[color:var(--rt-border)] flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)] z-20">
          <AssetsPanel />
        </aside>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {latestReport && <SettlementModal report={latestReport} />}
      </AnimatePresence>
    </div>
  );
};
