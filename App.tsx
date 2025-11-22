
import React, { useState, useEffect } from 'react';
import { PlayerState, GameLogEntry, CombatState } from './types';
import { processTurn, getInitialState, getLocationInfo, interactWithNPC, getNPC } from './services/gameEngine';
import { initializeCombat, moveEntity, performSkill, endTurn } from './services/combatEngine';
import StatusPanel from './components/StatusPanel';
import GameLog from './components/GameLog';
import ControlPanel from './components/ControlPanel';
import LocationMap from './components/LocationMap';
import BottomNav from './components/BottomNav';
import CharacterScreen from './components/CharacterScreen';
import InventoryScreen from './components/InventoryScreen';
import QuestScreen from './components/QuestScreen';
import NPCList from './components/NPCList';
import CombatScreen from './components/CombatScreen';
import { Scroll } from 'lucide-react';

type ViewState = 'map' | 'character' | 'inventory' | 'quests' | 'combat';

const App: React.FC = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(getInitialState());
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('map');
  
  // Combat State
  const [combatState, setCombatState] = useState<CombatState | null>(null);

  // Initialize game text
  useEffect(() => {
    const startLoc = getLocationInfo(playerState.locationId);
    const welcomeLogs: GameLogEntry[] = [
      { id: 'init1', type: 'system', content: '欢迎来到无尽江湖。', timestamp: Date.now() },
      { id: 'init2', type: 'narrative', content: startLoc.description, timestamp: Date.now() }
    ];
    setLogs(welcomeLogs);
  }, []); // Run once

  const handleAction = (action: string) => {
    if (isGameOver) return;

    const result = processTurn(action, playerState);
    
    setPlayerState(result.newState);
    setLogs(prev => [...prev, ...result.logs]);
    
    if (result.isGameOver) {
      setIsGameOver(true);
    }
  };

  const handleMove = (targetId: string) => {
    handleAction(`MOVE_${targetId}`);
  };

  const handleNpcInteraction = (npcId: string, action: 'CHAT' | 'STEAL' | 'POISON' | 'ATTACK') => {
    if (action === 'ATTACK') {
      // Initialize Combat
      const npc = getNPC(npcId);
      if (npc) {
        const newCombatState = initializeCombat(playerState, npc);
        setCombatState(newCombatState);
        setCurrentView('combat');
      }
      return;
    }

    // Handle other interactions via engine
    const result = interactWithNPC(npcId, action, playerState);
    setLogs(prev => [...prev, ...result.logs]);

    if (result.success) {
      // Update state if inventory changed (steal) or item used (poison)
      if (result.itemObtained) {
         setPlayerState(prev => ({
            ...prev,
            inventory: [...prev.inventory, result.itemObtained!]
         }));
      }
    }
  };

  const handleCombatAction = (type: 'MOVE' | 'ATTACK' | 'SKILL' | 'ITEM' | 'ESCAPE' | 'END_TURN', payload?: any) => {
    if (!combatState) return;

    let newState = combatState;

    switch(type) {
        case 'MOVE':
            newState = moveEntity(combatState, 'player', payload);
            break;
        case 'ATTACK':
            newState = performSkill(combatState, 'player', payload, 'fist_1'); // Default basic attack fallback if needed, but UI handles Skill now
            break;
        case 'SKILL':
            if (payload.pending) {
               // Set pending skill state for targeting
               newState = { ...combatState, activeSkillId: payload.moveId };
            } else {
               // Execute skill
               newState = performSkill(combatState, 'player', payload.targetId, payload.moveId);
            }
            break;
        case 'END_TURN':
            newState = endTurn(combatState);
            break;
        case 'ESCAPE':
            // Escape logic - exit combat view
            setCombatState(null);
            setCurrentView('map');
            setLogs(prev => [...prev, {
                id: Math.random().toString(),
                type: 'system', 
                content: '你退出了战斗。', 
                timestamp: Date.now()
            }]);
            return;
    }

    setCombatState(newState);

    // Check combat over (simple check if player hp update needed)
    const playerEntity = newState.entities.find(e => e.isPlayer);
    if (playerEntity) {
        // Sync combat HP back to main player state
        setPlayerState(prev => ({
            ...prev,
            hp: playerEntity.hp,
            qi: playerEntity.qi
        }));
        if (playerEntity.hp <= 0) {
            setIsGameOver(true);
        }
    }
  };

  // Get location name for header
  const currentLocationName = getLocationInfo(playerState.locationId)?.name || "未知";

  // Render Content based on active view
  const renderContent = () => {
    switch (currentView) {
      case 'combat':
        return combatState ? (
           <CombatScreen 
              combatState={combatState} 
              onAction={handleCombatAction} 
           />
        ) : <div>Error: Combat state missing</div>;
      case 'character':
        return <CharacterScreen state={playerState} />;
      case 'inventory':
        return <InventoryScreen state={playerState} />;
      case 'quests':
        return <QuestScreen />;
      case 'map':
      default:
        return (
          <div className="flex flex-col h-full w-full">
             {/* 1. Top Section: Status + Map + Controls */}
             {/* Map basis increased to 45vh to take more space */}
            <div className="flex-shrink-0 flex flex-col bg-slate-900 shadow-md z-20 relative">
              <StatusPanel state={playerState} locationName={currentLocationName} />
              
              {/* Map Container: Increased basis to 45vh */}
              <div className="w-full flex justify-center items-center bg-slate-900 shrink-1 basis-[45vh] min-h-[180px] overflow-hidden relative border-b border-slate-800">
                <LocationMap 
                  currentLocationId={playerState.locationId}
                  onMove={handleMove}
                  disabled={isGameOver}
                />
              </div>
              
              <ControlPanel 
                  onAction={handleAction} 
                  disabled={isGameOver} 
              />
            </div>

            {/* 2. Middle Section: Game Log */}
            {/* Takes all remaining space between Controls and NPC List */}
            <div className="flex-1 min-h-0 relative bg-slate-900 w-full">
               <div className="absolute inset-0">
                 <GameLog logs={logs} />
               </div>
            </div>
            
            {/* 3. Bottom Section: Dedicated NPC Area - Compact */}
            {/* Reduced fixed height to 54px */}
            <div className="flex-shrink-0 h-[54px] w-full z-20 relative bg-slate-900 border-t border-amber-900/30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
                <NPCList 
                  locationId={playerState.locationId}
                  onNpcInteraction={handleNpcInteraction}
                />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 w-full max-w-md mx-auto bg-slate-950 shadow-2xl overflow-hidden font-sans text-gray-100 flex flex-col">
      {/* Header (Fixed Top) */}
      <div className="bg-slate-900 text-amber-600 p-2 flex items-center justify-center border-b border-slate-800 shadow-md z-30 flex-shrink-0 h-[44px]">
        <Scroll size={16} className="mr-2" />
        <h1 className="text-base font-bold tracking-widest font-serif">无尽江湖</h1>
      </div>

      {/* Main Content Area (Flexible) */}
      <div className="flex-1 w-full min-h-0 relative">
        {renderContent()}
      </div>

      {/* Bottom Navigation (Fixed Bottom) - Hidden during combat */}
      {currentView !== 'combat' && (
        <div className="z-30 flex-shrink-0">
          <BottomNav currentView={currentView} onChangeView={setCurrentView} />
        </div>
      )}

      {/* Game Over Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-1000">
          <h2 className="text-5xl text-red-700 font-bold mb-6 font-serif tracking-widest border-b-2 border-red-900 pb-2">胜败乃兵家常事</h2>
          <p className="text-slate-400 mb-8">少侠请重新来过</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-slate-200 text-slate-900 rounded hover:bg-white transition-colors font-bold text-lg"
          >
            重入江湖
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
