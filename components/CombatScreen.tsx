
import React, { useEffect, useRef, useState } from 'react';
import { CombatState, HexCoordinate, CombatMove } from '../types';
import { hexToPixel, generateHexGrid, areHexesEqual } from '../services/combatEngine';
import { Sword, Shield, Footprints, LogOut, Zap, ArrowLeft, Heart } from 'lucide-react';

interface Props {
  combatState: CombatState;
  onAction: (type: 'MOVE' | 'ATTACK' | 'SKILL' | 'ITEM' | 'ESCAPE' | 'END_TURN', payload?: any) => void;
}

const StickFigure = ({ color, x, y, isDead }: { color: string, x: number, y: number, isDead: boolean }) => (
  <g transform={`translate(${x},${y}) ${isDead ? 'rotate(90)' : ''}`} style={{ transition: 'transform 0.3s ease-in-out' }}>
    {/* Head */}
    <circle cx="0" cy="-12" r="5" fill="none" stroke={color} strokeWidth="2" />
    {/* Body */}
    <line x1="0" y1="-7" x2="0" y2="8" stroke={color} strokeWidth="2" />
    {/* Arms */}
    <line x1="-8" y1="-2" x2="8" y2="-2" stroke={color} strokeWidth="2" />
    {/* Legs */}
    <line x1="0" y1="8" x2="-6" y2="18" stroke={color} strokeWidth="2" />
    <line x1="0" y1="8" x2="6" y2="18" stroke={color} strokeWidth="2" />
    {/* Weapon/Stance */}
    {!isDead && <line x1="8" y1="-2" x2="12" y2="-10" stroke={color} strokeWidth="1.5" />}
  </g>
);

