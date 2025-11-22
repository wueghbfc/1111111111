
import { PlayerState, GameLogEntry, GameWorld, GameTurnResult, NPC } from "../types";

// --- NPC DATA ---
const NPC_REGISTRY: Record<string, NPC> = {
  'village_chief': {
    id: 'village_chief',
    name: '王村长',
    title: '无名荒村村长',
    description: '一个慈眉善目的老人，拄着拐杖，在这个荒村生活了一辈子。',
    faction: '无门无派',
    realm: '不入流',
    hp: 50,
    maxHp: 50,
    inventory: ['粗布衣', '烟袋锅'],
    skills: ['种地', '砍柴'],
    attitude: 'friendly',
    dialogues: [
      '年轻人，外面世道乱，出门在外要小心啊。',
      '听说西边的残剑门以前可是个大门派，可惜了...',
      '村口的李大娘做的烧饼可好吃了。'
    ]
  },
  'beggar_li': {
    id: 'beggar_li',
    name: '李二狗',
    title: '流浪乞丐',
    description: '衣衫褴褛，浑身散发着异味，但眼神中偶尔闪过一丝精光。',
    faction: '丐帮(疑似)',
    realm: '三流武者',
    hp: 120,
    maxHp: 120,
    inventory: ['发霉的馒头', '破碗', '打狗棒法残页'],
    skills: ['莲花落', '太祖长拳'],
    attitude: 'neutral',
    dialogues: [
      '行行好，给口吃的吧...',
      '嘿嘿，别看我穿得破，我知道的消息可不少。',
      '这江湖啊，就是大鱼吃小鱼。'
    ]
  },
  'sect_disciple': {
    id: 'sect_disciple',
    name: '巡山弟子',
    title: '残剑门弟子',
    description: '身穿灰袍，背负长剑，神色傲慢。',
    faction: '残剑门',
    realm: '二流高手',
    hp: 300,
    maxHp: 300,
    inventory: ['精铁剑', '跌打酒', '门派令牌'],
    skills: ['残风剑法', '轻身术'],
    attitude: 'hostile',
    dialogues: [
      '残剑门重地，闲杂人等速速离开！',
      '看什么看，没见过名门正派的弟子吗？',
      '师父说最近山下不太平。'
    ]
  }
};

// --- STATIC GAME DATA ---

const WORLD_MAP: GameWorld = {
  npcs: NPC_REGISTRY,
  locations: {
    'start_village': {
      id: 'start_village',
      name: '无名荒村',
      description: '一座破败的小村庄，四周杂草丛生，只有几间摇摇欲坠的茅屋。',
      x: 0, y: 0,
      north: 'path_1',
      items: ['破旧的草鞋'],
      npcIds: ['village_chief', 'beggar_li']
    },
    'path_1': {
      id: 'path_1',
      name: '崎岖山道',
      description: '蜿蜒向上的山路，碎石遍地，两旁树木枯黄。',
      x: 0, y: 1,
      south: 'start_village',
      north: 'path_2',
      east: 'forest_edge'
    },
    'forest_edge': {
      id: 'forest_edge',
      name: '迷雾林边缘',
      description: '光线昏暗，空气中弥漫着腐烂树叶的味道。',
      x: 1, y: 1,
      west: 'path_1',
      north: 'deep_forest'
    },
    'deep_forest': {
      id: 'deep_forest',
      name: '迷雾林深处',
      description: '四周白雾茫茫，隐约传来野兽的低吼。',
      x: 1, y: 2,
      south: 'forest_edge'
    },
    'path_2': {
      id: 'path_2',
      name: '半山腰',
      description: '视野稍微开阔了一些，可以看到远处的群山连绵。',
      x: 0, y: 2,
      south: 'path_1',
      north: 'sect_gate',
      west: 'cliff',
      npcIds: ['sect_disciple'] 
    },
    'cliff': {
      id: 'cliff',
      name: '断魂崖',
      description: '深不见底的悬崖，寒风呼啸，令人胆寒。',
      x: -1, y: 2,
      east: 'path_2'
    },
    'sect_gate': {
      id: 'sect_gate',
      name: '残剑门山门',
      description: '曾经辉煌的门派如今只剩断壁残垣，巨大的石剑斜插在广场中央。',
      x: 0, y: 3,
      south: 'path_2',
      north: 'sect_hall',
      npcIds: ['sect_disciple']
    },
    'sect_hall': {
      id: 'sect_hall',
      name: '破败大殿',
      description: '大殿顶棚已塌了大半，供奉的神像布满蛛网。',
      x: 0, y: 4,
      south: 'sect_gate'
    }
  }
};

