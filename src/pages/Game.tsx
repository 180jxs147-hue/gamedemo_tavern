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
import { LogBar } from '../components/LogBar';
import { DaytimeActionPanel } from '../components/DaytimeActionPanel';
import { ServiceAssignmentView } from '../components/ServiceAssignmentView';
import { ReceptionView } from '../components/Reception/ReceptionView';

export const Game: React.FC = () => {
  const { timePhase, latestReport, selectedEntity } = useGameStore();
  const [showServiceView, setShowServiceView] = React.useState(false);

  if (timePhase === 'Morning') {
    return (
      <div className="flex flex-col h-screen w-screen bg-[color:var(--rt-bg)] overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ReceptionView />
        </div>
        <LogBar />
        
        <AnimatePresence>
          {latestReport && <SettlementModal report={latestReport} />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[color:var(--rt-bg)] text-[color:var(--rt-text)] font-sans overflow-hidden">
      <Topbar />

      <div className="flex flex-1 overflow-hidden bg-[color:var(--rt-surface-2)]">
        {/* Left Sidebar: Guests & Queue */}
        <aside className="w-80 bg-[color:var(--rt-surface)]/80 border-r border-[color:var(--rt-border)] flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar shadow-[inset_-10px_0_20px_rgba(0,0,0,0.5)] z-20">
          <GuestList />
        </aside>

        {/* Center: Main Dashboard / Detail View */}
        <main className="flex-1 relative flex flex-col z-10 bg-[color:var(--rt-surface-2)]">
          {selectedEntity === null && <TavernOverview />}
          {selectedEntity?.type === 'guest' && <GuestDetailView />}
          {selectedEntity?.type === 'asset' && <AssetDetailView />}
          {timePhase === 'Day' && <DaytimeActionPanel />}
          {(timePhase === 'Night' || timePhase === 'LateNight') && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
              <button 
                onClick={() => setShowServiceView(true)}
                className="px-8 py-3 bg-[#8c3f2b] hover:bg-[#a64a32] text-[#f2e6d9] border-2 border-[#e6b36e] font-bold rounded shadow-[0_0_20px_rgba(140,63,43,0.8)] text-lg tracking-widest transition-all hover:scale-105"
              >
                安排特殊服务
              </button>
            </div>
          )}
        </main>

        {/* Right Sidebar: Assets & Facilities */}
        <aside className="w-80 bg-[color:var(--rt-surface)] border-l border-[color:var(--rt-border)] flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)] z-20">
          <AssetsPanel />
        </aside>
      </div>

      <LogBar />

      <AnimatePresence>
        {showServiceView && <ServiceAssignmentView onClose={() => setShowServiceView(false)} />}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {latestReport && <SettlementModal report={latestReport} />}
      </AnimatePresence>
    </div>
  );
};
