import React from 'react';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';


export const MainMenu: React.FC = () => {
  const {  startGame, continueGame, day  } = useGameStore(useShallow(state => ({ startGame: state.startGame, continueGame: state.continueGame, day: state.day })));

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#161211] text-[#e6b36e] font-serif relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/backgrounds/tavern_night.jpg" 
          alt="Tavern Background" 
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
         loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161211] via-[#161211]/80 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 flex flex-col items-center"
      >
        <h1 className="text-6xl font-bold tracking-widest drop-shadow-[0_5px_15px_rgba(230,179,110,0.5)] mb-4 text-center">
          迷迭香酒馆<br/><span className="text-3xl text-[#a09081]">Rosemary Tavern</span>
        </h1>
        <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#8c3f2b] to-transparent mb-12" />

        <div className="flex flex-col gap-6 w-64">
          <MenuButton onClick={startGame} text="新游戏" />
          {day > 1 && (
            <MenuButton onClick={continueGame} text="继续经营" />
          )}
          <MenuButton onClick={() => alert('设置功能尚未实装')} text="设置" disabled />
        </div>
      </motion.div>
    </div>
  );
};

const MenuButton = ({ onClick, text, disabled }: { onClick: () => void, text: string, disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-8 py-4 bg-[#241d1a] border border-[#543b2b] hover:bg-[#3e2e25] hover:border-[#e6b36e] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded shadow-[0_0_15px_rgba(0,0,0,0.8)] text-xl font-bold tracking-widest relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e6b36e]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    {text}
  </button>
);
