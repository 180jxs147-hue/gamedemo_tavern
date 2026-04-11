import React from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';


const getSceneImage = (phase: string) => {
  if (phase === 'Morning' || phase === 'Day') {
    return 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=elegant%20dark%20fantasy%20tavern%20interior,%20warm%20sunlight,%20luxurious%20gothic,%208k%20resolution,%20highly%20detailed,%20masterpiece&image_size=landscape_16_9';
  } else {
    return 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=elegant%20dark%20fantasy%20tavern%20interior,%20dim%20candlelight,%20mysterious%20atmosphere,%20crimson%20and%20gold%20accents,%20luxurious%20gothic,%208k%20resolution,%20highly%20detailed,%20masterpiece&image_size=landscape_16_9';
  }
};

export const MainScene: React.FC = () => {
  const {  timePhase  } = useGameStore(useShallow(state => ({ timePhase: state.timePhase })));

  return (
    <div className="relative flex-1 overflow-hidden flex items-center justify-center bg-black">
      <AnimatePresence mode="wait">
        <motion.img
          key={timePhase}
          src={getSceneImage(timePhase)}
          alt="Tavern Scene"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
        />
      </AnimatePresence>

      {/* Overlay to darken and add vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60 pointer-events-none" />
      
      {/* Center text / Title overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none select-none">
        <motion.h1 
          key={`title-${timePhase}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-6xl font-serif tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-500 to-amber-900 drop-shadow-[0_0_15px_rgba(217,119,6,0.5)]"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          迷迭香酒馆
        </motion.h1>
        <motion.p 
          key={`subtitle-${timePhase}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-4 text-zinc-400 tracking-[0.3em] uppercase text-sm font-light"
        >
          Rosemary Tavern
        </motion.p>
      </div>
    </div>
  );
};