const CombatScreen: React.FC<Props> = ({ combatState, onAction }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [controlMode, setControlMode] = useState<'main' | 'skills' | 'items'>('main');
  
  const grid = generateHexGrid(combatState.gridRadius);
  
  // Scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatState.logs]);

  // Reset control mode on turn change
  useEffect(() => {
     if (!combatState.isPlayerTurn) {
         setControlMode('main');
     }
  }, [combatState.isPlayerTurn]);

  const player = combatState.entities.find(e => e.isPlayer);
  const enemy = combatState.entities.find(e => !e.isPlayer);

  const handleHexClick = (hex: HexCoordinate) => {
      if (!combatState.isPlayerTurn) return;
      
      // If a skill is selected, we are targeting
      if (combatState.activeSkillId) {
          const clickedEntity = combatState.entities.find(e => areHexesEqual(e.position, hex));
          // Simple logic: if self-cast move (range 0), allow targeting self?
          // Current engine `performSkill` expects a targetId for everyone. 
          // If clickedEntity exists, send it.
          if (clickedEntity) {
              onAction('SKILL', { moveId: combatState.activeSkillId, targetId: clickedEntity.id });
          } else {
              // If empty hex clicked and it's not a move action, cancel skill?
              // For now, just do nothing or maybe 'MOVE' if it was a mistake? 
              // Let's keep it strict: Skill mode requires valid target.
          }
          return;
      }

      // Default: Move or Basic Attack
      const clickedEntity = combatState.entities.find(e => areHexesEqual(e.position, hex));
      if (clickedEntity && !clickedEntity.isPlayer) {
          // Use first move as basic attack? Or generic? 
          // Engine uses `performAttack` for basic interaction.
          onAction('ATTACK', clickedEntity.id);
          return;
      }
      onAction('MOVE', hex);
  };

  const handleSkillSelect = (move: CombatMove) => {
      if (move.range === 0) {
          // Self Cast - Execute immediately? 
          // Let's maintain consistent flow: Select Skill -> Highlight Self -> Click Self?
          // Or just execute. Let's execute for better UX.
          if (player) {
             onAction('SKILL', { moveId: move.id, targetId: player.id });
          }
      } else {
          // Targeted
          onAction('SKILL', { moveId: move.id, pending: true });
      }
  };

  // --- Render Helpers ---

  const renderHealthBar = (entity: any, isRight: boolean) => (
      <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} w-full max-w-[120px]`}>
          <div className="text-xs font-bold text-slate-300 mb-1">{entity.name}</div>
          <div className="w-full h-2 bg-slate-800 border border-slate-700 rounded-full overflow-hidden relative">
              <div className={`h-full ${entity.isPlayer ? 'bg-blue-500' : 'bg-red-500'}`} style={{width: `${(entity.hp / entity.maxHp)*100}%`}}></div>
          </div>
          <div className="flex justify-between w-full text-[10px] text-slate-500 mt-0.5 font-mono">
              <span>HP: {entity.hp}</span>
              {entity.isPlayer && <span className="text-blue-400">Qi: {entity.qi}</span>}
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* 1. Combat Log (Top 25%) */}
      <div className="h-1/4 bg-slate-900 border-b border-slate-800 p-3 overflow-y-auto scrollbar-hide relative">
        <div className="space-y-1.5">
            {combatState.logs.map((log) => (
                <div key={log.id} className="text-sm font-serif text-slate-300 animate-in fade-in slide-in-from-left-2">
                    <span className="text-slate-600 text-xs mr-2">[{new Date(log.timestamp).toLocaleTimeString([], {hour12:false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                    {log.content}
                </div>
            ))}
            <div ref={logEndRef} />
        </div>
        {combatState.winner && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                <div className="text-center animate-in zoom-in duration-300">
                    <h2 className={`text-3xl font-bold font-serif mb-2 ${combatState.winner === 'player' ? 'text-amber-500' : 'text-red-600'}`}>
                        {combatState.winner === 'player' ? '战斗胜利' : '不敌落败'}
                    </h2>
                    <button 
                        onClick={() => onAction('ESCAPE')}
                        className="px-6 py-2 bg-slate-200 text-slate-900 rounded hover:bg-white font-bold"
                    >
                        {combatState.winner === 'player' ? '收剑离去' : '狼狈逃窜'}
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* 2. Hex Grid Arena (Middle ~55%) */}
      <div className="flex-1 bg-[#1a1f2e] relative overflow-hidden flex items-center justify-center select-none">
        {/* HUD Overlay */}
        <div className="absolute top-2 left-2 right-2 flex justify-between z-10">
            {player && renderHealthBar(player, false)}
            {enemy && renderHealthBar(enemy, true)}
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>

        <svg 
            viewBox="-120 -100 240 200" 
            className="w-full h-full max-w-lg aspect-square"
            style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
        >
            {/* Grid */}
            <g transform="translate(0,0)">
                {grid.map((hex, i) => {
                    const { x, y } = hexToPixel(hex);
                    const isOccupied = combatState.entities.some(e => areHexesEqual(e.position, hex));
                    // Can simplify hex polygon
                    const hexPoints = "0,-14 12,-7 12,7 0,14 -12,7 -12,-7"; 
                    
                    return (
                        <g 
                            key={i} 
                            transform={`translate(${x},${y})`}
                            onClick={() => handleHexClick(hex)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <polygon 
                                points={hexPoints} 
                                fill={isOccupied ? '#334155' : '#1e293b'} 
                                stroke={combatState.activeSkillId ? '#d97706' : '#475569'} 
                                strokeWidth={combatState.activeSkillId ? 1.5 : 1}
                                className={combatState.activeSkillId ? "animate-pulse" : "hover:stroke-amber-500/50"}
                            />
                        </g>
                    );
                })}
            </g>

            {/* Entities */}
            {combatState.entities.map(entity => {
                const { x, y } = hexToPixel(entity.position);
                return (
                    <g key={entity.id}>
                         <StickFigure 
                            color={entity.avatarColor || '#fff'} 
                            x={x} 
                            y={y} 
                            isDead={entity.hp <= 0}
                         />
                         {/* HP Bar (Mini) */}
                         <rect x={x - 10} y={y - 25} width="20" height="3" fill="#334155" />
                         <rect x={x - 10} y={y - 25} width={Math.max(0, (entity.hp / entity.maxHp) * 20)} height="3" fill={entity.isPlayer ? '#3b82f6' : '#ef4444'} />
                    </g>
                );
            })}
        </svg>

        {/* Turn Indicator */}
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold shadow-lg border transition-colors ${combatState.isPlayerTurn ? 'bg-blue-900/80 text-blue-200 border-blue-500' : 'bg-red-900/80 text-red-200 border-red-500'}`}>
            {combatState.isPlayerTurn ? (combatState.activeSkillId ? '请选择目标' : '你的回合') : '敌方行动中...'}
        </div>
      </div>

      {/* 3. Controls (Bottom ~20%) */}
      <div className="h-[20%] min-h-[140px] bg-slate-900 border-t border-slate-800 p-3 z-20">
         {/* Player Status Line (Simple) */}
         {player && (
            <div className="flex justify-between items-center mb-2 text-xs font-mono text-slate-400">
                <div className="flex gap-3">
                    <span>AP: <span className="text-amber-400">{player.actionPoints}</span></span>
                    <span>内力: <span className="text-blue-400">{player.qi}</span></span>
                </div>
            </div>
         )}

         {/* MAIN MENU */}
         {controlMode === 'main' && (
            <div className="grid grid-cols-4 gap-2 h-[calc(100%-30px)]">
                <button 
                    disabled={!combatState.isPlayerTurn || !!combatState.winner}
                    className="bg-amber-900/30 border border-amber-700/50 hover:bg-amber-800/40 text-amber-500 rounded flex flex-col items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setControlMode('skills')}
                >
                    <Zap size={20} />
                    <span className="text-xs font-bold">武功</span>
                </button>
                
                <button 
                    disabled={!combatState.isPlayerTurn || !!combatState.winner}
                    className="bg-blue-900/30 border border-blue-700/50 hover:bg-blue-800/40 text-blue-400 rounded flex flex-col items-center justify-center gap-1 disabled:opacity-40"
                    onClick={() => setControlMode('items')} // Placeholder
                >
                    <Shield size={20} />
                    <span className="text-xs font-bold">物品</span>
                </button>
                
                <button 
                    disabled={!combatState.isPlayerTurn || !!combatState.winner}
                    className="bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 rounded flex flex-col items-center justify-center gap-1 disabled:opacity-40"
                    onClick={() => onAction('END_TURN')}
                >
                    <Footprints size={20} />
                    <span className="text-xs font-bold">结束回合</span>
                </button>

                <button 
                    className="bg-red-950/30 border border-red-800/50 hover:bg-red-900/40 text-red-500 rounded flex flex-col items-center justify-center gap-1"
                    onClick={() => onAction('ESCAPE')}
                >
                    <LogOut size={20} />
                    <span className="text-xs font-bold">逃跑</span>
                </button>
            </div>
         )}

         {/* SKILLS MENU */}
         {controlMode === 'skills' && player?.moves && (
            <div className="flex gap-2 h-[calc(100%-30px)] overflow-x-auto">
                 <button 
                    onClick={() => setControlMode('main')}
                    className="w-12 bg-slate-800 border border-slate-600 rounded flex flex-col items-center justify-center text-slate-400 shrink-0"
                 >
                    <ArrowLeft size={20} />
                 </button>
                 {player.moves.map(move => {
                     const canAfford = player.actionPoints >= move.apCost && player.qi >= move.qiCost;
                     return (
                        <button 
                            key={move.id}
                            disabled={!canAfford}
                            onClick={() => handleSkillSelect(move)}
                            className={`
                                relative flex flex-col items-start justify-between p-2 w-24 rounded border shrink-0 transition-all
                                ${canAfford 
                                    ? 'bg-amber-900/20 border-amber-700/50 hover:bg-amber-900/40 text-amber-200' 
                                    : 'bg-slate-800 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'}
                            `}
                        >
                            <div className="text-[10px] font-bold truncate w-full">{move.name}</div>
                            <div className="text-[9px] font-mono w-full flex justify-between opacity-80">
                                <span>AP:{move.apCost}</span>
                                <span>Qi:{move.qiCost}</span>
                            </div>
                        </button>
                     );
                 })}
            </div>
         )}

         {/* ITEMS MENU (Placeholder) */}
         {controlMode === 'items' && (
             <div className="flex gap-2 h-[calc(100%-30px)] items-center justify-center text-slate-500 text-xs w-full bg-slate-800/50 rounded border border-slate-700 border-dashed">
                 <button 
                    onClick={() => setControlMode('main')}
                    className="absolute left-4 w-8 h-8 bg-slate-800 border border-slate-600 rounded flex items-center justify-center text-slate-400"
                 >
                    <ArrowLeft size={16} />
                 </button>
                 暂无可用物品
             </div>
         )}
      </div>
    </div>
  );
};

export default CombatScreen;
