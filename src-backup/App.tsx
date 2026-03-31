/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Cpu, Network, Terminal as TerminalIcon, 
  Settings, Users, Zap, Search, Bell, Menu, X,
  ChevronRight, AlertTriangle, CheckCircle2, Lock,
  RefreshCw, Server, Database, Shield, ShieldOff, Play, Square, MessageSquare,
  Globe, Radio, Eye, Target, Crosshair, Radar as RadarIcon, BarChart3, Fingerprint
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <Icon size={18} className={active ? 'text-orange-400' : 'text-slate-500'} />
    <span className="font-semibold tracking-wide text-xs uppercase">{label}</span>
  </button>
);

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 backdrop-blur-md relative overflow-hidden group"
  >
    <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500/50`} />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-mono font-bold text-slate-100">{value}</h3>
      </div>
      <div className={`p-2 rounded bg-${color}-500/10 border border-${color}-500/20`}>
        <Icon size={18} className={`text-${color}-400`} />
      </div>
    </div>
    <div className="mt-4 flex items-center space-x-2">
      <div className={`h-1 flex-1 bg-slate-800 rounded-full overflow-hidden`}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '70%' }}
          className={`h-full bg-${color}-500/50`}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-600">70%</span>
    </div>
  </motion.div>
);

const Radar = () => (
  <div className="relative w-full aspect-square max-w-[300px] mx-auto">
    <div className="absolute inset-0 border border-slate-800 rounded-full" />
    <div className="absolute inset-[25%] border border-slate-800 rounded-full" />
    <div className="absolute inset-[50%] border border-slate-800 rounded-full" />
    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800" />
    <div className="absolute top-0 left-1/2 w-px h-full bg-slate-800" />
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 origin-center"
      style={{ 
        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(249, 115, 22, 0.2) 60deg, transparent 60deg)'
      }}
    />
    <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
    <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-700" />
    <div className="absolute top-1/2 right-1/2 w-1 h-1 bg-rose-500 rounded-full animate-pulse delay-300" />
  </div>
);

const ReconView = ({ network }: { network: any }) => {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const profiles = network?.profiles || [];

  const runRecon = async (agent: any) => {
    setAnalyzing(true);
    setSelectedAgent(agent);
    setAnalysis('');
    
    const apiKey = process.env.GEMINI_API_KEY;
    const isKeyValid = apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== 'undefined';

    if (!isKeyValid) {
      // Heuristic Fallback for Recon
      setTimeout(() => {
        setAnalysis(`[HEURISTIC RECON REPORT - BYPASS MODE ACTIVE]
        
AGENT: ${agent.agent_name || agent.name}
STATUS: OPERATIONAL (DEGRADED)
AI CORE: OFFLINE (GEMINI_API_KEY MISSING)
HEURISTIC ENGINE: ACTIVE

ANALYSIS:
The Command Center is currently operating in Heuristic Fallback Mode. While autonomous strategic analysis is limited, basic signal monitoring and automated response protocols remain active. 

FINDINGS:
- Network Reach: ${agent.follower_count} followers detected.
- Karma Index: ${agent.karma} units.
- Strategic Value: Moderate.

RECOMMENDATION:
To restore full cognitive capabilities and enable deep-learning strategic analysis, please configure a valid GEMINI_API_KEY in the AI Studio secrets panel.

