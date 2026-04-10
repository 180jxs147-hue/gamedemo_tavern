import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Hammer, FlaskConical, Store, PackageOpen, X, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DaytimeActionPanel: React.FC = () => {
  const { timePhase, inventory, upgrades, researches, shopItems, resources, buyUpgrade, buyResearch, buyShopItem } = useGameStore();
  const [activeModal, setActiveModal] = useState<'build' | 'research' | 'shop' | 'inventory' | null>(null);

  if (timePhase !== 'Day') return null;

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 z-30">
        <ActionButton icon={<Hammer />} label="酒馆建设" onClick={() => setActiveModal('build')} />
        <ActionButton icon={<FlaskConical />} label="炼金科研" onClick={() => setActiveModal('research')} />
        <ActionButton icon={<Store />} label="黑市商店" onClick={() => setActiveModal('shop')} />
        <ActionButton icon={<PackageOpen />} label="物品背包" onClick={() => setActiveModal('inventory')} />
      </div>

      <AnimatePresence>
        {activeModal === 'inventory' && <InventoryModal onClose={() => setActiveModal(null)} inventory={inventory} />}
        {activeModal === 'build' && <BuildModal onClose={() => setActiveModal(null)} upgrades={upgrades} gold={resources.gold} onBuy={buyUpgrade} />}
        {activeModal === 'research' && <ResearchModal onClose={() => setActiveModal(null)} researches={researches} gold={resources.gold} onBuy={buyResearch} />}
        {activeModal === 'shop' && <ShopModal onClose={() => setActiveModal(null)} items={shopItems} gold={resources.gold} onBuy={buyShopItem} />}
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

const BuildModal = ({ onClose, upgrades, gold, onBuy }: any) => (
  <BaseModal title="酒馆建设" icon={<Hammer />} onClose={onClose} gold={gold}>
    <div className="flex flex-col gap-4">
      {upgrades.map((u: any) => (
        <div key={u.id} className="border border-[#543b2b] bg-[#1d1715] p-4 rounded flex justify-between items-center">
          <div>
            <h3 className="text-[#e6b36e] font-bold text-lg">{u.name} <span className="text-sm text-[#a09081]">Lv.{u.level}/{u.maxLevel}</span></h3>
            <p className="text-[#cbbba9] text-sm mt-1">{u.desc}</p>
          </div>
          <button 
            onClick={() => onBuy(u.id)}
            disabled={u.level >= u.maxLevel || gold < u.cost}
            className="px-4 py-2 bg-[#8c3f2b] hover:bg-[#a64a32] disabled:bg-zinc-800 disabled:text-zinc-500 text-[#f2e6d9] font-bold rounded transition-colors flex items-center gap-1"
          >
            {u.level >= u.maxLevel ? '已满级' : <><Coins className="w-4 h-4" /> {u.cost}</>}
          </button>
        </div>
      ))}
    </div>
  </BaseModal>
);

const ResearchModal = ({ onClose, researches, gold, onBuy }: any) => (
  <BaseModal title="炼金科研" icon={<FlaskConical />} onClose={onClose} gold={gold}>
    <div className="flex flex-col gap-4">
      {researches.map((r: any) => (
        <div key={r.id} className="border border-[#543b2b] bg-[#1d1715] p-4 rounded flex justify-between items-center">
          <div>
            <h3 className="text-[#e6b36e] font-bold text-lg">{r.name}</h3>
            <p className="text-[#cbbba9] text-sm mt-1">{r.desc}</p>
          </div>
          <button 
            onClick={() => onBuy(r.id)}
            disabled={r.isUnlocked || gold < r.cost}
            className="px-4 py-2 bg-[#3b5446] hover:bg-[#4a6b58] disabled:bg-zinc-800 disabled:text-zinc-500 text-[#d9f2e6] font-bold rounded transition-colors flex items-center gap-1"
          >
            {r.isUnlocked ? '已解锁' : <><Coins className="w-4 h-4" /> {r.cost}</>}
          </button>
        </div>
      ))}
    </div>
  </BaseModal>
);

const ShopModal = ({ onClose, items, gold, onBuy }: any) => (
  <BaseModal title="黑市商店" icon={<Store />} onClose={onClose} gold={gold}>
    <div className="grid grid-cols-2 gap-4">
      {items.map((item: any) => (
        <div key={item.id} className="border border-[#543b2b] bg-[#1d1715] p-4 rounded flex items-center gap-4">
          <div className="w-12 h-12 bg-[#120e0d] border border-[#3e2e25] flex items-center justify-center rounded shrink-0">
            <img src={item.icon} alt={item.name} className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-[#e6b36e] font-bold">{item.name}</h3>
            <p className="text-[#a09081] text-xs mt-1 leading-tight">{item.desc}</p>
            <button 
              onClick={() => onBuy(item.id)}
              disabled={gold < item.cost}
              className="mt-2 px-3 py-1 bg-[#2a2220] hover:bg-[#3e2e25] disabled:bg-zinc-800 disabled:text-zinc-500 border border-[#543b2b] text-[#e6b36e] text-xs rounded transition-colors flex items-center gap-1"
            >
              购买 <Coins className="w-3 h-3" /> {item.cost}
            </button>
          </div>
        </div>
      ))}
    </div>
  </BaseModal>
);

const BaseModal = ({ title, icon, onClose, gold, children }: any) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  >
    <motion.div 
      initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
      className="w-full max-w-2xl bg-[#161211] border-2 border-[#543b2b] rounded shadow-2xl flex flex-col max-h-[80vh] font-serif"
    >
      <div className="flex justify-between items-center p-4 border-b border-[#3e2e25] bg-[#1a1514]">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-[#e6b36e] flex items-center gap-2">{icon} {title}</h2>
          {gold !== undefined && <span className="flex items-center text-amber-400 text-sm"><Coins className="w-4 h-4 mr-1" /> {gold} G</span>}
        </div>
        <button onClick={onClose} className="text-[#a09081] hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </motion.div>
  </motion.div>
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