// --- LOGIC ---

const createLog = (content: string, type: GameLogEntry['type'] = 'system'): GameLogEntry => ({
  id: Math.random().toString(36).substr(2, 9),
  type,
  content,
  timestamp: Date.now()
});

export const getInitialState = (): PlayerState => ({
  hp: 100,
  maxHp: 100,
  qi: 50,
  maxQi: 100,
  stamina: 100,
  maxStamina: 100,
  inventory: ['生锈的铁剑', '干粮'],
  skills: [
    {
      id: 'basic_fist',
      name: '市井长拳',
      type: 'outer',
      level: 1,
      maxLevel: 10,
      description: '江湖中流传最广的入门拳法，招式简单实用。',
      effects: ['攻击力 +5', '命中率 +2%'],
      moves: [
        {
          id: 'fist_1',
          name: '黑虎掏心',
          description: '一记直拳猛击对手心窝。',
          apCost: 2,
          qiCost: 0,
          range: 1,
          damageScale: 1.2,
          type: 'attack'
        },
        {
          id: 'fist_2',
          name: '双风贯耳',
          description: '双拳同时击打对手太阳穴，威力尚可。',
          apCost: 3,
          qiCost: 5,
          range: 1,
          damageScale: 1.5,
          type: 'attack'
        }
      ]
    },
    {
      id: 'basic_breath',
      name: '无名吐纳法',
      type: 'inner',
      level: 1,
      maxLevel: 5,
      description: '一种粗浅的呼吸法门，勉强可以聚集一丝内力。',
      effects: ['内力上限 +20', '调息效果 +10%'],
      moves: [
        {
          id: 'breath_1',
          name: '气沉丹田',
          description: '原地调息，恢复少量气血和内力。',
          apCost: 3,
          qiCost: 0,
          range: 0, // Self
          damageScale: 0,
          healScale: 15,
          type: 'heal'
        }
      ]
    }
  ],
  locationId: 'start_village',
  level: '初入江湖',
  exp: 0
});

export const getLocationInfo = (locationId: string) => {
  return WORLD_MAP.locations[locationId];
};

export const getAllLocations = () => {
  return Object.values(WORLD_MAP.locations);
};

export const getNPCsInLocation = (locationId: string): NPC[] => {
  const loc = WORLD_MAP.locations[locationId];
  if (!loc || !loc.npcIds) return [];
  return loc.npcIds.map(id => WORLD_MAP.npcs[id]).filter(Boolean);
};

export const getNPC = (npcId: string): NPC | undefined => {
  return WORLD_MAP.npcs[npcId];
};

// --- NPC Interaction Logic Helpers ---

export const interactWithNPC = (npcId: string, type: 'CHAT' | 'STEAL' | 'POISON', playerState: PlayerState): { logs: GameLogEntry[], success: boolean, itemObtained?: string } => {
  const npc = NPC_REGISTRY[npcId];
  if (!npc) return { logs: [], success: false };

  const logs: GameLogEntry[] = [];
  let success = false;
  let itemObtained = undefined;

  switch (type) {
    case 'CHAT':
      const randomDialogue = npc.dialogues[Math.floor(Math.random() * npc.dialogues.length)];
      logs.push(createLog(`${npc.name}: “${randomDialogue}”`, 'narrative'));
      success = true;
      break;
    
    case 'STEAL':
      const stealChance = 0.3; // 30% base chance
      if (Math.random() < stealChance) {
        success = true;
        if (npc.inventory.length > 0) {
           // Simple mock: just duplicate item
           const itemIndex = Math.floor(Math.random() * npc.inventory.length);
           itemObtained = npc.inventory[itemIndex];
           logs.push(createLog(`你趁${npc.name}不备，伸手顺走了【${itemObtained}】！`, 'system'));
        } else {
           logs.push(createLog(`你摸了摸${npc.name}的口袋，结果比你的脸还干净。`, 'system'));
        }
      } else {
        logs.push(createLog(`你刚伸出手就被${npc.name}发现了！${npc.name}怒目而视。`, 'combat'));
      }
      break;

    case 'POISON':
      if (playerState.inventory.includes('蒙汗药') || playerState.inventory.includes('劣质毒药')) {
         if (Math.random() < 0.5) {
           success = true;
           logs.push(createLog(`你悄悄在${npc.name}的水杯里下了药，看着他喝了下去。`, 'system'));
         } else {
           logs.push(createLog(`你下药的手法太拙劣了，被${npc.name}当场识破！`, 'combat'));
         }
      } else {
        logs.push(createLog(`你身上没有毒药，无法下毒。`, 'system'));
      }
      break;
  }

  return { logs, success, itemObtained };
};


