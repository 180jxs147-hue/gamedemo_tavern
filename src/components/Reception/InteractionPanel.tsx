import React, { useEffect, useRef } from 'react';
import { Guest } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  guest: Guest;
  day: number;
  chatHistory: { sender: 'guest' | 'player', text: string }[];
  setChatHistory: React.Dispatch<React.SetStateAction<{ sender: 'guest' | 'player', text: string }[]>>;
  onNextGuest: () => void;
}

export const InteractionPanel: React.FC<Props> = ({ guest, day, chatHistory, setChatHistory, onNextGuest }) => {
  const { acceptGuest, rejectGuest, checkReceptionItem, queue } = useGameStore();
  const { reception } = guest;
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistory.length === 0 && reception) {
      setChatHistory([{ sender: 'guest', text: reception.introText }]);
    }
  }, [guest.id, chatHistory.length, reception, setChatHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  if (!reception) return null;

  const handleChoice = (optionId: string) => {
    const option = reception.dialogues.find(d => d.id === optionId);
    if (option) {
      setChatHistory(prev => [
        ...prev,
        { sender: 'player', text: option.text },
        { sender: 'guest', text: option.response }
      ]);
    }
  };

  const handleAccept = () => {
    if (acceptGuest(guest.id)) {
      onNextGuest();
    } else {
      alert("客满，无法入住！");
    }
  };

  const handleReject = () => {
    rejectGuest(guest.id);
    onNextGuest();
  };

  const availableOptions = reception.dialogues.filter(
    d => !chatHistory.some(chat => chat.text === d.text)
  );

  return (
    <div className="flex flex-col h-full relative">
      {/* Background & Character */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/backgrounds/tavern_day.jpg" 
          alt="Tavern" 
          className="w-full h-full object-cover opacity-20 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161211] via-transparent to-[#161211]/80 pointer-events-none" />
        
        <div className="absolute inset-x-0 bottom-[180px] h-[70%] flex justify-center items-end opacity-90">
          <img 
            src={guest.gender === 'Male' ? '/assets/portraits/detailed_male.jpg' : '/assets/portraits/detailed_female.jpg'}
            alt="Character"
            className="h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex justify-between items-center p-4 bg-[#161211]/80 backdrop-blur-sm border-b border-[#3e2e25]">
        <div className="flex items-center space-x-2 text-[#e6b36e]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-bold tracking-widest">迷迭香酒馆前台 / 王国历 812年 {day}日</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-[#a09081]">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            候客: {queue.length}
          </span>
          <span className="flex items-center text-[#e6b36e]">
            ★ {guest.rarity}
          </span>
        </div>
      </div>

      {/* Center Dialogue Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-20">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 overflow-y-auto max-h-[50vh] pr-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {chatHistory.map((chat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={clsx(
                  "px-6 py-3 rounded-lg max-w-[80%] shadow-lg border border-[#543b2b] whitespace-pre-line",
                  chat.sender === 'guest' 
                    ? "bg-[#e6d0a3] text-[#3e2e25] self-start rounded-tl-none font-bold"
                    : "bg-[#241d1a] text-[#cbbba9] self-end rounded-tr-none text-sm"
                )}
              >
                {chat.text}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Floating Item Removed */}
      </div>

      {/* Bottom Action Bar */}
      <div className="relative z-20 bg-[#161211] border-t-2 border-[#3e2e25] p-4 flex flex-col gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        {/* Dialogue Options */}
        <div className="flex justify-center gap-3">
          {availableOptions.length > 0 ? (
            availableOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleChoice(opt.id)}
                className="px-4 py-2 bg-[#2a2220] hover:bg-[#3e2e25] border border-[#543b2b] text-[#e6b36e] text-sm rounded shadow transition-colors"
              >
                "{opt.text}"
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-[#a09081] text-sm italic">无更多可询问的情报。</div>
          )}
        </div>

        {/* Final Decision Buttons */}
        <div className="flex justify-center gap-12 pt-4 border-t border-[#2a2220]">
          <button 
            onClick={handleAccept}
            className="group flex items-center gap-2 text-[#e6b36e] hover:text-[#f2e6d9] transition-colors"
          >
            <span className="text-xl font-bold tracking-widest">允许入住</span>
            <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          <button 
            onClick={handleReject}
            className="group flex items-center gap-2 text-[#8c3f2b] hover:text-[#d9534f] transition-colors"
          >
            <span className="text-xl font-bold tracking-widest">婉拒接待</span>
            <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
