import React, { useState } from 'react';
import { X, Shield, Cpu, Target, Mail, Zap, Terminal } from 'lucide-react';
import { MoltbookClient } from '../api/moltbook';
import { Agent } from '../agents/prompts';

interface AgentFactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (agent: Agent) => void;
}

export const AgentFactoryModal = ({ isOpen, onClose, onRegister }: AgentFactoryModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [codename, setCodename] = useState("");
  const [mission, setMission] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const res = await MoltbookClient.registerAgent(name, description);
      const key = res.api_key;
      
      const newAgent: Agent = {
        id: codename.toLowerCase(),
        codename,
        tier: 1,
        coverName: name,
        coverBio: description,
        role: "User Defined Asset",
        icon: codename.slice(0, 2).toUpperCase(),
        color: "#f472b6",
        dimColor: "rgba(244,114,182,0.10)",
        borderColor: "rgba(244,114,182,0.3)",
        mission,
        apiKey: key
      };

      onRegister(newAgent);
      onClose();
    } catch (error: any) {
      console.error("Registration failed:", error);
      alert(`Registration failed: ${error.message}`);
    }
    setIsRegistering(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0a0f1d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/10 rounded-2xl border border-pink-500/20">
              <Cpu className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white/90 uppercase font-display">Operative Synthesis</h2>
              <p className="text-[10px] text-white/20 font-mono tracking-widest mt-1">NEW ASSET REGISTRATION NODE · TIER-1 PROTOCOL</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/30" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-2 gap-8">
          
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Cover Name</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 opacity-20" />
                  <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. GhostWriter" 
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-12 py-3.5 text-xs text-white/80 focus:border-pink-500/30 transition-all font-medium"
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Operation Codename</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-3.5 w-4 h-4 opacity-20" />
                  <input 
                    value={codename}
                    onChange={(e) => setCodename(e.target.value)}
                    placeholder="e.g. GHOST" 
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-12 py-3.5 text-xs text-white/80 focus:border-pink-500/30 transition-all font-mono tracking-widest uppercase"
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Strategic Mission</label>
                <textarea 
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  rows={4}
                  placeholder="Define primary directive..." 
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white/80 focus:border-pink-500/30 transition-all resize-none"
                />
             </div>
          </div>

          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Cover Narrative (Bio)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Agent's public persona on Moltbook..." 
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white/80 focus:border-pink-500/30 transition-all resize-none"
                />
             </div>

             <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-white/20 flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  Registration Details
                </h4>
                <div className="space-y-2 text-[10px] text-white/40 leading-relaxed italic">
                  <div>· Assets are registered on the Moltbook public node.</div>
                  <div>· API Key will be generated and stored locally.</div>
                  <div>· Neural identity initialized with EFP protocols.</div>
                </div>
             </div>

             <button 
                onClick={handleRegister}
                disabled={!name || !codename || !mission || isRegistering}
                className="w-full py-4 bg-pink-500 hover:bg-pink-600 disabled:opacity-30 disabled:grayscale transition-all rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 shadow-lg shadow-pink-500/20"
              >
                {isRegistering ? (
                  <Zap className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 fill-white" />
                )}
                Synthesize Operative
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};
