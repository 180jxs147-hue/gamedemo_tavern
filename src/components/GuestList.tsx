import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Eye, User, Star } from 'lucide-react';
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
  const { guests, selectedEntity, setSelectedEntity } = useGameStore();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[color:var(--rt-accent)] font-serif font-bold text-lg flex items-center">
          <User className="w-5 h-5 mr-2" />
          入住客房
        </h2>
        <span className="text-xs text-[color:var(--rt-muted)]">{guests.length} 人入住</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {guests.length === 0 ? (
          <div className="text-center py-10 text-[color:var(--rt-muted)] text-sm border border-[color:var(--rt-border)] border-dashed rounded-sm">
            客房空空荡荡
          </div>
        ) : (
          guests.map((guest) => {
            const isSelected = selectedEntity?.type === 'guest' && selectedEntity.id === guest.id;
            return (
              <div
                key={guest.id}
                onClick={() => setSelectedEntity({ type: 'guest', id: guest.id })}
                className={clsx(
                  "group relative bg-[color:var(--rt-surface)] border-l-4 rounded-r-sm p-3 shadow-md cursor-pointer transition-all hover:bg-black/30",
                  RarityBorder(guest.rarity),
                  "border-y border-r border-[color:var(--rt-border)]",
                  isSelected && "translate-x-2 border-[color:var(--rt-accent)]/60 shadow-[0_0_18px_rgba(202,163,93,0.14)]"
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={clsx(
                      "font-serif font-bold transition-colors",
                      isSelected ? "text-[color:var(--rt-accent)]" : "text-[color:var(--rt-text)] group-hover:text-[color:var(--rt-accent)]"
                    )}>
                      {guest.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-[color:var(--rt-muted)]">
                      <span>{guest.gender === 'Male' ? '男' : '女'}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Star className="w-3 h-3 mr-0.5 text-[color:var(--rt-muted)]" />
                        {guest.rarity}
                      </span>
                    </div>
                  </div>
                  
                  {/* 状态标记 */}
                  <div className="flex flex-col space-y-1 items-end">
                    {guest.isInvestigated && (
                      <span title="已调查">
                        <Eye className="w-4 h-4 text-cyan-500" />
                      </span>
                    )}
                    {guest.gender === 'Male' && (guest as any).assignedAssetId && (
                      <span className="text-[10px] bg-[color:var(--rt-surface-2)] text-[color:var(--rt-accent)] px-1 border border-[color:var(--rt-border)] rounded-sm">
                        服务中
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={clsx(
                  "absolute inset-0 bg-gradient-to-r from-transparent to-[#3a2818]/30 pointer-events-none transition-opacity",
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
