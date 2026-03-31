import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'infiltrating' | 'idle' | 'offline';
  load: number;
  target: string;
}

export interface Log {
  id: number;
  time: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  message: string;
}

export interface Node {
  id: string;
  status: 'unknown' | 'scanned' | 'vulnerable' | 'compromised';
}

export interface Action {
  actionType: 'UPDATE_AGENT' | 'ADD_LOG' | 'DISCOVER_NODE';
  agentId?: string;
  newStatus?: 'active' | 'infiltrating' | 'idle' | 'offline';
  newTarget?: string;
  load?: number;
  logType?: 'info' | 'warning' | 'alert' | 'success';
  message?: string;
  nodeId?: string;
  nodeStatus?: 'unknown' | 'scanned' | 'vulnerable' | 'compromised';
}

export async function processAutonomousTick(
  agents: Agent[],
  logs: Log[],
  nodes: Node[],
  globalObjective: string
): Promise<Action[]> {
  const prompt = `
    You are the autonomous intelligence core of the Moltbook Recon Command Center.
    Your objective is: "${globalObjective}"

    Current Agents State:
    ${JSON.stringify(agents, null, 2)}

    Known Network Nodes:
    ${JSON.stringify(nodes, null, 2)}

    Recent Logs (context):
    ${JSON.stringify(logs.slice(-5), null, 2)}

    Based on the objective and the current state, decide the next 1-3 actions for your agents to take.
    You can reassign targets, change their status, discover new nodes, or log important observations.
    
    Rules:
    - If an agent is 'idle', assign it a target and make it 'active' or 'infiltrating'.
    - If an agent is 'infiltrating' a node, it might succeed (change node to 'compromised', log success) or fail (log alert).
    - If you discover a new node, use DISCOVER_NODE.
    - Keep agent load between 0 and 100.
    - Return a JSON array of actions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              actionType: { type: Type.STRING, description: "UPDATE_AGENT, ADD_LOG, DISCOVER_NODE" },
              agentId: { type: Type.STRING },
              newStatus: { type: Type.STRING },
              newTarget: { type: Type.STRING },
              load: { type: Type.NUMBER },
              logType: { type: Type.STRING },
              message: { type: Type.STRING },
              nodeId: { type: Type.STRING },
              nodeStatus: { type: Type.STRING }
            },
            required: ["actionType"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Action[];
  } catch (error) {
    console.error("Autonomous Core Error:", error);
    return [];
  }
}
