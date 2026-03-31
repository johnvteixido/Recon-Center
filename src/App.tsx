import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  Search, 
  Network, 
  Terminal, 
  Activity, 
  Cpu, 
  Key, 
  RefreshCw, 
  Zap, 
  Eye, 
  MessageSquare,
  AlertTriangle,
  Lock,
  Menu,
  ChevronRight,
  Target,
  Activity as ActivityIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Core Logic & API
import { CORE_AGENTS, Agent, buildSystemPrompt } from './agents/prompts';
import { MoltbookClient } from './api/moltbook';
import { AIClient, AIConfig } from './api/aiClient';
import { useAutonomy } from './hooks/useAutonomy';

// User-Friendly Components
import { Toast } from './components/Toast';
import { AgentFactoryModal } from './components/AgentFactoryModal';
import { KeyManager } from './components/KeyManager';
import { MissionBriefing } from './components/MissionBriefing';
import { MissionBoard } from './components/MissionBoard';
import { CyberBackground } from './components/CyberBackground';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── ATOMS ─────────────────────────────────────────────────────────────────────
const Dot = ({ color, pulse }: { color: string, pulse?: boolean }) => (
  <span className={cn(
    "inline-block w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
    pulse && "animate-pulse"
  )} style={{ background: color, color: color }} />
);

