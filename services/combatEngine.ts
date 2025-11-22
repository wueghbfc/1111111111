
import { CombatState, CombatEntity, HexCoordinate, PlayerState, NPC, GameLogEntry, CombatMove } from "../types";

const HEX_SIZE = 26;
const GRID_RADIUS = 3;

// --- HEX GRID MATH ---
// Axial coordinates (q, r) to Pixel coordinates (x, y)
export const hexToPixel = (hex: HexCoordinate): { x: number, y: number } => {
  const x = HEX_SIZE * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r);
  const y = HEX_SIZE * (3 / 2 * hex.r);
  return { x, y };
};

// Hex Distance
export const getHexDistance = (a: HexCoordinate, b: HexCoordinate): number => {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
};

export const areHexesEqual = (a: HexCoordinate | undefined, b: HexCoordinate | undefined): boolean => {
  if (!a || !b) return false;
  return a.q === b.q && a.r === b.r;
};

// Generate Grid
export const generateHexGrid = (radius: number): HexCoordinate[] => {
  const hexes: HexCoordinate[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      hexes.push({ q, r });
    }
  }
  return hexes;
};

// --- COMBAT LOGIC ---

const createCombatLog = (content: string): GameLogEntry => ({
  id: Math.random().toString(36).substring(2),
  type: 'combat',
  content,
  timestamp: Date.now()
});

export const initializeCombat = (player: PlayerState, enemy: NPC): CombatState => {
  // Flatten all moves from skills for easier access during combat
  const playerMoves = player.skills.flatMap(s => s.moves);

  const playerEntity: CombatEntity = {
    id: 'player',
    name: '你',
    isPlayer: true,
    hp: player.hp,
    maxHp: player.maxHp,
    qi: player.qi,
    maxQi: player.maxQi,
    position: { q: 0, r: 2 }, // Start at bottom
    actionPoints: 3,
    maxActionPoints: 3,
    avatarColor: '#3b82f6', // blue-500
    moves: playerMoves
  };

  const enemyEntity: CombatEntity = {
    id: enemy.id,
    name: enemy.name,
    isPlayer: false,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    qi: 100, // Default NPC Qi
    maxQi: 100,
    position: { q: 0, r: -2 }, // Start at top
    actionPoints: 3,
    maxActionPoints: 3,
    avatarColor: '#ef4444' // red-500
  };

  return {
    turnCount: 1,
    isPlayerTurn: true,
    entities: [playerEntity, enemyEntity],
    logs: [createCombatLog(`遭遇了 ${enemy.name}！战斗开始！`)],
    gridRadius: GRID_RADIUS
  };
};

export const moveEntity = (state: CombatState, entityId: string, targetHex: HexCoordinate): CombatState => {
  const newState = { ...state, entities: [...state.entities] };
  const entityIndex = newState.entities.findIndex(e => e.id === entityId);
  if (entityIndex === -1) return state;

  const entity = { ...newState.entities[entityIndex] };
  const dist = getHexDistance(entity.position, targetHex);
  const cost = dist; // 1 AP per hex

  if (entity.actionPoints >= cost) {
    entity.position = targetHex;
    entity.actionPoints -= cost;
    newState.entities[entityIndex] = entity;
    newState.logs = [...newState.logs, createCombatLog(`${entity.name} 移动到了新的位置。`)];
    newState.selectedHex = undefined;
    newState.activeSkillId = undefined; // Clear selected skill on move
  } else {
    newState.logs = [...newState.logs, createCombatLog(`${entity.name} 体力不足，无法移动。`)];
  }

  return newState;
};

// Execute a Skill Move
export const performSkill = (state: CombatState, attackerId: string, targetId: string, moveId: string): CombatState => {
    const newState = { ...state, entities: [...state.entities] };
    const attackerIdx = newState.entities.findIndex(e => e.id === attackerId);
    const targetIdx = newState.entities.findIndex(e => e.id === targetId);

    if (attackerIdx === -1) return state; // Should check targetIdx inside logic for self-casts

    const attacker = { ...newState.entities[attackerIdx] };
    
    // Find the move
    const move = attacker.moves?.find(m => m.id === moveId);
    if (!move) return state;

    // Check Costs
    if (attacker.actionPoints < move.apCost) {
        newState.logs = [...newState.logs, createCombatLog(`${attacker.name} 动作太慢，无法施展 ${move.name}！(需AP: ${move.apCost})`)];
        return newState;
    }
    if (attacker.qi < move.qiCost) {
        newState.logs = [...newState.logs, createCombatLog(`${attacker.name} 内力不足，无法施展 ${move.name}！(需内力: ${move.qiCost})`)];
        return newState;
    }

    // Handle Targeting & Range
    if (move.range === 0) {
        // Self Cast (Heal/Buff)
        if (move.type === 'heal' && move.healScale) {
            const healAmount = move.healScale;
            attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
            
            newState.logs = [...newState.logs, createCombatLog(`${attacker.name} 施展【${move.name}】，恢复了 ${healAmount} 点气血。`)];
        }
        // Deduct Costs
        attacker.actionPoints -= move.apCost;
        attacker.qi -= move.qiCost;
        newState.entities[attackerIdx] = attacker;

    } else {
        // Targeted Attack
        if (targetIdx === -1) return state;
        const target = { ...newState.entities[targetIdx] };

        const dist = getHexDistance(attacker.position, target.position);
        if (dist > move.range) {
             newState.logs = [...newState.logs, createCombatLog(`${attacker.name} 距离太远，无法击中目标！`)];
             return newState;
        }

        // Calculate Damage
        // Base dmg 10 + random. Scaled by move.
        const baseDmg = 10 + Math.floor(Math.random() * 5);
        const totalDmg = Math.floor(baseDmg * move.damageScale);
        
        target.hp = Math.max(0, target.hp - totalDmg);
        
        newState.logs = [...newState.logs, createCombatLog(`${attacker.name} 施展【${move.name}】击中对手，造成 ${totalDmg} 点伤害！`)];

        if (target.hp <= 0) {
             newState.logs = [...newState.logs, createCombatLog(`${target.name} 惨叫一声，倒地不起！`)];
             newState.winner = attacker.isPlayer ? 'player' : 'enemy';
        }

        // Deduct Costs
        attacker.actionPoints -= move.apCost;
        attacker.qi -= move.qiCost;

        newState.entities[attackerIdx] = attacker;
        newState.entities[targetIdx] = target;
    }

    newState.activeSkillId = undefined; // Reset active skill
    return newState;
};

