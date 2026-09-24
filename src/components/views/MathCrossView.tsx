import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MATH_CROSS_LEVELS } from '../../data/mathCrossLevels';
import { PuzzleVisualizer } from '../puzzle/PuzzleVisualizer';
import { Keypad } from '../common/Keypad';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { PlayerStats } from '../../types';
import { ParticleExplosion } from '../effects/ParticleExplosion';

interface MathCrossViewProps {
  playerStats: PlayerStats;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onBack: () => void;
  hapticEnabled?: boolean;
}

export const MathCrossView: React.FC<MathCrossViewProps> = ({
  playerStats,
  onUpdateStats,
  onBack,
  hapticEnabled = true,
}) => {
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isSolvedModal, setIsSolvedModal] = useState(false);

  const completedPacks = playerStats.crosswordCompleted || [];
  const currentPuzzle = MATH_CROSS_LEVELS[selectedPackIndex];
  const isCurrentSolved = completedPacks.includes(currentPuzzle.id);

  const handleSubmit = () => {
    const num = parseInt(inputValue.trim(), 10);
    if (isNaN(num)) return;

    if (num === currentPuzzle.answer) {
      soundManager.playCorrect();
      triggerHaptic('success', hapticEnabled);
      setFeedback('Crossword solved correctly!');

      const wasAlreadyCompleted = completedPacks.includes(currentPuzzle.id);
      const newCompleted = wasAlreadyCompleted
        ? completedPacks
        : [...completedPacks, currentPuzzle.id];

      onUpdateStats((prev) => ({
        ...prev,
        coins: prev.coins + (wasAlreadyCompleted ? 5 : 25),
        crosswordCompleted: newCompleted,
      }));

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}

      setIsSolvedModal(true);
    } else {
      soundManager.playWrong();
      triggerHaptic('warning', hapticEnabled);
      setIsShaking(true);
      setFeedback('Numbers do not align! Re-calculate horizontal and vertical lines.');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleNextCross = () => {
    setIsSolvedModal(false);
    setInputValue('');
    setFeedback(null);
    if (selectedPackIndex < MATH_CROSS_LEVELS.length - 1) {
      setSelectedPackIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col min-h-[calc(100vh-60px)]">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 bg-purple-400/20 border border-purple-300/40 px-3 py-1 rounded-full text-purple-200 text-xs font-game font-bold">
          <span>➗</span>
          <span>MATH CROSSWORDS</span>
        </div>
        <div className="text-xs text-purple-300 font-game">
          {completedPacks.length} / {MATH_CROSS_LEVELS.length} Done
        </div>
      </div>

      {/* Crossword Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mb-3">
        {MATH_CROSS_LEVELS.map((lvl, idx) => {
          const isDone = completedPacks.includes(lvl.id);
          const isSelected = selectedPackIndex === idx;

          return (
            <button
              key={lvl.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedPackIndex(idx);
                setInputValue('');
                setFeedback(null);
              }}
              className={`px-3 py-1.5 shrink-0 rounded-xl font-game text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isSelected
                  ? 'bg-purple-500 text-white shadow-md border-2 border-purple-200 scale-105'
                  : isDone
                  ? 'bg-emerald-500/80 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              <span>{lvl.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Puzzle Card */}
      <div
        className={`w-full bg-gradient-to-b from-white to-purple-50/90 rounded-3xl p-4 shadow-xl border-2 border-purple-100 flex flex-col items-center justify-between min-h-[300px] mb-3 transition-transform ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
      >
        <div className="w-full flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 font-game">
            {currentPuzzle.title}
          </span>
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            {currentPuzzle.difficulty}
          </span>
        </div>

        {/* Puzzle Visualizer */}
        <PuzzleVisualizer type={currentPuzzle.type} data={currentPuzzle.puzzleData} />

        {/* Answer Display */}
        <div className="w-full max-w-xs mt-2">
          <div className="w-full h-13 rounded-2xl bg-white border-2 border-purple-300 flex items-center justify-center text-center font-math text-2xl font-bold text-purple-950 shadow-inner px-4">
            {inputValue || <span className="text-purple-300 text-lg font-game">Missing number ?</span>}
          </div>
        </div>

        {feedback && (
          <div className="text-xs font-semibold text-purple-700 text-center mt-1">
            {feedback}
          </div>
        )}
      </div>

      {/* Keypad */}
      <div className="mt-auto">
        <Keypad
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          hapticEnabled={hapticEnabled}
        />
      </div>

      {/* Success Dialog */}
      {isSolvedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-gradient-to-b from-purple-900 to-indigo-950 border-2 border-amber-400 rounded-3xl p-6 text-white text-center shadow-2xl relative overflow-hidden">
            {/* Particle Explosion */}
            <ParticleExplosion
              active={true}
              type="ALL"
              count={26}
              origin={{ x: 50, y: 35 }}
            />

            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center mx-auto mb-3 shadow-md relative z-10">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="font-game text-2xl font-bold mb-1 relative z-10">Math Cross Solved!</h3>
            <p className="text-xs text-purple-200 mb-4 relative z-10">{currentPuzzle.explanation}</p>
            <div className="inline-flex items-center justify-center gap-1.5 bg-amber-400/20 border border-amber-300/40 rounded-full px-4 py-1.5 text-amber-300 font-game font-bold text-sm mb-4 relative z-10 shadow-inner">
              <span className="text-amber-200">¢</span>
              <span>+25 Coins Earned!</span>
            </div>

            <button
              onClick={handleNextCross}
              className="candy-btn w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-game font-bold text-base cursor-pointer border border-purple-300 relative z-10"
            >
              {selectedPackIndex < MATH_CROSS_LEVELS.length - 1 ? 'NEXT CROSSWORD' : 'DONE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
