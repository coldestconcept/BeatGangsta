
import React from 'react';
import { KnifeStyle, PendantStyle, ChainStyle, DuragStyle } from '../types';

export type GrillStyle = 'iced-out' | 'aquabberry-diamond' | 'gold' | 'opal';

interface MascotProps {
  className?: string;
  size?: number;
  glowColor?: string;
  grillStyle?: GrillStyle;
  knifeStyle?: KnifeStyle;
  duragStyle?: DuragStyle;
  pendantStyle?: PendantStyle;
  chainStyle?: ChainStyle;
  saberColor?: string;
  showChain?: boolean;
  highEyes?: boolean;
  isCigarEquipped?: boolean;
  isTossingCigar?: boolean;
  showChefHat?: boolean;
}

const DragonBall = ({ x, y, stars, scale = 1 }: { x: number, y: number, stars: number, scale?: number }) => {
  const starCoords = [
    [0, -10], [-8, 6], [8, 6], // 3 stars arrangement
    [-12, -4], [12, -4], // 5 stars extras
  ];
  
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <circle r="30" fill="#fb923c" stroke="#9a3412" strokeWidth="2" />
      <circle r="25" fill="#fdba74" opacity="0.3" cx="-5" cy="-5" />
      <g fill="#ef4444">
        {stars === 1 && <path d="M0 -12 L3 0 L15 3 L3 6 L0 18 L-3 6 L-15 3 L-3 0 Z" transform="scale(0.8)" />}
        {stars === 3 && starCoords.slice(0, 3).map(([sx, sy], i) => (
          <path key={i} d="M0 -8 L2 0 L8 2 L2 4 L0 10 L-2 4 L-8 2 L-2 0 Z" transform={`translate(${sx}, ${sy}) scale(0.6)`} />
        ))}
        {stars === 5 && starCoords.map(([sx, sy], i) => (
          <path key={i} d="M0 -8 L2 0 L8 2 L2 4 L0 10 L-2 4 L-8 2 L-2 0 Z" transform={`translate(${sx}, ${sy}) scale(0.5)`} />
        ))}
      </g>
    </g>
  );
};

