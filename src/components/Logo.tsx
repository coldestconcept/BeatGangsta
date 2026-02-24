
import React from 'react';
import { Mascot, GrillStyle } from './Mascot';
import { AppTheme, KnifeStyle, DuragStyle, PendantStyle, ChainStyle } from '../types';

export interface LogoProps {
  size?: number;
  grillStyle: GrillStyle;
  knifeStyle: KnifeStyle;
  duragStyle: DuragStyle;
  pendantStyle: PendantStyle;
  chainStyle: ChainStyle;
  theme: AppTheme;
  saberColor?: string;
  showChain?: boolean;
  highEyes?: boolean;
  isCigarEquipped?: boolean;
  isTossingCigar?: boolean;
  showChefHat?: boolean;
  showSparkles?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 48, 
  grillStyle, 
  knifeStyle, 
  duragStyle, 
  pendantStyle, 
  chainStyle, 
  theme, 
  saberColor, 
  showChain, 
  highEyes, 
  isCigarEquipped, 
  isTossingCigar, 
  showChefHat, 
  showSparkles, 
  onClick 
}) => (
  <div 
    className="group relative flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer select-none" 
    onClick={onClick}
  >
    {showSparkles && (
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute bottom-1/4 right-0 w-3 h-3 bg-white rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-0 w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-yellow-200 rounded-full animate-pulse opacity-50" />
      </div>
    )}
    <Mascot 
      size={size} 
      grillStyle={grillStyle} 
      knifeStyle={knifeStyle} 
      duragStyle={duragStyle}
      pendantStyle={pendantStyle}
      chainStyle={chainStyle}
      saberColor={saberColor}
      showChain={showChain}
      highEyes={highEyes}
      isCigarEquipped={isCigarEquipped}
      isTossingCigar={isTossingCigar}
      showChefHat={showChefHat}
      glowColor={theme === 'crazy-bird' ? '#ef4444' : (theme as string) === 'hustle-time' ? '#facc15' : theme === 'chef-mode' ? '#ffffff' : '#0ea5e9'} 
      className="relative z-10" 
    />
  </div>
);
