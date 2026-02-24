import React, { useState } from 'react';
import { BeatRecipe, AppTheme } from '../types';
import { DrumPatternDisplay } from './DrumPatternDisplay';
import { motion } from 'motion/react';

interface RecipeCardProps {
  recipe: BeatRecipe;
  isSaved: boolean;
  onSave: (recipe: BeatRecipe) => void;
  theme?: AppTheme;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSaved, onSave, theme = 'coldest' }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      layout
      className={`rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border shadow-2xl transition-all ${
        theme === 'coldest' 
          ? 'bg-white/80 backdrop-blur-2xl border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)] text-[#082f49]' 
          : theme === 'chef-mode'
          ? 'bg-white/60 border-orange-100 text-orange-950'
          : 'bg-black/40 border-white/10 text-white'
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tighter mb-2">{recipe.title}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              theme === 'coldest' ? 'bg-sky-100 text-sky-800' : 'bg-white/10'
            }`}>{recipe.style}</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              theme === 'coldest' ? 'bg-sky-100 text-sky-800' : 'bg-white/10'
            }`}>{recipe.bpm} BPM</span>
          </div>
          <p className="text-sm font-bold opacity-70 max-w-2xl leading-relaxed">{recipe.description}</p>
        </div>
        <button 
          onClick={() => onSave(recipe)}
          disabled={isSaved}
          className={`shrink-0 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 ${
            isSaved 
              ? 'bg-black/10 text-current opacity-50 shadow-none' 
              : theme === 'coldest' || theme === 'chef-mode'
              ? 'bg-gradient-to-b from-sky-400 to-sky-500 text-white shadow-[0_4px_15px_rgba(14,165,233,0.4)] border border-sky-400'
              : 'bg-white text-black'
          }`}
        >
          {isSaved ? 'Saved to Vault' : 'Save Recipe'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <h4 className="text-sm font-black uppercase tracking-widest opacity-40">Ingredients</h4>
          <div className="space-y-4">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className={`p-5 rounded-3xl border ${
                theme === 'coldest' ? 'bg-white/50 border-white/40 shadow-inner' : 'bg-black/20 border-white/5'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-black text-lg">{ing.instrument}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50 bg-black/5 px-2 py-1 rounded-md">{ing.sourceSoundGoal}</span>
                </div>
                <p className="text-xs font-bold opacity-70 mb-4">{ing.loopGuide}</p>
                <div className="flex flex-wrap gap-2">
                  {ing.processing.map((proc, pIdx) => (
                    <span key={pIdx} className={`text-[10px] font-bold px-3 py-1.5 rounded-xl ${
                      theme === 'coldest' ? 'bg-white border border-white/60 shadow-sm' : 'bg-white/10'
                    }`}>
                      {proc.pluginName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-black uppercase tracking-widest opacity-40">Drum Patterns</h4>
          <div className={`p-6 rounded-3xl border ${
            theme === 'coldest' ? 'bg-white/50 border-white/40 shadow-inner' : 'bg-black/20 border-white/5'
          }`}>
            <DrumPatternDisplay patterns={recipe.drumPatterns} theme={theme} />
          </div>
        </div>
      </div>

      <button 
        onClick={() => setExpanded(!expanded)}
        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
          theme === 'coldest' ? 'bg-white/40 hover:bg-white/60 border border-white/50' : 'bg-white/5 hover:bg-white/10'
        }`}
      >
        {expanded ? 'Hide Deep Dives' : 'Show Deep Dives & Arrangement'}
      </button>

      {expanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-8 pt-8 border-t border-current/10 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest opacity-40 mb-6">Arrangement</h4>
            <div className="space-y-4">
              {Object.entries(recipe.arrangement).map(([section, guide]) => (
                <div key={section} className={`p-4 rounded-2xl border ${
                  theme === 'coldest' ? 'bg-white/50 border-white/40' : 'bg-black/20 border-white/5'
                }`}>
                  <h5 className="font-black capitalize mb-1">{section}</h5>
                  <p className="text-xs font-bold opacity-70">{guide}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest opacity-40 mb-6">Mixing Advice</h4>
            <div className={`p-6 rounded-3xl border mb-6 ${
              theme === 'coldest' ? 'bg-sky-50 border-sky-100 text-sky-900' : 'bg-sky-900/20 border-sky-500/30 text-sky-100'
            }`}>
              <p className="text-sm font-bold leading-relaxed">{recipe.mixingAdvice}</p>
            </div>
            
            <h4 className="text-sm font-black uppercase tracking-widest opacity-40 mb-6">Deep Dives</h4>
            <div className="space-y-4">
              {recipe.deepDives?.map((dive, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border ${
                  theme === 'coldest' ? 'bg-white/50 border-white/40' : 'bg-black/20 border-white/5'
                }`}>
                  <h5 className="font-black mb-2">{dive.pluginName}</h5>
                  <p className="text-xs font-bold opacity-70 mb-3">{dive.whyItWorks}</p>
                  <div className="space-y-2">
                    {dive.keySettings.map((setting, sIdx) => (
                      <div key={sIdx} className="flex justify-between text-[10px] font-bold">
                        <span className="opacity-50">{setting.parameter}</span>
                        <span>{setting.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
