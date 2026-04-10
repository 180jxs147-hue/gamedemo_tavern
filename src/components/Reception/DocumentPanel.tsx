import React from 'react';
import { Guest } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { Map, ShieldCheck, Square, CheckSquare } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  guest: Guest;
}

export const DocumentPanel: React.FC<Props> = ({ guest }) => {
  const { checkReceptionItem } = useGameStore();
  const { reception } = guest;

  if (!reception) return null;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Adventurer License */}
      <div className="bg-[#1d1715] border-2 border-[#543b2b] rounded-sm flex-1 flex flex-col p-4 shadow-lg relative">
        <h3 className="text-[#e6b36e] text-center font-bold tracking-widest text-lg mb-4">身份通行证</h3>
        
        <div className="aspect-[3/4] w-full border border-[#543b2b] bg-[#120e0d] relative overflow-hidden flex items-center justify-center rounded-sm">
          <img 
            src={guest.gender === 'Male' ? '/assets/portraits/detailed_male.jpg' : '/assets/portraits/detailed_female.jpg'} 
            alt="Portrait" 
            className="w-full h-full object-cover mix-blend-luminosity opacity-80" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120e0d] to-transparent opacity-80" />
          <div className="absolute bottom-2 text-center w-full">
            <h4 className="font-bold text-[#e6b36e] text-lg">{reception.idCard.name}</h4>
            <p className="text-xs text-[#a09081]">职业：{reception.idCard.profession}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-[#543b2b] pt-2 text-sm text-[#cbbba9] flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-[#8c7a6b]">性别</span>
            <span>{guest.gender === 'Male' ? '男性' : '女性'}</span>
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
            <span className="text-[#8c3f2b] font-bold">{guest.stayDuration} 天</span>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-[#e6d0a3] border-2 border-[#8c7a6b] text-[#3e2e25] rounded-sm p-4 h-[30%] shadow-[inset_0_0_20px_rgba(140,122,107,0.5)]">
        <h3 className="text-center font-bold tracking-widest text-lg mb-4 pb-2 border-b border-[#8c7a6b]/50">检查清单</h3>
        
        <div className="flex flex-col gap-3 text-sm font-bold">
          <CheckItem 
            label="停留意向 确认" 
            checked={reception.checklist.durationAssessed} 
            onClick={() => checkReceptionItem(guest.id, 'durationAssessed')} 
          />
          <CheckItem 
            label="偏好/癖好 探查" 
            checked={reception.checklist.preferenceAssessed} 
            onClick={() => checkReceptionItem(guest.id, 'preferenceAssessed')} 
          />
          <CheckItem 
            label={guest.gender === 'Male' ? '特殊服务意向 评估' : '防备心/诱捕难度 评估'} 
            checked={reception.checklist.targetAssessed} 
            onClick={() => checkReceptionItem(guest.id, 'targetAssessed')} 
          />
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

const CheckItem = ({ label, checked, onClick }: { label: string, checked: boolean, onClick: () => void }) => (
  <div 
    className={clsx(
      "flex items-center cursor-pointer transition-colors hover:text-[#8c3f2b]",
      checked ? "text-[#8c3f2b]" : "text-[#543b2b]"
    )}
    onClick={onClick}
  >
    {checked ? <CheckSquare className="w-4 h-4 mr-3" /> : <Square className="w-4 h-4 mr-3" />}
    <span className={clsx(checked && "line-through opacity-80")}>{label}</span>
  </div>
);
