import React, { useState } from 'react';
import { DrumPattern } from '../types';
import { motion } from 'motion/react';

interface DrumPatternDisplayProps {
  patterns: {
    intro: DrumPattern;
    verse: DrumPattern;
    hook: DrumPattern;
    bridge: DrumPattern;
    outro: DrumPattern;
  };
  theme?: 'coldest' | 'chef-mode' | 'hustle-time' | 'crazy-bird';
}

const StepGrid = ({ steps = [], totalSteps, label, color, showVelocity }: { steps?: number[], totalSteps: number, label: string, color: string, showVelocity?: boolean }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{label}</span>
      </div>
      
      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar">
        <div className={`flex gap-1 sm:gap-1.5 ${totalSteps === 32 ? 'min-w-[800px]' : 'min-w-[400px]'} sm:min-w-full`}>
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = i + 1;
            const isActive = steps.includes(stepNum);
            const isBeat = stepNum % 4 === 1;
            const velocity = isActive ? Math.floor(60 + (Math.sin(stepNum * 12.5) * 20 + 20)) : 0;
            
            return (
              <div key={i} className="flex flex-col flex-1 gap-1 group">
                {/* Velocity Bar */}
                <div className={`flex flex-col justify-end items-center transition-all duration-500 ${showVelocity ? 'h-16 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
                  {isActive && (
                    <>
                      <span className="text-[9px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-slate-600 dark:text-slate-300">
                        {velocity}%
                      </span>
                      <div 
                        className={`w-full rounded-t-sm transition-all duration-500 ${color} opacity-50 group-hover:opacity-80`}
                        style={{ height: `${velocity}%` }}
                      />
                    </>
                  )}
                </div>

                {/* Step Box */}
                <div 
                  className={`
                    relative h-10 rounded-md transition-all duration-300 flex items-center justify-center
                    ${isActive ? color : 'bg-black/5 dark:bg-white/5'}
                    ${isBeat && !isActive ? 'border-l-2 border-black/10 dark:border-white/10' : ''}
                    ${isActive ? 'shadow-sm scale-[1.02]' : ''}
                  `}
                >
                  <span className={`text-[10px] font-mono font-bold transition-opacity ${isActive ? 'text-white opacity-90' : 'text-black/30 dark:text-white/30 opacity-0 group-hover:opacity-100'}`}>
                    {stepNum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SwingMeter = ({ label, percentage, colorClass }: { label: string, percentage: number, colorClass: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((percentage || 0) / 100) * circumference;
  return (
    <div className="text-center flex flex-col items-center gap-2">
      <div className={`relative inline-flex items-center justify-center w-24 h-24`}>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-black/10 dark:text-white/10"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          <circle
            className={colorClass}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-black font-mono ${colorClass}`}>{percentage || 0}</span>
          <span className="text-[9px] font-bold opacity-70">%</span>
        </div>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">{label}</div>
    </div>
  );
};

export const DrumPatternDisplay: React.FC<DrumPatternDisplayProps> = ({ patterns, theme }) => {
  const [activeSection, setActiveSection] = useState<keyof typeof patterns>('hook');
  const [localToggles, setLocalToggles] = useState<Record<string, { velocity: boolean }>>({});

  if (!patterns) return null;

  const sections: (keyof typeof patterns)[] = ['intro', 'verse', 'hook', 'bridge', 'outro'];
  const currentPattern = patterns[activeSection];

  if (!currentPattern) return (
    <div className="p-4 text-center text-xs opacity-50">
      Drum patterns not available for this recipe.
    </div>
  );

  const activeColor = theme === 'chef-mode' ? 'bg-orange-500' : 
                      theme === 'hustle-time' ? 'bg-yellow-500' : 
                      theme === 'crazy-bird' ? 'bg-red-500' : 'bg-sky-500';
  
  const activeText = theme === 'chef-mode' ? 'text-orange-500' : 
                     theme === 'hustle-time' ? 'text-yellow-500' : 
                     theme === 'crazy-bird' ? 'text-red-500' : 'text-sky-500';

  const currentToggles = localToggles[activeSection] || {
    velocity: currentPattern.velocityHumanized || false
  };

  const handleToggleVelocity = () => {
    setLocalToggles(prev => ({
      ...prev,
      [activeSection]: { ...currentToggles, velocity: !currentToggles.velocity }
    }));
  };

  return (
    <div className="mt-8 p-6 rounded-3xl bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeColor} animate-pulse`} />
          <h4 className="text-xs font-black uppercase tracking-widest opacity-70">Drum Guide</h4>
        </div>
        
        <div className="flex flex-wrap justify-center gap-1 bg-black/5 dark:bg-white/5 p-1.5 rounded-xl">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`
                px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all
                ${activeSection === section 
                  ? 'bg-white text-black shadow-sm scale-105' 
                  : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}
              `}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex lg:flex-col justify-around gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
          <SwingMeter label="Hi-Hat" percentage={currentPattern.swing?.hiHat} colorClass={activeText} />
          <SwingMeter label={currentPattern.snare.isClap ? 'Clap' : 'Snare'} percentage={currentPattern.swing?.snare} colorClass={activeText} />
          <SwingMeter label="Kick" percentage={currentPattern.swing?.kick} colorClass={activeText} />
        </div>
        <div className="flex-1 space-y-14">
          <StepGrid 
            steps={currentPattern.hiHat.steps} 
            totalSteps={currentPattern.hiHat.isDoubleTime ? 32 : 16} 
            label={`Hi-Hats ${currentPattern.hiHat.isDoubleTime ? '(2x Speed)' : ''}`}
            color={activeColor}
            showVelocity={currentToggles.velocity}
          />
          
          <StepGrid 
            steps={currentPattern.snare.steps} 
            totalSteps={16} 
            label={currentPattern.snare.isClap ? 'Clap' : 'Snare'}
            color={activeColor}
            showVelocity={currentToggles.velocity}
          />

          <StepGrid 
            steps={currentPattern.kick} 
            totalSteps={16} 
            label="Kick"
            color={activeColor}
            showVelocity={currentToggles.velocity}
          />
        </div>
      </div>
      
      <div className="mt-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-t border-black/5 dark:border-white/5 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto cursor-pointer group p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" onClick={handleToggleVelocity}>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Velocity Humanize</span>
            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${currentToggles.velocity ? activeColor : 'bg-black/20 dark:bg-white/20'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${currentToggles.velocity ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start lg:items-end text-[10px] opacity-50 font-mono w-full lg:w-auto bg-black/5 dark:bg-white/5 p-3 rounded-xl">
          <span>* 1 Bar Loop (16 Steps)</span>
          <span>{currentPattern.hiHat.isDoubleTime ? '32 Steps (Double Time)' : '16 Steps (Normal)'}</span>
        </div>
      </div>
    </div>
  );
};
