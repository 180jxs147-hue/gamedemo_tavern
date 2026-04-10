import React from 'react';
import { useGameStore } from '../store/gameStore';
import { UserPlus, UserX, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { GuestRarity } from '../types/game';

const RarityColor = (rarity: GuestRarity) => {
  switch (rarity) {
    case 'N': return 'text-zinc-400 border-zinc-600';
    case 'R': return 'text-blue-400 border-blue-600';
    case 'SR': return 'text-purple-400 border-purple-600';
    case 'SSR': return 'text-amber-400 border-amber-600';
    default: return 'text-zinc-400 border-zinc-600';
  }
};

export const QueuePanel: React.FC = () => {
  const { queue, guests, acceptGuest, rejectGuest } = useGameStore();
  const capacity = 3; // TODO: dynamically from facilities

  return (
    <div className="flex flex-col space-y-3 mb-6 border-b border-amber-900/30 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-amber-500 font-serif font-bold text-lg flex items-center">
          <Users className="w-5 h-5 mr-2" />
          候客队列
        </h2>
        <span className="text-xs font-mono text-zinc-400">
          容量: {guests.length}/{capacity}
        </span>
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-6 text-zinc-500 text-sm border border-zinc-800 border-dashed rounded-sm">
          门外已无客人等候
        </div>
      ) : (
        <div className="space-y-3">
          {/* First Guest in Queue */}
          <div className="bg-zinc-900 border border-amber-900/40 p-4 rounded-sm shadow-md flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-bold text-lg text-zinc-100">{queue[0].name}</h3>
                <p className="text-xs text-zinc-400 mt-1 flex items-center space-x-2">
                  <span>{queue[0].gender === 'Male' ? '男性' : '女性'}</span>
                  <span>•</span>
                  <span className={clsx("font-bold border px-1.5 rounded-sm", RarityColor(queue[0].rarity))}>
                    {queue[0].rarity}
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-sm overflow-hidden flex items-center justify-center">
                <img 
                  src={`https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20fantasy%20portrait%20silhouette%20${queue[0].gender}%20guest%20elegant&image_size=square`} 
                  alt="portrait" 
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => acceptGuest(queue[0].id)}
                disabled={guests.length >= capacity}
                className="flex-1 flex items-center justify-center py-1.5 bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 border border-amber-900/50 rounded-sm text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                邀请
              </button>
              <button
                onClick={() => rejectGuest(queue[0].id)}
                className="flex-1 flex items-center justify-center py-1.5 bg-red-900/10 hover:bg-red-900/30 text-red-500 border border-red-900/30 rounded-sm text-sm transition-colors"
              >
                <UserX className="w-4 h-4 mr-1" />
                拒绝
              </button>
            </div>
          </div>

          {/* Remaining Guests (Hidden Info) */}
          {queue.slice(1).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 border border-zinc-800 border-dashed rounded-sm opacity-50">
              <div className="w-8 h-8 bg-zinc-800 rounded-sm" />
              <div className="flex-1">
                <div className="h-3 w-16 bg-zinc-800 rounded-sm mb-1" />
                <div className="h-2 w-24 bg-zinc-800 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
