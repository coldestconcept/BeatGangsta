
import React, { useState } from 'react';
import { VSTPlugin } from '../types';
import { X, Star } from 'lucide-react';
import { getPluginInfo } from '../data/pluginDetails';

interface PluginCardProps {
  plugin: VSTPlugin;
  onRemove: (plugin: VSTPlugin) => void;
  onToggleFavorite: (plugin: VSTPlugin) => void;
  isFavorite: boolean;
}

export const PluginCard: React.FC<PluginCardProps> = ({ plugin, onRemove, onToggleFavorite, isFavorite }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const isInstrument = plugin.name.toLowerCase().includes('synth') || 
                       plugin.name.toLowerCase().includes('piano') ||
                       ['kontakt', 'vital', 'xpand', 'maitai', 'presence', 'mojito', 'opal', 'polymax', 'ravel'].some(keyword => plugin.name.toLowerCase().includes(keyword));

  const pluginInfo = getPluginInfo(plugin.name, plugin.type);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(plugin);
    }, 300); // Wait for animation to finish
  };

  return (
    <div className={`relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-[1.5rem] p-4 shadow-sm hover:bg-white/40 hover:scale-[1.02] transition-all group flex flex-col h-full ${isRemoving ? 'scale-90 opacity-0 duration-300' : ''}`}>
      
      {/* Top Actions */}
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(plugin); }}
          className={`p-1.5 rounded-full backdrop-blur-md transition-all ${isFavorite ? 'bg-yellow-400/90 text-yellow-900' : 'bg-black/20 text-white hover:bg-black/40'}`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Star size={14} className={isFavorite ? "fill-current" : ""} />
        </button>
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
          className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-md transition-all"
          title="Remove Plugin"
        >
          <X size={14} />
        </button>
      </div>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-[1.5rem] p-4 animate-in fade-in zoom-in duration-200">
          <div className="text-center">
            <p className="text-white text-xs font-bold mb-3">Remove {plugin.name}?</p>
            <div className="flex justify-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
                className="px-3 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold hover:bg-white/30 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-2 pr-16 gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 break-words">
          {plugin.vendor}
        </span>
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 mt-0.5 ${isInstrument ? 'bg-orange-100/50 text-orange-700' : 'bg-emerald-100/50 text-emerald-700'}`}>
          {plugin.type}
        </span>
      </div>
      
      <h3 className="text-sm font-bold text-slate-900 leading-tight mb-2">
        {plugin.name}
      </h3>
      
      <p className="text-[10px] text-slate-600 leading-relaxed flex-grow mb-3">
        {plugin.description || pluginInfo.description}
      </p>

      {plugin.features && plugin.features.length > 0 && (
        <div className="mb-4">
          <ul className="text-[9px] text-slate-500 list-disc pl-3 space-y-1">
            {plugin.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-black/5 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500">
        <span>v{plugin.version.slice(0, 5)}</span>
        <span>Est. {pluginInfo.year}</span>
      </div>
    </div>
  );
};
