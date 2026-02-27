
import React, { useState, useRef } from 'react';
import { SavedRecipe, UIPreset } from '../types';
import { DrumPatternDisplay } from './DrumPatternDisplay';

interface RecipeViewerModalProps {
  recipe: SavedRecipe;
  presets?: UIPreset[];
  onClose: () => void;
  onLinkPreset?: (presetId: string) => void;
}

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor || hexcolor.length < 7) return 'white';
  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};

export const RecipeViewerModal: React.FC<RecipeViewerModalProps> = ({ recipe, presets = [], onClose, onLinkPreset }) => {
  const params = recipe.parameters;
  const linkedPreset = presets.find(p => p.id === recipe.linkedPresetId);

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center p-4 sm:p-12 lg:p-20 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-6xl my-auto flex flex-col bg-slate-50 rounded-[3rem] sm:rounded-[5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden border border-white/50 relative">
        
        {/* Header Section */}
        <div className="sticky top-0 z-10 flex flex-col md:flex-row justify-between items-start md:items-center px-8 sm:px-16 py-8 sm:py-12 bg-white/95 backdrop-blur-2xl border-b border-slate-200 gap-6">
          <div className="flex items-center gap-6 sm:gap-10">
            <div 
              className="w-16 h-16 sm:w-28 sm:h-28 rounded-[1.5rem] sm:rounded-[3.5rem] flex items-center justify-center shadow-2xl border-4 border-white/60"
              style={{ backgroundColor: recipe.bubbleColor }}
            >
              <span className="text-2xl sm:text-5xl font-black text-white drop-shadow-md">
                {recipe.title.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-none mb-3">
                {recipe.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-[10px] sm:text-[14px] font-black uppercase tracking-[0.4em] text-orange-600">
                  {recipe.style} • Vault Record
                </p>
                {recipe.artistTypes && recipe.artistTypes.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    <span className="text-[12px] text-slate-300">•</span>
                    {recipe.artistTypes.map((artist, i) => (
                      <span key={i} className="text-[10px] sm:text-[13px] font-black uppercase tracking-widest text-slate-400 italic">
                        {artist}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 self-end md:self-center">
            {linkedPreset && (
              <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Persona</span>
                <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full" style={{ background: linkedPreset.bubbleColor }} />
                  {linkedPreset.name}
                </span>
              </div>
            )}
            <button 
              onClick={onClose} 
              className="p-4 sm:p-6 rounded-[1.2rem] sm:rounded-[2rem] bg-slate-100 text-slate-900 transition-all hover:bg-red-500 hover:text-white active:scale-90 shadow-sm border border-slate-200"
            >
              <svg className="w-6 h-6 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 sm:p-16 lg:p-24 space-y-16 sm:space-y-24">
          
          {/* Preset Linking Section */}
          <section className="bg-white border border-slate-200 rounded-[3rem] p-10 sm:p-14 shadow-xl">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3">Visual Tie-In</h3>
                  <p className="text-lg font-bold text-slate-800">Link this architecture to a Studio Persona.</p>
                </div>
                <div className="flex items-center gap-6">
                  {linkedPreset && (
                    <div className="w-14 h-14 rounded-full border-4 border-white shadow-2xl" style={{ background: linkedPreset.bubbleColor }} />
                  )}
                  <select 
                    value={recipe.linkedPresetId || ''} 
                    onChange={(e) => onLinkPreset?.(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-4 font-black text-[11px] uppercase tracking-widest outline-none focus:ring-8 focus:ring-orange-500/10 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="">No UI Preset Linked</option>
                    {presets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
             </div>
          </section>

          {/* Summary Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 sm:gap-24">
            <div className="lg:col-span-5 space-y-12">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-6">Architect's Brief</h3>
                <p className="text-2xl sm:text-4xl font-black italic text-slate-900 leading-[1.3] tracking-tight border-l-8 border-orange-500 pl-10 py-4">
                  "{recipe.description}"
                </p>
              </div>

              {recipe.layeringStrategy && (
                <div className="p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-400 mb-6">Layering Strategy</h3>
                  <p className="text-lg sm:text-xl leading-relaxed font-bold">{recipe.layeringStrategy}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-6">Mastering Path</h3>
                <div className="flex flex-wrap gap-3">
                  {recipe.mastering.map((m, i) => (
                    <span key={i} className="px-6 py-3 bg-white text-slate-900 rounded-full text-[11px] font-black uppercase tracking-widest border-2 border-slate-200 shadow-sm">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-8">Signal Flow Matrix</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="p-10 bg-white border border-slate-200 rounded-[3.5rem] shadow-xl space-y-8 hover:scale-[1.02] transition-transform duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                      <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">{ing.instrument}</span>
                    </div>

                    <div className="p-6 bg-orange-50/50 rounded-[2rem] border border-orange-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 block mb-2">Source Goal</span>
                      <p className="text-[13px] text-slate-800 leading-relaxed italic font-bold">"{ing.sourceSoundGoal}"</p>
                    </div>

                    <div className="space-y-4 pl-8 border-l-4 border-orange-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">FX Chain</span>
                      {ing.processing.map((proc, j) => (
                        <div key={j} className="flex flex-col">
                          <span className="text-base font-black text-slate-900">{proc.pluginName}</span>
                          <span className="text-[9px] uppercase font-black tracking-widest text-slate-500">{proc.purpose}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Loop Guide</span>
                      <p className="text-[13px] text-slate-800 leading-relaxed font-black">{ing.loopGuide}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Drum Patterns Section */}
          {recipe.drumPatterns && (
            <section className="space-y-12">
              <div className="flex items-center gap-8">
                <h3 className="text-2xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase">Drum Guide Protocols</h3>
                <div className="h-[4px] flex-1 bg-slate-200 rounded-full" />
              </div>
              <div className="bg-white p-4 sm:p-10 rounded-[4rem] border border-slate-200 shadow-2xl">
                <DrumPatternDisplay patterns={recipe.drumPatterns} />
              </div>
            </section>
          )}

          {/* Parameters Section */}
          {params ? (
            <section className="space-y-24 animate-in slide-in-from-bottom-12 duration-1000">
              <div className="flex items-center gap-8">
                <h3 className="text-2xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase">Deep Protocol Decryption</h3>
                <div className="h-[4px] flex-1 bg-slate-200 rounded-full" />
              </div>
              
              {/* Instrument Source Dives */}
              {params.instrumentDives && params.instrumentDives.length > 0 && (
                <div className="space-y-12">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-400 flex items-center gap-6">
                    <span className="w-12 h-[2px] bg-slate-300 rounded-full" />
                    Source Sound Protocols
                  </h3>
                  <div className="grid grid-cols-1 gap-12">
                    {params.instrumentDives.map((dive, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-[4rem] overflow-hidden shadow-2xl transition-all border-l-[12px] border-l-orange-500">
                        <div className="px-10 sm:px-16 py-8 sm:py-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                          <h4 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 uppercase">
                            {dive.instrumentName}
                          </h4>
                          <span className="text-[10px] font-black bg-orange-500 text-white px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
                            Source Module
                          </span>
                        </div>
                        
                        <div className="p-10 sm:p-16 space-y-12">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {dive.sourceSettings.map((set, sIdx) => (
                              <div key={sIdx} className="flex flex-col p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Parameter</span>
                                <span className="text-lg font-black text-slate-900 mb-4">{set.parameter}</span>
                                <div className="mt-auto">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block mb-2">Value</span>
                                  <span className="text-3xl font-black text-orange-500 block mb-4">{set.value}</span>
                                  <p className="text-[12px] font-bold leading-relaxed text-slate-500 border-t border-slate-200 pt-4">{set.explanation}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="p-10 bg-orange-50 rounded-[3rem] border-2 border-orange-100 shadow-inner">
                            <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-orange-600 mb-4">Pre-FX Preparation Advice</h5>
                            <p className="text-lg sm:text-xl font-black leading-relaxed text-slate-900 italic">
                              "{dive.preFxAdvice}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {params.dives && params.dives.length > 0 && (
                <div className="space-y-12">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-400 flex items-center gap-6">
                    <span className="w-12 h-[2px] bg-slate-300 rounded-full" />
                    Signal Chain Protocols
                  </h3>
                  <div className="grid grid-cols-1 gap-12">
                    {params.dives.map((dive, idx) => (
                      <div key={idx} className="flex flex-col bg-white border border-slate-200 rounded-[4rem] overflow-hidden shadow-2xl hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transition-all duration-700">
                        <div className="px-10 sm:px-16 py-8 sm:py-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                          <h4 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 uppercase">
                            {dive.pluginName}
                          </h4>
                          <span className="text-[10px] font-black bg-slate-900 text-white px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
                            FX Module {idx + 1}
                          </span>
                        </div>
                        
                        <div className="p-10 sm:p-16 space-y-12">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {dive.settings?.map((set, sIdx) => (
                              <div key={sIdx} className="flex flex-col p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Parameter</span>
                                <span className="text-lg font-black text-slate-900 mb-4">{set.parameter}</span>
                                <div className="mt-auto">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block mb-2">Value</span>
                                  <span className="text-3xl font-black text-orange-500 block mb-4">{set.value}</span>
                                  <p className="text-[12px] font-bold leading-relaxed text-slate-500 border-t border-slate-200 pt-4">{set.explanation}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="p-10 bg-orange-50 rounded-[3rem] border-2 border-orange-100 shadow-inner">
                            <p className="text-lg sm:text-xl font-black leading-relaxed text-slate-900 italic">
                              <span className="font-black uppercase tracking-[0.4em] text-orange-600 mr-4 not-italic">Pro Tip:</span>
                              {dive.proTip}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mixing Advice */}
              {params.mixingAdvice && (
                <div className="p-16 sm:p-24 bg-slate-900 rounded-[4rem] sm:rounded-[6rem] text-white shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-24 opacity-10 scale-[2] rotate-12 transition-transform group-hover:rotate-0 duration-1000">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                  <h3 className="text-[12px] font-black uppercase mb-12 tracking-[0.6em] text-orange-400 flex items-center gap-6">
                    <span className="w-12 sm:w-20 h-[3px] bg-orange-400 rounded-full" />
                    Engineering Verdict
                  </h3>
                  <p className="text-2xl sm:text-5xl font-black leading-[1.2] max-w-5xl relative z-10 tracking-tighter">
                    {params.mixingAdvice}
                  </p>
                </div>
              )}
            </section>
          ) : (
            <div className="py-32 text-center space-y-8">
              <div className="text-8xl animate-pulse">📡</div>
              <h3 className="text-2xl font-black text-slate-400 uppercase tracking-[0.4em]">Architecting Parameters...</h3>
              <p className="text-sm font-bold text-slate-500">This record will automatically update when the deep dive is complete.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-10 sm:p-16 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-center gap-6">
          <button 
            onClick={onClose}
            className="px-16 sm:px-24 py-6 sm:py-8 rounded-full bg-slate-100 text-slate-900 font-black text-[12px] sm:text-base uppercase tracking-[0.5em] transition-all hover:bg-slate-200 active:scale-95 shadow-sm border border-slate-200"
          >
            Close vault record
          </button>
        </div>

      </div>
    </div>
  );
};
