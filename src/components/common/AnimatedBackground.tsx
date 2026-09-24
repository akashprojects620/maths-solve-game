import React from 'react';
import { BackgroundTheme } from '../../types';

interface AnimatedBackgroundProps {
  theme?: BackgroundTheme;
  animationsEnabled?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  theme = 'NEBULA',
  animationsEnabled = true,
}) => {
  // Theme gradients & accent glows
  const themeStyles = {
    NEBULA: {
      gradient: 'from-slate-950 via-indigo-950 to-purple-950',
      orb1: 'bg-indigo-600/20',
      orb2: 'bg-purple-600/25',
      orb3: 'bg-pink-600/15',
      gridColor: 'rgba(129, 140, 248, 0.05)',
      symbolColor: 'text-indigo-300/25',
    },
    CANDY_ROYAL: {
      gradient: 'from-violet-950 via-fuchsia-950 to-rose-950',
      orb1: 'bg-pink-500/20',
      orb2: 'bg-amber-400/20',
      orb3: 'bg-fuchsia-600/25',
      gridColor: 'rgba(244, 114, 182, 0.06)',
      symbolColor: 'text-pink-300/25',
    },
    CYBER_EMERALD: {
      gradient: 'from-slate-950 via-teal-950 to-emerald-950',
      orb1: 'bg-emerald-500/20',
      orb2: 'bg-teal-400/25',
      orb3: 'bg-cyan-500/15',
      gridColor: 'rgba(52, 211, 153, 0.06)',
      symbolColor: 'text-emerald-300/25',
    },
    GOLDEN_DUSK: {
      gradient: 'from-amber-950/90 via-slate-950 to-indigo-950',
      orb1: 'bg-amber-500/20',
      orb2: 'bg-orange-600/20',
      orb3: 'bg-yellow-500/15',
      gridColor: 'rgba(251, 191, 36, 0.05)',
      symbolColor: 'text-amber-300/25',
    },
  }[theme];

  const mathSymbols = ['∑', 'π', '√', '∞', '∆', '÷', '×', '≈', '∫', '≠', '7', '9', '3'];

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b ${themeStyles.gradient} transition-colors duration-700`}>
      {/* Subtle Geometric Isometric Grid Overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${themeStyles.gridColor} 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Pulsing Luminous Color Nebulae */}
      <div
        className={`absolute -top-32 -left-20 w-96 h-96 rounded-full ${themeStyles.orb1} blur-3xl ${
          animationsEnabled ? 'animate-ambient-glow-pulse' : 'opacity-40'
        }`}
      />
      <div
        className={`absolute top-1/3 -right-24 w-80 h-80 rounded-full ${themeStyles.orb2} blur-3xl ${
          animationsEnabled ? 'animate-ambient-glow-pulse' : 'opacity-40'
        }`}
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className={`absolute -bottom-24 left-1/4 w-96 h-96 rounded-full ${themeStyles.orb3} blur-3xl ${
          animationsEnabled ? 'animate-ambient-glow-pulse' : 'opacity-40'
        }`}
        style={{ animationDelay: '3s' }}
      />

      {/* Floating Mathematical Ambient Runes (only if animations are enabled) */}
      {animationsEnabled && (
        <div className="absolute inset-0 overflow-hidden">
          <span
            className={`absolute font-game font-black text-4xl ${themeStyles.symbolColor} left-[8%] animate-float-math-1`}
          >
            {mathSymbols[0]}
          </span>
          <span
            className={`absolute font-game font-black text-3xl ${themeStyles.symbolColor} left-[28%] animate-float-math-2`}
          >
            {mathSymbols[1]}
          </span>
          <span
            className={`absolute font-game font-black text-5xl ${themeStyles.symbolColor} left-[55%] animate-float-math-3`}
          >
            {mathSymbols[2]}
          </span>
          <span
            className={`absolute font-game font-black text-4xl ${themeStyles.symbolColor} left-[82%] animate-float-math-4`}
          >
            {mathSymbols[3]}
          </span>
          <span
            className={`absolute font-game font-black text-3xl ${themeStyles.symbolColor} left-[40%] animate-float-math-1`}
            style={{ animationDelay: '8s' }}
          >
            {mathSymbols[4]}
          </span>
          <span
            className={`absolute font-game font-black text-4xl ${themeStyles.symbolColor} left-[70%] animate-float-math-2`}
            style={{ animationDelay: '12s' }}
          >
            {mathSymbols[5]}
          </span>
        </div>
      )}
    </div>
  );
};
