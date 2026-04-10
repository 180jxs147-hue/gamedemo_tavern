import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Heart, Activity, Gem, BookOpen } from 'lucide-react';

export const AssetsPanel: React.FC = () => {
  const { assets, trainAsset, resources } = useGameStore();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-purple-400 font-serif font-bold text-lg flex items-center">
          <Gem className="w-5 h-5 mr-2" />
          地下暗房资产
        </h2>
        <span className="text-xs text-zinc-400">{assets.length} 资产</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {assets.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">
            暂无捕获的资产
          </div>
        ) : (
          assets.map((asset) => (
            <div key={asset.id} className="bg-zinc-900 border border-purple-900/30 rounded-sm p-3 shadow-md flex flex-col relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.1)_0%,transparent_70%)] pointer-events-none" />
              
              <div className="flex justify-between items-start z-10">
                <div>
                  <h3 className="font-serif font-bold text-purple-100">{asset.name}</h3>
                  <span className="text-[10px] bg-black/50 px-1 border border-purple-900/50 rounded-sm text-purple-400 mt-1 inline-block">
                    {asset.rarity}
                  </span>
                </div>
                <div className="w-10 h-10 bg-zinc-950 border border-purple-900/50 rounded-sm overflow-hidden flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                   <img 
                    src={`https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20fantasy%20portrait%20silhouette%20Female%20guest%20elegant%20purple%20glow&image_size=square`} 
                    alt="portrait" 
                    className="w-full h-full object-cover opacity-80"
                  />
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
                onClick={() => trainAsset(asset.id)}
                disabled={resources.ap < 1}
                className="mt-3 py-1.5 w-full bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 border border-purple-900/50 rounded-sm flex items-center justify-center text-xs transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BookOpen className="w-3 h-3 mr-1.5" />
                调教训练 (-1 AP)
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
