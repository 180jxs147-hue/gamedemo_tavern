import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Hammer, FlaskConical, Store, PackageOpen, X, Coins, Lock, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';


export const DaytimeActionPanel: React.FC = () => {
  const {  timePhase, inventory, upgrades, researches, shopItems, resources, tavernTier, buyUpgrade, buyResearch, buyShopItem, upgradeTavernTier  } = useGameStore(useShallow(state => ({ timePhase: state.timePhase, inventory: state.inventory, upgrades: state.upgrades, researches: state.researches, shopItems: state.shopItems, resources: state.resources, tavernTier: state.tavernTier, buyUpgrade: state.buyUpgrade, buyResearch: state.buyResearch, buyShopItem: state.buyShopItem, upgradeTavernTier: state.upgradeTavernTier })));
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
        {activeModal === 'build' && <BuildModal onClose={() => setActiveModal(null)} upgrades={upgrades} gold={resources.gold} onBuy={buyUpgrade} tavernTier={tavernTier} upgradeTavernTier={upgradeTavernTier} reputation={resources.reputation} />}
        {activeModal === 'research' && <ResearchModal onClose={() => setActiveModal(null)} researches={researches} gold={resources.gold} onBuy={buyResearch} tavernTier={tavernTier} />}
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

const BuildModal = ({ onClose, upgrades, gold, onBuy, tavernTier, upgradeTavernTier, reputation }: any) => {
  const getPrerequisiteName = (id: string) => upgrades.find((u: any) => u.id === id)?.name || '未知';
  const isLocked = (tierReq: number, prereqId?: string) => {
    if (tavernTier < tierReq) return true;
    if (prereqId) {
      const prereq = upgrades.find((u: any) => u.id === prereqId);
      if (!prereq || prereq.level === 0) return true;
    }
    return false;
  };

  const renderCategory = (category: string, title: string) => {
    const list = upgrades.filter((u: any) => u.category === category);
    if (!list.length) return null;
    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-[#e6b36e] font-bold border-b border-[#3e2e25] pb-2 mb-3">{title}</h4>
        <div className="flex flex-col gap-3">
          {list.map((u: any) => {
            const locked = isLocked(u.tierReq, u.prerequisiteId);
            return (
              <div key={u.id} className={`border border-[#543b2b] p-4 rounded flex justify-between items-center ${locked ? 'bg-black/50 opacity-60' : 'bg-[#1d1715]'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center ${locked ? 'text-zinc-500' : 'text-[#e6b36e]'}`}>
                    {u.name} 
                    {!locked && <span className="text-sm text-[#a09081] ml-2">Lv.{u.level}/{u.maxLevel}</span>}
                  </h3>
                  <p className="text-[#cbbba9] text-sm mt-1">{u.desc}</p>
                  {locked && (
                    <div className="text-xs text-red-500 mt-2 flex items-center font-bold">
                      <Lock className="w-3 h-3 mr-1" />
                      {tavernTier < u.tierReq ? `需要酒馆达到 ${u.tierReq} 阶` : `需要前置设施: ${getPrerequisiteName(u.prerequisiteId!)}`}
                    </div>
                  )}
                </div>
                {!locked && (
                  <button 
                    onClick={() => onBuy(u.id)}
                    disabled={u.level >= u.maxLevel || gold < u.cost}
                    className="px-4 py-2 bg-[#8c3f2b] hover:bg-[#a64a32] disabled:bg-zinc-800 disabled:text-zinc-500 text-[#f2e6d9] font-bold rounded transition-colors flex items-center gap-1 shrink-0 ml-4"
                  >
                    {u.level >= u.maxLevel ? '已满级' : <><Coins className="w-4 h-4" /> {u.cost}</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const upgradeCosts = { 1: { gold: 1000, rep: 100 }, 2: { gold: 3000, rep: 300 }, 3: { gold: 8000, rep: 600 }, 4: { gold: 20000, rep: 1000 } };
  const currentCost = tavernTier < 5 ? upgradeCosts[tavernTier as 1|2|3|4] : null;

  return (
    <BaseModal title="酒馆建设" icon={<Hammer />} onClose={onClose} gold={gold}>
      {tavernTier < 5 && currentCost && (
        <div className="bg-[#1a1514] border border-amber-900/50 p-4 rounded-sm flex items-center justify-between shadow-lg mb-6">
          <div>
            <div className="text-sm text-amber-500 font-bold mb-1">晋升 {tavernTier + 1} 阶要求</div>
            <div className="text-xs text-zinc-400">
              金币: <span className={gold >= currentCost.gold ? "text-amber-400" : "text-red-400"}>{gold}</span> / {currentCost.gold}
              <span className="mx-3">|</span>
              声望: <span className={reputation >= currentCost.rep ? "text-amber-400" : "text-red-400"}>{reputation}</span> / {currentCost.rep}
            </div>
          </div>
          <button
            onClick={upgradeTavernTier}
            disabled={gold < currentCost.gold || reputation < currentCost.rep}
            className="px-4 py-2 bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold rounded shadow-[0_0_10px_rgba(217,119,6,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all"
          >
            <ArrowUpCircle className="w-5 h-5 mr-1" />
            升阶
          </button>
        </div>
      )}
      {renderCategory('reception', '接待区')}
      {renderCategory('dungeon', '暗房区')}
      {renderCategory('security', '安保区')}
    </BaseModal>
  );
};

const ResearchModal = ({ onClose, researches, gold, onBuy, tavernTier }: any) => {
  const getPrerequisiteName = (id: string) => researches.find((r: any) => r.id === id)?.name || '未知';
  const isLocked = (tierReq: number, prereqId?: string) => {
    if (tavernTier < tierReq) return true;
    if (prereqId) {
      const prereq = researches.find((r: any) => r.id === prereqId);
      if (!prereq || !prereq.isUnlocked) return true;
    }
    return false;
  };

  const renderCategory = (category: string, title: string) => {
    const list = researches.filter((r: any) => r.category === category);
    if (!list.length) return null;
    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-[#e6b36e] font-bold border-b border-[#3e2e25] pb-2 mb-3">{title}</h4>
        <div className="flex flex-col gap-3">
          {list.map((r: any) => {
            const locked = isLocked(r.tierReq, r.prerequisiteId);
            return (
              <div key={r.id} className={`border border-[#543b2b] p-4 rounded flex justify-between items-center ${locked ? 'bg-black/50 opacity-60' : 'bg-[#1d1715]'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center ${locked ? 'text-zinc-500' : 'text-[#e6b36e]'}`}>
                    {r.name}
                  </h3>
                  <p className="text-[#cbbba9] text-sm mt-1">{r.desc}</p>
                  {locked && (
                    <div className="text-xs text-red-500 mt-2 flex items-center font-bold">
                      <Lock className="w-3 h-3 mr-1" />
                      {tavernTier < r.tierReq ? `需要酒馆达到 ${r.tierReq} 阶` : `需要前置科技: ${getPrerequisiteName(r.prerequisiteId!)}`}
                    </div>
                  )}
                </div>
                {!locked && (
                  <button 
                    onClick={() => onBuy(r.id)}
                    disabled={r.isUnlocked || gold < r.cost}
                    className="px-4 py-2 bg-[#3b5446] hover:bg-[#4a6b58] disabled:bg-zinc-800 disabled:text-zinc-500 text-[#d9f2e6] font-bold rounded transition-colors flex items-center gap-1 shrink-0 ml-4"
                  >
                    {r.isUnlocked ? '已解锁' : <><Coins className="w-4 h-4" /> {r.cost}</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <BaseModal title="炼金科研" icon={<FlaskConical />} onClose={onClose} gold={gold}>
      {renderCategory('alchemy', '炼金毒药')}
      {renderCategory('mind', '洗脑控制')}
      {renderCategory('body', '躯体改造')}
    </BaseModal>
  );
};

const ShopModal = ({ onClose, items, gold, onBuy }: any) => (
  <BaseModal title="黑市商店" icon={<Store />} onClose={onClose} gold={gold}>
    <div className="grid grid-cols-2 gap-4">
      {items.map((item: any) => (
        <div key={item.id} className="border border-[#543b2b] bg-[#1d1715] p-4 rounded flex items-center gap-4">
          <div className="w-12 h-12 bg-[#120e0d] border border-[#3e2e25] flex items-center justify-center rounded shrink-0">
            <img src={item.icon} alt={item.name} className="w-8 h-8"  loading="lazy" />
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
                    <img src={item.icon} alt={item.name} className="w-8 h-8"  loading="lazy" />
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