export const Mascot: React.FC<MascotProps> = ({ 
  className = "", 
  size = 48, 
  glowColor = "#3b82f6",
  grillStyle = 'iced-out',
  knifeStyle = 'standard',
  duragStyle = 'standard',
  pendantStyle = 'silver',
  chainStyle = 'silver',
  saberColor = '#a855f7', // Default purple
  showChain = false,
  highEyes = false,
  isCigarEquipped = false,
  isTossingCigar = false,
  showChefHat = false,
}) => {
  const baseHeight = highEyes ? 2500 : 1200;
  const height = showChain ? baseHeight + 500 : baseHeight;
  const displayHeight = size * (height / 1000);

  const getChainStroke = () => {
    if (chainStyle === 'gold') return 'url(#goldPendantGrad)';
    if (chainStyle === 'rose-gold') return 'url(#roseGoldPendant)';
    return 'url(#silverBling)';
  };

  const getPendantStroke = () => {
    if (pendantStyle === 'gold') return 'url(#goldPendantGrad)';
    if (pendantStyle === 'rose-gold') return 'url(#roseGoldPendant)';
    return 'url(#silverBling)';
  };

  return (
    <svg 
      width={size} 
      height={displayHeight} 
      viewBox={`0 0 1000 ${height}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
      style={{ 
        filter: `drop-shadow(0 0 ${size * 0.15}px ${glowColor}66)`,
        transition: 'filter 0.5s ease-in-out, height 0.3s ease-in-out, transform 0.3s ease-in-out',
        overflow: 'visible' 
      }}
    >
      <style>
        {`
          @keyframes sparkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .sparkle-dot {
            animation: sparkle 2s infinite ease-in-out;
          }
          @keyframes glint {
            0% { transform: translateX(-100%) rotate(45deg); }
            20% { transform: translateX(200%) rotate(45deg); }
            100% { transform: translateX(200%) rotate(45deg); }
          }
          .blade-glint {
            animation: glint 4s infinite ease-in-out;
          }
          @keyframes drip {
            0% { transform: translateY(0); opacity: 0.8; }
            70% { transform: translateY(20px); opacity: 1; }
            100% { transform: translateY(40px); opacity: 0; }
          }
          .blood-drip {
            animation: drip 3s infinite ease-in;
          }
          @keyframes flicker {
            0% { opacity: 0.95; filter: blur(2px) brightness(1); }
            20% { opacity: 1; filter: blur(3px) brightness(1.2); }
            40% { opacity: 0.9; filter: blur(2px) brightness(0.9); }
            60% { opacity: 1; filter: blur(4px) brightness(1.3); }
            80% { opacity: 0.85; filter: blur(2px) brightness(1.1); }
            100% { opacity: 0.95; filter: blur(2px) brightness(1); }
          }
          .saber-blade {
            animation: flicker 0.15s infinite;
          }
          path, rect, circle, ellipse {
            transition: fill 0.3s ease-in-out, stroke 0.3s ease-in-out, transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
          }
          @keyframes chainSway {
            0%, 100% { transform: rotate(-1.5deg) translateY(0); }
            50% { transform: rotate(1.5deg) translateY(8px); }
          }
          .chain-assembly {
            animation: chainSway 5s infinite ease-in-out;
            transform-origin: 500px 750px;
          }
          @keyframes pupilDilation {
            0%, 100% { transform: scale(1.1); }
            50% { transform: scale(0.9); }
          }
          .high-pupil {
            animation: pupilDilation 4s infinite ease-in-out;
            transform-origin: center;
          }
          @keyframes smokeDriftLarge {
            0% { transform: translate(0, 0) scale(1); opacity: 0; }
            15% { opacity: 0.5; }
            80% { opacity: 0.2; }
            100% { transform: translate(120px, 800px) scale(5); opacity: 0; }
          }
          .smoke-puff-large {
            animation: smokeDriftLarge 10s infinite ease-out;
          }
          @keyframes emberPulse {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.5) drop-shadow(0 0 10px #ef4444); }
          }
          .ember-tip {
            animation: emberPulse 2s infinite ease-in-out;
          }
          @keyframes droolWobble {
            0%, 100% { transform: scaleX(1) scaleY(1); }
            50% { transform: scaleX(1.05) scaleY(1.1); }
          }
          @keyframes droolDrip {
            0% { transform: translateY(0) scale(0.8); opacity: 0; }
            20% { opacity: 0.8; }
            80% { opacity: 0.5; }
            100% { transform: translateY(120px) scale(1.2); opacity: 0; }
          }
          .drool-main {
            animation: droolWobble 3s infinite ease-in-out;
            transform-origin: top center;
          }
          .drool-drip-active {
            animation: droolDrip 4s infinite ease-in;
          }
          @keyframes flyOffLeft {
            0% { transform: translate(580px, 755px) rotate(15deg); opacity: 1; }
            100% { transform: translate(-2000px, 400px) rotate(-180deg); opacity: 0; }
          }
          .cigar-tossing {
            animation: flyOffLeft 1s forwards cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: center;
          }
        `}
      </style>
      <defs>
        <filter id="smokeBlurLarge">
          <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
        </filter>
        
        <linearGradient id="droolGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient id="rastaRed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="rastaYellow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="rastaGreen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        <linearGradient id="cigarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="50%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <radialGradient id="emberGrad">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="70%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>

        <linearGradient id="diamondFacet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#d1d5db" />
          <stop offset="60%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>

        <linearGradient id="silverBling" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="25%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="75%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <linearGradient id="roseGoldPendant" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="30%" stopColor="#f43f5e" />
          <stop offset="50%" stopColor="#fff1f2" />
          <stop offset="70%" stopColor="#be123c" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>

        <linearGradient id="goldPendantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#fef9c3" />
          <stop offset="70%" stopColor="#a16207" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        <linearGradient id="aquabberryDiamond" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ccfbf1" />
          <stop offset="20%" stopColor="#5eead4" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>

        <linearGradient id="goldGrill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="20%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#fef9c3" />
          <stop offset="80%" stopColor="#a16207" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        <linearGradient id="opalGrill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#e0f2fe" />
          <stop offset="35%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#f9a8d4" />
          <stop offset="65%" stopColor="#6ee7b7" />
          <stop offset="80%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="45%" stopColor="#9ca3af" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>

        <linearGradient id="bladeGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="45%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="55%" stopColor="#a16207" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        <linearGradient id="bladeAdamant" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ccfbf1" />
          <stop offset="45%" stopColor="#2dd4bf" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#042f2e" />
        </linearGradient>

        <linearGradient id="bladeMythril" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="45%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="55%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        <radialGradient id="bloodGrad">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="70%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>

        <linearGradient id="saberCore" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={saberColor} />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={saberColor} />
        </linearGradient>

        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>

        <linearGradient id="silkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#444" />
          <stop offset="30%" stopColor="#111" />
          <stop offset="70%" stopColor="#222" />
          <stop offset="100%" stopColor="#555" />
        </linearGradient>

        <linearGradient id="royalGreenSilkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="30%" stopColor="#065f46" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="70%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        <linearGradient id="royalPurpleSilkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="30%" stopColor="#5b21b6" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="70%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>

        {/* Clip for the top cap area (inner silk) */}
        <clipPath id="ragSilkClip">
          <path d="M170 450 C165 220 410 100 500 100 C590 100 835 220 830 450 Z" />
        </clipPath>

        {/* Clip for the tail silk area */}
        <clipPath id="ragTailClip">
          <path d="M825 420 Q930 480 885 670 L845 645 Q865 510 790 420 Z" />
        </clipPath>

        <clipPath id="bladeClip">
          <path d="M0 0 L280 15 Q320 25 280 40 L0 55 Z" />
        </clipPath>
        <clipPath id="steakKnifeClip">
          <path d="M 0,-15 L 200,-12 Q 235,0 210,12 Q 150,15 0,15 Z" />
        </clipPath>
        <clipPath id="eyeClipLeft">
          <ellipse cx="385" cy="580" rx="45" ry="75" />
        </clipPath>
        <clipPath id="eyeClipRight">
          <ellipse cx="615" cy="580" rx="45" ry="75" />
        </clipPath>
      </defs>

      {showChain && (
        <g className="chain-assembly">
          <path 
            d="M280 750 Q280 1050 500 1100 Q720 1050 720 750" 
            stroke={getChainStroke()} 
            strokeWidth="24" 
            fill="none" 
            strokeLinecap="round" 
          />
          <path 
            d="M280 750 Q280 1050 500 1100 Q720 1050 720 750" 
            stroke="#111" 
            strokeWidth="28" 
            fill="none" 
            opacity="0.2" 
            transform="translate(4, 4)"
          />
          <circle cx="500" cy="1100" r="28" fill="#111" opacity="0.3" transform="translate(4, 4)" />
          <circle cx="500" cy="1100" r="24" stroke={getChainStroke()} strokeWidth="12" fill="none" />
          <circle cx="500" cy="1100" r="12" stroke="#111" strokeWidth="2" fill="none" opacity="0.4" />
          
          <g transform="translate(500, 1250)">
             <g opacity="0.4" transform="translate(6, 6)">
                <path d="M-50 -100 L0 -150 L50 -100 M-50 -100 L-50 -30 M50 -100 L50 -30 M-50 -30 L0 30 M0 -30 L50 30 M-50 30 L-50 100 M50 30 L50 100 M-50 100 L0 150 L50 100" stroke="#000" strokeWidth="25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
             </g>
             <g stroke={getPendantStroke()} strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M-50 -100 L0 -150 L50 -100" />
                <path d="M-50 -100 L-50 -30" />
                <path d="M50 -100 L50 -30" />
                <path d="M-50 -30 L0 30" />
                <path d="M0 -30 L50 30" />
                <path d="M-50 30 L-50 100" />
                <path d="M50 30 L50 100" />
                <path d="M-50 100 L0 150 L50 100" />
             </g>
             <circle cx="-50" cy="-100" r="4" fill="white" className="sparkle-dot" />
             <circle cx="50" cy="30" r="5" fill="white" className="sparkle-dot" style={{ animationDelay: '0.5s' }} />
             <circle cx="0" cy="150" r="4" fill="white" className="sparkle-dot" style={{ animationDelay: '1.2s' }} />
             <circle cx="0" cy="-150" r="6" fill="white" className="sparkle-dot" style={{ animationDelay: '0.8s' }} />
          </g>
        </g>
      )}

      <circle cx="500" cy="580" r="360" fill="black" />
      <circle cx="500" cy="580" r="335" fill="#1e50ff" />
      <circle cx="500" cy="580" r="350" stroke="black" strokeWidth="20" fill="none" />

      <g>
        {!highEyes ? (
          <g>
            <ellipse cx="385" cy="580" rx="45" ry="75" fill="black" stroke="#000" strokeWidth="15" />
            <ellipse cx="395" cy="545" rx="8" ry="12" fill="white" />
            <ellipse cx="615" cy="580" rx="45" ry="75" fill="black" stroke="#000" strokeWidth="15" />
            <ellipse cx="625" cy="545" rx="8" ry="12" fill="white" />
          </g>
        ) : (
          <g>
            <g clipPath="url(#eyeClipLeft)">
              <ellipse cx="385" cy="580" rx="45" ry="75" fill="#f8fafc" stroke="#000" strokeWidth="20" />
              <g stroke="#ef4444" strokeWidth="3" fill="none" opacity="0.6">
                <path d="M350 550 Q365 570 380 560" />
                <path d="M420 590 Q400 580 410 610" />
                <path d="M370 630 Q385 615 360 600" />
                <path d="M400 540 Q390 560 380 545" />
              </g>
              <circle cx="385" cy="585" r="22" fill="black" className="high-pupil" />
              <rect x="340" y="475" width="90" height="85" fill="#1e50ff" stroke="black" strokeWidth="20" />
            </g>
            <ellipse cx="385" cy="580" rx="45" ry="75" fill="none" stroke="#000" strokeWidth="20" />
            <g clipPath="url(#eyeClipRight)">
              <ellipse cx="615" cy="580" rx="45" ry="75" fill="#f8fafc" stroke="#000" strokeWidth="20" />
              <g stroke="#ef4444" strokeWidth="3" fill="none" opacity="0.6">
                <path d="M580 570 Q600 580 590 600" />
                <path d="M640 550 Q625 565 645 580" />
                <path d="M600 620 Q615 610 630 630" />
              </g>
              <circle cx="615" cy="585" r="22" fill="black" className="high-pupil" />
              <rect x="570" y="475" width="90" height="85" fill="#1e50ff" stroke="black" strokeWidth="20" />
            </g>
             <ellipse cx="615" cy="580" rx="45" ry="75" fill="none" stroke="#000" strokeWidth="20" />
          </g>
        )}

        <g opacity="0.3">
          <circle cx="760" cy="560" r="10" fill="white" />
          <circle cx="785" cy="585" r="14" fill="white" />
          <circle cx="765" cy="610" r="10" fill="white" />
        </g>

        <g transform="translate(305, 710)">
          <g>
            {[10, 75, 140, 205, 270, 335].map((x, i) => {
              const tilt = (i - 2.5) * 4;
              const yOff = Math.abs(i - 2.5) * 5;
              let fill = "url(#diamondFacet)";
              let strokeColor = "#333";
              let showFacets = true;
              let showGoldDetail = false;

              if (grillStyle === 'aquabberry-diamond') {
                fill = "url(#aquabberryDiamond)";
                strokeColor = "#0f766e";
                showFacets = true;
              } else if (grillStyle === 'gold') {
                fill = "url(#goldGrill)";
                strokeColor = "#854d0e";
                showFacets = false;
                showGoldDetail = true;
              } else if (grillStyle === 'opal') {
                fill = "url(#opalGrill)";
                strokeColor = "#ccc";
                showFacets = true;
              }

              return (
                <g key={i} transform={`translate(${x}, ${15 + yOff}) rotate(${tilt})`}>
                  <rect width="50" height="60" rx="4" fill={fill} stroke={strokeColor} strokeWidth="2" />
                  {showFacets && (
                    <>
                      <path d="M0 0 L50 60 M50 0 L0 60" stroke="white" strokeWidth="1" opacity="0.3" />
                      <path d="M25 0 L25 60 M0 30 L50 30" stroke="white" strokeWidth="1" opacity="0.2" />
                      <circle cx="10" cy="10" r="2" fill="white" className="sparkle-dot" style={{ animationDelay: `${i * 0.3}s` }} />
                      <circle cx="40" cy="50" r="1.5" fill="white" className="sparkle-dot" style={{ animationDelay: `${i * 0.5}s` }} />
                    </>
                  )}
                  {showGoldDetail && (
                    <path d="M5 10 L45 10 M5 30 L45 30" stroke="#854d0e" strokeWidth="1" opacity="0.4" />
                  )}
                  <rect x="5" y="5" width="40" height="15" fill="white" opacity={grillStyle === 'gold' ? 0.2 : 0.4} rx="2" />
                </g>
              );
            })}
          </g>
        </g>
        {highEyes && (
          <g transform="translate(420, 785)">
            <path 
              d="M0 0 Q20 80 15 110 Q12 140 30 135 Q40 130 35 110 Q30 80 50 0" 
              fill="url(#droolGrad)" 
              className="drool-main"
            />
            <circle cx="15" cy="120" r="8" fill="url(#droolGrad)" className="drool-drip-active" />
            <circle cx="15" cy="120" r="3" fill="white" opacity="0.6" className="drool-drip-active" />
          </g>
        )}
      </g>

      <g style={{ opacity: (knifeStyle === 'samuels-saber') ? 0 : 1, pointerEvents: (knifeStyle === 'samuels-saber') ? 'none' : 'auto' }}>
        <g transform="translate(80, 820) rotate(-45)">
          {knifeStyle === 'steak-knife' ? (
            <g transform="translate(-110, -15)">
              <rect width="160" height="30" rx="15" fill="#2d1a12" stroke="black" strokeWidth="2" />
              <circle cx="30" cy="15" r="4" fill="#94a3b8" />
              <circle cx="80" cy="15" r="4" fill="#94a3b8" />
              <circle cx="130" cy="15" r="4" fill="#94a3b8" />
            </g>
          ) : (
            <rect x="-100" y="-20" width="140" height="40" rx="6" fill="#111" stroke="black" strokeWidth="3" />
          )}

          <g transform="translate(-80, 0)">
              <ellipse cx="20" cy="-15" rx="25" ry="15" fill="#1e50ff" stroke="black" strokeWidth="2" transform="rotate(-15)" />
              {[0, 25, 50, 75].map((xOffset) => (
                  <rect key={xOffset} x={xOffset} y="-25" width="22" height="50" rx="10" fill="url(#skinGrad)" stroke="black" strokeWidth="2" />
              ))}
          </g>
          
          {knifeStyle !== 'steak-knife' && (
            <rect x="35" y="-35" width="15" height="70" rx="4" fill="#222" stroke="black" strokeWidth="2" />
          )}
          
          <g transform={knifeStyle === 'steak-knife' ? "translate(50, 0)" : "translate(50, -28)"}>
              {(() => {
                let bladeFill = "url(#bladeGrad)";
                if (knifeStyle === 'gold') bladeFill = "url(#bladeGold)";
                if (knifeStyle === 'adamant') bladeFill = "url(#bladeAdamant)";
                if (knifeStyle === 'mythril') bladeFill = "url(#bladeMythril)";
                
                if (knifeStyle === 'steak-knife') {
                  const steakBladePath = "M 0,-15 L 200,-12 Q 235,0 210,12 Q 150,15 0,15 Z";
                  return (
                    <g>
                      <path d={steakBladePath} fill={bladeFill} stroke="#111" strokeWidth="3" />
                      <g clipPath="url(#steakKnifeClip)">
                          <rect x="-100" y="-50" width="40" height="200" fill="white" opacity="0.3" className="blade-glint" />
                      </g>
                    </g>
                  );
                }
                
                return <path d="M0 0 L280 15 Q320 25 280 40 L0 55 Z" fill={bladeFill} stroke="#111" strokeWidth="3" />;
              })()}

              {knifeStyle === 'bloody' && (
                <g>
                  <path d="M120 18 Q160 25 140 38 L80 30 Z" fill="url(#bloodGrad)" opacity="0.8" />
                  <path d="M220 24 Q260 28 240 36 L180 32 Z" fill="url(#bloodGrad)" opacity="0.9" />
                  <circle cx="150" cy="40" r="5" fill="#991b1b" className="blood-drip" style={{ animationDelay: '0s' }} />
                  <circle cx="210" cy="35" r="3.5" fill="#7f1d1d" className="blood-drip" style={{ animationDelay: '1.5s' }} />
                  <path d="M50 15 L280 28" stroke="#ef4444" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
                </g>
              )}
              
              {knifeStyle !== 'steak-knife' && (
                <>
                  <path d="M20 22 L240 28" stroke="#000" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
                  <path d="M10 50 L270 38" stroke="white" strokeWidth="1" opacity="0.5" />
                  <g clipPath="url(#bladeClip)">
                      <rect x="-100" y="-50" width="40" height="200" fill="white" opacity="0.4" className="blade-glint" />
                  </g>
                </>
              )}
          </g>
        </g>
      </g>

      {isCigarEquipped && (
        <g transform="translate(580, 755) rotate(15)" className={isTossingCigar ? "cigar-tossing" : ""}>
          <rect x="0" y="0" width="130" height="34" rx="5" fill="url(#cigarGrad)" stroke="#271103" strokeWidth="3" />
          <g stroke="black" strokeWidth="1" opacity="0.2">
            <path d="M30 0 L30 34" />
            <path d="M65 0 L65 34" />
            <path d="M100 0 L100 34" />
          </g>
          <g transform="translate(130, 17)">
            <circle r="18" fill="url(#emberGrad)" className="ember-tip" />
            <circle r="7" fill="white" opacity="0.7" className="ember-tip" />
            <path d="M0 -18 Q30 0 0 18" fill="#444" stroke="#111" strokeWidth="2" />
            <path d="M10 -10 Q15 0 10 10" fill="#666" opacity="0.5" />
          </g>
        </g>
      )}

      <g style={{ opacity: knifeStyle === 'samuels-saber' ? 1 : 0, pointerEvents: knifeStyle === 'samuels-saber' ? 'auto' : 'none' }}>
        <g transform="translate(130, 780)">
          <g>
            {[ -45, -15 ].map((yOffset) => (
                <rect key={yOffset} x="-35" y={yOffset} width="70" height="25" rx="12" fill="url(#skinGrad)" stroke="black" strokeWidth="3" />
            ))}
          </g>
          <g transform="translate(0, 0)">
            <rect x="-20" y="-120" width="40" height="180" rx="6" fill="#666" stroke="black" strokeWidth="3" />
            {[ -100, -80, -60, -40, -20, 0, 20, 40 ].map(y => (
              <rect key={y} x="-20" y={y} width="40" height="8" fill="black" />
            ))}
            <rect x="-18" y="-115" width="4" height="170" fill="#eab308" opacity="0.6" />
            <rect x="14" y="-115" width="4" height="170" fill="#eab308" opacity="0.6" />
            <rect x="-25" y="-140" width="50" height="30" rx="4" fill="#333" stroke="black" strokeWidth="3" />
          </g>
          <g>
            <ellipse cx="25" cy="-20" rx="28" ry="18" fill="#1e50ff" stroke="black" strokeWidth="3" transform="rotate(25)" />
            {[ 15, 45 ].map((yOffset) => (
                <rect key={yOffset} x="-35" y={yOffset} width="70" height="25" rx="12" fill="url(#skinGrad)" stroke="black" strokeWidth="3" />
            ))}
          </g>
          <g transform="translate(0, -140)">
            <rect x="-25" y="-600" width="50" height="600" rx="25" fill={saberColor} opacity="0.6" className="saber-blade" style={{ filter: 'blur(20px)' }} />
            <rect x="-18" y="-590" width="36" height="590" rx="18" fill={saberColor} opacity="0.8" className="saber-blade" style={{ filter: 'blur(8px)' }} />
            <rect x="-10" y="-580" width="20" height="580" rx="10" fill="url(#saberCore)" className="saber-blade" />
          </g>
        </g>
      </g>

      <g>
        {showChefHat ? (
          <g transform="translate(0, -20)">
             <path 
               d="M180 440 
                  L180 340 
                  C 60 240, 60 80, 280 60
                  C 350 -70, 650 -70, 720 60
                  C 940 80, 940 240, 820 340
                  L820 440 
                  Q500 400 180 440 Z" 
               fill="#ffffff" 
             />
             <path 
               d="M180 440 
                  L180 340 
                  C 60 240, 60 80, 280 60
                  C 350 -70, 650 -70, 720 60
                  C 940 80, 940 240, 820 340
                  L820 440 
                  Q500 400 180 440 Z" 
               stroke="black" strokeWidth="15" fill="none" strokeLinecap="round" strokeLinejoin="round" 
             />
             <path 
               d="M180 340 Q500 300 820 340" 
               stroke="black" strokeWidth="10" fill="none" opacity="0.6" strokeLinecap="round"
             />
             <g stroke="black" strokeWidth="4" opacity="0.2" fill="none" strokeLinecap="round">
               <path d="M300 80 Q320 220 350 330" />
               <path d="M500 65 Q510 210 500 315" />
               <path d="M700 80 Q680 220 650 330" />
               <path d="M220 330 Q250 310 280 340" />
               <path d="M780 330 Q750 310 720 340" />
             </g>
             <path d="M195 425 Q500 395 805 425" stroke="black" strokeWidth="2" opacity="0.1" fill="none" />
          </g>
        ) : !highEyes ? (
          <g>
            {(() => {
              const dFill = duragStyle === 'royal-green' ? 'url(#royalGreenSilkGrad)' : duragStyle === 'dragonball-purple' ? 'url(#royalPurpleSilkGrad)' : 'url(#silkGrad)';
              return (
                <>
                  {/* BASE BLACK LAYER (OUTLINE) */}
                  <path d="M150 460 C140 190 400 60 500 60 C600 60 860 190 850 460 L150 460 Z" fill="black" />
                  
                  {/* INNER SILK FABRIC */}
                  <path d="M170 450 C165 220 410 100 500 100 C590 100 835 220 830 450 Z" fill={dFill} />
                  
                  {/* DRAGONBALL PRINT LAYER (CLIPPED TO SILK AREA ONLY) */}
                  {duragStyle === 'dragonball-purple' && (
                    <g clipPath="url(#ragSilkClip)">
                      <DragonBall x={300} y={200} stars={5} scale={1.6} />
                      <DragonBall x={500} y={250} stars={3} scale={1.8} />
                      <DragonBall x={700} y={200} stars={1} scale={1.4} />
                      <DragonBall x={400} y={400} stars={1} scale={1.2} />
                      <DragonBall x={600} y={400} stars={5} scale={1.4} />
                    </g>
                  )}

                  {/* SEAM LINES & FOREHEAD BAND */}
                  <path d="M500 100 Q520 270 500 450" stroke="black" strokeWidth="12" strokeLinecap="round" opacity="0.8" fill="none" />
                  <path d="M500 100 Q520 270 500 450" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.2" fill="none" />
                  
                  <path d="M155 400 Q500 360 845 400 L845 460 Q500 420 155 460 Z" fill="black" />
                  <path d="M170 415 Q500 380 830 415 L830 445 Q500 410 170 445 Z" fill={duragStyle === 'royal-green' ? '#064e3b' : duragStyle === 'dragonball-purple' ? '#4c1d95' : '#333'} opacity={duragStyle === 'royal-green' ? 0.9 : 1} />
                  
                  {/* TAILS AREA */}
                  <path d="M840 420 Q950 490 900 690 L850 660 Q880 520 800 420 Z" fill="black" />
                  <path d="M825 420 Q930 480 885 670 L845 645 Q865 510 790 420 Z" fill={dFill} />
                  
                  {/* TAIL PRINT (CLIPPED) */}
                  {duragStyle === 'dragonball-purple' && (
                    <g clipPath="url(#ragTailClip)">
                      <DragonBall x={875} y={550} stars={3} scale={1.0} />
                    </g>
                  )}
                </>
              );
            })()}
            <path d="M300 190 Q400 140 450 160" stroke="white" strokeWidth="4" opacity="0.1" fill="none" />
            <path d="M600 190 Q700 240 750 290" stroke="white" strokeWidth="6" opacity="0.1" fill="none" />
          </g>
        ) : (
          <g>
             <path d="M150 460 C140 160 400 30 500 30 C600 30 860 160 850 460 Z" fill="black" />
             <path d="M185 320 C180 180 400 60 500 60 C600 60 820 180 815 320 Q500 280 185 320 Z" fill="url(#rastaRed)" stroke="black" strokeWidth="4" />
             <path d="M165 400 Q500 360 835 400 L815 320 Q500 280 185 320 Z" fill="url(#rastaYellow)" stroke="black" strokeWidth="4" />
             <path d="M150 460 Q500 420 850 460 L835 400 Q500 360 165 400 Z" fill="url(#rastaGreen)" stroke="black" strokeWidth="4" />
             <g stroke="black" strokeWidth="2" opacity="0.3" fill="none">
                <path d="M500 60 Q515 250 500 440" />
                <path d="M350 120 Q370 250 380 410" />
                <path d="M650 120 Q630 250 620 410" />
             </g>
             <path d="M170 410 Q500 375 830 410" stroke="white" strokeWidth="2" opacity="0.2" fill="none" />
          </g>
        )}
      </g>

      {highEyes && (
        <g filter="url(#smokeBlurLarge)" opacity="0.7">
          <circle cx="400" cy="850" r="120" fill="#ffffff" className="smoke-puff-large" style={{ animationDelay: '0s' }} />
          <circle cx="600" cy="880" r="140" fill="#ffffff" className="smoke-puff-large" style={{ animationDelay: '2.5s' }} />
          <circle cx="250" cy="900" r="100" fill="#ffffff" className="smoke-puff-large" style={{ animationDelay: '5s' }} />
          <circle cx="750" cy="840" r="130" fill="#ffffff" className="smoke-puff-large" style={{ animationDelay: '7.5s' }} />
          <circle cx="500" cy="950" r="160" fill="#ffffff" className="smoke-puff-large" style={{ animationDelay: '1s' }} />
          <circle cx="450" cy="1100" r="180" fill="#ffffff" className="smoke-puff-large" style={{ animationDelay: '3.5s' }} />
          <circle cx="550" cy="1200" r="150" fill="#ffffff" className="smoke-puff-large" style={{ animationDelay: '6s' }} />
        </g>
      )}
    </svg>
  );
};
