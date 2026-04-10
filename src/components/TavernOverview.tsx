import React from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';

export const TavernOverview: React.FC = () => {
  const { timePhase, nextPhase } = useGameStore();

  const bgImage = timePhase === 'Morning' || timePhase === 'Day'
    ? '/assets/backgrounds/tavern_day.jpg'
    : '/assets/backgrounds/tavern_night.jpg';

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-8 h-full">
      <AnimatePresence mode="wait">
        <motion.img
          key={timePhase}
          src={bgImage}
          alt="Tavern Scene"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none mix-blend-luminosity"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_0%,rgba(202,163,93,0.10),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--rt-bg)] via-[color:var(--rt-bg)]/70 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl">
        <div className="mb-12">
          <h1 className="text-5xl font-serif tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-500 to-amber-900 drop-shadow-[0_0_10px_rgba(217,119,6,0.3)] mb-4">
            迷迭香酒馆
          </h1>
          <p className="text-zinc-400 tracking-[0.3em] uppercase text-sm font-light">
            Rosemary Tavern
          </p>
        </div>

        <div className="bg-[color:var(--rt-surface)] border border-[color:var(--rt-border)] backdrop-blur-md p-8 rounded-sm shadow-2xl w-full">
          <p className="text-[color:var(--rt-muted)] mb-8 font-serif leading-relaxed">
            {timePhase === 'Morning' && "晨光微露，门外已有客人在等候。安排今日的入住，规划接下来的行动。"}
            {timePhase === 'Day' && "酒馆内人声鼎沸。趁着喧闹，正是打探情报与训练资产的好时机。"}
            {timePhase === 'Night' && "夜幕降临，掩护着那些见不得光的勾当。准备好狩猎了吗？"}
            {timePhase === 'LateNight' && "深夜幽静，只有微弱的烛火摇曳。完成最后的交易，清算今日的账单。"}
          </p>

          <button
            onClick={nextPhase}
            className={clsx(
              "group relative px-10 py-4 bg-[color:var(--rt-surface-2)] border-2 rounded-sm overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 w-full max-w-md mx-auto flex items-center justify-center",
              timePhase === 'LateNight' ? "border-[#6b3a25] hover:border-[color:var(--rt-danger)]" : "border-[color:var(--rt-border-strong)] hover:border-[color:var(--rt-accent)]"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <div className="flex items-center space-x-3 relative z-10">
              <Clock className={clsx("w-5 h-5", timePhase === 'LateNight' ? "text-[color:var(--rt-danger)]" : "text-[color:var(--rt-accent)]")} />
              <span className={clsx("font-serif font-bold tracking-widest text-lg", timePhase === 'LateNight' ? "text-[color:var(--rt-danger)]" : "text-[color:var(--rt-accent)]")}>
                {timePhase === 'LateNight' ? '结束营业 (深夜结算)' : '推进时间'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
