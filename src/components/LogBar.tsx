import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { clsx } from 'clsx';
import { Terminal } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';


export const LogBar: React.FC = () => {
  const {  logs  } = useGameStore(useShallow(state => ({ logs: state.logs })));
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-48 w-full bg-[#120e0d] border-t-2 border-[#543b2b] flex flex-col font-serif shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-50">
      <div className="flex items-center px-4 py-1 bg-[#1a1514] border-b border-[#3e2e25] text-[#8c7a6b] text-xs font-bold tracking-widest">
        <Terminal className="w-4 h-4 mr-2" />
        <span>酒馆运作日志 (SYSTEM LOG)</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 text-sm custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-zinc-600 italic">暂无记录...</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="flex items-start gap-3">
              <span className="text-[#543b2b] whitespace-nowrap">[{log.timestamp}]</span>
              <span className={clsx(
                "leading-relaxed",
                log.type === 'info' && "text-[#cbbba9]",
                log.type === 'success' && "text-[#e6b36e]",
                log.type === 'warning' && "text-amber-400",
                log.type === 'danger' && "text-[#d9534f]"
              )}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};
