import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Flame,
  Heart,
  HelpCircle,
  Lightbulb,
  FastForward,
  RotateCcw,
  Trophy,
  Award,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Shield,
  Infinity as InfinityIcon,
  ChevronRight,
} from 'lucide-react';
import { PlayerStats, Level } from '../../types';
import { generateEndlessLevel } from '../../utils/proceduralGenerator';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { PuzzleVisualizer } from '../puzzle/PuzzleVisualizer';
import { ParticleExplosion } from '../effects/ParticleExplosion';

interface EndlessModeViewProps {
  playerStats: PlayerStats;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onBack: () => void;
  hapticEnabled?: boolean;
}

export const EndlessModeView: React.FC<EndlessModeViewProps> = ({
  playerStats,
  onUpdateStats,
  onBack,
  hapticEnabled = true,
}) => {
  // Pull existing career stats or defaults
  const currentSavedLevel = playerStats.endlessStats?.currentLevel || 1;
  const highestSavedLevel = playerStats.endlessStats?.highestLevel || 1;
  const bestSavedStreak = playerStats.endlessStats?.bestStreak || 0;
  const totalSolved = playerStats.endlessStats?.totalSolved || 0;

  // Active run state
  const [levelNum, setLevelNum] = useState<number>(currentSavedLevel);
  const [lives, setLives] = useState<number>(3);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [currentStreak, setCurrentStreak] = useState<number>(playerStats.endlessStats?.currentStreak || 0);
  const [runSolvedCount, setRunSolvedCount] = useState<number>(0);
  const [runCoinsEarned, setRunCoinsEarned] = useState<number>(0);

  // Puzzle state
  const [currentLevel, setCurrentLevel] = useState<Level>(() => generateEndlessLevel(currentSavedLevel));
  const [userInput, setUserInput] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [showParticle, setShowParticle] = useState<boolean>(false);
  const [solvedMessage, setSolvedMessage] = useState<string>('');

  // Hints
  const [unlockedHints, setUnlockedHints] = useState<number>(0);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);

  // Run Over state
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Sync level puzzle whenever levelNum changes
  useEffect(() => {
    const nextPuzzle = generateEndlessLevel(levelNum);
    setCurrentLevel(nextPuzzle);
    setUserInput('');
    setIsCorrect(false);
    setIsWrong(false);
    setUnlockedHints(0);
    setShowHintModal(false);
  }, [levelNum]);

  // Difficulty Tier calculation
  const getRankTitle = (lvl: number) => {
    if (lvl <= 5) return { title: 'Novice Pioneer', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' };
    if (lvl <= 15) return { title: 'Apprentice Thinker', color: 'text-sky-400', bg: 'bg-sky-500/20 border-sky-500/30' };
    if (lvl <= 30) return { title: 'Logic Voyager', color: 'text-indigo-400', bg: 'bg-indigo-500/20 border-indigo-500/30' };
    if (lvl <= 50) return { title: 'Mathematician', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' };
    if (lvl <= 75) return { title: 'Grand Master', color: 'text-pink-400', bg: 'bg-pink-500/20 border-pink-500/30' };
    if (lvl <= 100) return { title: 'Infinity Legend', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' };
    return { title: 'Cosmic Mind', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/30' };
  };

  const rankInfo = getRankTitle(levelNum);

  // Coin multiplier based on streak
  const getStreakMultiplier = (streak: number) => {
    if (streak >= 10) return { mult: 2.0, text: '2.0x' };
    if (streak >= 5) return { mult: 1.5, text: '1.5x' };
    if (streak >= 3) return { mult: 1.2, text: '1.2x' };
    return { mult: 1.0, text: '1.0x' };
  };

  const streakBonus = getStreakMultiplier(currentStreak);

  // Keypad click handlers
  const handleDigit = useCallback(
    (digit: string) => {
      if (isCorrect || isGameOver) return;
      if (userInput.length >= 8) return;
      soundManager.playKey();
      triggerHaptic('light', hapticEnabled);
      setUserInput((prev) => prev + digit);
      setIsWrong(false);
    },
    [isCorrect, isGameOver, userInput.length, hapticEnabled]
  );

  const handleBackspace = useCallback(() => {
    if (isCorrect || isGameOver) return;
    soundManager.playKey();
    triggerHaptic('light', hapticEnabled);
    setUserInput((prev) => prev.slice(0, -1));
    setIsWrong(false);
  }, [isCorrect, isGameOver, hapticEnabled]);

  const handleClear = useCallback(() => {
    if (isCorrect || isGameOver) return;
    soundManager.playKey();
    triggerHaptic('light', hapticEnabled);
    setUserInput('');
    setIsWrong(false);
  }, [isCorrect, isGameOver, hapticEnabled]);

  // Submission validation
  const handleSubmit = useCallback(() => {
    if (isCorrect || isGameOver || !userInput.trim()) return;

    const parsed = parseInt(userInput, 10);
    if (isNaN(parsed)) return;

    // Track submission telemetry
    onUpdateStats((prev) => ({
      ...prev,
      developerTelemetry: prev.developerTelemetry
        ? {
            ...prev.developerTelemetry,
            totalSubmissions: prev.developerTelemetry.totalSubmissions + 1,
            totalFailedSubmissions:
              parsed !== currentLevel.answer
                ? prev.developerTelemetry.totalFailedSubmissions + 1
                : prev.developerTelemetry.totalFailedSubmissions,
          }
        : undefined,
    }));

    if (parsed === currentLevel.answer) {
      // Correct!
      soundManager.playSuccess();
      soundManager.playCoin();
      triggerHaptic('success', hapticEnabled);
      setIsCorrect(true);
      setIsWrong(false);
      setShowParticle(true);

      const baseReward = 15;
      const totalEarned = Math.round(baseReward * streakBonus.mult);
      const nextStreak = currentStreak + 1;
      const isRecord = levelNum > highestSavedLevel;

      setSolvedMessage(`+${totalEarned} Coins! ${streakBonus.mult > 1 ? `(${streakBonus.text} Streak Bonus)` : ''}`);
      setCurrentStreak(nextStreak);
      setRunSolvedCount((prev) => prev + 1);
      setRunCoinsEarned((prev) => prev + totalEarned);

      // Persist endless stats
      onUpdateStats((prev) => {
        const curEndless = prev.endlessStats || {
          currentLevel: 1,
          highestLevel: 1,
          currentStreak: 0,
          bestStreak: 0,
          totalSolved: 0,
          totalCoinsEarned: 0,
        };

        const updatedHighest = Math.max(curEndless.highestLevel, levelNum + 1);
        const updatedBestStreak = Math.max(curEndless.bestStreak, nextStreak);

        return {
          ...prev,
          coins: prev.coins + totalEarned,
          endlessStats: {
            currentLevel: levelNum + 1,
            highestLevel: updatedHighest,
            currentStreak: nextStreak,
            bestStreak: updatedBestStreak,
            totalSolved: curEndless.totalSolved + 1,
            totalCoinsEarned: curEndless.totalCoinsEarned + totalEarned,
          },
        };
      });
    } else {
      // Wrong answer
      soundManager.playWrong();
      triggerHaptic('heavy', hapticEnabled);
      setIsWrong(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);

      if (!isZenMode) {
        const remainingLives = lives - 1;
        setLives(remainingLives);
        setCurrentStreak(0);

        if (remainingLives <= 0) {
          // Game Over
          const isRecord = levelNum >= highestSavedLevel;
          setIsNewRecord(isRecord);
          setIsGameOver(true);
        }
      }
    }
  }, [
    isCorrect,
    isGameOver,
    userInput,
    currentLevel,
    streakBonus,
    currentStreak,
    levelNum,
    highestSavedLevel,
    isZenMode,
    lives,
    hapticEnabled,
    onUpdateStats,
  ]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleBackspace, handleSubmit, handleClear, isGameOver]);

  // Proceed to next endless level
  const handleNextLevel = () => {
    soundManager.playClick();
    triggerHaptic('medium', hapticEnabled);
    setShowParticle(false);
    setLevelNum((prev) => prev + 1);
  };

  // Unlock hint using coins
  const handleUnlockHint = () => {
    const cost = 10;
    if (playerStats.coins < cost) {
      soundManager.playWrong();
      triggerHaptic('warning', hapticEnabled);
      return;
    }
    soundManager.playHint();
    triggerHaptic('medium', hapticEnabled);
    onUpdateStats((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      developerTelemetry: prev.developerTelemetry
        ? {
            ...prev.developerTelemetry,
            totalHintsRequested: prev.developerTelemetry.totalHintsRequested + 1,
          }
        : undefined,
    }));
    setUnlockedHints((prev) => Math.min(3, prev + 1));
    setShowHintModal(true);
  };

  // Skip level using coins
  const handleSkipLevel = () => {
    const cost = 25;
    if (playerStats.coins < cost) {
      soundManager.playWrong();
      triggerHaptic('warning', hapticEnabled);
      return;
    }
    soundManager.playWhoosh();
    triggerHaptic('heavy', hapticEnabled);
    onUpdateStats((prev) => ({
      ...prev,
      coins: prev.coins - cost,
    }));
    setLevelNum((prev) => prev + 1);
  };

  // Revive with coins
  const handleRevive = () => {
    const cost = 30;
    if (playerStats.coins < cost) {
      soundManager.playWrong();
      triggerHaptic('warning', hapticEnabled);
      return;
    }
    soundManager.playMilestone();
    triggerHaptic('success', hapticEnabled);
    onUpdateStats((prev) => ({
      ...prev,
      coins: prev.coins - cost,
    }));
    setLives(3);
    setIsGameOver(false);
    setUserInput('');
    setIsWrong(false);
  };

  // Restart run from Level 1
  const handleRestartRun = () => {
    soundManager.playClick();
    triggerHaptic('medium', hapticEnabled);
    setLives(3);
    setLevelNum(1);
    setCurrentStreak(0);
    setRunSolvedCount(0);
    setRunCoinsEarned(0);
    setIsGameOver(false);
    setIsNewRecord(false);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col min-h-[calc(100vh-65px)] justify-between select-none">
      {/* Particle Celebration */}
      <ParticleExplosion active={showParticle} type="ALL" count={32} />

      {/* Top Header & Status Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => {
              soundManager.playClick();
              triggerHaptic('light', hapticEnabled);
              onBack();
            }}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition cursor-pointer shadow-sm active:scale-95"
            aria-label="Back to Map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <InfinityIcon className="w-4 h-4 text-pink-400 animate-pulse" />
              <span className="font-game font-extrabold text-base tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300">
                LEVEL {levelNum}
              </span>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-game font-bold border ${rankInfo.bg} ${rankInfo.color}`}>
              {rankInfo.title}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Coins Badge */}
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 rounded-2xl text-amber-300 text-xs font-bold shadow-xs">
              <span className="text-sm">🪙</span>
              <span>{playerStats.coins}</span>
            </div>
          </div>
        </div>

        {/* Mode & Streak Subheader */}
        <div className="flex items-center justify-between px-1 py-1 mb-2 bg-white/5 border border-white/10 rounded-2xl text-xs backdrop-blur-sm">
          {/* Hearts / Zen Mode */}
          <div className="flex items-center gap-1 pl-2">
            {isZenMode ? (
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zen (Infinite)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((heartIndex) => (
                  <Heart
                    key={heartIndex}
                    className={`w-4 h-4 transition-all duration-300 ${
                      heartIndex <= lives
                        ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-sm'
                        : 'text-white/20 fill-transparent scale-90'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Streak Multiplier */}
          <div className="flex items-center gap-1 pr-2">
            <Flame
              className={`w-4 h-4 ${
                currentStreak > 0 ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-white/30'
              }`}
            />
            <span
              className={`font-game font-bold text-[11px] ${
                currentStreak > 0 ? 'text-amber-300' : 'text-white/40'
              }`}
            >
              Streak: {currentStreak} {streakBonus.mult > 1 && `(${streakBonus.text})`}
            </span>
          </div>
        </div>

        {/* Puzzle Card Container */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/15 p-4 shadow-xl backdrop-blur-md mb-2">
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-36 h-36 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          {/* Puzzle Header Details */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-game font-bold tracking-wider uppercase text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {currentLevel.categoryName}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-white/50 font-semibold">Best: #{highestSavedLevel}</span>
            </div>
          </div>

          {/* Visual Diagram / Question */}
          <div className="w-full min-h-[190px] flex items-center justify-center py-2">
            <PuzzleVisualizer type={currentLevel.type} data={currentLevel.puzzleData} />
          </div>

          {/* Powerup Tool Buttons (Hints & Skip) */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
            <button
              onClick={handleUnlockHint}
              disabled={isCorrect || unlockedHints >= 3}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                unlockedHints > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : 'bg-white/10 hover:bg-white/15 text-white/80 border border-white/10'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Hint {unlockedHints > 0 ? `(${unlockedHints}/3)` : '(10🪙)'}</span>
            </button>

            <button
              onClick={handleSkipLevel}
              disabled={isCorrect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white/80 border border-white/10 transition cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 text-sky-400" />
              <span>Skip (25🪙)</span>
            </button>
          </div>
        </div>

        {/* Active Unlocked Hints Display */}
        {unlockedHints > 0 && (
          <div className="mb-2 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs">
            <div className="flex items-center gap-1 font-bold text-amber-300 mb-1">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Clues Unlocked:</span>
            </div>
            <ul className="space-y-1 pl-2">
              {currentLevel.hints.slice(0, unlockedHints).map((hint, hIdx) => (
                <li key={hIdx} className="text-[11px] leading-relaxed">
                  <span className="font-bold text-amber-400">#{hIdx + 1}:</span> {hint}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Answer & Keypad Area */}
      <div className="w-full flex flex-col gap-2">
        {/* Solution feedback banner or active input display */}
        {isCorrect ? (
          <div className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-300 text-white flex items-center justify-between shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-200" />
              <div className="flex flex-col">
                <span className="font-game font-extrabold text-sm">SPLENDID!</span>
                <span className="text-xs text-emerald-100">{solvedMessage}</span>
              </div>
            </div>
            <button
              onClick={handleNextLevel}
              className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-game font-bold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className={`w-full py-2.5 px-4 rounded-2xl bg-slate-800/90 border flex items-center justify-between shadow-inner transition-transform ${
              shake ? 'animate-shake border-rose-500 bg-rose-950/40' : isWrong ? 'border-rose-400' : 'border-white/20'
            }`}
          >
            <span className="text-xs font-semibold text-white/50">Your Answer:</span>
            <span className="font-math font-bold text-2xl tracking-widest text-amber-300">
              {userInput || <span className="text-white/20 animate-pulse">?</span>}
            </span>
            {isWrong && (
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </span>
            )}
          </div>
        )}

        {/* Virtual Number Pad */}
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit.toString())}
              disabled={isCorrect}
              className="py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white font-math font-bold text-xl transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {digit}
            </button>
          ))}

          {/* Clear Key */}
          <button
            onClick={handleClear}
            disabled={isCorrect}
            className="py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 border border-rose-500/30 text-rose-300 font-game font-bold text-sm transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            CLEAR
          </button>

          {/* Zero Key */}
          <button
            onClick={() => handleDigit('0')}
            disabled={isCorrect}
            className="py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white font-math font-bold text-xl transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            0
          </button>

          {/* Backspace or Submit */}
          {userInput.length > 0 ? (
            <button
              onClick={handleSubmit}
              disabled={isCorrect}
              className="py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 border border-emerald-300 text-white font-game font-extrabold text-sm transition cursor-pointer shadow-md disabled:opacity-50"
            >
              SUBMIT
            </button>
          ) : (
            <button
              onClick={handleBackspace}
              disabled={isCorrect}
              className="py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white font-game font-bold text-sm transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              ⌫
            </button>
          )}
        </div>
      </div>

      {/* GAME OVER RUN SUMMARY MODAL */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/20 p-6 shadow-2xl text-center flex flex-col items-center">
            {isNewRecord ? (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl mb-3 shadow-lg animate-bounce">
                👑
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-3xl mb-3 shadow-lg">
                💔
              </div>
            )}

            <h2 className="font-game font-extrabold text-xl text-white mb-1">
              {isNewRecord ? 'NEW RECORD REACHED!' : 'RUN COMPLETED'}
            </h2>
            <p className="text-xs text-white/60 mb-4">
              {isNewRecord
                ? `You reached Endless Level #${levelNum} for the first time!`
                : `You conquered ${runSolvedCount} endless levels in this run.`}
            </p>

            {/* Run Stats Grid */}
            <div className="grid grid-cols-2 gap-2 w-full mb-5">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                <span className="text-[10px] text-white/50 font-bold uppercase">Level Reached</span>
                <span className="font-game font-extrabold text-xl text-pink-400">#{levelNum}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                <span className="text-[10px] text-white/50 font-bold uppercase">Best Streak</span>
                <span className="font-game font-extrabold text-xl text-amber-400">{currentStreak} 🔥</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                <span className="text-[10px] text-white/50 font-bold uppercase">Solved This Run</span>
                <span className="font-game font-extrabold text-xl text-emerald-400">{runSolvedCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                <span className="text-[10px] text-white/50 font-bold uppercase">Coins Won</span>
                <span className="font-game font-extrabold text-xl text-amber-300">+{runCoinsEarned} 🪙</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 w-full">
              {/* Revive Button */}
              <button
                onClick={handleRevive}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 border border-emerald-300 text-white font-game font-extrabold text-sm shadow-lg hover:scale-102 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Revive & Keep Going (30🪙)</span>
              </button>

              {/* Start Fresh Run */}
              <button
                onClick={handleRestartRun}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-game font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Endless Run (Level 1)</span>
              </button>

              {/* Return to Map */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onBack();
                }}
                className="w-full py-2 text-xs text-white/50 hover:text-white transition cursor-pointer font-medium"
              >
                Return to Adventure Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
