
import React, { useState } from 'react';
import { AppTheme } from '../types';

interface DAWGuideProps {
  theme: AppTheme;
  onClose: () => void;
}

export const DAWGuide: React.FC<DAWGuideProps> = ({ theme, onClose }) => {
  const [activeTab, setActiveTab] = useState<'reaper' | 'studio-one'>('reaper');

  const containerClasses = theme === 'coldest' 
    ? "bg-white/95 border-white text-[#0c4a6e]" 
    : "bg-black/95 border-red-900/50 text-red-50";

  const tabClasses = (id: string) => {
    const active = activeTab === id;
    if (theme === 'coldest') {
      return active 
        ? "bg-sky-500 text-white shadow-lg" 
        : "bg-white/50 text-sky-900 hover:bg-white/80";
    } else {
      return active 
        ? "bg-red-600 text-white shadow-lg shadow-red-900/40" 
        : "bg-black/40 text-red-400 hover:bg-black/60";
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`w-full max-w-2xl rounded-[3rem] border p-8 shadow-2xl overflow-hidden relative ${containerClasses}`}>
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-black tracking-tighter mb-2">Export Intel</h2>
        <p className="text-sm opacity-70 mb-8 font-medium">Extract your plugin library to build your rack.</p>

        <div className="flex gap-2 mb-8 p-1 bg-black/5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('reaper')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tabClasses('reaper')}`}
          >
            REAPER (.ini)
          </button>
          <button 
            onClick={() => setActiveTab('studio-one')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tabClasses('studio-one')}`}
          >
            Studio One (.csv)
          </button>
        </div>

        <div className="space-y-6 min-h-[300px] animate-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'reaper' ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center font-black flex-shrink-0">1</div>
                <p className="text-sm leading-relaxed">Go to <strong className="font-black">Options</strong> &gt; <strong className="font-black">Show resource path...</strong> in REAPER.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center font-black flex-shrink-0">2</div>
                <p className="text-sm leading-relaxed">Find <code className="bg-black/5 px-2 py-1 rounded font-mono font-bold">reaper-vstplugins64.ini</code>.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center font-black flex-shrink-0">3</div>
                <p className="text-sm leading-relaxed">Either <strong className="font-black">copy/paste</strong> the text or <strong className="font-black">upload</strong> the file directly.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center font-black flex-shrink-0">4</div>
                <p className="text-sm leading-relaxed">BeatGangsta will parse your .ini and load your gear automatically.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center font-black flex-shrink-0">1</div>
                <p className="text-sm leading-relaxed">Open Studio One and go to <strong className="font-black">View</strong> &gt; <strong className="font-black">Plug-in Manager</strong>.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center font-black flex-shrink-0">2</div>
                <p className="text-sm leading-relaxed">Click <strong className="font-black">Export...</strong> at the bottom and save as a <strong className="font-black">CSV</strong>.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center font-black flex-shrink-0">3</div>
                <p className="text-sm leading-relaxed"><strong className="font-black">Upload the CSV file</strong> here or paste the text content.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center font-black flex-shrink-0">4</div>
                <p className="text-sm leading-relaxed">We will read your vendor and plugin names to generate signal chains.</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10">
          <button 
            onClick={onClose}
            className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all ${theme === 'coldest' ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            I'm Ready
          </button>
        </div>
      </div>
    </div>
  );
};
