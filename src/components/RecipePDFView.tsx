
import React from 'react';
import { BeatRecipe, RecipeParameters } from '../types';

interface RecipePDFViewProps {
  recipe: BeatRecipe;
  params: RecipeParameters | null;
}

export const RecipePDFView: React.FC<RecipePDFViewProps> = ({ recipe, params }) => {
  // We'll render each "page" as a div with a specific class that we can target
  return (
    <div className="pdf-export-container bg-white text-slate-900 font-sans">
      
      {/* PAGE 1: COVER */}
      <div className="pdf-page w-[800px] h-[1131px] p-20 flex flex-col justify-center items-center text-center bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
           </svg>
        </div>
        <div className="relative z-10 space-y-8">
          <div className="w-32 h-32 bg-orange-500 rounded-[3rem] mx-auto flex items-center justify-center shadow-2xl border-4 border-white/20">
            <span className="text-6xl font-black">{recipe.title.charAt(0)}</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter leading-none uppercase">{recipe.title}</h1>
          <div className="h-1 w-24 bg-orange-500 mx-auto rounded-full" />
          <div className="text-2xl font-black uppercase tracking-[0.5em] text-orange-400">
            {recipe.style} • {recipe.bpm} BPM
          </div>
          <p className="text-sm font-black uppercase tracking-[0.8em] opacity-40 pt-20">
            BeatGangsta Production Manual
          </p>
        </div>
      </div>

      {/* PAGE 2: INDEX */}
      <div className="pdf-page w-[800px] h-[1131px] p-24 bg-white flex flex-col">
        <h2 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 mb-20">Table of Contents</h2>
        <div className="flex-1 space-y-12">
          <div className="flex items-end gap-4 group">
            <span className="text-4xl font-black text-slate-200">01</span>
            <span className="text-2xl font-black uppercase tracking-widest text-slate-900">The Architect's Brief</span>
            <div className="flex-1 border-b-2 border-dotted border-slate-200 mb-2" />
            <span className="text-xl font-black text-orange-500">03</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-black text-slate-200">02</span>
            <span className="text-2xl font-black uppercase tracking-widest text-slate-900">Signal Flow Matrix</span>
            <div className="flex-1 border-b-2 border-dotted border-slate-200 mb-2" />
            <span className="text-xl font-black text-orange-500">04</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-black text-slate-200">03</span>
            <span className="text-2xl font-black uppercase tracking-widest text-slate-900">Drum Guide Protocols</span>
            <div className="flex-1 border-b-2 border-dotted border-slate-200 mb-2" />
            <span className="text-xl font-black text-orange-500">05</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-black text-slate-200">04</span>
            <span className="text-2xl font-black uppercase tracking-widest text-slate-900">Source Sound Protocols</span>
            <div className="flex-1 border-b-2 border-dotted border-slate-200 mb-2" />
            <span className="text-xl font-black text-orange-500">06</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-black text-slate-200">05</span>
            <span className="text-2xl font-black uppercase tracking-widest text-slate-900">Signal Chain Protocols</span>
            <div className="flex-1 border-b-2 border-dotted border-slate-200 mb-2" />
            <span className="text-xl font-black text-orange-500">08</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-black text-slate-200">06</span>
            <span className="text-2xl font-black uppercase tracking-widest text-slate-900">Engineering Verdict</span>
            <div className="flex-1 border-b-2 border-dotted border-slate-200 mb-2" />
            <span className="text-xl font-black text-orange-500">10</span>
          </div>
        </div>
        <div className="pt-12 border-t border-slate-100 opacity-30 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">BeatGangsta Coldest Concept Edition</p>
        </div>
      </div>

      {/* PAGE 3: BRIEF & LAYERING */}
      <div className="pdf-page w-[800px] h-[1131px] p-24 bg-slate-50 flex flex-col gap-12">
        <div className="flex justify-between items-center border-b border-slate-200 pb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">01 • The Architect's Brief</h2>
          <span className="text-sm font-black text-slate-900">Page 03</span>
        </div>
        
        <div className="space-y-12">
          <div className="p-12 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-6">The Vision</h3>
            <p className="text-4xl font-black italic leading-[1.3] text-slate-900 border-l-8 border-orange-500 pl-10 py-2">
              "{recipe.description}"
            </p>
          </div>

          {recipe.layeringStrategy && (
            <div className="p-12 bg-slate-900 text-white rounded-[3rem] shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-400 mb-6">Layering Strategy</h3>
              <p className="text-xl leading-relaxed font-bold">{recipe.layeringStrategy}</p>
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Mastering Path</h3>
            <div className="flex flex-wrap gap-3">
              {recipe.mastering.map((m, i) => (
                <span key={i} className="px-6 py-3 bg-white text-slate-900 rounded-full text-[11px] font-black uppercase tracking-widest border-2 border-slate-200 shadow-sm">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 4: SIGNAL FLOW MATRIX */}
      <div className="pdf-page w-[800px] h-[1131px] p-24 bg-white flex flex-col gap-12">
        <div className="flex justify-between items-center border-b border-slate-200 pb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">02 • Signal Flow Matrix</h2>
          <span className="text-sm font-black text-slate-900">Page 04</span>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {recipe.ingredients.map((ing, i) => (
            <div key={i} className="p-10 bg-slate-50 border border-slate-200 rounded-[3rem] flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-orange-500 rounded-full" />
                <h3 className="text-2xl font-black tracking-tight uppercase">{ing.instrument}</h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">Source Goal</span>
                  <p className="text-xs text-slate-700 italic font-bold leading-relaxed">"{ing.sourceSoundGoal}"</p>
                </div>
                <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Loop Guide</span>
                  <p className="text-xs text-slate-700 font-black leading-relaxed">{ing.loopGuide}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">FX Chain</span>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {ing.processing.map((proc, j) => (
                    <div key={j} className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">{proc.pluginName}</span>
                      <span className="text-[8px] uppercase font-black tracking-widest text-slate-500">{proc.purpose}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAGE 5: DRUM GUIDE */}
      <div className="pdf-page w-[800px] h-[1131px] p-24 bg-slate-50 flex flex-col gap-12">
        <div className="flex justify-between items-center border-b border-slate-200 pb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">03 • Drum Guide Protocols</h2>
          <span className="text-sm font-black text-slate-900">Page 05</span>
        </div>

        <div className="space-y-8">
          {recipe.drumPatterns && (['intro', 'verse', 'hook', 'bridge', 'outro'] as const).map(section => {
            const pattern = recipe.drumPatterns![section];
            if (!pattern) return null;
            return (
              <div key={section} className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">{section}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">16 Step Grid</span>
                </div>
                
                <div className="space-y-6">
                  {/* Hi-Hats */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Hi-Hats {pattern.hiHat.isDoubleTime ? '(Double Time)' : ''}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: pattern.hiHat.isDoubleTime ? 32 : 16 }).map((_, i) => (
                        <div key={i} className={`flex-1 h-6 rounded-sm ${pattern.hiHat.steps.includes(i + 1) ? 'bg-sky-500' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  </div>
                  {/* Snare/Clap */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{pattern.snare.isClap ? 'Clap' : 'Snare'}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className={`flex-1 h-6 rounded-sm ${pattern.snare.steps.includes(i + 1) ? 'bg-sky-500' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  </div>
                  {/* Kick */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Kick</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className={`flex-1 h-6 rounded-sm ${pattern.kick.includes(i + 1) ? 'bg-sky-500' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAGE 6: SOURCE SOUND PROTOCOLS */}
      {params && params.instrumentDives && params.instrumentDives.length > 0 && (
        <div className="pdf-page w-[800px] h-[1131px] p-24 bg-white flex flex-col gap-12">
          <div className="flex justify-between items-center border-b border-slate-200 pb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">04 • Source Sound Protocols</h2>
            <span className="text-sm font-black text-slate-900">Page 06</span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {params.instrumentDives.slice(0, 2).map((dive, idx) => (
              <div key={idx} className="p-10 bg-slate-50 border-l-[12px] border-orange-500 rounded-[3rem] space-y-8">
                <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900">{dive.instrumentName}</h4>
                <div className="grid grid-cols-1 gap-6">
                  {dive.sourceSettings.map((set, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-200 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-slate-400">Param</span>
                        <span className="text-sm font-bold">{set.parameter}</span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[8px] font-black uppercase text-slate-400">Value</span>
                        <span className="text-xl font-black text-orange-500">{set.value}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-slate-400">Logic</span>
                        <span className="text-[10px] font-medium leading-relaxed text-slate-600">{set.explanation}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-orange-100/50 rounded-2xl border border-orange-200">
                  <p className="text-xs font-bold italic text-slate-800">"{dive.preFxAdvice}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE 7: SOURCE SOUND PROTOCOLS (CONT) */}
      {params && params.instrumentDives && params.instrumentDives.length > 2 && (
        <div className="pdf-page w-[800px] h-[1131px] p-24 bg-white flex flex-col gap-12">
          <div className="flex justify-between items-center border-b border-slate-200 pb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">04 • Source Sound Protocols (Cont.)</h2>
            <span className="text-sm font-black text-slate-900">Page 07</span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {params.instrumentDives.slice(2, 4).map((dive, idx) => (
              <div key={idx} className="p-10 bg-slate-50 border-l-[12px] border-orange-500 rounded-[3rem] space-y-8">
                <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900">{dive.instrumentName}</h4>
                <div className="grid grid-cols-1 gap-6">
                  {dive.sourceSettings.map((set, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-200 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-slate-400">Param</span>
                        <span className="text-sm font-bold">{set.parameter}</span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[8px] font-black uppercase text-slate-400">Value</span>
                        <span className="text-xl font-black text-orange-500">{set.value}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-slate-400">Logic</span>
                        <span className="text-[10px] font-medium leading-relaxed text-slate-600">{set.explanation}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-orange-100/50 rounded-2xl border border-orange-200">
                  <p className="text-xs font-bold italic text-slate-800">"{dive.preFxAdvice}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE 8: SIGNAL CHAIN PROTOCOLS */}
      {params && (
        <div className="pdf-page w-[800px] h-[1131px] p-24 bg-slate-50 flex flex-col gap-12">
          <div className="flex justify-between items-center border-b border-slate-200 pb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">05 • Signal Chain Protocols</h2>
            <span className="text-sm font-black text-slate-900">Page 08</span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {params.dives.slice(0, 2).map((dive, idx) => (
              <div key={idx} className="p-10 bg-white border border-slate-200 rounded-[3rem] space-y-8 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900">{dive.pluginName}</h4>
                  <span className="text-[10px] font-black bg-slate-100 px-4 py-1 rounded-full uppercase tracking-widest">Module {idx + 1}</span>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {dive.settings.map((set, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-50 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-slate-400">Param</span>
                        <span className="text-sm font-bold">{set.parameter}</span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[8px] font-black uppercase text-slate-400">Value</span>
                        <span className="text-xl font-black text-orange-500">{set.value}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-slate-400">Logic</span>
                        <span className="text-[10px] font-medium leading-relaxed text-slate-600">{set.explanation}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-xs font-bold italic text-slate-800">
                    <span className="font-black uppercase text-orange-600 mr-2">Pro Tip:</span>
                    {dive.proTip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE 9: SIGNAL CHAIN PROTOCOLS (CONT) */}
      {params && params.dives.length > 2 && (
        <div className="pdf-page w-[800px] h-[1131px] p-24 bg-slate-50 flex flex-col gap-12">
          <div className="flex justify-between items-center border-b border-slate-200 pb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">05 • Signal Chain Protocols (Cont.)</h2>
            <span className="text-sm font-black text-slate-900">Page 09</span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {params.dives.slice(2, 4).map((dive, idx) => (
              <div key={idx} className="p-10 bg-white border border-slate-200 rounded-[3rem] space-y-8 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900">{dive.pluginName}</h4>
                  <span className="text-[10px] font-black bg-slate-100 px-4 py-1 rounded-full uppercase tracking-widest">Module {idx + 3}</span>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {dive.settings.map((set, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-50 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-slate-400">Param</span>
                        <span className="text-sm font-bold">{set.parameter}</span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[8px] font-black uppercase text-slate-400">Value</span>
                        <span className="text-xl font-black text-orange-500">{set.value}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-slate-400">Logic</span>
                        <span className="text-[10px] font-medium leading-relaxed text-slate-600">{set.explanation}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-xs font-bold italic text-slate-800">
                    <span className="font-black uppercase text-orange-600 mr-2">Pro Tip:</span>
                    {dive.proTip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE 10: VERDICT */}
      {params && (
        <div className="pdf-page w-[800px] h-[1131px] p-24 bg-slate-900 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-24 opacity-10 scale-[2] rotate-12">
            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div className="relative z-10 space-y-12">
            <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-orange-400">06 • Engineering Verdict</h2>
            <p className="text-4xl font-black leading-[1.2] max-w-2xl tracking-tighter">
              {params.mixingAdvice}
            </p>
            <div className="pt-20">
               <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full mb-8" />
               <p className="text-sm font-black uppercase tracking-[0.8em] opacity-40">
                 End of Manual
               </p>
            </div>
          </div>
          <div className="absolute bottom-12 right-12">
             <span className="text-sm font-black opacity-40">Page 10</span>
          </div>
        </div>
      )}

    </div>
  );
};
