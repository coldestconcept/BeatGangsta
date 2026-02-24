
import React from 'react';

const RavenIcon = ({ className, flapDuration = "0.8s" }: { className?: string, flapDuration?: string }) => (
  <svg viewBox="-15 -10 140 120" className={className}>
    <defs>
      {/* Dark maroon to black gradient for the body */}
      <linearGradient id="ravenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2a0810" />
        <stop offset="50%" stopColor="#0a0a0a" />
        <stop offset="100%" stopColor="#1a0508" />
      </linearGradient>
      {/* Gradient for the beak */}
      <linearGradient id="beakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8c4a5b" />
        <stop offset="100%" stopColor="#2a0810" />
      </linearGradient>
      {/* Emboss filter */}
      <filter id="emboss" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
        <feSpecularLighting in="blur" surfaceScale="2" specularConstant="0.8" specularExponent="15" lightingColor="#9e2a46" result="specOut">
          <fePointLight x="-10" y="-10" z="30" />
        </feSpecularLighting>
        <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
        <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
      </filter>
    </defs>

    <g filter="url(#emboss)">
      {/* Back Wing (Right Wing) */}
      <path fill="url(#ravenGrad)" opacity="0.85">
        <animate 
          attributeName="d" 
          dur={flapDuration} 
          repeatCount="indefinite"
          keyTimes="0; 0.2; 0.45; 0.75; 1"
          begin="-0.08s"
          values="
            M 44 42 C 55 10, 75 -5, 95 -10 L 90 -2 L 100 0 L 92 8 L 100 15 C 80 25, 65 35, 44 42 Z;
            M 44 42 C 40 30, 30 32, 20 35 L 23 38 L 17 40 L 22 43 L 20 46 C 30 44, 40 42, 44 42 Z;
            M 44 42 C 45 60, 45 75, 40 90 L 45 85 L 48 92 L 52 85 L 58 90 C 60 70, 55 55, 44 42 Z;
            M 44 42 C 40 30, 30 32, 20 35 L 23 38 L 17 40 L 22 43 L 20 46 C 30 44, 40 42, 44 42 Z;
            M 44 42 C 55 10, 75 -5, 95 -10 L 90 -2 L 100 0 L 92 8 L 100 15 C 80 25, 65 35, 44 42 Z
          "
        />
      </path>

      {/* Body - Smooth Throat, Realistic Head, Wedge Tail & Trailing Talons */}
      <path fill="url(#ravenGrad)" d="
        M 0 46 
        C 4 44.5, 8 43, 12 42
        C 16 37, 22 36, 28 37
        C 40 39, 50 39, 60 40 
        C 75 42, 85 44, 95 46 
        L 115 50 
        L 110 52 L 122 53 L 112 55 L 125 56 L 114 58 L 120 60 L 105 60 L 95 58 
        L 85 58 
        C 88 60, 90 62, 92 64 
        L 96 65 L 92 64 
        L 98 68 L 91 63 
        L 95 70 L 87 62 
        C 80 60, 70 60, 60 59 
        C 45 58, 35 55, 25 52 
        C 15 50, 8 48, 0 46 
        Z" 
      />

      {/* Colored Beak */}
      <path fill="url(#beakGrad)" d="M 0 46 C 4 44.5, 8 43, 12 42 L 12 48 C 8 47.5, 4 47, 0 46 Z" />

      {/* Front Wing (Left Wing) */}
      <path fill="url(#ravenGrad)">
        <animate 
          attributeName="d" 
          dur={flapDuration} 
          repeatCount="indefinite"
          keyTimes="0; 0.2; 0.45; 0.75; 1"
          values="
            M 38 48 C 40 25, 55 10, 75 5 L 72 12 L 80 15 L 75 22 L 82 28 C 70 38, 55 44, 38 48 Z;
            M 38 48 C 25 40, 10 42, -5 45 L -2 48 L -8 50 L -3 53 L -5 56 C 10 54, 25 52, 38 48 Z;
            M 38 48 C 30 70, 20 85, 10 95 L 15 92 L 18 98 L 22 92 L 28 96 C 35 80, 40 65, 38 48 Z;
            M 38 48 C 25 40, 10 42, -5 45 L -2 48 L -8 50 L -3 53 L -5 56 C 10 54, 25 52, 38 48 Z;
            M 38 48 C 40 25, 55 10, 75 5 L 72 12 L 80 15 L 75 22 L 82 28 C 70 38, 55 44, 38 48 Z
          "
        />
      </path>
    </g>

    {/* Maroon Highlights / Emboss Lines */}
    <g stroke="#7a152c" strokeWidth="0.8" fill="none" opacity="0.8">
      {/* Beak split */}
      <path d="M 0 46 C 4 46, 8 45.5, 12 45" />
      {/* Body contour / wing base */}
      <path d="M 38 48 C 45 52, 55 55, 65 55" />
      {/* Tail feather separations */}
      <path d="M 95 50 L 115 52" />
      <path d="M 95 53 L 120 55" />
      <path d="M 95 56 L 115 58" />
    </g>

    {/* Eye */}
    <circle cx="16" cy="41" r="1.2" fill="#ff1e56" filter="drop-shadow(0px 0px 2px #ff1e56)" />
  </svg>
);

const FeatherIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 100" className={className} fill="#ef4444">
    {/* Silhouette based on the provided red feather image */}
    <path d="M20 95 C18 80 15 70 10 50 C5 30 15 10 20 5 C25 10 35 30 30 50 C25 70 22 80 20 95 Z" />
    <path d="M20 95 L20 15" stroke="#7f1d1d" strokeWidth="0.5" />
    <path d="M20 40 L10 35 M20 50 L12 48 M20 60 L14 62" stroke="#7f1d1d" strokeWidth="0.3" opacity="0.6" />
  </svg>
);

export const AvianField: React.FC = () => {
  // Define flock members relative to a flock container
  const flock = [
    { top: '45%', left: '10%', size: 160, bobDuration: '1.5s', flapDuration: '0.8s' },
    { top: '25%', left: '25%', size: 120, bobDuration: '1.4s', flapDuration: '0.85s' },
    { top: '65%', left: '22%', size: 140, bobDuration: '1.6s', flapDuration: '0.75s' },
    { top: '15%', left: '40%', size: 90, bobDuration: '1.3s', flapDuration: '0.9s' },
    { top: '80%', left: '38%', size: 110, bobDuration: '1.7s', flapDuration: '0.8s' },
    { top: '50%', left: '45%', size: 130, bobDuration: '1.55s', flapDuration: '0.82s' },
  ];

  const feathers = [
    { left: '15%', delay: '0s', duration: '12s', size: 30 },
    { left: '25%', delay: '4s', duration: '15s', size: 25 },
    { left: '45%', delay: '2s', duration: '18s', size: 35 },
    { left: '65%', delay: '7s', duration: '14s', size: 20 },
    { left: '85%', delay: '1s', duration: '16s', size: 32 },
    { left: '5%', delay: '9s', duration: '20s', size: 28 },
    { left: '55%', delay: '3s', duration: '13s', size: 24 },
    { left: '75%', delay: '6s', duration: '17s', size: 38 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>
        {`
          @keyframes flockFly {
            0% { transform: translateX(100vw); }
            70% { transform: translateX(-100vw); }
            100% { transform: translateX(-100vw); }
          }
          @keyframes bobbing {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-30px); }
          }
          @keyframes featherFall {
            0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateY(110vh) translateX(50px) rotate(360deg); opacity: 0; }
          }
          .feather-float {
            animation: featherFall linear infinite;
          }
          .flock-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            animation: flockFly 20s linear infinite;
          }
        `}
      </style>

      {/* Flock of Ravens */}
      <div className="flock-container">
        {flock.map((r, i) => (
          <div
            key={`raven-${i}`}
            className="absolute text-black"
            style={{
              top: r.top,
              left: r.left,
              width: `${r.size}px`,
            }}
          >
            <div style={{ animation: `bobbing ${r.bobDuration} ease-in-out infinite alternate` }}>
              <RavenIcon className="drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" flapDuration={r.flapDuration} />
            </div>
          </div>
        ))}
      </div>

      {/* Feathers */}
      {feathers.map((f, i) => (
        <div
          key={`feather-${i}`}
          className="absolute feather-float"
          style={{
            left: f.left,
            width: `${f.size}px`,
            animationDelay: f.delay,
            animationDuration: f.duration
          }}
        >
          <FeatherIcon />
        </div>
      ))}
    </div>
  );
};
