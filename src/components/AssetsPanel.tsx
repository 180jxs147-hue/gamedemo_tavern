import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Heart, Activity, Gem, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { useShallow } from 'zustand/react/shallow';


export const AssetsPanel: React.FC = () => {
  const {  assets, trainAsset, resources, selectedEntity, setSelectedEntity  } = useGameStore(useShallow(state => ({ assets: state.assets, trainAsset: state.trainAsset, resources: state.resources, selectedEntity: state.selectedEntity, setSelectedEntity: state.setSelectedEntity })));


  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[color:var(--rt-accent)] font-serif font-bold text-lg flex items-center">
          <Gem className="w-5 h-5 mr-2 text-[#a57b3c]" />
          地下暗房资产
        </h2>
        <span className="text-xs text-[color:var(--rt-muted)]">{assets.length} 资产</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {assets.length === 0 ? (
          <div className="text-center py-10 text-[color:var(--rt-muted)] text-sm border border-[color:var(--rt-border)] border-dashed rounded-sm">
            暂无捕获的资产
          </div>
        ) : (
          assets.map((asset) => {
            const isSelected = selectedEntity?.type === 'asset' && selectedEntity.id === asset.id;
            return (
              <div 
                key={asset.id} 
                onClick={() => setSelectedEntity({ type: 'asset', id: asset.id })}
                className={clsx(
                  "bg-[color:var(--rt-surface)] border rounded-sm p-3 shadow-md flex flex-col relative overflow-hidden group cursor-pointer transition-all hover:bg-black/30",
                  isSelected ? "border-[color:var(--rt-accent)] translate-x-2 shadow-[0_0_18px_rgba(202,163,93,0.16)]" : "border-[color:var(--rt-border)] hover:border-[color:var(--rt-border-strong)]"
                )}
              >
                <div className={clsx(
                  "absolute inset-0 pointer-events-none transition-opacity",
                  isSelected ? "bg-[radial-gradient(ellipse_at_top_right,rgba(202,163,93,0.18)_0%,transparent_70%)]" : "bg-[radial-gradient(ellipse_at_top_right,rgba(202,163,93,0.10)_0%,transparent_70%)]"
                )} />
                
                <div className="flex justify-between items-start z-10">
                  <div>
                    <h3 className={clsx("font-serif font-bold transition-colors", isSelected ? "text-[color:var(--rt-accent)]" : "text-[color:var(--rt-text)] group-hover:text-[color:var(--rt-accent)]")}>
                      {asset.name}
                    </h3>
                    <div className="flex gap-1 mt-1">
                      <span className="text-[10px] bg-black/40 px-1 border border-[color:var(--rt-border)] rounded-sm text-[color:var(--rt-muted)] inline-block">
                        {asset.rarity}
                      </span>
                      <span className="text-[10px] bg-black/40 px-1 border border-[color:var(--rt-border)] rounded-sm text-[#e6b36e] inline-block">
                        {asset.race}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-[color:var(--rt-surface-2)] border border-[color:var(--rt-border)] rounded-sm overflow-hidden flex items-center justify-center shadow-[0_0_10px_rgba(202,163,93,0.12)]">
                    <img 
                      src={asset.portrait}
                      alt={asset.name}
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all"
                     loading="lazy" />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs z-10">
                  <div className="flex items-center text-pink-400 bg-pink-950/30 px-2 py-1 rounded-sm border border-pink-900/30">
                    <Heart className="w-3 h-3 mr-1" /> 魅力 {asset.charm}
                  </div>
                  <div className="flex items-center text-indigo-400 bg-indigo-950/30 px-2 py-1 rounded-sm border border-indigo-900/30">
                    <Activity className="w-3 h-3 mr-1" /> 服从 {asset.obedience}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEntity({ type: 'asset', id: asset.id });
                  }}
                  className="mt-3 py-1.5 w-full bg-[color:var(--rt-surface-2)] hover:bg-black/40 text-[color:var(--rt-accent)] border border-[color:var(--rt-border-strong)] rounded-sm flex items-center justify-center text-xs transition-colors z-10"
                >
                  <BookOpen className="w-3 h-3 mr-1.5" />
                  调教管理
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
