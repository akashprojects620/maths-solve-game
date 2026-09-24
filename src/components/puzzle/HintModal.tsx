import React, { useState } from 'react';
import { X, Lightbulb, Unlock, Eye, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';

interface HintModalProps {
  hints: [string, string, string];
  explanation: string;
  answer: number;
  coins: number;
  unlockedLevel: number; // 0, 1, 2, 3
  onUnlockHint: (level: number, cost: number) => boolean;
  onClose: () => void;
  hapticEnabled?: boolean;
}

export const HintModal: React.FC<HintModalProps> = ({
  hints,
  explanation,
  answer,
  coins,
  unlockedLevel,
  onUnlockHint,
  onClose,
  hapticEnabled = true,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const HINT_COSTS = [5, 10, 15]; // Costs for Hint 1, Hint 2, Hint 3
  const HINT_TITLES = ['1. Concept Clue', '2. Relationship Clue', '3. Strong Clue / Calculation'];

  const handleUnlock = (levelIndex: number) => {
    const cost = HINT_COSTS[levelIndex];
    if (coins < cost) {
      soundManager.playWrong();
      triggerHaptic('warning', hapticEnabled);
      return;
    }
    const success = onUnlockHint(levelIndex + 1, cost);
    if (success) {
      soundManager.playHint();
      triggerHaptic('success', hapticEnabled);
    }
  };

  const handleRevealAnswer = () => {
    soundManager.playClick();
    triggerHaptic('medium', hapticEnabled);
    setShowAnswer(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 border-2 border-indigo-400/50 rounded-3xl p-5 shadow-2xl text-white relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition cursor-pointer"
          aria-label="Close hints"
        >
          <X className="w-5 h-5 text-white/80" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 border border-amber-200 flex items-center justify-center shadow-md">
            <Lightbulb className="w-6 h-6 text-amber-950 fill-amber-300" />
          </div>
          <div>
            <h3 className="font-game text-xl font-bold text-white leading-tight">Need a Clue?</h3>
            <p className="text-xs text-indigo-200">Unlock progressive hints with your coins</p>
          </div>
        </div>

        {/* Coins indicator */}
        <div className="flex items-center justify-between bg-white/10 rounded-2xl px-3.5 py-2 mb-4">
          <span className="text-xs text-indigo-200 font-medium">Your Coins</span>
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-sm font-bold">¢</span>
            <span className="font-game text-base font-bold text-amber-300">{coins}</span>
          </div>
        </div>

        {/* 3 Tiered Hints */}
        <div className="flex flex-col gap-3 mb-4">
          {hints.map((hintText, idx) => {
            const isUnlocked = unlockedLevel > idx;
            const canUnlock = unlockedLevel === idx;
            const cost = HINT_COSTS[idx];
            const canAfford = coins >= cost;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-100'
                    : 'bg-white/5 border-white/10 text-white/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-game text-xs font-bold tracking-wide uppercase text-amber-300">
                    {HINT_TITLES[idx]}
                  </span>
                  {isUnlocked && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      UNLOCKED
                    </span>
                  )}
                </div>

                {isUnlocked ? (
                  <p className="text-sm font-medium text-white/90 leading-snug">{hintText}</p>
                ) : (
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-xs text-white/50 italic">Locked hint</span>
                    {canUnlock ? (
                      <button
                        onClick={() => handleUnlock(idx)}
                        disabled={!canAfford}
                        className={`candy-btn px-3 py-1.5 rounded-xl font-game text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border border-amber-300'
                            : 'bg-slate-700 text-white/40 border border-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock for {cost} ¢</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-white/40">Unlock previous first</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reveal Answer Section (Only if all 3 hints unlocked or player chooses) */}
        {unlockedLevel >= 3 && !showAnswer && (
          <button
            onClick={handleRevealAnswer}
            className="w-full candy-btn py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-game text-sm font-bold flex items-center justify-center gap-2 border border-purple-400 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Reveal Answer & Explanation</span>
          </button>
        )}

        {showAnswer && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-100 animate-in fade-in">
            <div className="flex items-center gap-1 text-emerald-300 font-game font-bold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Correct Answer: {answer}</span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};
