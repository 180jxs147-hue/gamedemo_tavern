import React from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../utils/imageHelper';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';

export const TavernOverview: React.FC = () => {
  const { timePhase, nextPhase } = useGameStore();

  const scenePrompt = timePhase === 'Morning' || timePhase === 'Day'
    ? 'elegant dark fantasy tavern interior, warm sunlight, luxurious gothic, highly detailed, masterpiece'
    : 'elegant dark fantasy tavern interior, dim candlelight, mysterious atmosphere, crimson and gold accents, luxurious gothic, highly detailed, masterpiece';

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-8 h-full">
      <AnimatePresence mode="wait">
        <motion.img
          key={timePhase}
          src={getImageUrl(scenePrompt, 'landscape_16_9')}
          alt="Tavern Scene"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl">
        <div className="mb-12">
          <h1 className="text-5xl font-serif tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-500 to-amber-900 drop-shadow-[0_0_10px_rgba(217,119,6,0.3)] mb-4">
            迷迭香酒馆
          </h1>
          <p className="text-zinc-400 tracking-[0.3em] uppercase text-sm font-light">
            Rosemary Tavern
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-amber-900/30 backdrop-blur-md p-8 rounded-sm shadow-2xl w-full">
          <p className="text-zinc-400 mb-8 font-serif leading-relaxed">
            {timePhase === 'Morning' && "晨光微露，门外已有客人在等候。安排今日的入住，规划接下来的行动。"}
            {timePhase === 'Day' && "酒馆内人声鼎沸。趁着喧闹，正是打探情报与训练资产的好时机。"}
            {timePhase === 'Night' && "夜幕降临，掩护着那些见不得光的勾当。准备好狩猎了吗？"}
            {timePhase === 'LateNight' && "深夜幽静，只有微弱的烛火摇曳。完成最后的交易，清算今日的账单。"}
          </p>

          <button
            onClick={nextPhase}
            className={clsx(
              "group relative px-10 py-4 bg-zinc-900 border-2 rounded-sm overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 w-full max-w-md mx-auto flex items-center justify-center",
              timePhase === 'LateNight' ? "border-red-900 hover:border-red-500" : "border-amber-900 hover:border-amber-500"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <div className="flex items-center space-x-3 relative z-10">
              <Clock className={clsx("w-5 h-5", timePhase === 'LateNight' ? "text-red-500" : "text-amber-500")} />
              <span className={clsx("font-serif font-bold tracking-widest text-lg", timePhase === 'LateNight' ? "text-red-500" : "text-amber-500")}>
                {timePhase === 'LateNight' ? '结束营业 (深夜结算)' : '推进时间'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
