import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { InteractionPanel } from './InteractionPanel';
import { DocumentPanel } from './DocumentPanel';

export const ReceptionView: React.FC = () => {
  const { queue, day, nextPhase } = useGameStore();
  const currentGuest = queue[0];

  // We handle chat history here so it resets when guest changes
  const [chatHistory, setChatHistory] = useState<{ sender: 'guest' | 'player', text: string }[]>([]);

  if (!currentGuest) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-[#1a1514] text-[#d4c4b7] p-8">
        <div className="bg-[#241d1a] border-2 border-[#543b2b] p-8 rounded-lg flex flex-col items-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <h2 className="text-2xl font-serif mb-6 text-[#e6b36e]">晨间接待结束</h2>
          <p className="text-zinc-400 mb-8">门外的等候队列已经空了，开始白天的酒馆经营吧。</p>
          <button
            onClick={() => nextPhase()}
            className="px-8 py-3 bg-[#8c3f2b] hover:bg-[#a64a32] text-[#f2e6d9] font-bold rounded shadow-inner transition-colors"
          >
            结束接待 (进入白天)
          </button>
        </div>
      </div>
    );
  }

  if (!currentGuest.reception) {
    return <div>Data Error: Missing reception info.</div>;
  }

  const handleNextGuest = () => {
    setChatHistory([]);
  };

  return (
    <div className="flex w-full h-full bg-[#161211] text-[#d4c4b7] font-serif p-4 gap-4 overflow-hidden">
      {/* Center Column: Interaction (Dialog & Character) */}
      <div className="flex-1 flex flex-col rounded-md border-2 border-[#3e2e25] bg-[#1a1514] relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
        <InteractionPanel 
          guest={currentGuest} 
          day={day} 
          chatHistory={chatHistory} 
          setChatHistory={setChatHistory} 
          onNextGuest={handleNextGuest}
        />
      </div>

      {/* Right Column: ID Document (Removed Checklist) */}
      <div className="w-[320px] flex flex-col gap-4">
        <DocumentPanel guest={currentGuest} />
      </div>
    </div>
  );
};
