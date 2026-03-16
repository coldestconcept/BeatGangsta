import React, { useState, useEffect, useMemo } from 'react';

const generateTrees = (count: number, heightRange: [number, number]) => {
  return Array.from({ length: count }).map((_, i) => ({
    height: heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]),
    left: (i / count) * 100 + (Math.random() * (100/count) - (50/count)),
    seed: Math.floor(Math.random() * 10000)
  }));
};

const backTrees = generateTrees(35, [40, 75]);
const midTrees = generateTrees(25, [60, 95]);
const frontTrees = generateTrees(15, [80, 130]);

const RealisticPine: React.FC<{ className?: string, colorTop: string, colorBottom: string, style?: React.CSSProperties, seed: number, x: number, height: number, width: number }> = ({ className, colorTop, colorBottom, style, seed, x, height, width }) => (
  <g transform={`translate(${x}, 500) scale(${width/280}, ${-height/520})`} className={className} style={style}>
    <path d="M100,0 
             L115,30 L105,30 
             L125,70 L110,70 
             L140,120 L120,120 
             L155,180 L130,180 
             L175,250 L145,250 
             L200,330 L165,330 
             L230,420 L115,420 
             L115,500 L85,500 L85,420 
             L-30,420 L35,330 
             L0,330 L55,250 
             L25,250 L70,180 
             L45,180 L80,120 
             L60,120 L90,70 
             L75,70 L95,30 
             L85,30 Z" fill={`url(#treeGrad-${seed % 5})`} filter="url(#roughpine)" />
  </g>
);

const TreeChunk = ({ trees, colorTop, colorBottom, yOffset, blur }: { trees: any[], colorTop: string, colorBottom: string, yOffset: number, blur: number }) => {
  return (
    <div className="absolute inset-0 w-full h-full flex items-end" style={{ filter: blur > 0 ? `blur(${blur}px)` : 'none' }}>
      <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="none">
        {trees.map((t, i) => (
          <RealisticPine 
            key={i}
            seed={t.seed}
            colorTop={colorTop}
            colorBottom={colorBottom}
            x={t.left * 10}
            height={t.height * 5}
            width={t.height * 3}
            className="origin-bottom"
          />
        ))}
      </svg>
    </div>
  );
};

export const GangstaFairy = ({ isShooting = false, droppedMags = false, isLTR = true }: { isShooting?: boolean, droppedMags?: boolean, isLTR?: boolean }) => (
  <svg viewBox="0 0 200 200" width="150" height="150" className="drop-shadow-[0_0_20px_rgba(167,255,235,0.9)] overflow-visible">
    <defs>
      <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a7ffeb" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
      </linearGradient>
      <pattern id="camo" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#1b5e20" />
        <path d="M0,5 Q5,0 10,5 T20,5 L20,15 Q15,20 10,15 T0,15 Z" fill="#2e7d32" />
        <circle cx="15" cy="5" r="4" fill="#4caf50" />
      </pattern>
    </defs>
    
    {/* Wings (Fluttering) */}
    <g className="origin-[100px_100px] animate-[wingFlutter_0.15s_ease-in-out_infinite]">
      <g fill="url(#wingGrad)" stroke="#a7ffeb" strokeWidth="2">
        <path d="M100,80 C140,0 200,20 190,70 C180,120 140,110 100,100 Z" />
        <path d="M100,80 C130,140 180,160 170,120 C160,80 130,90 100,100 Z" />
        <path d="M100,80 C60,0 0,20 10,70 C20,120 60,110 100,100 Z" />
        <path d="M100,80 C70,140 20,160 30,120 C40,80 70,90 100,100 Z" />
      </g>
    </g>

    {/* Body Group (Bobbing) */}
    <g className="origin-[100px_100px] animate-[bodyBob_2s_ease-in-out_infinite_alternate]">
      
      {/* Left Leg Group */}
      <g className="origin-[85px_135px] animate-[legSwingLeft_1s_ease-in-out_infinite_alternate]">
        <path d="M65,135 L100,135 L90,175 L75,175 Z" fill="url(#camo)" />
        <rect x="70" y="168" width="22" height="8" rx="4" fill="#00e676" />
        <rect x="75" y="176" width="8" height="12" fill="#81d4fa" />
        <g transform="translate(10, 0)">
          <path d="M50,195 L75,195 L75,185 L60,185 Z" fill="#4b92db" />
          <rect x="50" y="190" width="25" height="5" fill="#ffffff" />
          <text x="62" y="194" fill="#000000" fontSize="4" fontWeight="bold" textAnchor="middle" transform={!isLTR ? "translate(62, 194) scale(-1, 1) translate(-62, -194)" : undefined}>"AIR"</text>
          <rect x="68" y="180" width="3" height="10" fill="#f44336" transform="rotate(20 68 180)" />
        </g>
      </g>

      {/* Right Leg Group */}
      <g className="origin-[115px_135px] animate-[legSwingRight_1s_ease-in-out_infinite_alternate]">
        <path d="M100,135 L135,135 L125,175 L110,175 Z" fill="url(#camo)" />
        <rect x="108" y="168" width="22" height="8" rx="4" fill="#00e676" />
        <rect x="117" y="176" width="8" height="12" fill="#81d4fa" />
        <g transform="translate(-5, 0)">
          <path d="M115,195 L140,195 L130,185 L115,185 Z" fill="#4b92db" />
          <rect x="115" y="190" width="25" height="5" fill="#ffffff" />
          <text x="127" y="194" fill="#000000" fontSize="4" fontWeight="bold" textAnchor="middle" transform={!isLTR ? "translate(127, 194) scale(-1, 1) translate(-127, -194)" : undefined}>"AIR"</text>
        </g>
      </g>

      {/* Left Arm Group */}
      <g 
        className="origin-[80px_85px] transition-transform duration-300"
        style={{ transform: isShooting ? 'rotate(45deg)' : '' }}
      >
        <g className={!isShooting ? 'animate-[armSwingLeft_1s_ease-in-out_infinite_alternate]' : 'animate-[recoilLeft_0.1s_infinite_alternate]'}>
          <path d="M80,85 L40,105 L35,95 L75,75 Z" fill="#81d4fa" />
          <circle cx="35" cy="100" r="8" fill="#81d4fa" />
          <rect x="40" y="92" width="6" height="8" fill="#ffd700" />
          <rect x="48" y="92" width="3" height="8" fill="#ffb300" />
          <g fill="#ffd700" stroke="#ffb300" strokeWidth="1">
            <rect x="5" y="90" width="30" height="8" rx="2" />
            {!droppedMags && <rect x="20" y="98" width="8" height="15" transform="rotate(15 20 98)" />}
            <rect x="5" y="90" width="8" height="4" fill="#fff" opacity="0.5" />
          </g>
          {droppedMags && (
            <g className="animate-[magDrop_3s_forwards_ease-in] origin-[24px_105px]">
              <rect x="20" y="98" width="8" height="15" fill="#ffd700" stroke="#ffb300" strokeWidth="1" transform="rotate(15 20 98)" />
            </g>
          )}
          {isShooting && (
            <g className="animate-[flash_0.05s_infinite_alternate]">
              <circle cx="0" cy="94" r="12" fill="#ffeb3b" opacity="0.8" />
              <circle cx="0" cy="94" r="6" fill="#ffffff" />
              <rect x="-40" y="93" width="20" height="2" fill="#ffd700" className="animate-[bulletFlyLeft_0.1s_infinite]" />
            </g>
          )}
        </g>
      </g>

      {/* Right Arm Group */}
      <g 
        className="origin-[120px_85px] transition-transform duration-300"
        style={{ transform: isShooting ? 'rotate(-45deg)' : '' }}
      >
        <g className={!isShooting ? 'animate-[armSwingRight_1s_ease-in-out_infinite_alternate]' : 'animate-[recoilRight_0.1s_infinite_alternate]'}>
          <path d="M120,85 L160,105 L165,95 L125,75 Z" fill="#81d4fa" />
          <circle cx="165" cy="100" r="8" fill="#81d4fa" />
          <rect x="150" y="92" width="10" height="8" fill="#e0e0e0" />
          <circle cx="155" cy="96" r="3" fill="#ffffff" className="drop-shadow-[0_0_2px_#fff]" />
          <g fill="#ffd700" stroke="#ffb300" strokeWidth="1">
            <rect x="165" y="90" width="30" height="8" rx="2" />
            {!droppedMags && <rect x="172" y="98" width="8" height="15" transform="rotate(-15 172 98)" />}
            <rect x="187" y="90" width="8" height="4" fill="#fff" opacity="0.5" />
          </g>
          {droppedMags && (
            <g className="animate-[magDrop_3s_forwards_ease-in] origin-[176px_105px]">
              <rect x="172" y="98" width="8" height="15" fill="#ffd700" stroke="#ffb300" strokeWidth="1" transform="rotate(-15 172 98)" />
            </g>
          )}
          {isShooting && (
            <g className="animate-[flash_0.05s_infinite_alternate]">
              <circle cx="200" cy="94" r="12" fill="#ffeb3b" opacity="0.8" />
              <circle cx="200" cy="94" r="6" fill="#ffffff" />
              <rect x="220" y="93" width="20" height="2" fill="#ffd700" className="animate-[bulletFlyRight_0.1s_infinite]" />
            </g>
          )}
        </g>
      </g>

      {/* Torso */}
      <g>
        <path d="M75,75 L125,75 L135,135 L65,135 Z" fill="#004d40" />
        <text x="100" y="120" fill="#ffffff" fontSize="32" fontWeight="900" textAnchor="middle" fontFamily="monospace" transform={!isLTR ? "translate(100, 120) scale(-1, 1) translate(-100, -120)" : undefined}>69</text>
        <path d="M88,75 Q100,105 112,75" stroke="#e0e0e0" strokeWidth="3" fill="none" />
        <text x="100" y="108" fill="#e0e0e0" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" className="drop-shadow-[0_0_2px_#fff]" transform={!isLTR ? "translate(100, 108) scale(-1, 1) translate(-100, -108)" : undefined}>S</text>
      </g>

      {/* Head Group */}
      <g>
        <rect x="95" y="60" width="10" height="15" fill="#81d4fa" />
        <circle cx="100" cy="45" r="20" fill="#81d4fa" />
        
        {/* Hair */}
        <path d="M80,42 C65,55 75,80 82,80 C75,65 82,50 82,50 Z" fill="#212121" />
        <path d="M120,42 C135,55 125,80 118,80 C125,65 118,50 118,50 Z" fill="#212121" />

        {/* Bandana */}
        <g fill="#00e676">
          <path d="M78,32 Q100,20 122,32 L120,42 Q100,32 80,42 Z" />
          <circle cx="100" cy="34" r="5" />
          <path d="M100,34 L92,20 L108,20 Z" />
        </g>

        {/* Anime Eyes */}
        <g>
          {/* Eye Whites */}
          <ellipse cx="90" cy="42" rx="5" ry="7" fill="#ffffff" />
          <ellipse cx="110" cy="42" rx="5" ry="7" fill="#ffffff" />
          {/* Irises (Blue) */}
          <ellipse cx="90" cy="42" rx="3" ry="5" fill="#0277bd" />
          <ellipse cx="110" cy="42" rx="3" ry="5" fill="#0277bd" />
          {/* Pupils */}
          <ellipse cx="90" cy="42" rx="1.5" ry="2.5" fill="#000000" />
          <ellipse cx="110" cy="42" rx="1.5" ry="2.5" fill="#000000" />
          {/* Highlights */}
          <circle cx="89" cy="40" r="1.5" fill="#ffffff" />
          <circle cx="109" cy="40" r="1.5" fill="#ffffff" />
          
          {/* Lashes */}
          <path d="M85,38 Q90,34 95,38" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M85,38 L82,35 M87,36 L85,33" stroke="#000" strokeWidth="1" fill="none" />
          
          <path d="M105,38 Q110,34 115,38" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M115,38 L118,35 M113,36 L115,33" stroke="#000" strokeWidth="1" fill="none" />

          {/* Eyebrows (Angry) */}
          <g className="animate-[faceFadeOut_4s_ease-in-out_infinite]">
            <path d="M85,32 L95,36" stroke="#000" strokeWidth="1.5" fill="none" />
            <path d="M115,32 L105,36" stroke="#000" strokeWidth="1.5" fill="none" />
          </g>
          {/* Eyebrows (Happy) */}
          <g className="animate-[faceFadeIn_4s_ease-in-out_infinite]">
            <path d="M85,34 Q90,30 95,34" stroke="#000" strokeWidth="1.5" fill="none" />
            <path d="M115,34 Q110,30 105,34" stroke="#000" strokeWidth="1.5" fill="none" />
          </g>
        </g>

        {/* Lips (Animated Transition) */}
        <g>
          {/* Angry Frown */}
          <path d="M94,56 Q100,52 106,56" stroke="#4a148c" strokeWidth="2.5" fill="none" className="animate-[faceFadeOut_4s_ease-in-out_infinite]" />
          {/* Happy Smile */}
          <path d="M94,54 Q100,60 106,54" stroke="#4a148c" strokeWidth="2.5" fill="none" className="animate-[faceFadeIn_4s_ease-in-out_infinite]" />
        </g>
        
        {/* Tear drop */}
        <path d="M90,48 Q92,52 90,54 Q88,52 90,48" fill="#01579b" />
      </g>
    </g>
  </svg>
);

export const FairyController = ({ onFinished }: { onFinished?: () => void }) => {
  const [pos, setPos] = useState({ x: -50, y: 50, scaleX: 1, transitionDuration: 0 });
  const [isShooting, setIsShooting] = useState(false);
  const [droppedMags, setDroppedMags] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let shootStartId: NodeJS.Timeout;
    let shootEndId: NodeJS.Timeout;
    let finishId: NodeJS.Timeout;
    
    const fly = () => {
      const isLTR = Math.random() > 0.5;
      const startX = isLTR ? -50 : 150;
      const endX = isLTR ? 150 : -50;
      const startY = Math.random() * 80 + 10; 
      const endY = startY + (Math.random() * 40 - 20); 
      const duration = 12 + Math.random() * 6; 

      setPos({ x: startX, y: startY, scaleX: isLTR ? 1 : -1, transitionDuration: 0 });
      setIsShooting(false);
      setDroppedMags(false);

      timeoutId = setTimeout(() => {
        setPos({ x: endX, y: endY, scaleX: isLTR ? 1 : -1, transitionDuration: duration });
        
        shootStartId = setTimeout(() => {
          setIsShooting(true);
        }, duration * 0.3 * 1000);

        shootEndId = setTimeout(() => {
          setIsShooting(false);
          setDroppedMags(true);
        }, duration * 0.7 * 1000);

        finishId = setTimeout(() => {
          if (onFinished) onFinished();
        }, (duration + 1) * 1000);
      }, 100);
    };

    fly();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(shootStartId);
      clearTimeout(shootEndId);
      clearTimeout(finishId);
    };
  }, [onFinished]);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 overflow-visible">
      <div 
        className="absolute"
        style={{ 
          top: `${pos.y}%`, 
          left: `${pos.x}vw`,
          transform: `scaleX(${pos.scaleX})`,
          transition: pos.transitionDuration > 0 ? `left ${pos.transitionDuration}s linear, top ${pos.transitionDuration}s linear` : 'none',
        }}
      >
        <div style={{ animation: 'fairyBob 3s ease-in-out infinite' }}>
          <GangstaFairy isShooting={isShooting} droppedMags={droppedMags} isLTR={pos.scaleX === 1} />
        </div>
      </div>
    </div>
  );
};