export const getNearbyLocations = (currentId: string) => {
  const loc = WORLD_MAP.locations[currentId];
  if (!loc) return [];
  
  const nearby = [];
  if (loc.north) nearby.push({ dir: '北', id: loc.north, name: WORLD_MAP.locations[loc.north].name });
  if (loc.south) nearby.push({ dir: '南', id: loc.south, name: WORLD_MAP.locations[loc.south].name });
  if (loc.east) nearby.push({ dir: '东', id: loc.east, name: WORLD_MAP.locations[loc.east].name });
  if (loc.west) nearby.push({ dir: '西', id: loc.west, name: WORLD_MAP.locations[loc.west].name });
  return nearby;
};

export const processTurn = (action: string, state: PlayerState): GameTurnResult => {
  let newState = { ...state };
  const logs: GameLogEntry[] = [];
  let isGameOver = false;

  // Movement Logic
  if (action.startsWith('MOVE_')) {
    const targetId = action.replace('MOVE_', '');
    const targetLoc = WORLD_MAP.locations[targetId];
    
    if (targetLoc) {
      newState.locationId = targetId;
      newState.stamina = Math.max(0, newState.stamina - 2);
      logs.push(createLog(`你来到了${targetLoc.name}。`, 'narrative'));
      logs.push(createLog(targetLoc.description, 'narrative'));
      
      // Display NPCs encountered
      if (targetLoc.npcIds && targetLoc.npcIds.length > 0) {
        const npcNames = targetLoc.npcIds.map(id => WORLD_MAP.npcs[id].name).join('、');
        logs.push(createLog(`你看到这里有：${npcNames}`, 'narrative'));
      }

      // Random Encounter Chance (Reduced if NPCs are present to avoid spam)
      if (Math.random() < 0.1 && targetId !== 'start_village') {
        newState.hp -= 5;
        logs.push(createLog('路边突然窜出一只野狗，咬了你一口！(气血 -5)', 'combat'));
      }
    }
  } 
  // Action Logic
  else {
    switch (action) {
      case '打坐调息':
        if (newState.stamina < 10) {
          logs.push(createLog('你太累了，无法集中精神打坐。', 'system'));
        } else {
          const qiGain = 10 + Math.floor(Math.random() * 5);
          const hpGain = 5;
          newState.qi = Math.min(newState.maxQi, newState.qi + qiGain);
          newState.hp = Math.min(newState.maxHp, newState.hp + hpGain);
          newState.stamina -= 10;
          logs.push(createLog(`你盘膝而坐，运转周天。内力恢复了 ${qiGain} 点，气血恢复了 ${hpGain} 点。`, 'system'));
        }
        break;
      
      case '观察四周':
        const loc = WORLD_MAP.locations[newState.locationId];
        logs.push(createLog(loc.description, 'narrative'));
        
        // Items
        if (loc.items && loc.items.length > 0) {
           logs.push(createLog(`你发现这里似乎有：${loc.items.join(', ')}`, 'system'));
        }
        
        // NPCs
        if (loc.npcIds && loc.npcIds.length > 0) {
           const descriptions = loc.npcIds.map(id => {
             const n = WORLD_MAP.npcs[id];
             return `${n.name}(${n.title})：${n.description}`;
           }).join('\n');
           logs.push(createLog(`人物：\n${descriptions}`, 'system'));
        } else if (!loc.items || loc.items.length === 0) {
           logs.push(createLog('这里除了尘土，什么也没有。', 'system'));
        }
        break;

      case '搜寻物品':
        const currentLoc = WORLD_MAP.locations[newState.locationId];
        if (currentLoc.items && currentLoc.items.length > 0) {
           const item = currentLoc.items.shift(); // Simple mock: remove item from world (in memory only for this session)
           if (item) {
             newState.inventory = [...newState.inventory, item];
             logs.push(createLog(`你仔细搜寻，找到了一件【${item}】！`, 'system'));
           }
        } else {
           newState.stamina -= 5;
           logs.push(createLog('你翻找了半天，一无所获，反而弄得灰头土脸。(体力 -5)', 'system'));
        }
        break;

      default:
        logs.push(createLog('你发呆了一会儿，什么也没做。', 'system'));
        break;
    }
  }

  if (newState.hp <= 0) {
    isGameOver = true;
    logs.push(createLog('你眼前一黑，倒在了江湖的尘埃中...', 'system'));
  }

  return {
    newState,
    logs,
    nearbyLocations: getNearbyLocations(newState.locationId),
    isGameOver
  };
};
