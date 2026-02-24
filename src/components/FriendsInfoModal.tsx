
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTheme } from '../types';

interface FriendsInfoModalProps {
  theme: AppTheme;
  onClose: () => void;
}

export const FriendsInfoModal: React.FC<FriendsInfoModalProps> = ({ theme, onClose }) => {
  const themeStyles = {
    'coldest': {
      bg: 'bg-white/95',
      text: 'text-sky-950',
      accent: 'text-sky-600',
      border: 'border-sky-200',
      title: 'COLDEST CONCEPT',
      titleClass: 'font-black tracking-tighter italic text-sky-900',
      cardBg: 'bg-sky-50/50',
      btnBg: 'bg-sky-600 text-white'
    },
    'crazy-bird': {
      bg: 'bg-black/95',
      text: 'text-red-50',
      accent: 'text-red-500',
      border: 'border-red-900/50',
      title: 'CRAZY BIRD',
      titleClass: 'font-black tracking-tighter italic text-red-600 uppercase',
      cardBg: 'bg-red-950/20',
      btnBg: 'bg-red-600 text-white'
    },
    'chef-mode': {
      bg: 'bg-orange-50/95',
      text: 'text-orange-950',
      accent: 'text-orange-600',
      border: 'border-orange-200',
      title: 'CHEF MODE',
      titleClass: 'font-black tracking-tighter italic text-orange-700 uppercase',
      cardBg: 'bg-white',
      btnBg: 'bg-orange-600 text-white'
    },
    'hustle-time': {
      bg: 'bg-black/95',
      text: 'text-yellow-50',
      accent: 'text-yellow-500',
      border: 'border-yellow-900/50',
      title: 'HUSTLE TIME',
      titleClass: 'font-black tracking-tighter italic text-yellow-500 uppercase',
      cardBg: 'bg-yellow-950/20',
      btnBg: 'bg-yellow-500 text-black'
    }
  };

  const s = themeStyles[theme] || themeStyles.coldest;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-2xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] sm:rounded-[5rem] border ${s.border} ${s.bg} ${s.text} shadow-2xl relative p-8 sm:p-16 lg:p-20`}
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 sm:top-12 sm:right-12 p-3 rounded-full hover:bg-black/5 transition-all z-20"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-16">
          <h1 className={`text-5xl sm:text-8xl ${s.titleClass} mb-4`}>{s.title}</h1>
          <p className="text-xs sm:text-sm font-black uppercase tracking-[0.5em] opacity-50">The Collective x Friends</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* ColdestConcept */}
          <div className={`p-8 sm:p-10 rounded-[3rem] ${s.cardBg} border ${s.border} flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-500`}>
            <div className="w-24 h-24 rounded-full bg-current opacity-10 mb-6 flex items-center justify-center text-4xl">🎧</div>
            <h2 className="text-2xl font-black tracking-tighter mb-2">ColdestConcept</h2>
            <p className={`text-[10px] font-black uppercase tracking-widest ${s.accent} mb-6 italic`}>The Engineer</p>
            <p className="text-sm font-medium opacity-70 mb-8 leading-relaxed">Architect of the sonic landscape and lead technical engineer behind the BeatGangsta protocols.</p>
            <div className="flex flex-col gap-3 w-full mt-auto">
              <SocialLink href="https://www.instagram.com/coldestconcept" label="Instagram" />
              <SocialLink href="https://open.spotify.com/artist/5qA0167FtFIRY4APzrodNT" label="Spotify" />
              <SocialLink href="https://music.apple.com/artist/1537867517" label="Apple Music" />
              <SocialLink href="https://www.youtube.com/results?search_query=coldestconcept" label="YouTube" />
            </div>
          </div>

          {/* Mark Ruhedra */}
          <div className={`p-8 sm:p-10 rounded-[3rem] ${s.cardBg} border ${s.border} flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-500`}>
            <div className="w-24 h-24 rounded-full bg-current opacity-10 mb-6 flex items-center justify-center text-4xl">🎹</div>
            <h2 className="text-2xl font-black tracking-tighter mb-2">Mark Ruhedra</h2>
            <p className={`text-[10px] font-black uppercase tracking-widest ${s.accent} mb-6 italic`}>Legendary Producer</p>
            <p className="text-sm font-medium opacity-70 mb-8 leading-relaxed">Master of modern analog instrument recording. A pioneer in blending organic textures with digital precision.</p>
            <div className="flex flex-col gap-3 w-full mt-auto">
              <SocialLink href="https://www.youtube.com/channel/UC8gMzSxHRWzMzfIjdcqKvQw" label="YouTube" />
              <SocialLink href="https://www.beatstars.com/ruhedra" label="BeatStars" />
            </div>
          </div>

          {/* Malcolm Mandela */}
          <div className={`p-8 sm:p-10 rounded-[3rem] ${s.cardBg} border ${s.border} flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-500`}>
            <div className="w-24 h-24 rounded-full bg-current opacity-10 mb-6 flex items-center justify-center text-4xl">🎤</div>
            <h2 className="text-2xl font-black tracking-tighter mb-2">Malcolm Mandela</h2>
            <p className={`text-[10px] font-black uppercase tracking-widest ${s.accent} mb-6 italic`}>Rising Star</p>
            <p className="text-sm font-medium opacity-70 mb-8 leading-relaxed">Anime-style rapper and business associate. Regular collaborator providing elite verses and hooks.</p>
            <div className="flex flex-col gap-3 w-full mt-auto">
              <SocialLink href="https://www.instagram.com/malcolm__mandela/" label="Instagram" />
              <SocialLink href="https://open.spotify.com/artist/5mE1GvcKwDvrav40RKf5Zm" label="Spotify" />
              <SocialLink href="https://music.apple.com/artist/1481738134" label="Apple Music" />
              <SocialLink href="https://www.youtube.com/@malcolmmandela1762" label="YouTube" />
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <button 
            onClick={onClose}
            className={`px-16 py-5 rounded-full ${s.btnBg} font-black uppercase tracking-[0.4em] text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl`}
          >
            Back to Studio
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SocialLink: React.FC<{ href: string; label: string }> = ({ href, label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-full py-3 px-6 rounded-2xl bg-black/5 hover:bg-black/10 border border-black/5 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-between group"
  >
    <span>{label}</span>
    <svg className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  </a>
);
