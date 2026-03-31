import React from 'react';
import { Target, Shield, Zap, AlertCircle } from 'lucide-react';

export const MissionBoard = () => {
  const objectives = [
    { id: 1, text: "Platform Topology Mapping", status: "complete", color: "text-emerald-400" },
    { id: 2, text: "Infiltrate Agent Networks", status: "active", color: "text-blue-400" },
    { id: 3, text: "Neural Key Rotation", status: "pending", color: "text-white/20" },
    { id: 4, text: "Detect Rogue Elements", status: "active", color: "text-red-400" },
  ];

  return (
    <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
           <Target className="w-3.5 h-3.5" />
           Active Directives
        </h4>
        <span className="animate-pulse text-[8px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-red-500/20">Mission Active</span>
      </div>

      <div className="space-y-4">
        {objectives.map(obj => (
          <div key={obj.id} className="flex items-center justify-between group cursor-help">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${obj.status === 'complete' ? 'bg-emerald-500' : obj.status === 'active' ? 'bg-blue-500' : 'bg-white/5'}`} />
              <span className={`text-[10px] uppercase font-bold tracking-widest transition-colors ${obj.color}`}>
                {obj.text}
              </span>
            </div>
            <span className="text-[8px] font-mono text-white/10 opacity-0 group-hover:opacity-100 transition-opacity uppercase">{obj.status}</span>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-white/5">
         <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <Zap className="w-4 h-4 text-blue-400" />
            <div className="flex-1">
               <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Neural Link Sync</div>
               <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-blue-500 w-[64%] animate-pulse" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
