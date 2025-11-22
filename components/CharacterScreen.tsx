
import React, { useState } from 'react';
import { PlayerState, MartialArt } from '../types';
import { Sword, Shield, Flame, Wind, Zap, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  state: PlayerState;
}

const CharacterScreen: React.FC<Props> = ({ state }) => {
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const toggleSkill = (id: string) => {
    setExpandedSkillId(expandedSkillId === id ? null : id);
  };

  const StatRow = ({ label, value, max, color }: any) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1 font-bold text-slate-300">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div 
          className={`h-full ${color} transition-all duration-500`} 
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }} 
        />
      </div>
    </div>
  );

  const SkillItem = ({ skill }: { skill: MartialArt }) => {
    const isExpanded = expandedSkillId === skill.id;
    let Icon = Sword;
    let color = "text-slate-400";
    let typeName = "武功";

    if (skill.type === 'inner') {
      Icon = Flame;
      color = "text-red-400";
      typeName = "内功";
    } else if (skill.type === 'light') {
      Icon = Wind;
      color = "text-blue-400";
      typeName = "轻功";
    } else if (skill.type === 'outer') {
      Icon = Zap;
      color = "text-amber-400";
      typeName = "外功";
    }

    return (
      <div 
        onClick={() => toggleSkill(skill.id)}
        className={`bg-slate-800 rounded border shadow-sm transition-all cursor-pointer overflow-hidden
          ${isExpanded ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-slate-700 hover:border-slate-600'}
        `}
      >
        {/* Header */}
        <div className="p-3 flex items-center gap-3">
          <div className={`p-2 bg-slate-900 rounded-lg border border-slate-800 ${color} shrink-0`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h4 className="text-slate-200 font-bold font-serif truncate">{skill.name}</h4>
              <div className="flex items-center gap-2">
                 <span className="text-xs bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 shrink-0">{typeName}</span>
                 {isExpanded ? <ChevronUp size={14} className="text-slate-500"/> : <ChevronDown size={14} className="text-slate-500"/>}
              </div>
            </div>
            
            {/* Progress Bar (Collapsed View) */}
            {!isExpanded && (
               <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                 <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-amber-700" 
                     style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                   />
                 </div>
                 <span className="font-mono shrink-0">{skill.level}/{skill.maxLevel}</span>
               </div>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-3 pb-3 animate-in slide-in-from-top-2 duration-200">
            <div className="text-xs text-slate-400 mb-3 italic border-l-2 border-slate-600 pl-2">
               {skill.description}
            </div>

            {/* Move List */}
            {skill.moves && skill.moves.length > 0 && (
               <div className="mt-3 bg-slate-900/50 rounded p-2">
                  <h5 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">Available Moves (招式)</h5>
                  <div className="space-y-2">
                     {skill.moves.map(move => (
                       <div key={move.id} className="flex justify-between items-start text-xs border-b border-slate-700/50 pb-1 last:border-0 last:pb-0">
                          <div className="flex-1">
                            <span className="text-slate-200 font-bold mr-1">【{move.name}】</span>
                            <span className="text-slate-500">{move.description}</span>
                          </div>
                          <div className="text-right font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                            <div>AP: {move.apCost}</div>
                            <div>Qi: {move.qiCost}</div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            )}
            
            {/* Passive Effects */}
            {skill.effects && skill.effects.length > 0 && (
              <div className="mt-2 pt-2 grid grid-cols-2 gap-1">
                {skill.effects.map((effect, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-[10px] text-amber-500/80">
                    <Sparkles size={8} className="shrink-0" />
                    <span className="truncate">{effect}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155; 
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #475569; 
        }
      `}</style>
      <div className="flex-1 bg-slate-900 p-4 overflow-y-auto custom-scrollbar">
        <h2 className="text-2xl font-bold text-amber-500 font-serif mb-6 text-center border-b border-slate-800 pb-4">
          侠客属性
        </h2>

        {/* Header Stats Block */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 shadow-lg mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                  <span className="text-xs text-slate-500 mb-1">当前境界</span>
                  <span className="text-xl font-bold text-amber-400 font-serif tracking-wide">{state.level}</span>
              </div>
              <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500 mb-1">江湖阅历</span>
                  <span className="text-slate-200 font-mono">{state.exp}</span>
              </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
            <div className="flex items-center gap-2">
                <Sword className="text-red-400" size={16} />
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-slate-500">攻击力</span>
                  <span className="font-bold text-slate-200">25</span>
                </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
                <div className="flex flex-col leading-none items-end">
                  <span className="text-[10px] text-slate-500">防御力</span>
                  <span className="font-bold text-slate-200">12</span>
                </div>
                <Shield className="text-blue-400" size={16} />
            </div>
          </div>
        </div>

        {/* Basic Stats */}
        <div className="space-y-2 mb-8">
          <StatRow label="气血 (HP)" value={state.hp} max={state.maxHp} color="bg-red-600" />
          <StatRow label="内力 (Qi)" value={state.qi} max={state.maxQi} color="bg-blue-600" />
          <StatRow label="体力 (Stamina)" value={state.stamina} max={state.maxStamina} color="bg-emerald-600" />
        </div>

        {/* Martial Arts Section */}
        <h3 className="text-lg font-bold text-slate-300 font-serif mb-3 pl-2 border-l-4 border-amber-600 flex items-center justify-between pr-2">
          <span>修习武学</span>
          <span className="text-xs font-sans font-normal text-slate-500">已习得 {state.skills.length} 门</span>
        </h3>
        <div className="space-y-3 mb-6">
          {state.skills.length > 0 ? (
            state.skills.map(skill => (
              <SkillItem key={skill.id} skill={skill} />
            ))
          ) : (
            <div className="text-center py-8 text-slate-600 text-sm">
              暂未习得任何武功
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default CharacterScreen;
