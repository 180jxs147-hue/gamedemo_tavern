import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Lock, Skull } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { clsx } from 'clsx';

export const AssetsPanel: React.FC = () => {
  const { assets, setDungeonOpen } = useGameStore(useShallow(state => ({ assets: state.assets, setDungeonOpen: state.setDungeonOpen })));

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-[color:var(--rt-surface-2)] border-b border-[color:var(--rt-border-strong)] flex justify-between items-center">
        <h2 className="text-xl font-bold font-serif text-[color:var(--rt-accent)] tracking-widest flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          地下暗房资产
        </h2>
        <span className="text-xs bg-black/50 px-2 py-1 rounded text-zinc-400">
          已关押: {assets.length}
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none" />
        
        <Skull className="w-16 h-16 text-zinc-800 mb-6" />
        <p className="text-sm text-zinc-500 mb-8 text-center px-4">
          这里关押着你在夜间捕获的猎物。你需要进入暗房，对她们进行调教和管理，才能将其转化为酒馆的赚钱工具。
        </p>

        <button
          onClick={() => setDungeonOpen(true)}
          className={clsx(
            "w-full max-w-[200px] py-4 rounded-sm font-bold tracking-widest transition-all flex flex-col items-center justify-center border shadow-lg relative overflow-hidden group",
            "bg-red-950/40 border-red-500/50 text-red-400 hover:bg-red-900/60"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="z-10 text-lg">进入暗房画廊</span>
        </button>
      </div>
    </div>
  );
};
