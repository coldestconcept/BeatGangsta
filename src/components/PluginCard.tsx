
import React, { useState } from 'react';
import { VSTPlugin } from '../types';
import { X, Star } from 'lucide-react';
import { getPluginInfo } from '../data/pluginDetails';
import { motion, AnimatePresence } from 'motion/react';

interface PluginCardProps {
  id?: string;
  plugin: VSTPlugin;
  onRemove: (plugin: VSTPlugin) => void;
  onToggleFavorite: (plugin: VSTPlugin) => void;
  isFavorite: boolean;
}

export const PluginCard: React.FC<PluginCardProps> = ({ id, plugin, onRemove, onToggleFavorite, isFavorite }) => {
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
    <div id={id} className={`relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-[1.5rem] p-4 pt-10 shadow-sm hover:bg-white/40 hover:scale-[1.02] transition-all group flex flex-col h-full ${isRemoving ? 'scale-90 opacity-0 duration-300' : ''}`}>
      
      {/* Action Buttons - Positioned for better mobile fit */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(plugin); }}
          className={`p-1.5 rounded-full backdrop-blur-md shadow-sm transition-all ${isFavorite ? 'bg-yellow-400/90 text-yellow-900' : 'bg-black/20 text-white hover:bg-black/40'}`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <motion.div
            initial={false}
            animate={{ scale: isFavorite ? [1, 1.5, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Star size={12} className={isFavorite ? "fill-current" : ""} />
          </motion.div>
        </motion.button>
      </div>

      <div className="absolute top-2.5 right-2.5 z-10">
        <button 
          onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
          className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-md shadow-sm transition-all"
          title="Remove Plugin"
        >
          <X size={12} />
        </button>
      </div>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="absolute top-0 right-0 z-20 bg-black/90 backdrop-blur-md rounded-2xl p-3 shadow-xl animate-in fade-in zoom-in duration-200">
          <p className="text-white text-[10px] font-bold mb-2">Remove {plugin.name}?</p>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
              className="px-2 py-1 rounded-full bg-white/20 text-white text-[9px] font-bold hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleRemove}
              className="px-2 py-1 rounded-full bg-red-500 text-white text-[9px] font-bold hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Header Info - Adjusted for absolute buttons */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 truncate max-w-[60%]">
          {plugin.vendor}
        </span>
        <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${isInstrument ? 'bg-orange-100/50 text-orange-700' : 'bg-emerald-100/50 text-emerald-700'}`}>
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
