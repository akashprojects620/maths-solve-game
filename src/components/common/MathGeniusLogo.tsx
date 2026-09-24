import React from 'react';

interface MathGeniusLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  animated?: boolean;
}

export const MathGeniusLogo: React.FC<MathGeniusLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  animated = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    hero: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    hero: 'text-3xl sm:text-4xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* 3D Geometric Gem Icon with Mathematical Core */}
      <div
        className={`relative ${iconSizes[size]} shrink-0 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 ${
          animated ? 'hover:scale-105 active:scale-95 transition-transform' : ''
        }`}
      >
        {/* Inner Gem Facet */}
        <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center relative overflow-hidden border border-amber-300/40">
          {/* Subtle Ambient Backlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-pink-500/20 to-indigo-500/20" />

          {/* SVG Vector Sacred Math Compass & Infinity Motif */}
          <svg
            viewBox="0 0 40 40"
            className="w-4/5 h-4/5 text-amber-300 drop-shadow-[0_2px_4px_rgba(245,158,11,0.6)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Diamond Ring */}
            <polygon
              points="20,4 36,20 20,36 4,20"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinejoin="round"
              className={animated ? 'animate-pulse' : ''}
              opacity="0.85"
            />
            {/* Inner Hexagram Cross */}
            <line x1="20" y1="10" x2="20" y2="30" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="10" y1="20" x2="30" y2="20" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Multiplication Diagonal Accent dots */}
            <circle cx="14" cy="14" r="2" fill="#fbbf24" />
            <circle cx="26" cy="14" r="2" fill="#fbbf24" />
            <circle cx="14" cy="26" r="2" fill="#fbbf24" />
            <circle cx="26" cy="26" r="2" fill="#fbbf24" />
            {/* Center Brain Sparkle */}
            <circle cx="20" cy="20" r="3.2" fill="#ffffff" filter="drop-shadow(0 0 3px #fbbf24)" />

            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>

          {/* Top-Right Glint */}
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white opacity-80 animate-ping" />
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 leading-tight">
          <span
            className={`font-game font-black tracking-wide ${titleSizes[size]} bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
          >
            Math Genius
          </span>
          <span className="text-[10px] font-game font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
            PRO
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-semibold text-indigo-200 tracking-wider">
            Number Brain Puzzle Adventure
          </span>
        )}
      </div>
    </div>
  );
};
