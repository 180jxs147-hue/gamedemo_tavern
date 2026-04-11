import React from 'react';
import { Guest } from '../../types/game';
import { Map } from 'lucide-react';

interface Props {
  guest: Guest;
}

export const DocumentPanel: React.FC<Props> = ({ guest }) => {
  const { reception } = guest;

  if (!reception) return null;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Adventurer License */}
      <div className="bg-[#1d1715] border-2 border-[#543b2b] rounded-sm flex-1 flex flex-col p-4 shadow-lg relative">
        <h3 className="text-[#e6b36e] text-center font-bold tracking-widest text-lg mb-4">身份通行证</h3>
        
        <div className="aspect-[3/4] w-full border border-[#543b2b] bg-[#120e0d] relative overflow-hidden flex items-center justify-center rounded-sm">
          <img 
            src={guest.portrait} 
            alt="Portrait" 
            className="w-full h-full object-cover opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120e0d] via-[#120e0d]/40 to-transparent opacity-80" />
          <div className="absolute bottom-2 text-center w-full">
            <h4 className="font-bold text-[#e6b36e] text-lg drop-shadow-md">{reception.idCard.name}</h4>
            <p className="text-xs text-[#e6b36e] drop-shadow-md bg-black/40 inline-block px-2 py-0.5 rounded border border-[#543b2b]/50">
              {guest.race} {reception.idCard.profession}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-[#543b2b] pt-2 text-sm text-[#cbbba9] flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-[#8c7a6b]">性别</span>
            <span>{guest.gender === 'Male' ? '男性' : '女性'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8c7a6b]">种族</span>
            <span className="text-[#e6b36e]">{guest.race}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8c7a6b]">财力评估</span>
            <span>{guest.wealthTier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8c7a6b]">签发地</span>
            <span>{reception.idCard.origin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8c7a6b]">预计停留</span>
            <span className="text-[#e6b36e] font-bold text-lg">{guest.stayDuration} 天</span>
          </div>
        </div>
      </div>

      {/* Map/Extra Button */}
      <div className="h-16 bg-[#1d1715] border-2 border-[#3e2e25] rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#2a2220] transition-colors text-[#a09081]">
        <Map className="w-5 h-5 mr-2" />
        <span className="font-bold tracking-widest">王城地图</span>
      </div>
    </div>
  );
};
