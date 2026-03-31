import React, { useState } from 'react';
import { Key, Shield, Lock, CheckCircle, Brain, Target, Cpu, Eye, EyeOff } from 'lucide-react';
import { Agent } from '../agents/prompts';
import { AIProvider, AIConfig } from '../api/aiClient';

interface KeyManagerProps {
  agentKeys: Record<string, string>;
  allAgents: Agent[];
  onUpdateKey: (id: string, key: string) => void;
  aiConfig: AIConfig;
  onUpdateAI: (config: Partial<AIConfig>) => void;
}

export const KeyManager = ({ agentKeys, allAgents, onUpdateKey, aiConfig, onUpdateAI }: KeyManagerProps) => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleShow = (id: string) => setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h3 className="text-xl font-bold text-white/90 uppercase tracking-tight flex items-center gap-3">
              <Brain className="w-5 h-5 text-blue-500" />
              Neural Strategy Center
           </h3>
           <p className="text-[10px] text-white/20 font-mono tracking-widest mt-1">CROSS-PROVIDER AI INFRASTRUCTURE · AUTHENTICATION LINK</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* AI Provider Config */}
        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Cpu className="w-32 h-32" />
           </div>
           
           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                   <div className="text-sm font-bold text-white/80 uppercase">Neural Engine Provider</div>
                   <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest mt-1">Active reasoning core</div>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
              {(['gemini', 'openai', 'ollama', 'anthropic'] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onUpdateAI({ provider: p })}
                  className={`py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    aiConfig.provider === p 
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                    : 'bg-white/5 border-white/5 text-white/20 hover:border-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
           </div>

           <div className="space-y-4 relative z-10 pt-4 border-t border-white/5">
              <div className="relative">
                <input 
                  type={showKeys['ai'] ? "text" : "password"}
                  value={aiConfig.apiKey || ""}
                  onChange={(e) => onUpdateAI({ apiKey: e.target.value })}
                  placeholder={`${aiConfig.provider.toUpperCase()} API KEY...`}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono text-white/60 focus:border-blue-500/40 transition-all"
                />
                <button onClick={() => toggleShow('ai')} className="absolute right-4 top-4 hover:text-white transition-colors opacity-30">
                  {showKeys['ai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {aiConfig.provider === 'ollama' && (
                <input 
                  type="text"
                  value={aiConfig.baseUrl || ""}
                  onChange={(e) => onUpdateAI({ baseUrl: e.target.value })}
                  placeholder="ENDPOINT (default: http://localhost:11434)"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-3 text-[10px] font-mono text-white/40 focus:border-blue-500/40 transition-all"
                />
              )}
           </div>
        </div>

        <div className="h-px bg-white/5 my-4" />

        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-2">Operative Tactical Keys</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allAgents.map(a => (
            <div key={a.id} className="p-4 rounded-3xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-4 group">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-inner" style={{ background: a.dimColor, color: a.color }}>
                        {a.icon}
                     </div>
                     <span className="text-xs font-bold text-white/50 group-hover:text-white/80 transition-colors">{a.codename}</span>
                  </div>
                  {agentKeys[a.id] ? <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/5" />}
               </div>
               <div className="relative">
                 <input 
                    type={showKeys[a.id] ? "text" : "password"}
                    value={agentKeys[a.id] || ""}
                    onChange={(e) => onUpdateKey(a.id, e.target.value)}
                    placeholder="molt_..." 
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-mono text-white/40 focus:border-white/20 transition-all"
                 />
                 <button onClick={() => toggleShow(a.id)} className="absolute right-3 top-3 hover:text-white transition-colors opacity-20 scale-75">
                    {showKeys[a.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
