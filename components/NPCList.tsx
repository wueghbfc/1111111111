import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { getNPCsInLocation } from '../services/gameEngine';
import NPCModal from './NPCModal';
import { NPC } from '../types';

interface Props {
  locationId: string;
  onNpcInteraction: (npcId: string, action: 'CHAT' | 'STEAL' | 'POISON' | 'ATTACK') => void;
}

const NPCList: React.FC<Props> = ({ locationId, onNpcInteraction }) => {
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const npcs = getNPCsInLocation(locationId);

  return (
    <div className="w-full h-full flex justify-center items-center bg-slate-900">
         {npcs.length > 0 ? (
           <div className="flex flex-wrap justify-center gap-2 w-full px-2">
             {npcs.map(npc => (
               <button
                 key={npc.id}
                 onClick={() => setSelectedNpc(npc)}
                 // Compact button: w-9 h-9 (36px)
                 className="flex flex-col items-center justify-center w-9 h-9 bg-slate-800 border border-slate-600 hover:border-amber-400 rounded shadow hover:shadow-amber-900/50 transition-all active:scale-95 relative group"
               >
                 <Users size={14} className="text-slate-400 group-hover:text-amber-200" />
                 <span className="text-[8px] font-bold text-slate-300 group-hover:text-white truncate w-full text-center px-0.5 leading-none scale-90 origin-center">{npc.name}</span>
                 {/* Status Indicator - Compact */}
                 <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-600 rounded-full border border-slate-900"></div>
               </button>
             ))}
           </div>
         ) : (
           <div className="text-center text-slate-700 text-[10px] font-serif flex items-center gap-2 opacity-60">
             <span className="w-4 h-[1px] bg-slate-800"></span>
             <span>鬼影都没一个</span>
             <span className="w-4 h-[1px] bg-slate-800"></span>
           </div>
         )}
         
        {selectedNpc && (
        <NPCModal 
          npc={selectedNpc} 
          onClose={() => setSelectedNpc(null)}
          onAction={(action) => {
             if (action !== 'CHAT') {
               setSelectedNpc(null);
             }
             onNpcInteraction(selectedNpc.id, action);
          }}
        />
      )}
    </div>
  );
};

export default NPCList;