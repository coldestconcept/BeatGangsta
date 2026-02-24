
import React from 'react';
import { BeatRecipe, RecipeParameters } from '../types';

interface RecipeExportViewProps {
  recipe: BeatRecipe;
  params: RecipeParameters | null;
}

export const RecipeExportView: React.FC<RecipeExportViewProps> = ({ recipe, params }) => {
  return (
    <div id={`export-recipe-${recipe.title.replace(/\s+/g, '-').toLowerCase()}`} className="w-[1000px] bg-slate-50 p-20 flex flex-col gap-20 font-sans text-slate-900">
      {/* Header */}
      <div className="bg-white p-20 rounded-[4rem] border-4 border-slate-200 shadow-2xl flex flex-col gap-8">
        <div className="flex items-center gap-10">
          <div 
            className="w-32 h-32 rounded-[3.5rem] flex items-center justify-center shadow-2xl border-4 border-white"
            style={{ backgroundColor: recipe.bubbleColor }}
          >
            <span className="text-6xl font-black text-white drop-shadow-md">
              {recipe.title.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-none mb-4">{recipe.title}</h1>
            <div className="flex items-center gap-6 text-2xl font-black uppercase tracking-[0.3em] text-orange-600">
              <span>{recipe.style}</span>
              <span className="text-slate-200">•</span>
              <span>{recipe.bpm} BPM</span>
            </div>
          </div>
        </div>
        {recipe.artistTypes && recipe.artistTypes.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {recipe.artistTypes.map((artist, i) => (
              <span key={i} className="px-6 py-3 bg-slate-100 rounded-full text-sm font-black uppercase tracking-widest text-slate-500 italic">
                {artist}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description & Layering */}
      <div className="grid grid-cols-1 gap-12">
        <div className="p-12 bg-white rounded-[4rem] border-2 border-slate-100 shadow-xl">
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 mb-8">Architect's Brief</h2>
          <p className="text-4xl font-black italic leading-[1.3] text-slate-900 border-l-8 border-orange-500 pl-12 py-4">"{recipe.description}"</p>
        </div>

        {recipe.layeringStrategy && (
          <div className="p-12 bg-slate-900 text-white rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-orange-400 mb-8">Layering Strategy</h2>
            <p className="text-2xl leading-relaxed font-bold">{recipe.layeringStrategy}</p>
          </div>
        )}
      </div>

      {/* Architectural Chain */}
      <div className="space-y-12">
        <h2 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 px-8">Signal Flow Matrix</h2>
        <div className="grid grid-cols-2 gap-10">
          {recipe.ingredients.map((ing, i) => (
            <div key={i} className="p-12 bg-white rounded-[4rem] border border-slate-200 shadow-xl space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-5 h-5 bg-orange-500 rounded-full shadow-lg" />
                <h3 className="text-3xl font-black tracking-tighter uppercase">{ing.instrument}</h3>
              </div>
              
              <div className="space-y-10">
                <div className="p-8 bg-orange-50/50 rounded-[2.5rem] border border-orange-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block mb-3">Source Goal</span>
                  <p className="text-xl text-slate-800 italic font-bold">"{ing.sourceSoundGoal}"</p>
                </div>

                <div className="pl-10 border-l-4 border-orange-100 space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">FX Chain</span>
                  {ing.processing.map((proc, j) => (
                    <div key={j} className="flex flex-col">
                      <span className="text-2xl font-black text-slate-900">{proc.pluginName}</span>
                      <span className="text-xs uppercase font-black tracking-widest text-slate-500">{proc.purpose}</span>
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3">Loop Guide</span>
                  <p className="text-lg text-slate-800 font-black leading-relaxed">{ing.loopGuide}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drum Patterns - Show ALL sections */}
      {recipe.drumPatterns && (
        <div className="space-y-12">
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 px-8">Drum Guide Protocols</h2>
          <div className="grid grid-cols-1 gap-12">
            {(['intro', 'verse', 'hook', 'bridge', 'outro'] as const).map(section => {
              const pattern = recipe.drumPatterns![section];
              if (!pattern) return null;
              return (
                <div key={section} className="p-12 bg-white rounded-[4rem] border border-slate-200 shadow-2xl">
                  <div className="flex items-center justify-between mb-12">
                    <h3 className="text-4xl font-black uppercase tracking-[0.2em] text-slate-900">{section}</h3>
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">16 Step Grid</span>
                  </div>
                  
                  <div className="space-y-12">
                    {/* Hi-Hats */}
                    <div className="space-y-4">
                      <span className="text-[12px] font-black uppercase tracking-widest text-slate-400">Hi-Hats {pattern.hiHat.isDoubleTime ? '(Double Time)' : ''}</span>
                      <div className="flex gap-1.5">
                        {Array.from({ length: pattern.hiHat.isDoubleTime ? 32 : 16 }).map((_, i) => (
                          <div key={i} className={`flex-1 h-12 rounded-md ${pattern.hiHat.steps.includes(i + 1) ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 'bg-slate-100'}`} />
                        ))}
                      </div>
                    </div>
                    {/* Snare/Clap */}
                    <div className="space-y-4">
                      <span className="text-[12px] font-black uppercase tracking-widest text-slate-400">{pattern.snare.isClap ? 'Clap' : 'Snare'}</span>
                      <div className="flex gap-1.5">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className={`flex-1 h-12 rounded-md ${pattern.snare.steps.includes(i + 1) ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 'bg-slate-100'}`} />
                        ))}
                      </div>
                    </div>
                    {/* Kick */}
                    <div className="space-y-4">
                      <span className="text-[12px] font-black uppercase tracking-widest text-slate-400">Kick</span>
                      <div className="flex gap-1.5">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className={`flex-1 h-12 rounded-md ${pattern.kick.includes(i + 1) ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 'bg-slate-100'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Parameters - If available */}
      {params && (
        <div className="space-y-20">
          <h2 className="text-xs font-black uppercase tracking-[0.6em] text-slate-400 px-8">Deep Protocol Decryption</h2>
          
          {/* Instrument Dives */}
          {params.instrumentDives && params.instrumentDives.length > 0 && (
            <div className="space-y-12">
              <h3 className="text-2xl font-black uppercase tracking-[0.4em] text-slate-900 px-8">Source Sound Protocols</h3>
              <div className="grid grid-cols-1 gap-12">
                {params.instrumentDives.map((dive, idx) => (
                  <div key={idx} className="p-16 bg-white border-l-[16px] border-orange-500 rounded-[4rem] shadow-2xl space-y-12">
                    <h4 className="text-4xl font-black uppercase tracking-tighter">{dive.instrumentName}</h4>
                    <div className="grid grid-cols-3 gap-10">
                      {dive.sourceSettings.map((set, sIdx) => (
                        <div key={sIdx} className="flex flex-col p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <span className="text-[10px] font-black uppercase text-slate-400 mb-2">Parameter</span>
                          <span className="text-xl font-black text-slate-900 mb-4">{set.parameter}</span>
                          <div className="mt-auto">
                            <span className="text-[10px] font-black uppercase text-orange-600 block mb-1">Value</span>
                            <span className="text-4xl font-black text-orange-500">{set.value}</span>
                            <p className="text-sm font-bold text-slate-500 mt-4 border-t border-slate-200 pt-4">{set.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-10 bg-orange-50 rounded-[3rem] border-2 border-orange-100 shadow-inner">
                      <span className="text-[11px] font-black uppercase text-orange-600 block mb-4 tracking-widest">Pre-FX Preparation Advice</span>
                      <p className="text-2xl font-black italic text-slate-900">"{dive.preFxAdvice}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FX Dives */}
          <div className="space-y-12">
            <h3 className="text-2xl font-black uppercase tracking-[0.4em] text-slate-900 px-8">Signal Chain Protocols</h3>
            <div className="grid grid-cols-1 gap-12">
              {params.dives.map((dive, idx) => (
                <div key={idx} className="p-16 bg-white rounded-[4rem] border border-slate-200 shadow-2xl space-y-12">
                  <div className="flex justify-between items-center">
                    <h4 className="text-4xl font-black uppercase tracking-tighter">{dive.pluginName}</h4>
                    <span className="px-8 py-2 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest">Module {idx + 1}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-10">
                    {dive.settings.map((set, sIdx) => (
                      <div key={sIdx} className="flex flex-col p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400 mb-2">Parameter</span>
                        <span className="text-xl font-black text-slate-900 mb-4">{set.parameter}</span>
                        <div className="mt-auto">
                          <span className="text-[10px] font-black uppercase text-orange-600 block mb-1">Value</span>
                          <span className="text-4xl font-black text-orange-500">{set.value}</span>
                          <p className="text-sm font-bold text-slate-500 mt-4 border-t border-slate-200 pt-4">{set.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-10 bg-orange-50 rounded-[3rem] border-2 border-orange-100 shadow-inner">
                    <p className="text-2xl font-black italic text-slate-900">
                      <span className="font-black uppercase text-orange-600 mr-4 not-italic tracking-widest">Pro Tip:</span>
                      {dive.proTip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mixing Advice */}
          <div className="p-24 bg-slate-900 text-white rounded-[6rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-24 opacity-10 scale-[2] rotate-12">
              <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.6em] text-orange-400 mb-12">Engineering Verdict</h3>
            <p className="text-5xl font-black leading-[1.2] tracking-tighter">{params.mixingAdvice}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-20 text-center border-t border-slate-200 pt-20 opacity-30">
        <p className="text-lg font-black uppercase tracking-[0.8em]">BeatGangsta Coldest Concept Edition</p>
        <p className="text-sm mt-4">Generated by Gemini Pro Visionary Production Engine</p>
      </div>
    </div>
  );
};