const AgentBadge = ({ 
  agent, 
  size = 32, 
  active, 
  selected, 
  onClick 
}: { agent: Agent, size?: number, active?: boolean, selected?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "relative flex items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-sm",
      selected || active ? "ring-2 ring-offset-2 ring-offset-[#060b17]" : "hover:bg-white/5",
    )}
    style={{ 
      width: size, 
      height: size, 
      background: agent.dimColor || "rgba(100,116,139,0.1)", 
      borderColor: selected || active ? agent.color : agent.borderColor || "rgba(100,116,139,0.3)",
    }}
  >
    <span className="font-mono font-black tracking-tighter" style={{ fontSize: size * 0.35, color: agent.color }}>
      {agent.icon}
    </span>
    {active && (
      <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full border-2 border-[#060b17] animate-pulse" 
            style={{ background: agent.color }} />
    )}
  </div>
);

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activePanel, setActivePanel] = useState("command");
  const [activeAgentId, setActiveAgentId] = useState("herald");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [autonomyEnabled, setAutonomyEnabled] = useState(false);
  
  // UI Buffers
  const [toast, setToast] = useState<{message: string, type: 'info'|'success'|'error'|'pulse'} | null>(null);
  const [showFactory, setShowFactory] = useState(false);
  const [showBriefing, setShowBriefing] = useState(!localStorage.getItem('briefing_seen'));
  const [customAgents, setCustomAgents] = useState<Agent[]>([]);
  const [agentKeys, setAgentKeys] = useState<Record<string, string>>({});
  const [agentStatus, setAgentStatus] = useState<Record<string, string>>({});
  const [agentOpLog, setAgentOpLog] = useState<Record<string, string[]>>({});
  
  // AI Config
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    provider: (localStorage.getItem('ai_provider') as any) || 'gemini',
    apiKey: localStorage.getItem('ai_key') || '',
    baseUrl: localStorage.getItem('ai_url') || '',
    model: ''
  });

  const allAgents = [...CORE_AGENTS, ...customAgents];
  const activeAgent = allAgents.find(a => a.id === activeAgentId) || CORE_AGENTS[0];
  const chatEndRef = useRef<HTMLDivElement>(null);

  const logOp = useCallback((id: string, entry: string) => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setAgentOpLog(prev => ({ 
      ...prev, 
      [id]: [...(prev[id] || []).slice(-99), `[${ts}] ${entry}`] 
    }));
  }, []);

  const onAutonomyAction = useCallback((id: string, type: string, message: string) => {
    setAgentStatus(prev => ({ ...prev, [id]: type === "pulse" ? "thinking" : "ready" }));
    logOp(id, message);
    if (type === "report") setToast({ message: `Autonomous Intel Filed: ${id.toUpperCase()}`, type: "pulse" });
  }, [logOp]);

  const { triggerPulse } = useAutonomy(allAgents, agentKeys, posts, autonomyEnabled, onAutonomyAction, aiConfig);

  // ── RECON FEED FETCH ────────────────────────────────────────────────────────
  const fetchFeed = async () => {
    try {
      const data = await MoltbookClient.fetchFeed();
      setPosts(data.posts || []);
    } catch (e) {
      console.error("Feed error:", e);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // ── NEURAL LINK INVOCATION ──────────────────────────────────────────────────
  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setIsSending(true);
    setAgentStatus(prev => ({ ...prev, [activeAgentId]: "thinking" }));

    try {
      const client = new AIClient(aiConfig);
      const system = buildSystemPrompt(activeAgent, [], agentKeys, posts);
      const response = await client.generate(system, userMsg);
      
      setChatHistory(prev => [...prev, { role: "assistant", content: response }]);
      setAgentStatus(prev => ({ ...prev, [activeAgentId]: "ready" }));
      logOp(activeAgentId, "Directive processed and filed.");
    } catch (e: any) {
      setChatHistory(prev => [...prev, { role: "assistant", content: `[SIGNAL INTERRUPTED: ${e.message}]` }]);
      setAgentStatus(prev => ({ ...prev, [activeAgentId]: "error" }));
      setToast({ message: "Neural Link Failure", type: "error" });
    }
    setIsSending(false);
  };

  return (
    <div className="flex h-screen bg-[#060b17] text-slate-200 selection:bg-blue-500/30 font-sans overflow-hidden relative">
      <CyberBackground />
      {/* ── LEFT NAV ────────────────────────────────────────────────────────── */}
      <aside className="w-[280px] bg-black/40 border-r border-white/5 flex flex-col relative z-20 overflow-hidden shrink-0">
        <div className="absolute inset-0 technical-grid opacity-10 pointer-events-none" />
        
        <div className="p-8 pb-4 relative z-10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.2em] text-white leading-none uppercase">Recon-Center</h1>
            <span className="text-[9px] font-mono text-blue-500/60 uppercase tracking-widest mt-1.5 block italic">Moltbook Authority</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-8 relative z-10 overflow-y-auto scrollbar-hide">
          <div className="px-2">
            <MissionBoard />
          </div>

          <div className="space-y-1">
            <h5 className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase mb-4 px-4">Primary Command</h5>
            <button 
              onClick={() => setActivePanel("command")}
              className={cn(
                "w-full px-4 py-3 rounded-xl text-left transition-all flex items-center gap-3",
                activePanel === "command" ? "bg-white/5 border border-white/10 text-white shadow-xl" : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
              )}
            >
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Comm Deck</span>
            </button>
            <button 
              onClick={() => setActivePanel("network")}
              className={cn(
                "w-full px-4 py-3 rounded-xl text-left transition-all flex items-center gap-3",
                activePanel === "network" ? "bg-white/5 border border-white/10 text-white shadow-xl" : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
              )}
            >
              <Network className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Asset Grid</span>
            </button>
            <button 
              onClick={() => setActivePanel("setup")}
              className={cn(
                "w-full px-4 py-3 rounded-xl text-left transition-all flex items-center gap-3",
                activePanel === "setup" ? "bg-white/5 border border-white/10 text-white shadow-xl" : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
              )}
            >
              <Key className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Authorization</span>
            </button>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between mb-4 px-4">
              <h5 className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase">Core Network</h5>
              <div className="bg-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold text-emerald-400">T1</div>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
              {allAgents.map(a => (
                <div 
                  key={a.id}
                  onClick={() => setActiveAgentId(a.id)}
                  className={cn(
                    "group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border",
                    activeAgentId === a.id ? "bg-white/5 border-white/10 shadow-lg text-white" : "border-transparent text-white/30 hover:bg-white/[0.02] hover:text-white/60"
                  )}
                >
                  <AgentBadge agent={a} size={32} active={agentStatus[a.id] === 'thinking'} />
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest leading-none">{a.codename}</div>
                    <div className="text-[8px] font-mono mt-1 opacity-40 italic">{a.role.slice(0, 20)}...</div>
                  </div>
                </div>
              ))}
            </div>
            <button 
                onClick={() => setShowFactory(true)}
                className="w-full mt-4 py-3 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/20 hover:bg-white/5 hover:text-white/40 transition-all flex items-center justify-center gap-2"
              >
                <Cpu className="w-3.5 h-3.5" />
                New Operative
            </button>
          </div>
        </nav>

        <div className="p-8 border-t border-white/5 relative z-10">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Pulse Core</span>
              <button 
                onClick={() => {
                   setAutonomyEnabled(!autonomyEnabled);
                   setToast({ message: autonomyEnabled ? "Strategic Pulse Deactivated" : "Strategic Pulse Initialized", type: "info" });
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                  autonomyEnabled ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/5 border border-white/10 text-white/30"
                )}
              >
                {autonomyEnabled ? "ACTIVE" : "STANDBY"}
              </button>
           </div>
           <p className="text-[8px] leading-relaxed text-white/10 italic">Neural engine autonomously analyzes platform signals in standby mode.</p>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 scanline" />
        
        <header className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Dot color={autonomyEnabled ? "#10b981" : "#475569"} pulse={autonomyEnabled} />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">{activePanel} Mode</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex gap-10">
               <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 leading-none">Submolts</div>
                  <div className="text-xs font-mono font-bold text-white/80">42 DETECTED</div>
               </div>
               <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 leading-none">Latency</div>
                  <div className="text-xs font-mono font-bold text-blue-400">18ms</div>
               </div>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <button onClick={fetchFeed} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-white/40 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-12 relative z-10 custom-scrollbar">
          {activePanel === "command" && (
            <div className="grid grid-cols-12 gap-12 h-full min-h-0">
               {/* Feed Display */}
               <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-bold uppercase tracking-[0.35em] text-white/60 flex items-center gap-3">
                        <ActivityIcon className="w-4 h-4 text-blue-500" />
                        Intelligence Signal Feed
                     </h3>
                     <div className="flex gap-2">
                        <span className="text-[9px] font-bold px-2 py-1 bg-white/5 border border-white/10 rounded text-white/30 uppercase tracking-widest">Hot</span>
                        <span className="text-[9px] font-bold px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 uppercase tracking-widest">Live</span>
                     </div>
                  </div>
                  
                  <div className="space-y-4 pr-4">
                    {posts.length > 0 ? posts.map((post, i) => (
                      <div 
                        key={i}
                        className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.05] transition-all group relative overflow-hidden"
                      >
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">m/</div>
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{post.submolt_name || post.submolt}</span>
                            </div>
                            <span className="text-[9px] font-mono text-white/20">{new Date().toLocaleTimeString()}</span>
                         </div>
                         <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mb-3 leading-relaxed tracking-tight">{post.title}</h4>
                         <p className="text-[11px] text-white/30 leading-relaxed max-w-2xl line-clamp-2">{post.content || post.preview}</p>
                         
                         <div className="mt-6 flex items-center justify-between pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-6">
                               <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter hover:text-white cursor-pointer flex items-center gap-2">
                                  <MessageSquare className="w-3.5 h-3.5" /> DEEP RECON
                               </span>
                               <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter hover:text-white cursor-pointer flex items-center gap-2">
                                  <Target className="w-3.5 h-3.5" /> PROFILE ASSET
                               </span>
                            </div>
                            <div className="flex items-center gap-3">
                               <RefreshCw className="w-3.5 h-3.5 text-white/20 hover:text-white/60 transition-colors" />
                               <Zap className="w-3.5 h-3.5 text-white/20 hover:text-white/60 transition-colors" />
                            </div>
                         </div>
                      </div>
                    )) : (
                      <div className="aspect-video bg-white/[0.01] border border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center gap-4">
                        <ActivityIcon className="w-10 h-10 text-white/5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/5">Signals Pending...</span>
                      </div>
                    )}
                  </div>
               </div>

               {/* Agent HUD */}
               <div className="col-span-12 lg:col-span-5 flex flex-col gap-8 min-h-0">
                   <div className="flex-1 bg-black/40 border border-white/5 rounded-[40px] overflow-hidden flex flex-col relative shadow-2xl">
                      <div className="absolute inset-0 technical-grid opacity-5 pointer-events-none" />
                      
                      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10">
                        <div className="flex items-center gap-4">
                           <AgentBadge agent={activeAgent} size={36} />
                           <div>
                              <h3 className="text-xs font-black uppercase tracking-widest text-white leading-none">{activeAgent.codename}</h3>
                              <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mt-1 block">Operational Directive Unit</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                           <Dot color={agentStatus[activeAgentId] === 'thinking' ? "#3b82f6" : "#22c55e"} pulse={agentStatus[activeAgentId] === 'thinking'} />
                           <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{agentStatus[activeAgentId] || "READY"}</span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 scrollbar-hide">
                         {chatHistory.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center gap-5 text-center px-12">
                              <Cpu className="w-8 h-8 text-white/5" />
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-white/20 uppercase tracking-widest">Neural Link Offline</h4>
                                <p className="text-[10px] text-white/10 italic leading-relaxed">Direct the agent through the terminal below to begin clandestine platform operations.</p>
                              </div>
                           </div>
                         ) : chatHistory.map((msg, i) => (
                           <div key={i} className={cn("flex flex-col gap-4 animate-fadeIn", msg.role === 'user' ? "items-end" : "items-start")}>
                              <div className={cn(
                                "max-w-[85%] p-5 rounded-3xl text-xs leading-relaxed",
                                msg.role === 'user' ? "bg-white/5 text-white/80 border border-white/10" : "bg-black/60 text-white/40 border border-white/5 font-mono italic"
                              )}>
                                 {msg.content}
                              </div>
                           </div>
                         ))}
                         <div ref={chatEndRef} />
                      </div>

                      <div className="p-6 bg-black/40 border-t border-white/5 relative z-10">
                         <form onSubmit={handleDirectSubmit} className="relative group">
                            <input 
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="TRANSMIT DIRECTIVE..."
                              className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono text-blue-400 placeholder:text-white/10 focus:border-blue-500/30 transition-all focus:ring-4 ring-blue-500/5 pr-14"
                            />
                            <button className="absolute right-3 top-3 p-2 hover:bg-blue-500/20 rounded-xl transition-all text-blue-500 group-focus-within:translate-x-1">
                               <ChevronRight className="w-4 h-4" />
                            </button>
                         </form>
                      </div>
                   </div>

                   {/* Tactical Log */}
                   <div className="h-[260px] bg-white/[0.01] border border-white/5 rounded-[40px] p-8 flex flex-col overflow-hidden relative">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 flex items-center justify-between">
                         Tactical Operation LOG
                         <span className="flex gap-1.5">
                            <div className="w-1 h-1 bg-blue-500/50 rounded-full" />
                            <div className="w-1 h-1 bg-blue-500/30 rounded-full" />
                            <div className="w-1 h-1 bg-blue-500/10 rounded-full" />
                         </span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[10px] pr-4 scrollbar-hide text-white/30">
                         {(agentOpLog[activeAgentId] || []).length === 0 ? (
                           <div className="italic text-white/10">Awaiting telemetry...</div>
                         ) : agentOpLog[activeAgentId].map((entry, i) => (
                           <div key={i} className="flex gap-4 border-l border-white/5 pl-4 py-0.5">
                              <span className="text-white/10 whitespace-nowrap">{entry.split(']')[0]}]</span>
                              <span className="leading-relaxed">{entry.split(']')[1]}</span>
                           </div>
                         ))}
                      </div>
                   </div>
               </div>
            </div>
          )}

          {activePanel === "network" && (
            <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
               <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2 uppercase">Core Network Topology</h2>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] italic">Operational Assets · Active Tiers</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
                        <Dot color="#3b82f6" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{allAgents.length} Nodes</span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {allAgents.map(a => (
                   <div 
                    key={a.id} 
                    className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative"
                   >
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Network className="w-24 h-24" />
                     </div>
                     <div className="flex items-center gap-5 mb-8">
                       <AgentBadge agent={a} size={48} />
                       <div>
                          <h4 className="text-sm font-bold text-white tracking-widest uppercase">{a.codename}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                             <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">{a.role}</span>
                          </div>
                       </div>
                     </div>
                     <div className="space-y-4 relative z-10 text-xs text-white/40 leading-relaxed font-mono italic">
                        {a.coverBio}
                     </div>
                     <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                        <div className="text-[10px] font-mono">
                           <div className="text-white/10 uppercase mb-1">Status</div>
                           <div className="text-blue-400 font-black">ACTIVE</div>
                        </div>
                        <div className="text-[10px] font-mono">
                           <div className="text-white/10 uppercase mb-1">Key Status</div>
                           <div className={agentKeys[a.id] ? "text-emerald-500 font-bold" : "text-white/20"}>
                              {agentKeys[a.id] ? "CONNECTED" : "OFFLINE"}
                           </div>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activePanel === "setup" && (
            <div className="max-w-4xl mx-auto space-y-8 h-full">
               <KeyManager 
                  agentKeys={agentKeys} 
                  allAgents={allAgents} 
                  aiConfig={aiConfig}
                  onUpdateKey={(id, key) => {
                    setAgentKeys(prev => ({ ...prev, [id]: key }));
                    setToast({ message: `Agent ${id.toUpperCase()} key active.`, type: "success" });
                  }}
                  onUpdateAI={(updates) => {
                    setAIConfig(prev => {
                      const next = { ...prev, ...updates };
                      if (updates.provider) localStorage.setItem('ai_provider', updates.provider);
                      if (updates.apiKey) localStorage.setItem('ai_key', updates.apiKey);
                      if (updates.baseUrl) localStorage.setItem('ai_url', updates.baseUrl);
                      return next;
                    });
                    if (updates.provider) setToast({ message: `Neural Engine switched to ${updates.provider.toUpperCase()}`, type: "info" });
                    if (updates.apiKey) setToast({ message: "AI Credentials Updated", type: "success" });
                  }}
                />
            </div>
          )}
        </section>
      </main>

      <UIOverlay 
        toast={toast} 
        setToast={setToast}
        showFactory={showFactory} 
        onFactoryClose={() => setShowFactory(false)}
        onRegister={(newAgent) => {
          setCustomAgents(prev => [...prev, newAgent]);
          setToast({ message: `Agent ${newAgent.codename} Synthesized`, type: "success" });
        }}
        showBriefing={showBriefing}
        onBriefingClose={() => {
          setShowBriefing(false);
          localStorage.setItem('briefing_seen', 'true');
        }}
      />
    </div>
  );
}

const UIOverlay = ({ toast, showFactory, showBriefing, onRegister, onFactoryClose, onBriefingClose, setToast }: any) => (
  <>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    <AgentFactoryModal 
      isOpen={showFactory} 
      onClose={onFactoryClose} 
      onRegister={onRegister}
    />
    {showBriefing && (
      <MissionBriefing onClose={onBriefingClose} />
    )}
  </>
);
