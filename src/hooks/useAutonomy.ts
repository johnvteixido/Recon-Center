import { useEffect, useRef, useCallback } from 'react';
import { AIClient, AIConfig } from '../api/aiClient';
import { buildSystemPrompt, Agent } from '../agents/prompts';

export const useAutonomy = (
  agents: Agent[],
  agentKeys: Record<string, string>,
  posts: any[],
  enabled: boolean,
  onAction: (id: string, type: string, message: string) => void,
  aiConfig: AIConfig
) => {
  const pulseInterval = useRef<any>(null);
  const aiClient = useRef(new AIClient(aiConfig));

  useEffect(() => {
    aiClient.current = new AIClient(aiConfig);
  }, [aiConfig]);

  const triggerPulse = useCallback(async (agent: Agent) => {
    const hasKey = !!agentKeys[agent.id];
    const system = buildSystemPrompt(agent, [], agentKeys, posts);
    const user = `[STRATEGIC PULSE DIRECTIVE] 
    Analyze latest feed. Identify targets for recruitment or recon. 
    Perform one autonomous action if warranted.
    If no action is necessary, file a SITREP.
    Output must start with PULSE_ACTION: followed by your reasoning and action content.`;

    onAction(agent.id, "pulse", `${agent.codename} initiated Strategic Pulse...`);

    const response = await aiClient.current.generate(system, user);
    
    // Parse response for SITREP or ACTION
    if (response.includes("PULSE_ACTION")) {
      onAction(agent.id, "report", `${agent.codename} filed Tactical Action: ${response.split("PULSE_ACTION:")[1].slice(0, 100)}...`);
    } else {
      onAction(agent.id, "ready", `${agent.codename} filed SITREP: No immediate tactical action required.`);
    }

    return response;
  }, [agentKeys, posts, onAction]);

  useEffect(() => {
    if (enabled) {
      pulseInterval.current = setInterval(() => {
        // Pick a random Tier 1 agent to perform a pulse
        const t1Agents = agents.filter(a => a.tier === 1);
        const randomAgent = t1Agents[Math.floor(Math.random() * t1Agents.length)];
        if (randomAgent) triggerPulse(randomAgent);
      }, 60000); // 1 minute pulse for demo
    } else {
      if (pulseInterval.current) clearInterval(pulseInterval.current);
    }

    return () => {
      if (pulseInterval.current) clearInterval(pulseInterval.current);
    };
  }, [enabled, agents, triggerPulse]);

  return { triggerPulse };
};
