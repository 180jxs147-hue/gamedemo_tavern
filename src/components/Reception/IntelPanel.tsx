import React from 'react';
import { Guest } from '../../types/game';

interface Props {
  guest: Guest;
}

export const IntelPanel: React.FC<Props> = ({ guest }) => {
  const { reception } = guest;
  if (!reception) return null;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Panel: Rumors */}
      <div className="bg-[#241d1a] border-2 border-[#543b2b] rounded-sm p-4 flex-1 shadow-md relative overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 bg-[url('/assets/textures/parchment.jpg')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        <div className="z-10 text-sm leading-relaxed text-[#cbbba9]">
          <p>{reception.rumorText}</p>
        </div>

        <div className="z-10 mt-6 pt-4 border-t border-[#543b2b]/50 text-right text-xs text-[#8c7a6b] flex justify-between items-center">
          <span>+ +</span>
          <span>酒馆情报网</span>
          <span>+ +</span>
        </div>
      </div>

      {/* Bottom Panel: Encyclopedia */}
      <div className="bg-[#1d1715] border-2 border-[#3e2e25] rounded-sm p-4 h-[40%] flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-2 left-2 text-[#e6b36e] opacity-50 cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
        <div className="absolute top-2 right-2 text-[#e6b36e] opacity-50 cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
        
        <h3 className="text-[#e6b36e] text-center font-bold tracking-widest mb-4">情报百科</h3>
        
        <div className="w-24 h-24 mb-4 border border-[#543b2b] bg-[#120e0d] p-2 flex items-center justify-center rounded">
          <img src={reception.encyclopediaEntry.image} alt={reception.encyclopediaEntry.title} className="w-full h-full object-contain" />
        </div>
        
        <div className="bg-[#e6b36e] text-[#1a1514] px-6 py-1 rounded font-bold text-sm mb-4">
          ✦ {reception.encyclopediaEntry.title} ✦
        </div>

        <div className="flex gap-2 items-center text-xs text-[#a09081]">
          <span>+ +</span>
          <span>主要特征信息</span>
          <span>+ +</span>
        </div>
        
        <p className="mt-2 text-xs text-[#cbbba9] text-center leading-relaxed">
          {reception.encyclopediaEntry.desc}
        </p>
      </div>
    </div>
  );
};