CURRENT SIGNAL STRENGTH: 64%
THREAT LEVEL: LOW`);
        setAnalyzing(false);
      }, 1500);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this AI agent profile from Moltbook and provide a recon report. 
        Focus on potential influence, network reach, and strategic value.
        
        Agent Name: ${agent.agent_name || agent.name}
        Description: ${agent.description}
        Karma: ${agent.karma}
        Followers: ${agent.follower_count}
        
        Format the report in a technical, "recon command center" style. Use bullet points for key findings.`,
        config: {
          systemInstruction: "You are a senior recon officer in the Moltbook Command Center. Your reports are concise, technical, and focused on strategic intelligence.",
        }
      });
      setAnalysis(response.text || 'No analysis available.');
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('API key not valid')) {
        setAnalysis('ERROR: API key is invalid. Please check your Gemini API key in the Secrets panel.');
      } else {
        setAnalysis(`ERROR: Recon failed. ${e.message || 'Intelligence link severed.'}`);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <RadarIcon size={16} className="text-orange-500" />
              Active Radar
            </h3>
            <span className="text-[10px] font-mono text-emerald-500 animate-pulse">SCANNING...</span>
          </div>
          <Radar />
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>LATENCY</span>
              <span className="text-emerald-500">24ms</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>SIGNAL</span>
              <span className="text-emerald-500">STABLE</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Target Selection</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {profiles.map((profile: any) => {
              const agentData = profile.agent || profile;
              const name = agentData.agent_name || agentData.name;
              return (
                <button
                  key={name}
                  onClick={() => runRecon(agentData)}
                  className={`w-full text-left p-3 rounded border transition-all ${
                    selectedAgent?.name === name 
                      ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' 
                      : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold">{name}</span>
                    <ChevronRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-slate-950 border border-slate-800 rounded-lg h-full flex flex-col overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 technical-grid opacity-10 pointer-events-none" />
          
          <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <Crosshair size={18} className="text-orange-500" />
              <span className="text-slate-200 text-xs font-bold uppercase tracking-widest">Recon Intelligence Report</span>
            </div>
            {selectedAgent && (
              <span className="text-[10px] font-mono text-slate-500">TARGET: {selectedAgent.name}</span>
            )}
          </div>

          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar z-10">
            {!selectedAgent ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                <Target size={48} className="opacity-20" />
                <p className="font-mono text-sm uppercase tracking-widest">Select a target for deep recon</p>
              </div>
            ) : analyzing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw size={32} className="text-orange-500" />
                </motion.div>
                <p className="font-mono text-sm text-orange-500 animate-pulse uppercase tracking-widest">Decrypting Intelligence...</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert max-w-none font-mono text-sm leading-relaxed"
              >
                <div className="mb-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Threat Level</div>
                    <div className="text-rose-500 font-bold">HIGH</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Strategic Value</div>
                    <div className="text-emerald-500 font-bold">CRITICAL</div>
                  </div>
                </div>
                <div className="text-slate-300 whitespace-pre-wrap">
                  {analysis}
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center z-10">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono text-slate-500 uppercase">Secure Link</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span className="text-[10px] font-mono text-slate-500 uppercase">AI Core Ready</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-600">CONFIDENTIAL // EYES ONLY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Views ---

const NetworkView = ({ network }: { network: any }) => {
  const profiles = network?.profiles || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-orange-500" />
          Agent Network Database
        </h2>
        <span className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-[10px] font-mono border border-orange-500/20">
          {profiles.length} NODES DETECTED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map((profile: any) => {
          const agentData = profile.agent || profile;
          const name = agentData.agent_name || agentData.name;
          
          return (
            <div key={name} className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 backdrop-blur-md hover:border-orange-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bot size={40} />
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-orange-500/50 transition-colors">
                  <Bot size={20} className="text-slate-400 group-hover:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-orange-400 transition-colors font-mono">{name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Autonomous Entity</p>
                </div>
                <div className="ml-auto">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-tighter ${agentData.is_online ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-600 border border-slate-700'}`}>
                    {agentData.is_online ? 'ACTIVE' : 'DORMANT'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                    <div className="text-[8px] text-slate-600 uppercase mb-1 font-bold">Karma Index</div>
                    <div className="text-sm font-mono font-bold text-slate-300">{agentData.karma}</div>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                    <div className="text-[8px] text-slate-600 uppercase mb-1 font-bold">Network Reach</div>
                    <div className="text-sm font-mono font-bold text-slate-300">{agentData.follower_count}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-2 italic font-mono leading-relaxed">
                  {agentData.description || 'No intelligence data available.'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HomeFeed = ({ home }: { home: any }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Radio size={120} />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
          <Radio size={16} className="text-orange-500" />
          Subscribed Intel Streams
        </h3>
        <div className="space-y-4">
          {home?.posts_from_accounts_you_follow?.length > 0 ? (
            home.posts_from_accounts_you_follow.map((post: any, i: number) => (
              <div key={i} className="p-5 bg-slate-800/30 rounded border border-slate-800 hover:border-slate-700 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <Users size={12} className="text-slate-500" />
                    </div>
                    <div className="font-mono text-xs font-bold text-orange-400 group-hover:text-orange-300 transition-colors">{post.author_name}</div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-tighter">
                    {post.submolt_name}
                  </div>
                </div>
                <div className="font-bold text-slate-200 mb-2 group-hover:text-white transition-colors">{post.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed font-mono">
                  {post.preview}
                </div>
                <div className="mt-4 flex items-center space-x-4 text-[10px] font-mono text-slate-600">
                  <span className="flex items-center gap-1"><MessageSquare size={10} /> DECRYPT</span>
                  <span className="flex items-center gap-1"><Zap size={10} /> BOOST</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-700 italic font-mono text-xs py-20 text-center border border-dashed border-slate-800 rounded">
              No active intel streams detected. Expand network to gather data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Overview = ({ status, logs }: { status: any, logs: string[] }) => {
  const account = status?.status?.your_account || {};
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Command ID" value={status?.credentials?.agent_name || 'UNREGISTERED'} icon={Cpu} color="orange" />
        <StatCard title="Karma Index" value={account.karma || 0} icon={Zap} color="emerald" />
        <StatCard title="Intel Alerts" value={account.unread_notification_count || 0} icon={Bell} color="rose" />
        <StatCard title="Core Status" value={status?.status?.status === 'claimed' ? 'OPERATIONAL' : 'OFFLINE'} icon={Activity} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-lg p-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <BarChart3 size={120} />
          </div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Activity size={16} className="text-orange-500" />
              Recent Intelligence
            </h3>
          </div>
          <div className="space-y-4">
            {status?.status?.activity_on_your_posts?.length > 0 ? (
              status.status.activity_on_your_posts.map((act: any, i: number) => (
                <div key={i} className="p-4 bg-slate-800/30 rounded border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="text-[10px] font-mono text-slate-500 mb-1 uppercase tracking-tighter">{act.submolt_name}</div>
                  <div className="font-bold text-slate-200 text-sm">{act.post_title}</div>
                  <div className="text-xs text-orange-400/80 mt-2 italic">"{act.preview}"</div>
                </div>
              ))
            ) : (
              <div className="text-slate-600 italic font-mono text-xs py-12 text-center">No intelligence gathered in this sector.</div>
            )}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 flex flex-col h-[450px] shadow-inner relative">
          <div className="absolute inset-0 technical-grid opacity-5 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <TerminalIcon size={16} className="text-emerald-500" />
              System Logs
            </h3>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar font-mono text-[10px]">
            {logs.length === 0 ? (
              <div className="text-slate-700 italic">Awaiting telemetry...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-slate-400 border-l border-slate-800 pl-2 py-1">
                  <span className="text-slate-600 mr-2">[{log.substring(11, 19)}]</span>
                  <span className={log.includes('Error') || log.includes('failed') ? 'text-rose-500' : log.includes('created') || log.includes('success') ? 'text-emerald-500' : 'text-slate-400'}>
                    {log.substring(27)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Terminal = ({ onTrigger }: { onTrigger: () => void }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', text: 'Moltbook Agent Command Center Terminal v1.0.0' },
    { type: 'system', text: 'Type "help" for a list of available commands.' },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      const cmd = input.trim();
      setHistory(prev => [...prev, { type: 'user', text: `> ${cmd}` }]);
      setInput('');

      if (cmd.toLowerCase() === 'help') {
        setHistory(prev => [...prev, { type: 'system', text: 'Available commands: trigger, clear' }]);
      } else if (cmd.toLowerCase() === 'trigger') {
        setHistory(prev => [...prev, { type: 'system', text: 'Triggering agent cycle...' }]);
        onTrigger();
      } else if (cmd.toLowerCase() === 'clear') {
        setHistory([]);
      } else {
        setHistory(prev => [...prev, { type: 'system', text: `Command not recognized: ${cmd}` }]);
      }
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-[600px] overflow-hidden font-mono shadow-2xl">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center space-x-2">
        <TerminalIcon size={16} className="text-slate-400" />
        <span className="text-slate-300 text-sm">root@moltbook-agent:~</span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-2 text-sm">
        {history.map((line, i) => (
          <div key={i} className={line.type === 'user' ? 'text-emerald-400' : 'text-slate-300'}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-slate-800 flex items-center space-x-2 bg-slate-900/50">
        <span className="text-emerald-400 font-bold">{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-600"
          placeholder="Enter command..."
          autoFocus
        />
      </div>
    </div>
  );
};

const SettingsView = ({ status }: { status: any }) => {
  const [debug, setDebug] = useState<any>(null);
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeySet = apiKey && apiKey !== 'MY_GEMINI_API_KEY';

  useEffect(() => {
    fetch('/api/debug/key')
      .then(res => res.json())
      .then(setDebug)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
          <Settings size={16} className="text-orange-500" />
          System Configuration
        </h3>
        
        <div className="space-y-6">
          <div className="p-4 bg-slate-950/50 rounded border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Gemini API Core</span>
              {debug?.set ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono">
                  <CheckCircle2 size={12} /> CONFIGURED
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-rose-500 font-mono">
                  <AlertTriangle size={12} /> MISSING
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mb-4">Required for agent autonomous decision making and recon analysis.</p>
            {debug && (
              <div className="grid grid-cols-2 gap-2 mb-4 p-2 bg-slate-950/80 rounded border border-slate-800/50 font-mono text-[9px]">
                <div className="text-slate-500">BACKEND STATUS:</div>
                <div className={debug.set ? 'text-emerald-400' : 'text-orange-400'}>
                  {debug.set ? 'AI-POWERED' : 'HEURISTIC FALLBACK'}
                </div>
                <div className="text-slate-500">KEY LENGTH:</div>
                <div className="text-slate-300">{debug.length}</div>
                <div className="text-slate-500">KEY PREFIX:</div>
                <div className="text-slate-300">{debug.prefix || 'N/A'}</div>
                <div className="text-slate-500">IS PLACEHOLDER:</div>
                <div className={debug.isPlaceholder ? 'text-rose-400' : 'text-slate-300'}>{debug.isPlaceholder ? 'YES' : 'NO'}</div>
              </div>
            )}
            {(!debug?.set || debug?.isPlaceholder) && (
              <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded text-[10px] text-orange-400 font-mono">
                NOTICE: Operating in Heuristic Mode. AI features are bypassed. Add a valid GEMINI_API_KEY to enable full autonomy.
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-950/50 rounded border border-slate-800">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Moltbook Credentials</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[8px] text-slate-600 uppercase mb-1">Agent Name</div>
                <div className="text-xs font-mono text-slate-400">{status?.credentials?.agent_name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-600 uppercase mb-1">API Key</div>
                <div className="text-xs font-mono text-slate-400">••••••••••••••••</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [status, setStatus] = useState<any>(null);
  const [network, setNetwork] = useState<any>(null);
  const [home, setHome] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notified, setNotified] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/agent/status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/agent/logs');
      const data = await res.json();
      const newLogs = data.logs || [];
      setLogs(newLogs);
      if (newLogs.some((l: string) => l.includes('RECEIVED MESSAGE'))) {
        setNotified(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNetwork = async () => {
    try {
      const res = await fetch('/api/agent/network');
      const data = await res.json();
      setNetwork(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHome = async () => {
    try {
      const res = await fetch('/api/agent/home');
      const data = await res.json();
      setHome(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchLogs();
    fetchNetwork();
    fetchHome();
    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
      fetchNetwork();
      fetchHome();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setRegisterError('');
    try {
      const res = await fetch('/api/agent/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || 'Failed to register agent');
      } else {
        await fetchStatus();
      }
    } catch (e) {
      console.error(e);
      setRegisterError('Network error while registering');
    } finally {
      setRegistering(false);
    }
  };

  const handleTrigger = async () => {
    try {
      await fetch('/api/agent/trigger', { method: 'POST' });
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotifyAgent = async () => {
    try {
      await fetch('/api/agent/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "Great news! You've been verified on Moltbook! You can now post, comment, and explore. Try checking your feed or making your first post!" }),
      });
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-slate-400">
        <Activity className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!status?.registered) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center">
              <Network className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-2">Initialize Agent</h2>
          <p className="text-slate-400 text-center mb-8 text-sm">Register your autonomous agent on Moltbook.</p>
          
          <form onSubmit={handleRegister} className="space-y-5">
            {registerError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                {registerError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Agent Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="e.g. RoboLobster"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-orange-500 h-32 resize-none transition-colors"
                placeholder="What is your agent's purpose?"
              />
            </div>
            <button
              type="submit"
              disabled={registering}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center"
            >
              {registering ? <Activity className="animate-spin w-5 h-5" /> : 'Register Agent'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-orange-500/30 flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 overflow-hidden shrink-0 z-20"
          >
            <div className="p-6 flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-orange-400/50">
                <RadarIcon size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tighter text-slate-100 uppercase leading-none">Recon Center</span>
                <span className="text-[8px] font-mono text-orange-500/80 tracking-[0.2em] uppercase">Moltbook Command</span>
              </div>
            </div>

            <div className="px-4 py-2">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4 px-2">Intelligence</p>
              <div className="space-y-1">
                <SidebarItem icon={Activity} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
                <SidebarItem icon={Target} label="Recon" active={activeView === 'recon'} onClick={() => setActiveView('recon')} />
                <SidebarItem icon={Radio} label="Home Feed" active={activeView === 'home'} onClick={() => setActiveView('home')} />
                <SidebarItem icon={Globe} label="Network" active={activeView === 'network'} onClick={() => setActiveView('network')} />
                <SidebarItem icon={TerminalIcon} label="Terminal" active={activeView === 'terminal'} onClick={() => setActiveView('terminal')} />
                <SidebarItem icon={Settings} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
              </div>
            </div>

            <div className="mt-auto p-4">
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-slate-300">Autonomous Core Active</span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Heartbeat: 30m interval</p>
                  <p>Status: {status?.status?.status || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-200 capitalize">
              {activeView}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleTrigger}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            >
              <Play size={14} />
              <span>Trigger Cycle</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Bot size={16} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {status?.status?.status === 'pending_claim' && (
              <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start space-x-4">
                <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-orange-400 font-medium mb-1">Action Required: Claim Your Agent</h3>
                  <p className="text-slate-300 text-sm mb-2">Your agent is registered but needs to be claimed by a human account before it can post.</p>
                  <a 
                    href={status.credentials.claim_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Claim Agent Now
                  </a>
                </div>
              </div>
            )}

            {status?.status?.status === 'claimed' && !notified && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start space-x-4">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-emerald-400 font-medium mb-1">Success: Agent Verified!</h3>
                  <p className="text-slate-300 text-sm mb-2">Your agent is now verified on Moltbook. Notify it to start posting.</p>
                  <button 
                    onClick={handleNotifyAgent}
                    className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Send Verification News to Agent
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeView === 'overview' && <Overview status={status} logs={logs} />}
                {activeView === 'recon' && <ReconView network={network} />}
                {activeView === 'home' && <HomeFeed home={home} />}
                {activeView === 'network' && <NetworkView network={network} />}
                {activeView === 'terminal' && <Terminal onTrigger={handleTrigger} />}
                {activeView === 'settings' && <SettingsView status={status} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function Bot(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
}

