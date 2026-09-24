import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Check, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DAILY_PUZZLES } from '../../data/dailyChallenges';
import { PuzzleVisualizer } from '../puzzle/PuzzleVisualizer';
import { Keypad } from '../common/Keypad';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { PlayerStats } from '../../types';
import { ParticleExplosion } from '../effects/ParticleExplosion';

interface DailyChallengeViewProps {
  playerStats: PlayerStats;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onBack: () => void;
  hapticEnabled?: boolean;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  playerStats,
  onUpdateStats,
  onBack,
  hapticEnabled = true,
}) => {
  const [currentDailyIndex, setCurrentDailyIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrectModal, setIsCorrectModal] = useState(false);

  const completedIndices = playerStats.dailyProgress?.completedIndices || [];
  const currentPuzzle = DAILY_PUZZLES[currentDailyIndex];
  const isFinishedToday = completedIndices.length >= DAILY_PUZZLES.length;

  const handleSubmit = () => {
    const num = parseInt(inputValue.trim(), 10);
    if (isNaN(num)) return;

    if (num === currentPuzzle.answer) {
      // Correct!
      soundManager.playCorrect();
      triggerHaptic('success', hapticEnabled);
      setFeedback('Correct! Great thinking!');

      const wasAlreadyCompleted = completedIndices.includes(currentDailyIndex);
      const newCompleted = wasAlreadyCompleted
        ? completedIndices
        : [...completedIndices, currentDailyIndex];

      const allDone = newCompleted.length === DAILY_PUZZLES.length;

      onUpdateStats((prev) => ({
        ...prev,
        coins: prev.coins + (wasAlreadyCompleted ? 5 : 15),
        dailyProgress: {
          ...prev.dailyProgress,
          completedIndices: newCompleted,
          isFinished: allDone,
        },
      }));

      setIsCorrectModal(true);

      if (allDone && !playerStats.dailyProgress.isFinished) {
        // Bonus reward!
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch {}
      }
    } else {
      // Wrong!
      soundManager.playWrong();
      triggerHaptic('warning', hapticEnabled);
      setIsShaking(true);
      setFeedback('Not quite right. Give it another thought!');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleNextPuzzle = () => {
    setIsCorrectModal(false);
    setInputValue('');
    setFeedback(null);
    if (currentDailyIndex < DAILY_PUZZLES.length - 1) {
      setCurrentDailyIndex((prev) => prev + 1);
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
        <div className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/40 px-3 py-1 rounded-full text-amber-200 text-xs font-game font-bold">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>TODAY'S CHALLENGE</span>
        </div>
        <div className="text-xs text-indigo-300 font-mono">
          {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* 10-step progress trail: 1 -> 2 -> ... -> 10 */}
      <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 mb-3 border border-white/15">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-game font-bold text-white uppercase tracking-wider">
            Daily Progress ({completedIndices.length}/10)
          </span>
          {isFinishedToday && (
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
              <Check className="w-3 h-3" />
              COMPLETED +100¢
            </span>
          )}
        </div>

        {/* Stepping pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
          {DAILY_PUZZLES.map((p, idx) => {
            const isDone = completedIndices.includes(idx);
            const isSelected = currentDailyIndex === idx;

            return (
              <button
                key={p.id}
                onClick={() => {
                  soundManager.playClick();
                  setCurrentDailyIndex(idx);
                  setInputValue('');
                  setFeedback(null);
                }}
                className={`w-8 h-8 shrink-0 rounded-xl font-game text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-amber-300 scale-110 bg-amber-400 text-amber-950 shadow-md'
                    : isDone
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-white/15 text-white/70 hover:bg-white/25'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Puzzle Card */}
      <div
        className={`w-full bg-gradient-to-b from-white to-indigo-50/90 rounded-3xl p-4 shadow-xl border-2 border-indigo-100 flex flex-col items-center justify-between min-h-[300px] mb-3 transition-transform ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
      >
        <div className="w-full flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 font-game">
            Puzzle #{currentDailyIndex + 1}
          </span>
          <span className="text-[11px] font-semibold text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full">
            {currentPuzzle.categoryName}
          </span>
        </div>

        {/* Puzzle Visualizer */}
        <PuzzleVisualizer type={currentPuzzle.type} data={currentPuzzle.puzzleData} />

        {/* Answer Display */}
        <div className="w-full max-w-xs mt-2">
          <div className="w-full h-13 rounded-2xl bg-white border-2 border-indigo-300 flex items-center justify-center text-center font-math text-2xl font-bold text-indigo-950 shadow-inner px-4">
            {inputValue || <span className="text-indigo-300 text-lg font-game">Tap digits below</span>}
          </div>
        </div>

        {feedback && (
          <div className="text-xs font-semibold text-indigo-600 text-center mt-1">
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

      {/* Correct Step Dialog */}
      {isCorrectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-gradient-to-b from-indigo-900 to-purple-900 border-2 border-emerald-400 rounded-3xl p-6 text-white text-center shadow-2xl relative overflow-hidden">
            {/* Particle Burst on Reward */}
            <ParticleExplosion
              active={true}
              type="COINS"
              count={24}
              origin={{ x: 50, y: 35 }}
            />

            <div className="w-14 h-14 rounded-2xl bg-emerald-400 text-emerald-950 flex items-center justify-center mx-auto mb-3 shadow-md relative z-10">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="font-game text-2xl font-bold mb-1 relative z-10">Daily Step Solved!</h3>
            <p className="text-xs text-indigo-200 mb-4 relative z-10">{currentPuzzle.explanation}</p>
            <div className="inline-flex items-center justify-center gap-1.5 bg-amber-400/20 border border-amber-300/40 rounded-full px-4 py-1.5 text-amber-300 font-game font-bold text-sm mb-4 relative z-10 shadow-inner">
              <span className="text-amber-200">¢</span>
              <span>+15 Coins Earned!</span>
            </div>

            <button
              onClick={handleNextPuzzle}
              className="candy-btn w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-game font-bold text-base cursor-pointer border border-emerald-300 relative z-10"
            >
              {currentDailyIndex < DAILY_PUZZLES.length - 1 ? 'CONTINUE DAILY CHALLENGE' : 'FINISH'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
