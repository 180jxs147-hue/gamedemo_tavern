import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Hammer, FlaskConical, Store, PackageOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DaytimeActionPanel: React.FC = () => {
  const { timePhase, addLog, inventory } = useGameStore();
  const [activeModal, setActiveModal] = useState<'build' | 'research' | 'shop' | 'inventory' | null>(null);

  if (timePhase !== 'Day') return null;

  const handleAction = (action: string) => {
    addLog(`[系统] 玩家打开了 ${action} 面板。该功能正在施工中...`, 'warning');
  };

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 z-30">
        <ActionButton icon={<Hammer />} label="酒馆建设" onClick={() => { setActiveModal('build'); handleAction('酒馆建设'); }} />
        <ActionButton icon={<FlaskConical />} label="炼金科研" onClick={() => { setActiveModal('research'); handleAction('炼金科研'); }} />
        <ActionButton icon={<Store />} label="黑市商店" onClick={() => { setActiveModal('shop'); handleAction('黑市商店'); }} />
        <ActionButton icon={<PackageOpen />} label="物品背包" onClick={() => setActiveModal('inventory')} />
      </div>

      <AnimatePresence>
        {activeModal === 'inventory' && (
          <InventoryModal onClose={() => setActiveModal(null)} inventory={inventory} />
        )}
      </AnimatePresence>
    </>
  );
};

const ActionButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-[#241d1a] border-2 border-[#543b2b] text-[#e6b36e] rounded shadow-lg hover:bg-[#3e2e25] transition-colors"
  >
    {icon}
    <span className="font-bold tracking-widest">{label}</span>
  </button>
);

const InventoryModal = ({ onClose, inventory }: { onClose: () => void, inventory: any[] }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="w-full max-w-2xl bg-[#161211] border-2 border-[#543b2b] rounded shadow-2xl flex flex-col max-h-[80vh]"
      >
        <div className="flex justify-between items-center p-4 border-b border-[#3e2e25] bg-[#1a1514]">
          <h2 className="text-xl font-bold text-[#e6b36e] flex items-center gap-2"><PackageOpen /> 物品背包</h2>
          <button onClick={onClose} className="text-[#a09081] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-[#a09081]">
              <PackageOpen className="w-12 h-12 mb-4 opacity-50" />
              <p>背包空空如也...</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {inventory.map(item => (
                <div key={item.id} className="border border-[#543b2b] bg-[#1d1715] rounded p-2 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-[#120e0d] border border-[#3e2e25] flex items-center justify-center">
                    <img src={item.icon} alt={item.name} className="w-8 h-8" />
                  </div>
                  <span className="text-[#e6b36e] text-sm font-bold text-center">{item.name}</span>
                  <span className="text-[#a09081] text-xs">x {item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
