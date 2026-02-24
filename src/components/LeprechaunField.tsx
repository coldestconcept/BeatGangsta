
import React from 'react';

const CashBill = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="billGreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#065f46" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#064e3b" />
      </linearGradient>
    </defs>
    
    {/* Main Bill Shape */}
    <rect width="120" height="60" rx="4" fill="url(#billGreen)" stroke="#022c22" strokeWidth="2" />
    
    {/* Decorative Border */}
    <rect x="5" y="5" width="110" height="50" rx="2" stroke="#ecfdf5" strokeWidth="1" strokeDasharray="4 2" opacity="0.3" />
    
    {/* Central Oval */}
    <ellipse cx="60" cy="30" rx="25" ry="20" fill="#064e3b" stroke="#ecfdf5" strokeWidth="1" opacity="0.5" />
    
    {/* Currency Symbols */}
    <text x="60" y="38" textAnchor="middle" fill="#ecfdf5" fontSize="24" fontWeight="black" style={{ userSelect: 'none' }}>$</text>
    
    {/* Corner Numbers */}
    <text x="12" y="18" fill="#ecfdf5" fontSize="10" fontWeight="bold" opacity="0.8">100</text>
    <text x="108" y="50" textAnchor="end" fill="#ecfdf5" fontSize="10" fontWeight="bold" opacity="0.8">100</text>
    
    {/* Texture Lines */}
    <path d="M10 30 H30 M90 30 H110" stroke="#ecfdf5" strokeWidth="0.5" opacity="0.2" />
  </svg>
);

const GoldCoin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#facc15" stroke="#a16207" strokeWidth="5" />
    <circle cx="50" cy="50" r="30" stroke="#a16207" strokeWidth="2" strokeDasharray="5 5" />
    <text x="50" y="65" textAnchor="middle" fill="#a16207" fontSize="40" fontWeight="black" style={{ userSelect: 'none' }}>$</text>
  </svg>
);

export const LeprechaunField: React.FC = () => {
  const coins = Array.from({ length: 25 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${3 + Math.random() * 5}s`,
    size: 12 + Math.random() * 18
  }));

  const bills = Array.from({ length: 12 }).map((_, i) => ({
    top: `${10 + Math.random() * 80}%`,
    left: `${Math.random() * 100}%`,
    size: 80 + Math.random() * 60,
    delay: `${Math.random() * 15}s`,
    duration: `${15 + Math.random() * 15}s`,
    rotation: Math.random() * 360
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-emerald-950/40">
      <style>
        {`
          @keyframes flutter {
            0% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(100px, 30px) rotate(10deg); }
            50% { transform: translate(50px, 80px) rotate(-5deg); }
            75% { transform: translate(-80px, 40px) rotate(8deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes billSpin {
            0% { transform: perspective(400px) rotateY(0deg); }
            100% { transform: perspective(400px) rotateY(360deg); }
          }
          @keyframes rainDown {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
          .flutter-anim {
            animation: flutter linear infinite alternate;
          }
          .spin-anim {
            animation: billSpin 6s infinite linear;
          }
          .coin-rain {
            animation: rainDown linear infinite;
          }
        `}
      </style>

      {/* Raining Gold Coins */}
      {coins.map((c, i) => (
        <div
          key={`coin-${i}`}
          className="absolute coin-rain"
          style={{
            left: c.left,
            width: `${c.size}px`,
            animationDelay: c.delay,
            animationDuration: c.duration
          }}
        >
          <GoldCoin />
        </div>
      ))}

      {/* Floating Cash Bills */}
      {bills.map((b, i) => (
        <div
          key={`bill-${i}`}
          className="absolute flutter-anim"
          style={{
            top: b.top,
            left: b.left,
            width: `${b.size}px`,
            animationDelay: b.delay,
            animationDuration: b.duration,
            transform: `rotate(${b.rotation}deg)`
          }}
        >
          <div className="spin-anim">
            <CashBill className="w-full h-full drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]" />
          </div>
        </div>
      ))}
    </div>
  );
};
