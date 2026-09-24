import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { Sparkles, Map, ChevronRight, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { ParticleExplosion } from '../effects/ParticleExplosion';

interface SuccessModalProps {
  levelId: number;
  stars: number; // 1, 2, or 3
  coinsAwarded: number;
  explanation: string;
  onNextLevel?: () => void;
  onGoToMap: () => void;
  hasNextLevel: boolean;
  hapticEnabled?: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  levelId,
  stars,
  coinsAwarded,
  explanation,
  onNextLevel,
  onGoToMap,
  hasNextLevel,
  hapticEnabled = true,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showParticleBurst, setShowParticleBurst] = useState(true);

  useEffect(() => {
    // Joyful confetti celebration & coin chimes
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#3B82F6'],
      });
    } catch {
      // ignore
    }

    // Play coin clink and haptic impact
    const timer = setTimeout(() => {
      soundManager.playCoin();
      triggerHaptic('success', hapticEnabled);
    }, 200);

    return () => clearTimeout(timer);
  }, [hapticEnabled]);

  const triggerBonusBurst = () => {
    soundManager.playCoin();
    triggerHaptic('light', hapticEnabled);
    setShowParticleBurst(false);
    setTimeout(() => setShowParticleBurst(true), 50);
  };

  const handleNext = () => {
    soundManager.playClick();
    triggerHaptic('medium', hapticEnabled);
    if (onNextLevel) onNextLevel();
  };

  const handleMap = () => {
    soundManager.playClick();
    triggerHaptic('medium', hapticEnabled);
    onGoToMap();
  };

  const getPraiseMessage = () => {
    if (stars === 3) return 'Brainiac! Flawless Solution!';
    if (stars === 2) return 'Great Job! Solid Reasoning!';
    return 'Well Done! Puzzle Solved!';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 shadow-2xl text-white text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Celebration icon badge */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-lg mx-auto mb-3 flex items-center justify-center animate-bounce">
          <Sparkles className="w-9 h-9 text-amber-950 fill-amber-500" />
        </div>

        {/* Level complete title */}
        <span className="text-xs font-bold uppercase tracking-widest text-amber-300/90 font-game">
          Level {levelId} Solved
        </span>
        <h2 className="font-game text-3xl font-extrabold text-white tracking-tight mb-2 drop-shadow-sm">
          LEVEL COMPLETE!
        </h2>

        {/* Particle Explosion on Reward celebration */}
        <ParticleExplosion
          active={showParticleBurst}
          type="ALL"
          count={32}
          origin={{ x: 50, y: 38 }}
        />

        {/* Stars Container */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', damping: 12 }}
          className="flex items-center justify-center gap-2 mb-3 relative"
        >
          {[1, 2, 3].map((starNum) => {
            const isEarned = starNum <= stars;
            return (
              <motion.div
                key={starNum}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: isEarned ? 1.15 : 0.9, rotate: 0 }}
                transition={{
                  delay: 0.2 + starNum * 0.12,
                  type: 'spring',
                  stiffness: 300,
                  damping: 10,
                }}
                className={`text-4xl transition-all duration-300 ${
                  isEarned
                    ? 'drop-shadow-[0_4px_12px_rgba(245,158,11,0.7)] animate-pulse'
                    : 'opacity-25 grayscale'
                }`}
              >
                ⭐
              </motion.div>
            );
          })}
        </motion.div>

        <p className="text-sm font-semibold text-indigo-200 mb-4">{getPraiseMessage()}</p>

        {/* Reward Pill with Interactive Particle Burst */}
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 260, damping: 15 }}
          whileTap={{ scale: 0.94 }}
          onClick={triggerBonusBurst}
          title="Tap for extra coin sparks!"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-amber-500/25 border border-amber-300/60 rounded-full px-5 py-2 mb-5 shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer hover:border-amber-300 transition-all select-none group"
        >
          <motion.span
            animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 font-black text-xs flex items-center justify-center border border-white shadow-xs"
          >
            ¢
          </motion.span>
          <span className="font-game font-bold text-base text-amber-200 group-hover:text-amber-100">
            +{coinsAwarded} Coins Earned
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:scale-125 transition-transform" />
        </motion.div>

        {/* Mathematical Explanation Accordion */}
        <div className="mb-5 text-left">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between text-xs text-indigo-300 font-semibold bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{showExplanation ? 'Hide Solution Steps' : 'Why this works (Explanation)'}</span>
            </span>
            <span>{showExplanation ? '▲' : '▼'}</span>
          </button>
          {showExplanation && (
            <div className="mt-2 p-3 bg-white/10 border border-indigo-400/30 rounded-xl text-xs text-indigo-100 leading-relaxed animate-in fade-in">
              {explanation}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {hasNextLevel ? (
            <button
              onClick={handleNext}
              className="candy-btn w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 border-2 border-emerald-300 text-white font-game text-lg font-bold flex items-center justify-center gap-2 shadow-emerald-900/40 cursor-pointer"
            >
              <span>NEXT LEVEL</span>
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          ) : (
            <div className="py-2 text-amber-300 font-game font-bold text-sm">
              🏆 ALL 50 LEVELS COMPLETED! YOU ARE A TRUE MATH MASTER!
            </div>
          )}

          <button
            onClick={handleMap}
            className="candy-btn w-full py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-game text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Map className="w-4 h-4 text-indigo-200" />
            <span>LEVEL MAP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
