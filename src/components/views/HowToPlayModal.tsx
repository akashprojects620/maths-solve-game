import React from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const guideItems = [
    {
      title: 'Type A — Number Relationships',
      icon: '📐',
      desc: 'Solve algebraic systems. Find the unknown numbers (A, B, C) by using the given operations to calculate the target.',
      example: 'A + B = 10, A - B = 4 ➔ A = 7, B = 3',
    },
    {
      title: 'Type B — Geometric Puzzles',
      icon: '🔺',
      desc: 'Explore the corners and centers of shapes (triangles, circles, diamonds, hexagons). Numbers around the perimeter interact to produce the center or missing vertex.',
      example: 'Center = (Top + Left + Right) or product of corners',
    },
    {
      title: 'Type C — Number Patterns',
      icon: '🔢',
      desc: 'Discover the arithmetic or geometric sequence. Rules can involve adding, multiplying, alternating steps, or squares.',
      example: '2, 4, 8, 16, ? ➔ ? = 32 (doubling)',
    },
    {
      title: 'Type D — Number Grids',
      icon: '⊞',
      desc: 'Rows and columns share mathematical logic. Check across each row or down each column to uncover the missing value.',
      example: 'Col 1 × Col 2 = Col 3',
    },
    {
      title: 'Type E — Math Crosswords',
      icon: '➗',
      desc: 'Equations intersect at the target cell. The missing number must satisfy both the horizontal equation and the vertical equation.',
      example: 'Row: 15 - ? = 9 | Col: ? ÷ 3 = 2 ➔ 6',
    },
    {
      title: 'Speed 60s Blitz (Time Attack)',
      icon: '⚡',
      desc: 'Race against a 60-second ticking clock to answer fast mental math questions. Chain consecutive correct answers for massive combo score multipliers and bonus coins!',
      example: 'Consecutive streaks earn up to 3x multiplier',
    },
    {
      title: 'Endless AI Puzzle Generator',
      icon: '🪄',
      desc: 'Visit the Practice Arena to dynamically craft endless custom puzzles across Patterns, Algebra, Geometry, and Matrix grids at any difficulty.',
      example: 'Configure Archetype & Tier ➔ Play instantly',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 border-2 border-indigo-400/50 rounded-3xl p-5 shadow-2xl text-white relative max-h-[85vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition cursor-pointer"
          aria-label="Close guide"
        >
          <X className="w-5 h-5 text-white/80" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-amber-400 flex items-center justify-center text-amber-950">
            <Sparkles className="w-5 h-5 fill-amber-300" />
          </div>
          <div>
            <h2 className="font-game text-xl font-bold text-white">How to Play</h2>
            <p className="text-xs text-indigo-200">Rules & Strategy Guide</p>
          </div>
        </div>

        {/* Guide Cards */}
        <div className="flex flex-col gap-3 mb-4">
          {guideItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-white/10 rounded-2xl border border-white/10 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <span className="font-game font-bold text-xs text-amber-300">{item.title}</span>
              </div>
              <p className="text-xs text-white/80 leading-snug">{item.desc}</p>
              <div className="mt-1 bg-black/20 rounded-xl px-2.5 py-1 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>{item.example}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Hint strategy tip */}
        <div className="p-3 bg-amber-400/15 border border-amber-300/30 rounded-2xl text-xs text-amber-100 mb-4">
          <span className="font-bold text-amber-300">💡 Star Tip:</span> Solve with 0 hints for 3
          Stars! Using 1 hint earns 2 Stars, and multiple hints earn 1 Star.
        </div>

        <button
          onClick={onClose}
          className="candy-btn w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-game font-bold text-base cursor-pointer border border-emerald-300 shadow-md"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
