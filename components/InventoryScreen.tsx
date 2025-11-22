
import React from 'react';
import { PlayerState } from '../types';
import { Package, XCircle } from 'lucide-react';

interface Props {
  state: PlayerState;
}

const InventoryScreen: React.FC<Props> = ({ state }) => {
  return (
    <div className="flex-1 bg-slate-900 p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold text-amber-500 font-serif mb-6 text-center border-b border-slate-800 pb-4">
        行囊背包
      </h2>

      {state.inventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Package size={48} className="mb-4 opacity-20" />
            <p>囊中羞涩，空无一物</p>
        </div>
      ) : (
        <div className="grid gap-3">
            {state.inventory.map((item, index) => (
                <div key={index} className="bg-slate-800 p-3 rounded border border-slate-700 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-amber-600">
                            <Package size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-200">{item}</div>
                            <div className="text-xs text-slate-500">普通物品</div>
                        </div>
                    </div>
                    <button className="text-slate-500 text-xs px-2 py-1 border border-slate-600 rounded hover:bg-slate-700">
                        查看
                    </button>
                </div>
            ))}
            
            {/* Mock Empty Slots to fill space */}
            {Array.from({ length: Math.max(0, 10 - state.inventory.length) }).map((_, i) => (
                 <div key={`empty-${i}`} className="bg-slate-900/30 p-3 rounded border border-slate-800/50 flex items-center justify-center h-[66px]">
                     <span className="text-slate-700 text-xs">空置</span>
                 </div>
            ))}
        </div>
      )}
      
      <div className="mt-4 text-center text-xs text-slate-600">
        负重: {state.inventory.length} / 20
      </div>
    </div>
  );
};

export default InventoryScreen;