export const EtherealForestField: React.FC = () => {
  const lightRays = useMemo(() => [...Array(8)].map((_, i) => ({
    rot: 20 + Math.random() * 25,
    left: i * 15 - 20,
    width: 15 + Math.random() * 25,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 7
  })), []);

  const spores = useMemo(() => [...Array(20)].map((_, i) => ({
    left: Math.random() * 100,
    size: 3 + Math.random() * 6,
    delay: Math.random() * 15,
    duration: 12 + Math.random() * 10
  })), []);

  const fireflies = useMemo(() => [...Array(25)].map((_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 5 + Math.random() * 5,
    blinkDuration: 1 + Math.random() * 3,
    delay: Math.random() * 5
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-[#000a08] via-[#001f18] to-[#003d30]">
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="roughpine">
            <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {[...Array(5)].map((_, i) => (
            <linearGradient key={i} id={`treeGrad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={i === 0 ? "#001a14" : i === 1 ? "#00261c" : "#00332a"} />
              <stop offset="85%" stopColor={i === 0 ? "#00332a" : i === 1 ? "#004d40" : "#00695c"} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          ))}
        </defs>
      </svg>
      <style>
        {`
          @keyframes panRight {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes rayPulse {
            0%, 100% { opacity: 0.1; transform: rotate(var(--ray-rot)) scaleX(1) translateX(0); }
            50% { opacity: 0.5; transform: rotate(var(--ray-rot)) scaleX(1.5) translateX(20px); }
          }
          @keyframes fallDown {
            0% { transform: translateY(-20vh) scale(0.5); opacity: 0; }
            20% { opacity: 0.8; }
            80% { opacity: 0.8; }
            100% { transform: translateY(120vh) scale(1.5); opacity: 0; }
          }
          
          .layer-back { animation: panRight 120s linear infinite; }
          .layer-mid { animation: panRight 80s linear infinite; }
          .layer-front { animation: panRight 40s linear infinite; }
          
          .light-ray {
            transform-origin: top left;
            animation: rayPulse 8s ease-in-out infinite;
          }
          
          .spore {
            position: absolute;
            background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(167,255,235,0.6) 40%, rgba(255,255,255,0) 100%);
            border-radius: 50%;
            animation: fallDown 15s linear infinite;
            box-shadow: 0 0 10px 2px rgba(167,255,235,0.4);
          }
          
          @keyframes fairyFly {
            0% { transform: translateX(0) translateY(10vh) rotate(5deg); }
            25% { transform: translateX(35vw) translateY(-5vh) rotate(-5deg); }
            50% { transform: translateX(70vw) translateY(5vh) rotate(5deg); }
            100% { transform: translateX(140vw) translateY(-10vh) rotate(-5deg); }
          }
          @keyframes fairyBob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-40px); }
          }
          @keyframes fireflyFloat {
            0% { transform: translate(0, 0); }
            33% { transform: translate(15px, -20px); }
            66% { transform: translate(-10px, -40px); }
            100% { transform: translate(20px, -60px); }
          }
          @keyframes fireflyBlink {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 1; }
          }
          @keyframes wingFlutter {
            0%, 100% { transform: scaleX(1); }
            50% { transform: scaleX(0.3); }
          }
          @keyframes armSwingLeft {
            0%, 100% { transform: rotate(15deg); }
            50% { transform: rotate(-15deg); }
          }
          @keyframes armSwingRight {
            0%, 100% { transform: rotate(-15deg); }
            50% { transform: rotate(15deg); }
          }
          @keyframes legSwingLeft {
            0%, 100% { transform: rotate(-20deg); }
            50% { transform: rotate(20deg); }
          }
          @keyframes legSwingRight {
            0%, 100% { transform: rotate(20deg); }
            50% { transform: rotate(-20deg); }
          }
          @keyframes bodyBob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes faceFadeOut {
            0%, 30% { opacity: 1; }
            40%, 90% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes faceFadeIn {
            0%, 30% { opacity: 0; }
            40%, 90% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}
      </style>

      {/* Mist / Fog background */}
      <div className="absolute inset-0 bg-[#00e676]/5 backdrop-blur-3xl z-0" />

      {/* Background Trees (Slow) */}
      <div className="absolute inset-0 z-10 flex w-[200vw] layer-back opacity-50">
        <div className="relative w-[100vw] h-full">
          <TreeChunk trees={backTrees} colorTop="#001a14" colorBottom="#00332a" yOffset={0} blur={4} />
        </div>
        <div className="relative w-[100vw] h-full">
          <TreeChunk trees={backTrees} colorTop="#001a14" colorBottom="#00332a" yOffset={0} blur={4} />
        </div>
      </div>

      {/* Midground Trees (Medium) */}
      <div className="absolute inset-0 z-20 flex w-[200vw] layer-mid opacity-80">
        <div className="relative w-[100vw] h-full">
          <TreeChunk trees={midTrees} colorTop="#00261c" colorBottom="#004d40" yOffset={5} blur={2} />
        </div>
        <div className="relative w-[100vw] h-full">
          <TreeChunk trees={midTrees} colorTop="#00261c" colorBottom="#004d40" yOffset={5} blur={2} />
        </div>
      </div>

      {/* Foreground Trees (Fast) */}
      <div className="absolute inset-0 z-30 flex w-[200vw] layer-front">
        <div className="relative w-[100vw] h-full">
          <TreeChunk trees={frontTrees} colorTop="#00332a" colorBottom="#00695c" yOffset={15} blur={0} />
        </div>
        <div className="relative w-[100vw] h-full">
          <TreeChunk trees={frontTrees} colorTop="#00332a" colorBottom="#00695c" yOffset={15} blur={0} />
        </div>
      </div>

      {/* Ground Fog Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#001f18] to-transparent z-[35] pointer-events-none" />

      {/* Light Rays */}
      <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden mix-blend-screen">
        {lightRays.map((ray, i) => (
          <div 
            key={`ray-${i}`}
            className="absolute top-[-20%] bg-gradient-to-b from-[#ffffff] via-[#a7ffeb]/40 to-transparent light-ray"
            style={{
              left: `${ray.left}%`,
              width: `${ray.width}%`,
              height: '150%',
              '--ray-rot': `${ray.rot}deg`,
              animationDelay: `${ray.delay}s`,
              animationDuration: `${ray.duration}s`
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Floating Spores/Particles */}
      <div 
        className="absolute inset-0 z-50 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0px, transparent 120px, black 200px, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, transparent 120px, black 200px, black 100%)'
        }}
      >
        {spores.map((spore, i) => (
          <div
            key={`spore-${i}`}
            className="spore"
            style={{
              left: `${spore.left}%`,
              width: `${spore.size}px`,
              height: `${spore.size}px`,
              animationDelay: `${spore.delay}s`,
              animationDuration: `${spore.duration}s`
            }}
          />
        ))}
      </div>

      {/* Fireflies */}
      <div 
        className="absolute inset-0 z-40 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0px, transparent 120px, black 200px, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, transparent 120px, black 200px, black 100%)'
        }}
      >
        {fireflies.map((ff, i) => (
          <div
            key={`firefly-${i}`}
            className="absolute rounded-full bg-[#a7ffeb]"
            style={{
              left: `${ff.left}%`,
              top: `${ff.top}%`,
              width: `${ff.size}px`,
              height: `${ff.size}px`,
              boxShadow: '0 0 8px 2px rgba(167,255,235,0.8)',
              animation: `fireflyFloat ${ff.duration}s ease-in-out infinite alternate, fireflyBlink ${ff.blinkDuration}s ease-in-out infinite alternate`,
              animationDelay: `${ff.delay}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
