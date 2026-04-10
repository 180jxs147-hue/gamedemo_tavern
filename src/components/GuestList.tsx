import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Guest } from '../types/game';
import { GuestModal } from './GuestModal';
import { Eye, Info, User, Star } from 'lucide-react';
import { clsx } from 'clsx';

const RarityBorder = (rarity: string) => {
  switch (rarity) {
    case 'N': return 'border-zinc-600';
    case 'R': return 'border-blue-600';
    case 'SR': return 'border-purple-600';
    case 'SSR': return 'border-amber-600';
    default: return 'border-zinc-600';
  }
};

export const GuestList: React.FC = () => {
  const { guests } = useGameStore();
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-amber-500 font-serif font-bold text-lg flex items-center">
          <User className="w-5 h-5 mr-2" />
          入住客房
        </h2>
        <span className="text-xs text-zinc-400">{guests.length} 人入住</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {guests.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">
            客房空空荡荡
          </div>
        ) : (
          guests.map((guest) => (
            <div
              key={guest.id}
              onClick={() => setSelectedGuest(guest)}
              className={clsx(
                "group relative bg-zinc-900 border-l-4 rounded-r-sm p-3 shadow-md cursor-pointer transition-all hover:bg-zinc-800 hover:translate-x-1",
                RarityBorder(guest.rarity),
                "border-y border-r border-zinc-800"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                    {guest.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-zinc-400">
                    <span>{guest.gender === 'Male' ? '男' : '女'}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-0.5 text-zinc-500" />
                      {guest.rarity}
                    </span>
                  </div>
                </div>
                
                {/* 状态标记 */}
                <div className="flex flex-col space-y-1 items-end">
                  {guest.isInvestigated && (
                    <Eye className="w-4 h-4 text-cyan-500" title="已调查" />
                  )}
                  {guest.gender === 'Male' && (guest as any).assignedAssetId && (
                    <span className="text-[10px] bg-amber-900/30 text-amber-500 px-1 border border-amber-900/50 rounded-sm">
                      服务中
                    </span>
                  )}
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-800/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))
        )}
      </div>

      {selectedGuest && (
        <GuestModal guest={selectedGuest} onClose={() => setSelectedGuest(null)} />
      )}
    </div>
  );
};
