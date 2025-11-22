
export interface CombatMove {
  id: string;
  name: string;
  description: string;
  apCost: number;
  qiCost: number;
  range: number; // 0 for self
  damageScale: number; // Multiplier of base attack (1.0 = 100%)
  healScale?: number; // For healing moves
  type: 'attack' | 'heal' | 'buff';
}

export interface MartialArt {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  type: 'inner' | 'outer' | 'light'; // 内功 (Inner), 外功 (Outer), 轻功 (Lightness)
  effects?: string[]; // Passive bonuses, e.g., "Attack +5"
  moves: CombatMove[]; // Active moves derived from this art
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  qi: number; // Internal energy
  maxQi: number;
  stamina: number;
  maxStamina: number;
  inventory: string[];
  skills: MartialArt[]; // New Skills field
  locationId: string; // Changed from string name to ID
  level: string;
  exp: number;
}

export interface GameLogEntry {
  id: string;
  type: 'narrative' | 'system' | 'user' | 'combat';
  content: string;
  timestamp: number;
}

// Martial Arts Realm/Rank
export type Realm = '不入流' | '三流武者' | '二流高手' | '一流高手' | '后天境界' | '先天宗师';

export interface NPC {
  id: string;
  name: string;
  title?: string; // e.g. "Village Chief"
  description: string;
  faction: string; // e.g. "None", "Beggar Sect"
  realm: Realm;
  hp: number;
  maxHp: number;
  inventory: string[];
  skills: string[]; // Names of skills
  attitude: 'friendly' | 'neutral' | 'hostile';
  dialogues: string[];
}

export interface LocationNode {
  id: string;
  name: string;
  description: string;
  // Coordinates for minimap (0,0 is center/start)
  x: number;
  y: number;
  // Connected location IDs (null if blocked)
  north?: string;
  south?: string;
  east?: string;
  west?: string;
  // Static items or enemies could go here
  enemies?: string[];
  items?: string[];
  npcIds?: string[]; // List of NPCs in this location
}

export interface GameWorld {
  locations: Record<string, LocationNode>;
  npcs: Record<string, NPC>;
}

export interface GameTurnResult {
  newState: PlayerState;
  logs: GameLogEntry[];
  nearbyLocations: { dir: string; name: string; id: string }[];
  isGameOver: boolean;
}

// --- COMBAT TYPES ---
export interface HexCoordinate {
  q: number;
  r: number;
}

export interface CombatEntity {
  id: string;
  name: string;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  qi: number;       // Added Qi
  maxQi: number;    // Added Max Qi
  position: HexCoordinate;
  actionPoints: number;
  maxActionPoints: number;
  avatarColor?: string; 
  moves?: CombatMove[]; // Available moves for this entity
}

export interface CombatState {
  turnCount: number;
  isPlayerTurn: boolean;
  entities: CombatEntity[];
  logs: GameLogEntry[];
  selectedHex?: HexCoordinate;
  gridRadius: number;
  winner?: 'player' | 'enemy';
  activeSkillId?: string; // ID of the skill currently selected for targeting
}

export interface AIResponseSchema {
  story: string;
  hp_change: number;
  qi_change: number;
  stamina_change: number;
  location_update?: string | null;
  items_added?: string[];
  items_removed?: string[];
  is_game_over: boolean;
  suggested_actions: string[];
  nearby_locations: string[];
}
