import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Users } from 'lucide-react';
import { clsx } from 'clsx';
import { getRarityColor } from '../utils/ui';
import { useShallow } from 'zustand/react/shallow';


export const GuestList: React.FC = () => {
  const {  guests, setSelectedEntity  } = useGameStore(useShallow(state => ({ guests: state.guests, setSelectedEntity: state.setSelectedEntity })));

  return (
    <div className="flex flex-col h-full bg-[#1d1715] border-2 border-[#543b2b] rounded shadow-lg overflow-hidden font-serif">
      <div className="flex items-center px-4 py-3 bg-[#241d1a] border-b border-[#3e2e25]">
        <Users className="w-5 h-5 mr-2 text-[#e6b36e]" />
        <h2 className="text-[#e6b36e] font-bold tracking-widest text-lg">入住宾客</h2>
        <span className="ml-auto text-xs text-[#a09081] bg-[#120e0d] px-2 py-1 rounded border border-[#3e2e25]">
          共 {guests.length} 人
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {guests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#a09081]">
            <p className="italic">酒馆内空无一人...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {guests.map(guest => (
              <div 
                key={guest.id}
                onClick={() => setSelectedEntity({ type: 'guest', id: guest.id })}
                className="group relative flex items-center p-3 bg-[#1a1514] border border-[#3e2e25] rounded cursor-pointer hover:border-[#8c3f2b] transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#8c3f2b]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                {/* Avatar */}
                <div className="w-12 h-12 rounded border border-[#543b2b] overflow-hidden shrink-0 bg-[#120e0d]">
                  <img 
                    src={guest.portrait} 
                    alt={guest.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all"
                   loading="lazy" />
                </div>

                {/* Info */}
                <div className="ml-3 flex flex-col flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#e6b36e] text-base leading-none">{guest.name}</span>
                    <span className={clsx("text-xs font-bold", getRarityColor(guest.rarity))}>
                      {guest.rarity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-[#a09081]">{guest.race} {guest.gender === 'Male' ? '男' : '女'}</span>
                    <span className="text-[#8c7a6b]">{guest.wealthTier}</span>
                    <span className="text-[#cbbba9] bg-[#2a2220] px-1.5 py-0.5 rounded border border-[#3e2e25]">
                      停留 {guest.stayDuration - guest.daysStayed} 天
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
