
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PlayerState, AIResponseSchema, GameLogEntry } from "../types";

const apiKey = process.env.API_KEY;

// Helper to create the client ensures we always use the latest key if env changes
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: apiKey || 'dummy_key' });
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.STRING,
      description: "EXTREMELY CONCISE narrative (max 50 characters). Focus on atmosphere and immediate action only.",
    },
    hp_change: {
      type: Type.INTEGER,
      description: "The amount to add or subtract from player HP. Negative for damage.",
    },
    qi_change: {
      type: Type.INTEGER,
      description: "The amount to add or subtract from player Qi (Internal Energy).",
    },
    stamina_change: {
      type: Type.INTEGER,
      description: "The amount to add or subtract from player Stamina.",
    },
    location_update: {
      type: Type.STRING,
      description: "The new location name if the player moved. Null otherwise.",
      nullable: true
    },
    items_added: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of item names gained.",
    },
    items_removed: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of item names lost/consumed.",
    },
    is_game_over: {
      type: Type.BOOLEAN,
      description: "True if the player has died or reached a bad ending.",
    },
    suggested_actions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-3 short non-movement actions (e.g. 'Search', 'Meditate', 'Talk').",
    },
    nearby_locations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 2-4 names of adjacent locations the player can move to (e.g., 'Village North', 'Mountain Path'). Exclude the current location.",
    },
  },
  required: ["story", "hp_change", "qi_change", "stamina_change", "is_game_over", "suggested_actions", "nearby_locations"],
};

export const generateGameTurn = async (
  action: string,
  currentState: PlayerState,
  recentLogs: GameLogEntry[]
): Promise<AIResponseSchema> => {
  const ai = getAIClient();
  
  // Filter logs to last 6 to save tokens and keep context very tight
  const contextLogs = recentLogs.slice(-6).map(log => 
    `[${log.type === 'user' ? 'Player' : 'Game'}]: ${log.content}`
  ).join("\n");

  const prompt = `
    Role: You are the Dungeon Master for a Wuxia MUD.
    
    Current State:
    - HP: ${currentState.hp}/${currentState.maxHp}
    - Location: ${currentState.locationId}
    - Inventory: ${currentState.inventory.join(', ') || 'Empty'}
    
    History:
    ${contextLogs}
    
    Player Action: "${action}"
    
    STRICT OUTPUT RULES:
    1. "story": MUST be under 60 characters (Chinese). Very terse, classic Wuxia style (e.g. "Sword flashes. Enemy falls. The wind howls.").
    2. "nearby_locations": detailed names of places directly connected to current location.
    3. "location_update": only change if player successfully moved.
    4. Logic: Fighting drains HP/Stamina. Meditating restores Qi.
    5. Output valid JSON only.
    
    Language: SIMPLIFIED CHINESE (zh-CN).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIResponseSchema;
  } catch (error) {
    console.error("GenAI Error:", error);
    return {
      story: "心神不宁，眼前一片迷雾...",
      hp_change: 0,
      qi_change: 0,
      stamina_change: 0,
      items_added: [],
      items_removed: [],
      is_game_over: false,
      suggested_actions: ["原地调息"],
      nearby_locations: ["Unknown"]
    };
  }
};
