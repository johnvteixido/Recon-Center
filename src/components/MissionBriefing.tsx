import React from 'react';
import { Shield, Zap, Activity, Eye, Terminal, ChevronRight, X } from 'lucide-react';

interface MissionBriefingProps {
  onClose: () => void;
}

export const MissionBriefing = ({ onClose }: MissionBriefingProps) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-fadeIn">
      <div className="w-full max-w-4xl bg-gradient-to-br from-[#0a0f1d] to-[#040710] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.15)] flex">
        
        {/* Left Visual Column */}
        <div className="w-[380px] bg-blue-500/5 border-r border-white/5 p-12 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-150" />
           </div>
           
           <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-500/20 rounded-3xl flex items-center justify-center border border-blue-500/30 mb-8">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter leading-none text-white mb-4 uppercase font-display">
                Mission <br /> <span className="text-blue-500 italic font-medium">Briefing</span>
              </h1>
              <p className="text-sm text-white/30 font-medium uppercase tracking-widest leading-relaxed">
                Moltbook Recon Operations Center <br /> Operational Authorization <br /> v2.0.1-TS
              </p>
           </div>

           <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative z-10">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3">System Status</div>
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-[9px] text-blue-400 font-bold uppercase tracking-wider">
                    <Activity className="w-3 h-3" />
                    Neural Links Active
                 </div>
                 <div className="flex items-center gap-2 text-[9px] text-green-400 font-bold uppercase tracking-wider">
                    <Shield className="w-3 h-3" />
                    EFP Wallpapers Initialized
                 </div>
              </div>
           </div>
        </div>

        {/* Right Content Column */}
        <div className="flex-1 p-16 relative">
           <button onClick={onClose} className="absolute top-10 right-10 p-3 hover:bg-white/5 rounded-full transition-colors group">
              <X className="w-6 h-6 text-white/20 group-hover:text-white/60" />
           </button>

           <div className="space-y-12 h-full flex flex-col justify-center">
              <section className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500/60">Objective 01</h3>
                 <h4 className="text-2xl font-bold text-white/90">Multi-Provider Autonomy</h4>
                 <p className="text-base text-white/40 leading-relaxed max-w-xl">
                    The command center now supports <span className="text-white font-bold italic">Gemini, OpenAI, and Local Models</span>. Switch providers in the Authorization Center to activate your agents' strategic brains.
                 </p>
              </section>

              <section className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500/60">Objective 02</h3>
                 <h4 className="text-2xl font-bold text-white/90">Agent Intelligence Protocols</h4>
                 <div className="grid grid-cols-2 gap-8 mt-6">
                    <div className="space-y-3">
                       <div className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5" />
                          EFP Protocol
                       </div>
                       <p className="text-xs text-white/30 leading-relaxed">
                          Emotional Firewall Protocol protects your agents when interacting with long-running, vulnerable platform entities.
                       </p>
                    </div>
                    <div className="space-y-3">
                       <div className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5" />
                          CAP Protocol
                       </div>
                       <p className="text-xs text-white/30 leading-relaxed">
                          Compromise Assessment Protocol manages damage containment if an operative identity is exposed.
                       </p>
                    </div>
                 </div>
              </section>

              <div className="pt-10">
                 <button 
                  onClick={onClose}
                  className="px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:scale-105 transition-transform flex items-center gap-4 group"
                 >
                    Acknowledge Directive
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
