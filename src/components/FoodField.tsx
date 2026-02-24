
import React from 'react';

const Pizza = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 L10 80 Q50 90 90 80 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="3" />
    <path d="M10 80 Q50 95 90 80" stroke="#b45309" strokeWidth="6" strokeLinecap="round" />
    <circle cx="45" cy="45" r="6" fill="#ef4444" />
    <circle cx="65" cy="60" r="5" fill="#ef4444" />
    <circle cx="35" cy="65" r="4" fill="#ef4444" />
    <path d="M40 30 Q45 25 50 30" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Taco = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 60 Q50 10 90 60 Z" fill="#fcd34d" stroke="#b45309" strokeWidth="3" />
    <path d="M15 55 Q50 25 85 55" fill="#16a34a" />
    <rect x="30" y="45" width="10" height="10" fill="#ef4444" rx="2" />
    <rect x="55" y="40" width="8" height="8" fill="#ef4444" rx="2" />
    <path d="M10 60 H90 V70 Q50 80 10 70 Z" fill="#fde68a" stroke="#b45309" strokeWidth="2" />
  </svg>
);

const Burger = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 45 Q50 15 85 45 Z" fill="#d97706" stroke="#78350f" strokeWidth="3" />
    <path d="M15 45 H85 V52 H15 Z" fill="#16a34a" />
    <path d="M15 52 H85 V62 H15 Z" fill="#451a03" />
    <path d="M15 62 H85 V75 Q50 85 15 75 Z" fill="#d97706" stroke="#78350f" strokeWidth="3" />
    <circle cx="40" cy="30" r="1.5" fill="#fef3c7" />
    <circle cx="60" cy="32" r="1.5" fill="#fef3c7" />
    <circle cx="50" cy="25" r="1.5" fill="#fef3c7" />
  </svg>
);

export const FoodField: React.FC = () => {
  // Define items. Some are universal (Standard), some are Mobile Only to fill space.
  const items = [
    // Standard Items (Visible everywhere)
    { Comp: Pizza, top: '10%', left: '10%', size: 80, delay: '0s', mobileOnly: false },
    { Comp: Taco, top: '15%', left: '75%', size: 90, delay: '2s', mobileOnly: false },
    { Comp: Burger, top: '45%', left: '5%', size: 100, delay: '1s', mobileOnly: false },
    { Comp: Pizza, top: '50%', left: '80%', size: 70, delay: '3s', mobileOnly: false },
    { Comp: Taco, top: '80%', left: '15%', size: 85, delay: '4s', mobileOnly: false },
    { Comp: Burger, top: '75%', left: '70%', size: 110, delay: '0.5s', mobileOnly: false },
    { Comp: Pizza, top: '30%', left: '40%', size: 65, delay: '5s', mobileOnly: false },

    // Mobile Extra Items (sm:hidden)
    { Comp: Burger, top: '5%', left: '40%', size: 60, delay: '1.2s', mobileOnly: true },
    { Comp: Taco, top: '25%', left: '15%', size: 75, delay: '3.5s', mobileOnly: true },
    { Comp: Pizza, top: '35%', left: '85%', size: 55, delay: '0.8s', mobileOnly: true },
    { Comp: Burger, top: '60%', left: '25%', size: 85, delay: '2.1s', mobileOnly: true },
    { Comp: Taco, top: '55%', left: '55%', size: 65, delay: '4.2s', mobileOnly: true },
    { Comp: Pizza, top: '12%', left: '60%', size: 50, delay: '1.5s', mobileOnly: true },
    { Comp: Burger, top: '85%', left: '50%', size: 70, delay: '5.5s', mobileOnly: true },
    { Comp: Taco, top: '70%', left: '5%', size: 60, delay: '0.3s', mobileOnly: true },
    { Comp: Pizza, top: '90%', left: '80%', size: 80, delay: '2.7s', mobileOnly: true },
    { Comp: Burger, top: '40%', left: '65%', size: 55, delay: '3.1s', mobileOnly: true },
    { Comp: Taco, top: '20%', left: '30%', size: 45, delay: '1.9s', mobileOnly: true },
    { Comp: Pizza, top: '65%', left: '40%', size: 65, delay: '0.6s', mobileOnly: true },
    { Comp: Burger, top: '32%', left: '5%', size: 50, delay: '4.8s', mobileOnly: true },
    { Comp: Taco, top: '48%', left: '92%', size: 40, delay: '2.3s', mobileOnly: true },
    { Comp: Pizza, top: '78%', left: '90%', size: 55, delay: '1.1s', mobileOnly: true },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>
        {`
          @keyframes foodFloat {
            0% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(15px, -20px) rotate(5deg); }
            66% { transform: translate(-10px, 10px) rotate(-5deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          .food-item {
            animation: foodFloat 8s infinite ease-in-out;
            filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1));
            transition: all 0.3s ease;
          }

          /* Mobile Optimization: Smaller and Faster */
          @media (max-width: 640px) {
            .food-item {
              animation-duration: 4s !important;
              scale: 0.55;
            }
          }
        `}
      </style>
      {items.map(({ Comp, top, left, size, delay, mobileOnly }, i) => (
        <div
          key={i}
          className={`absolute food-item ${mobileOnly ? 'sm:hidden' : ''}`}
          style={{ 
            top, 
            left, 
            width: `${size}px`, 
            height: `${size}px`, 
            animationDelay: delay 
          }}
        >
          <Comp className="w-full h-full" />
        </div>
      ))}
    </div>
  );
};
