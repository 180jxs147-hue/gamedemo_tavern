import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Coins, Zap, ShieldAlert, Star, Package, Clock, Sun, Moon, MoonStar, LogOut, Sword, Heart, Beer } from 'lucide-react';
import { TimePhase } from '../types/game';
import { clsx } from 'clsx';
import { useShallow } from 'zustand/react/shallow';


const PhaseIcon = ({ phase }: { phase: TimePhase }) => {
  switch (phase) {
    case 'Morning': return <Sun className="w-5 h-5 text-amber-200" />;
    case 'Day': return <Sun className="w-5 h-5 text-yellow-500" />;
    case 'Night': return <Moon className="w-5 h-5 text-blue-300" />;
    case 'LateNight': return <MoonStar className="w-5 h-5 text-indigo-400" />;
  }
};

const PhaseLabel = ({ phase }: { phase: TimePhase }) => {
  switch (phase) {
    case 'Morning': return '晨间';
    case 'Day': return '日间';
    case 'Night': return '夜间';
    case 'LateNight': return '深夜';
  }
};

export const Topbar: React.FC = () => {
  const {  day, timePhase, resources, backToMenu  } = useGameStore(useShallow(state => ({ day: state.day, timePhase: state.timePhase, resources: state.resources, backToMenu: state.backToMenu })));

  return (
    <header className="bg-[color:var(--rt-surface)] border-b border-[color:var(--rt-border)] text-[color:var(--rt-text)] p-4 flex justify-between items-center shadow-lg shadow-black/50">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 border border-[color:var(--rt-border-strong)] bg-[color:var(--rt-surface-2)] px-4 py-1.5 rounded-sm">
          <span className="text-[color:var(--rt-accent)] font-serif font-bold text-lg tracking-wider">DAY {day}</span>
          <div className="w-px h-5 bg-[color:var(--rt-border)] mx-2" />
          <div className="flex items-center space-x-2">
            <PhaseIcon phase={timePhase} />
            <span className={clsx(
              "font-medium tracking-widest text-sm",
              timePhase === 'Morning' && "text-amber-200",
              timePhase === 'Day' && "text-yellow-500",
              timePhase === 'Night' && "text-blue-300",
              timePhase === 'LateNight' && "text-indigo-400",
            )}>
              <PhaseLabel phase={timePhase} />
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 font-serif">
        <ResourceBadge icon={<Zap className="w-4 h-4 text-cyan-400" />} value={`${resources.ap}/${resources.maxAp}`} label="行动力" />
        <ResourceBadge icon={<Coins className="w-4 h-4 text-[color:var(--rt-accent)]" />} value={resources.gold} label="金币" />
        <ResourceBadge icon={<Package className="w-4 h-4 text-[color:var(--rt-muted)]" />} value={resources.materials} label="建材" />
        <ResourceBadge icon={<Star className="w-4 h-4 text-[#a57b3c]" />} value={resources.reputation} label="声望" />

        <div className="w-px h-5 bg-[color:var(--rt-border)] mx-2" />
        <ResourceBadge icon={<Sword className="w-4 h-4 text-red-500" />} value={resources.force} label="酒馆武力" />
        <ResourceBadge icon={<Heart className="w-4 h-4 text-pink-400" />} value={resources.charm} label="酒馆魅力" />
        <ResourceBadge icon={<Beer className="w-4 h-4 text-amber-500" />} value={resources.alcohol} label="酒水烈度" />
        
        <div className="flex items-center space-x-2 bg-[color:var(--rt-surface-2)] border border-[color:var(--rt-border)] px-3 py-1.5 rounded-sm text-sm ml-4">
          <ShieldAlert className={clsx("w-4 h-4", resources.alertLevel > 50 ? "text-[color:var(--rt-danger)] animate-pulse" : "text-[#6b3a25]")} />
          <span className="text-[color:var(--rt-muted)]">警戒</span>
          <span className={clsx("font-bold", resources.alertLevel > 50 ? "text-[color:var(--rt-danger)]" : "text-[color:var(--rt-text)]")}>{resources.alertLevel}%</span>
        </div>
      </div>

      <button 
        onClick={backToMenu}
        className="ml-6 px-4 py-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded flex items-center transition-colors text-sm font-bold"
      >
        <LogOut className="w-4 h-4 mr-2" />
        主菜单
      </button>
    </header>
  );
};

const ResourceBadge = ({ icon, value, label }: { icon: React.ReactNode, value: string | number, label: string }) => (
  <div className="flex items-center space-x-2 bg-[color:var(--rt-surface-2)] border border-[color:var(--rt-border)] px-3 py-1.5 rounded-sm text-sm" title={label}>
    {icon}
    <span className="font-bold text-[color:var(--rt-text)]">{value}</span>
  </div>
);
