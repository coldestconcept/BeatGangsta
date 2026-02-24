
import React from 'react';
import { VSTPlugin } from '../types';

interface PluginCardProps {
  plugin: VSTPlugin;
}

export const PluginCard: React.FC<PluginCardProps> = ({ plugin }) => {
  const isInstrument = plugin.name.toLowerCase().includes('synth') || 
                       plugin.name.toLowerCase().includes('piano') ||
                       ['kontakt', 'vital', 'xpand', 'maitai', 'presence', 'mojito', 'opal', 'polymax', 'ravel'].some(keyword => plugin.name.toLowerCase().includes(keyword));

  return (
    <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-[1.5rem] p-4 shadow-sm hover:bg-white/40 hover:scale-[1.02] transition-all">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
          {plugin.vendor}
        </span>
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${isInstrument ? 'bg-orange-100/50 text-orange-700' : 'bg-emerald-100/50 text-emerald-700'}`}>
          {plugin.type}
        </span>
      </div>
      <h3 className="text-sm font-bold truncate text-slate-900">
        {plugin.name}
      </h3>
      <div className="mt-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-700">
        <span>v{plugin.version.slice(0, 5)}</span>
        <span>{plugin.lastModified.includes('year') ? 'Legacy' : 'Recent'}</span>
      </div>
    </div>
  );
};
