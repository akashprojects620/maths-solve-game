import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb } from 'lucide-react';
import { Level, PlayerStats, GameSettings } from '../../types';
import { PuzzleVisualizer } from './PuzzleVisualizer';
import { Keypad } from '../common/Keypad';
import { HintModal } from './HintModal';
import { SuccessModal } from './SuccessModal';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';

interface PuzzleScreenProps {
  level: Level;
  playerStats: PlayerStats;
  settings: GameSettings;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onNextLevel: () => void;
  onGoToMap: () => void;
  hasNextLevel: boolean;
}

export const PuzzleScreen: React.FC<PuzzleScreenProps> = ({
  level,
  playerStats,
  settings,
  onUpdateStats,
  onNextLevel,
  onGoToMap,
  hasNextLevel,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [hintsUnlockedCount, setHintsUnlockedCount] = useState<number>(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Time tracking & attempts tracking for developer telemetry
  const levelStartTimeRef = useRef<number>(Date.now());
  const levelAttemptsRef = useRef<number>(0);

  // Reset timer on level change
  useEffect(() => {
    levelStartTimeRef.current = Date.now();
    levelAttemptsRef.current = 0;
    setInputValue('');
    setHintsUnlockedCount(0);
    setFeedbackMessage(null);
    setShowSuccessModal(false);

    // Track total puzzles attempted in developer telemetry
    onUpdateStats((prev) => {
      const currentTelemetry = prev.developerTelemetry || {
        totalPuzzlesAttempted: 0,
        totalSubmissions: 0,
        totalFailedSubmissions: 0,
        totalHintsRequested: 0,
        totalTimePlayedSeconds: 0,
        sessionStartTime: new Date().toISOString(),
      };
      return {
        ...prev,
        developerTelemetry: {
          ...currentTelemetry,
          totalPuzzlesAttempted: currentTelemetry.totalPuzzlesAttempted + 1,
        },
      };
    });
  }, [level.id]);

  // Difficulty badge styling
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'EASY_PLUS':
        return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'MEDIUM_PLUS':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'HARD':
        return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'EXPERT':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    }
  };

  const handleUnlockHint = (levelIndex: number, cost: number): boolean => {
    if (playerStats.coins < cost) {
      return false;
    }
    onUpdateStats((prev) => {
      const currentTelemetry = prev.developerTelemetry || {
        totalPuzzlesAttempted: 0,
        totalSubmissions: 0,
        totalFailedSubmissions: 0,
        totalHintsRequested: 0,
        totalTimePlayedSeconds: 0,
        sessionStartTime: new Date().toISOString(),
      };
      return {
        ...prev,
        coins: prev.coins - cost,
        developerTelemetry: {
          ...currentTelemetry,
          totalHintsRequested: currentTelemetry.totalHintsRequested + 1,
        },
      };
    });
    setHintsUnlockedCount(levelIndex);
    return true;
  };

  const handleSubmit = () => {
    const num = parseInt(inputValue.trim(), 10);
    if (isNaN(num)) return;

    levelAttemptsRef.current += 1;
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - levelStartTimeRef.current) / 1000));

    if (num === level.answer) {
      // Correct!
      soundManager.playLevelComplete();
      triggerHaptic('success', settings.hapticEnabled);

      // Star logic:
      // 0 hints used = 3 stars
      // 1 hint used = 2 stars
      // 2+ hints used = 1 star
      let earnedStars = 3;
      if (hintsUnlockedCount === 1) earnedStars = 2;
      else if (hintsUnlockedCount >= 2) earnedStars = 1;

      const coinsReward = 20 + (earnedStars === 3 ? 10 : 0);

      const existingRecord = playerStats.levelsProgress[level.id];
      const highestStar = Math.max(existingRecord?.stars || 0, earnedStars);
      const isFirstTime = !existingRecord?.completed;
      const totalLevelAttempts = (existingRecord?.attempts || 0) + levelAttemptsRef.current;
      const priorTime = existingRecord?.totalTimeSpentSeconds || 0;
      const bestSolveTime = existingRecord?.solveTimeSeconds
        ? Math.min(existingRecord.solveTimeSeconds, elapsedSeconds)
        : elapsedSeconds;

      onUpdateStats((prev) => {
        const currentTelemetry = prev.developerTelemetry || {
          totalPuzzlesAttempted: 0,
          totalSubmissions: 0,
          totalFailedSubmissions: 0,
          totalHintsRequested: 0,
          totalTimePlayedSeconds: 0,
          sessionStartTime: new Date().toISOString(),
        };

        const newProgress = {
          ...prev.levelsProgress,
          [level.id]: {
            completed: true,
            stars: highestStar,
            hintsUsed: Math.max(existingRecord?.hintsUsed || 0, hintsUnlockedCount),
            bestScore: level.id,
            attempts: totalLevelAttempts,
            solveTimeSeconds: bestSolveTime,
            totalTimeSpentSeconds: priorTime + elapsedSeconds,
            completedAt: new Date().toISOString(),
          },
        };

        const totalStars = Object.values(newProgress).reduce(
          (sum, item) => sum + (item.stars || 0),
          0
        );

        return {
          ...prev,
          coins: prev.coins + (isFirstTime ? coinsReward : 5),
          totalStars,
          highestUnlockedLevel: Math.max(prev.highestUnlockedLevel, level.id + 1),
          currentLevel: Math.max(prev.currentLevel, level.id + 1),
          levelsProgress: newProgress,
          developerTelemetry: {
            ...currentTelemetry,
            totalSubmissions: currentTelemetry.totalSubmissions + 1,
            totalTimePlayedSeconds: currentTelemetry.totalTimePlayedSeconds + elapsedSeconds,
          },
        };
      });

      setShowSuccessModal(true);
    } else {
      // Incorrect
      soundManager.playWrong();
      triggerHaptic('warning', settings.hapticEnabled);
      setIsShaking(true);
      setFeedbackMessage('Not quite right! Check the pattern closely.');
      setTimeout(() => setIsShaking(false), 500);

      // Track failed attempt in telemetry
      onUpdateStats((prev) => {
        const currentTelemetry = prev.developerTelemetry || {
          totalPuzzlesAttempted: 0,
          totalSubmissions: 0,
          totalFailedSubmissions: 0,
          totalHintsRequested: 0,
          totalTimePlayedSeconds: 0,
          sessionStartTime: new Date().toISOString(),
        };
        const existingRecord = prev.levelsProgress[level.id];
        return {
          ...prev,
          levelsProgress: {
            ...prev.levelsProgress,
            [level.id]: {
              ...(existingRecord || { completed: false, stars: 0 }),
              attempts: (existingRecord?.attempts || 0) + 1,
              hintsUsed: Math.max(existingRecord?.hintsUsed || 0, hintsUnlockedCount),
            },
          },
          developerTelemetry: {
            ...currentTelemetry,
            totalSubmissions: currentTelemetry.totalSubmissions + 1,
            totalFailedSubmissions: currentTelemetry.totalFailedSubmissions + 1,
          },
        };
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 flex flex-col justify-between min-h-[calc(100vh-65px)]">
      {/* Level Meta Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-game font-bold text-lg text-white drop-shadow-xs">
            Level {level.id}
          </span>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs ${getDifficultyBadge(
              level.difficulty
            )}`}
          >
            {level.difficulty}
          </span>
        </div>

        {/* Hint Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            triggerHaptic('light', settings.hapticEnabled);
            setShowHintModal(true);
          }}
          className="candy-btn px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 border-2 border-amber-200 text-amber-950 font-game text-xs font-bold flex items-center gap-1.5 shadow-md hover:from-amber-300 hover:to-yellow-200 cursor-pointer"
        >
          <Lightbulb className="w-4 h-4 fill-amber-500 text-amber-950" />
          <span>HINT</span>
          <span className="bg-amber-950/20 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px]">
            {hintsUnlockedCount > 0 ? `${hintsUnlockedCount}/3` : '¢'}
          </span>
        </button>
      </div>

      {/* Main Puzzle Card */}
      <div
        className={`w-full bg-gradient-to-b from-white to-slate-50 rounded-3xl p-4 shadow-xl border-2 border-indigo-100/90 flex flex-col items-center justify-between min-h-[280px] mb-2 transition-transform ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : settings.animationsEnabled !== false ? 'animate-gentle-levitate' : ''
        }`}
      >
        <div className="w-full flex items-center justify-between mb-1">
          <span className="font-game font-semibold text-xs text-indigo-500 uppercase tracking-wider">
            {level.categoryName}
          </span>
          <span className="font-game font-semibold text-xs text-indigo-900 truncate max-w-[180px]">
            {level.title}
          </span>
        </div>

        {/* Puzzle Visualizer Element */}
        <div className="w-full flex items-center justify-center my-auto py-1">
          <PuzzleVisualizer type={level.type} data={level.puzzleData} />
        </div>

        {/* Answer Display Field */}
        <div className="w-full max-w-xs mt-1">
          <div className="w-full h-13 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 flex items-center justify-center text-center font-math text-2xl font-bold text-indigo-950 shadow-inner px-4">
            {inputValue ? (
              <span className="tracking-wider">{inputValue}</span>
            ) : (
              <span className="text-indigo-300 text-base font-game font-medium">
                Enter your answer...
              </span>
            )}
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <p className="text-xs font-semibold text-rose-500 text-center mt-1 animate-in fade-in">
            {feedbackMessage}
          </p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full mt-auto">
        <Keypad
          value={inputValue}
          onChange={(val) => {
            setFeedbackMessage(null);
            setInputValue(val);
          }}
          onSubmit={handleSubmit}
          hapticEnabled={settings.hapticEnabled}
        />
      </div>

      {/* Hint Modal */}
      {showHintModal && (
        <HintModal
          hints={level.hints}
          explanation={level.explanation}
          answer={level.answer}
          coins={playerStats.coins}
          unlockedLevel={hintsUnlockedCount}
          onUnlockHint={handleUnlockHint}
          onClose={() => setShowHintModal(false)}
          hapticEnabled={settings.hapticEnabled}
        />
      )}

      {/* Success Complete Modal */}
      {showSuccessModal && (
        <SuccessModal
          levelId={level.id}
          stars={hintsUnlockedCount === 0 ? 3 : hintsUnlockedCount === 1 ? 2 : 1}
          coinsAwarded={20 + (hintsUnlockedCount === 0 ? 10 : 0)}
          explanation={level.explanation}
          onNextLevel={() => {
            setShowSuccessModal(false);
            setInputValue('');
            setHintsUnlockedCount(0);
            setFeedbackMessage(null);
            onNextLevel();
          }}
          onGoToMap={() => {
            setShowSuccessModal(false);
            onGoToMap();
          }}
          hasNextLevel={hasNextLevel}
          hapticEnabled={settings.hapticEnabled}
        />
      )}
    </div>
  );
};
