
import React from 'react';
import { PlayerState } from '../types';
import { Heart, Zap, Activity, MapPin, Box } from 'lucide-react';

interface Props {
  state: PlayerState;
  locationName: string;
}

const StatusPanel: React.FC<Props> = ({ state, locationName }) => {
  // Calculate percentages for bars
  const hpPct = Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100));
  const qiPct = Math.max(0, Math.min(100, (state.qi / state.maxQi) * 100));
  const stPct = Math.max(0, Math.min(100, (state.stamina / state.maxStamina) * 100));

  return (
    <div className="bg-slate-800 border-t-2 border-slate-700 p-3 pb-1 shadow-lg">
      {/* Top Row: Location & Inventory Count */}
      <div className="flex justify-between items-center mb-2 text-amber-400 text-sm font-bold font-serif">
        <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{locationName}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Box size={14} />
            <span>{state.inventory.length} 物品</span>
        </div>
      </div>

      {/* Bars */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        {/* HP */}
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-red-400">
                <span className="flex items-center gap-1"><Heart size={10}/> 气血</span>
                <span>{state.hp}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${hpPct}%` }} />
            </div>
        </div>

        {/* Qi */}
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-blue-400">
                <span className="flex items-center gap-1"><Zap size={10}/> 内力</span>
                <span>{state.qi}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${qiPct}%` }} />
            </div>
        </div>

        {/* Stamina */}
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-emerald-400">
                <span className="flex items-center gap-1"><Activity size={10}/> 体力</span>
                <span>{state.stamina}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: `${stPct}%` }} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;
