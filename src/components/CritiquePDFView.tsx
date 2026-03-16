import React from 'react';
import { MixCritique, AppTheme } from '../types';

interface CritiquePDFViewProps {
  critique: MixCritique;
  theme?: AppTheme;
}

export const CritiquePDFView: React.FC<CritiquePDFViewProps> = ({ critique, theme = 'coldest' }) => {
  const containerId = `export-pdf-container-${critique.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  
  const getThemeColors = () => {
    switch (theme) {
      case 'coldest':
        return {
          primary: '#0ea5e9', // sky-500
          primaryText: '#0ea5e9',
          primaryBorder: '#0ea5e9',
          lightBg: '#f0f9ff', // sky-50
          lightBorder: '#bae6fd', // sky-200
          darkBg: '#0f172a', // slate-900
          darkText: '#ffffff',
        };
      default:
        return {
          primary: '#0ea5e9',
          primaryText: '#0ea5e9',
          primaryBorder: '#0ea5e9',
          lightBg: '#f0f9ff',
          lightBorder: '#bae6fd',
          darkBg: '#0f172a',
          darkText: '#ffffff',
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div id={containerId} className="pdf-export-container bg-white text-slate-900 font-sans">
      
      {/* PAGE 1: COVER */}
      <div className="pdf-page w-[800px] h-[1131px] p-20 flex flex-col justify-center items-center text-center text-white relative overflow-hidden" style={{ backgroundColor: colors.darkBg }}>
        <div className="absolute inset-0 opacity-10">
           <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
           </svg>
        </div>
        <div className="relative z-10 space-y-8">
          <div className={`w-32 h-32 rounded-[3rem] mx-auto flex items-center justify-center shadow-2xl border-4 border-white/20`} style={{ backgroundColor: colors.primary }}>
            <span className="text-6xl font-black">🎧</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter leading-none uppercase">{critique.title}</h1>
          <div className={`h-1 w-24 mx-auto rounded-full`} style={{ backgroundColor: colors.primary }} />
          <div className={`text-2xl font-black uppercase tracking-[0.5em]`} style={{ color: colors.primaryText }}>
            {critique.isGangstaVox ? 'Vocal Critique' : 'Beat Critique'}
          </div>
          <p className="text-sm font-black uppercase tracking-[0.8em] opacity-40 pt-20">
            BeatGangsta Engineering Report
          </p>
        </div>
      </div>

      {/* PAGE 2: OVERALL FEEDBACK */}
      <div className="pdf-page w-[800px] h-[1131px] p-24 bg-white flex flex-col gap-12">
        <div className="flex justify-between items-center border-b border-slate-200 pb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">01 • Executive Summary</h2>
          <span className="text-sm font-black text-slate-900">Page 02</span>
        </div>
        
        <div className="space-y-12">
          <div className={`p-12 rounded-[3rem] border shadow-sm`} style={{ backgroundColor: colors.lightBg, borderColor: colors.lightBorder }}>
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-6`} style={{ color: colors.primaryText }}>Overall Feedback</h3>
            <p className="text-2xl font-black leading-relaxed text-slate-900">
              {critique.overallFeedback}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="p-10 border rounded-[3rem]" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: '#0284c7' }}>Strengths</h3>
              <ul className="space-y-4">
                {critique.strengths.map((s, i) => (
                  <li key={i} className="text-sm font-bold text-slate-700 flex items-start gap-2">
                    <span style={{ color: '#0ea5e9' }}>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-10 border rounded-[3rem]" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: '#dc2626' }}>Areas for Improvement</h3>
              <ul className="space-y-4">
                {critique.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm font-bold text-slate-700 flex items-start gap-2">
                    <span style={{ color: '#ef4444' }}>•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 3: ACTION PLAN */}
      <div className="pdf-page w-[800px] h-[1131px] p-24 bg-slate-50 flex flex-col gap-12">
        <div className="flex justify-between items-center border-b border-slate-200 pb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">02 • Action Plan Protocols</h2>
          <span className="text-sm font-black text-slate-900">Page 03</span>
        </div>

        <div className="space-y-8">
          {critique.actionPlan.map((action, idx) => (
            <div key={idx} className="p-10 bg-white border border-slate-200 rounded-[3rem] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-8 h-8 ${colors.primary} text-white rounded-full flex items-center justify-center font-black text-sm`}>
                  {idx + 1}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{action.issue}</h3>
              </div>
              <p className="text-sm font-bold text-slate-600 mb-8 pl-12">{action.solution}</p>
              
              <div className="pl-12 space-y-4">
                <span className={`text-[10px] font-black uppercase tracking-widest ${colors.primaryText}`}>Recommended Chain</span>
                <div className="grid grid-cols-1 gap-4">
                  {action.recommendedChain.map((plugin, pIdx) => (
                    <div key={pIdx} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-slate-900">{plugin.pluginName}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plugin.purpose}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-black text-sky-600">{plugin.settings}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAGE 4: SPECIFIC HELP (IF ANY) */}
      {critique.specificHelp && critique.specificHelp.length > 0 && (
        <div className="pdf-page w-[800px] h-[1131px] p-24 bg-white flex flex-col gap-12">
          <div className="flex justify-between items-center border-b border-slate-200 pb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">03 • Specific Engineering Queries</h2>
            <span className="text-sm font-black text-slate-900">Page 04</span>
          </div>

          <div className="space-y-8">
            {critique.specificHelp.map((help, idx) => (
              <div key={idx} className={`p-10 ${colors.lightBg} border border-sky-100 rounded-[3rem]`}>
                <h3 className="text-xs font-black uppercase tracking-widest text-sky-400 mb-4">Q: {help.query}</h3>
                <p className="text-lg font-bold text-slate-900 mb-8 leading-relaxed">{help.advice}</p>
                
                {help.recommendedChain && help.recommendedChain.length > 0 && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recommended Plugins</span>
                    <div className="grid grid-cols-2 gap-4">
                      {help.recommendedChain.map((plugin, pIdx) => (
                        <div key={pIdx} className="p-5 bg-white border border-sky-50 rounded-2xl">
                          <h4 className="font-black text-sm text-slate-900">{plugin.pluginName}</h4>
                          <p className="text-[10px] font-bold text-slate-400 mb-2">{plugin.purpose}</p>
                          <p className="text-[9px] font-mono text-sky-500">{plugin.settings}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FINAL PAGE: VERDICT */}
      <div className="pdf-page w-[800px] h-[1131px] p-24 bg-slate-900 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-24 opacity-10 scale-[2] rotate-12">
          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div className="relative z-10 space-y-12">
          <h2 className={`text-[12px] font-black uppercase tracking-[0.6em] ${colors.primaryText}`}>Engineering Verdict</h2>
          <p className="text-4xl font-black leading-[1.2] max-w-2xl tracking-tighter italic">
            "Your mix has potential. Follow the protocols for a professional finish."
          </p>
          <div className="pt-20">
             <div className={`w-16 h-1 ${colors.primary} mx-auto rounded-full mb-8`} />
             <p className="text-sm font-black uppercase tracking-[0.8em] opacity-40">
               End of Report
             </p>
          </div>
        </div>
      </div>

    </div>
  );
};
