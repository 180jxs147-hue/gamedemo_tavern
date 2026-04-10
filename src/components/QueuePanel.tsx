import React from 'react';
import { useGameStore } from '../store/gameStore';
import { UserPlus, UserX, Users } from 'lucide-react';
import { clsx } from 'clsx';

import type { GuestRarity } from '../types/game';
import { getRarityColor } from '../utils/ui';

const RarityColor = (rarity: GuestRarity) => {
  return getRarityColor(rarity);
};

const RarityBadge = ({ rarity }: { rarity: string }) => {
  return (
    <span className={clsx("text-[10px] px-1 py-0.5 rounded border font-bold border-current", getRarityColor(rarity))}>
      {rarity}
    </span>
  );
};

export const QueuePanel: React.FC = () => {
  const { queue, guests, acceptGuest, rejectGuest } = useGameStore();
  const capacity = 3; // TODO: dynamically from facilities

  return (
    <div className="flex flex-col space-y-3 mb-6 border-b border-[color:var(--rt-border)] pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[color:var(--rt-accent)] font-serif font-bold text-lg flex items-center">
          <Users className="w-5 h-5 mr-2" />
          候客队列
        </h2>
        <span className="text-xs font-mono text-[color:var(--rt-muted)]">
          容量: {guests.length}/{capacity}
        </span>
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-6 text-[color:var(--rt-muted)] text-sm border border-[color:var(--rt-border)] border-dashed rounded-sm">
          门外已无客人等候
        </div>
      ) : (
        <div className="space-y-3">
          {/* First Guest in Queue */}
          <div className="bg-[color:var(--rt-surface)] border border-[color:var(--rt-border)] p-4 rounded-sm shadow-md flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-bold text-lg text-[color:var(--rt-text)]">{queue[0].name}</h3>
                <p className="text-xs text-[color:var(--rt-muted)] mt-1 flex items-center space-x-2">
                  <span>{queue[0].gender === 'Male' ? '男性' : '女性'}</span>
                  <span>•</span>
                  <span className={clsx("font-bold border px-1.5 rounded-sm", RarityColor(queue[0].rarity))}>
                    {queue[0].rarity}
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 bg-[color:var(--rt-surface-2)] border border-[color:var(--rt-border)] rounded-sm overflow-hidden flex items-center justify-center">
                <img 
                  src={queue[0].gender === 'Male' ? '/assets/portraits/silhouette_male.jpg' : '/assets/portraits/silhouette_female.jpg'}
                  alt="portrait" 
                  className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => acceptGuest(queue[0].id)}
                disabled={guests.length >= capacity}
                className="flex-1 flex items-center justify-center py-1.5 bg-[color:var(--rt-surface-2)] hover:bg-black/40 text-[color:var(--rt-accent)] border border-[color:var(--rt-border-strong)] rounded-sm text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                邀请
              </button>
              <button
                onClick={() => rejectGuest(queue[0].id)}
                className="flex-1 flex items-center justify-center py-1.5 bg-[color:var(--rt-surface-2)] hover:bg-black/40 text-[#b24b35] border border-[#6b3a25] rounded-sm text-sm transition-colors"
              >
                <UserX className="w-4 h-4 mr-1" />
                拒绝
              </button>
            </div>
          </div>

          {/* Remaining Guests (Hidden Info) */}
          {queue.slice(1).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 border border-[color:var(--rt-border)] border-dashed rounded-sm opacity-50">
              <div className="w-8 h-8 bg-[color:var(--rt-surface-2)] rounded-sm" />
              <div className="flex-1">
                <div className="h-3 w-16 bg-[color:var(--rt-surface-2)] rounded-sm mb-1" />
                <div className="h-2 w-24 bg-[color:var(--rt-surface-2)] rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
