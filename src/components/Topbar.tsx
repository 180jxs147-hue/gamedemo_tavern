import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Coins, Zap, ShieldAlert, Star, Package, Clock, Sun, Moon, MoonStar } from 'lucide-react';
import { TimePhase } from '../types/game';
import { clsx } from 'clsx';

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
  const { day, timePhase, resources } = useGameStore();

  return (
    <header className="bg-zinc-950 border-b border-amber-900/30 text-zinc-300 p-4 flex justify-between items-center shadow-lg shadow-black/50">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 border border-amber-900/50 bg-zinc-900/50 px-4 py-1.5 rounded-sm">
          <span className="text-amber-500 font-serif font-bold text-lg tracking-wider">DAY {day}</span>
          <div className="w-px h-5 bg-amber-900/50 mx-2" />
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
        <ResourceBadge icon={<Coins className="w-4 h-4 text-amber-400" />} value={resources.gold} label="金币" />
        <ResourceBadge icon={<Package className="w-4 h-4 text-zinc-400" />} value={resources.materials} label="建材" />
        <ResourceBadge icon={<Star className="w-4 h-4 text-purple-400" />} value={resources.reputation} label="声望" />
        
        <div className="flex items-center space-x-2 bg-zinc-900/50 border border-red-900/30 px-3 py-1.5 rounded-sm text-sm ml-4">
          <ShieldAlert className={clsx("w-4 h-4", resources.alertLevel > 50 ? "text-red-500 animate-pulse" : "text-red-900")} />
          <span className="text-zinc-400">警戒</span>
          <span className={clsx("font-bold", resources.alertLevel > 50 ? "text-red-500" : "text-zinc-300")}>{resources.alertLevel}%</span>
        </div>
      </div>
    </header>
  );
};

const ResourceBadge = ({ icon, value, label }: { icon: React.ReactNode, value: string | number, label: string }) => (
  <div className="flex items-center space-x-2 bg-zinc-900/50 border border-amber-900/20 px-3 py-1.5 rounded-sm text-sm" title={label}>
    {icon}
    <span className="font-bold text-amber-50">{value}</span>
  </div>
);