export const endTurn = (state: CombatState): CombatState => {
    let newState = { ...state };
    
    // Switch Turn
    newState.isPlayerTurn = !newState.isPlayerTurn;
    newState.selectedHex = undefined;
    newState.activeSkillId = undefined;

    // Reset AP
    newState.entities = newState.entities.map(e => ({
        ...e,
        actionPoints: e.maxActionPoints
    }));

    if (newState.isPlayerTurn) {
        newState.logs = [...newState.logs, createCombatLog(`第 ${newState.turnCount + 1} 回合开始。`)];
        newState.turnCount += 1;
    } else {
        // Enemy AI Turn
        newState = processEnemyTurn(newState);
    }

    return newState;
};

const processEnemyTurn = (state: CombatState): CombatState => {
    let newState = { ...state };
    const enemy = newState.entities.find(e => !e.isPlayer);
    const player = newState.entities.find(e => e.isPlayer);

    if (!enemy || !player || enemy.hp <= 0) return newState;

    newState.logs = [...newState.logs, createCombatLog(`${enemy.name} 正在行动...`)];

    // Simple AI:
    // 1. If next to player, attack.
    // 2. If not, move towards player.
    
    const enemyIdx = newState.entities.findIndex(e => !e.isPlayer);
    let currentEnemy = { ...newState.entities[enemyIdx] };

    // Loop while AP > 0
    while (currentEnemy.actionPoints > 0) {
        const dist = getHexDistance(currentEnemy.position, player.position);

        if (dist === 1 && currentEnemy.actionPoints >= 2) {
            // Basic Attack Mockup (Since NPCs don't have full moves yet)
             const dmg = 8 + Math.floor(Math.random() * 4);
             const playerIdx = newState.entities.findIndex(e => e.isPlayer);
             const target = { ...newState.entities[playerIdx] };
             
             target.hp = Math.max(0, target.hp - dmg);
             currentEnemy.actionPoints -= 2;
             
             newState.entities[playerIdx] = target;
             newState.logs = [...newState.logs, createCombatLog(`${enemy.name} 凶猛地攻击，你受到了 ${dmg} 点伤害！`)];

             if (target.hp <= 0) {
                 newState.logs = [...newState.logs, createCombatLog(`你不敌对手，倒下了...`)];
                 newState.winner = 'enemy';
                 break; // End fight
             }
        } else if (dist > 1 && currentEnemy.actionPoints >= 1) {
            // Move towards player
            const neighbors = [
                { q: currentEnemy.position.q + 1, r: currentEnemy.position.r },
                { q: currentEnemy.position.q - 1, r: currentEnemy.position.r },
                { q: currentEnemy.position.q, r: currentEnemy.position.r + 1 },
                { q: currentEnemy.position.q, r: currentEnemy.position.r - 1 },
                { q: currentEnemy.position.q + 1, r: currentEnemy.position.r - 1 },
                { q: currentEnemy.position.q - 1, r: currentEnemy.position.r + 1 },
            ];
            
            let bestMove = null;
            let minD = dist;

            for (const n of neighbors) {
                const d = getHexDistance(n, player.position);
                if (d < minD) {
                    minD = d;
                    bestMove = n;
                }
            }

            if (bestMove) {
                currentEnemy.position = bestMove;
                currentEnemy.actionPoints -= 1;
                newState.logs = [...newState.logs, createCombatLog(`${enemy.name} 向你逼近。`)];
            } else {
                break;
            }
        } else {
            break;
        }
    }

    newState.entities[enemyIdx] = currentEnemy;

    // Pass turn back to player
    newState.isPlayerTurn = true;
    newState.entities = newState.entities.map(e => ({...e, actionPoints: e.maxActionPoints}));
    newState.turnCount += 1;
    newState.logs = [...newState.logs, createCombatLog(`轮到你了。`)];

    return newState;
}
