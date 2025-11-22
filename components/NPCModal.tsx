
import React, { useState } from 'react';
import { NPC } from '../types';
import { MessageCircle, Search, Hand, Skull, Sword, X, AlertTriangle } from 'lucide-react';

interface Props {
  npc: NPC;
  onClose: () => void;
  onAction: (type: 'CHAT' | 'STEAL' | 'POISON' | 'ATTACK') => void;
}

const NPCModal: React.FC<Props> = ({ npc, onClose, onAction }) => {
  const [showStats, setShowStats] = useState(false);
  const [showConfirmAttack, setShowConfirmAttack] = useState(false);

  const handleAction = (type: 'CHAT' | 'STEAL' | 'POISON' | 'ATTACK') => {
    if (type === 'ATTACK') {
      setShowConfirmAttack(true);
    } else {
      onAction(type);
    }
  };

  const confirmAttack = () => {
    onAction('ATTACK');
  };

  const ActionButton = ({ icon: Icon, label, onClick, colorClass }: any) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all ${colorClass}`}
    >
      <Icon size={20} className="mb-1" />
      <span className="text-xs font-bold font-serif">{label}</span>
    </button>
  );

  // Confirmation Overlay
  if (showConfirmAttack) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-red-900 rounded-lg p-6 w-full max-w-xs text-center shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              <AlertTriangle size={48} className="mx-auto text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-red-500 font-serif mb-2">杀机已动</h3>
              <p className="text-slate-400 text-sm mb-6">
                你确定要对 <span className="text-amber-500 font-bold">{npc.name}</span> 出手吗？
                <br/>
                <span className="text-xs opacity-70 mt-2 block">刀剑无眼，生死有命。</span>
              </p>
              <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setShowConfirmAttack(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-sm"
                  >
                    收起杀心
                  </button>
                  <button 
                    onClick={confirmAttack}
                    className="px-4 py-2 bg-red-900 text-red-100 rounded hover:bg-red-800 font-bold text-sm border border-red-700"
                  >
                    拔剑！
                  </button>
              </div>
          </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-xs rounded-lg border border-amber-800 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-800 p-3 flex justify-between items-start border-b border-slate-700">
          <div>
             <h3 className="text-amber-500 font-bold text-xl font-serif">{npc.name}</h3>
             <p className="text-slate-400 text-xs">{npc.title} | {npc.faction}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 min-h-[150px] text-sm text-slate-300 leading-relaxed bg-slate-900/50">
          {!showStats ? (
            // Description View
            <div className="animate-in slide-in-from-right-4 duration-300">
              <p className="mb-4 text-slate-400 italic">"{npc.description}"</p>
              <div className="inline-block px-2 py-1 bg-amber-900/30 border border-amber-800/50 rounded text-amber-500 text-xs font-serif">
                境界：{npc.realm}
              </div>
            </div>
          ) : (
            // Stats View (Probe Result)
            <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
               <p className="text-amber-400 font-bold border-b border-slate-700 pb-1 mb-2">探查结果</p>
               <div className="flex justify-between">
                  <span>气血:</span>
                  <span className="text-red-400 font-mono">{npc.hp} / {npc.maxHp}</span>
               </div>
               <div>
                  <span className="block mb-1">修习武学:</span>
                  <div className="flex flex-wrap gap-1">
                     {npc.skills.map((skill, i) => (
                        <span key={i} className="text-xs bg-slate-800 px-1 rounded text-blue-300 border border-slate-700">{skill}</span>
                     ))}
                  </div>
               </div>
               <div>
                  <span className="block mb-1">随身物品:</span>
                  <div className="text-xs text-slate-400">
                      {npc.inventory.length > 0 ? npc.inventory.join(', ') : '无'}
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Action Grid */}
        <div className="p-3 bg-slate-800/50 border-t border-slate-700 grid grid-cols-5 gap-2">
          <ActionButton 
            icon={MessageCircle} 
            label="聊天" 
            onClick={() => handleAction('CHAT')} 
            colorClass="text-emerald-400 hover:text-emerald-300"
          />
          <ActionButton 
            icon={Search} 
            label="探查" 
            onClick={() => setShowStats(true)} 
            colorClass="text-blue-400 hover:text-blue-300"
          />
          <ActionButton 
            icon={Hand} 
            label="偷窃" 
            onClick={() => handleAction('STEAL')} 
            colorClass="text-amber-400 hover:text-amber-300"
          />
          <ActionButton 
            icon={Skull} 
            label="下药" 
            onClick={() => handleAction('POISON')} 
            colorClass="text-purple-400 hover:text-purple-300"
          />
          <ActionButton 
            icon={Sword} 
            label="攻击" 
            onClick={() => handleAction('ATTACK')} 
            colorClass="text-red-500 hover:text-red-400 border-red-900/30 bg-red-950/20"
          />
        </div>

      </div>
    </div>
  );
};

export default NPCModal;
