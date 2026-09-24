import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Timer, Zap, Trophy, Play, RotateCcw, Award, Flame, Sparkles } from 'lucide-react';
import { PlayerStats } from '../../types';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { ParticleExplosion } from '../effects/ParticleExplosion';

interface SpeedMathQuestion {
  question: string;
  answer: number;
  options: number[];
}

interface SpeedAttackViewProps {
  playerStats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onBack: () => void;
  hapticEnabled?: boolean;
}

const GAME_DURATION = 60; // 60 seconds of high-adrenaline speed math

export const SpeedAttackView: React.FC<SpeedAttackViewProps> = ({
  playerStats,
  onUpdateStats,
  onBack,
  hapticEnabled = true,
}) => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<SpeedMathQuestion | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [earnedCoins, setEarnedCoins] = useState<number>(0);

  const timerRef = useRef<number | null>(null);

  // Generate varied, rapid mental math questions
  const generateQuestion = useCallback((): SpeedMathQuestion => {
    const ops = ['+', '-', '×', '÷'] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = 0;
    let b = 0;
    let ans = 0;
    let qStr = '';

    if (op === '+') {
      a = Math.floor(Math.random() * 45) + 5;
      b = Math.floor(Math.random() * 45) + 5;
      ans = a + b;
      qStr = `${a} + ${b} = ?`;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 50) + 15;
      b = Math.floor(Math.random() * (a - 5)) + 3;
      ans = a - b;
      qStr = `${a} - ${b} = ?`;
    } else if (op === '×') {
      a = Math.floor(Math.random() * 11) + 2;
      b = Math.floor(Math.random() * 11) + 2;
      ans = a * b;
      qStr = `${a} × ${b} = ?`;
    } else {
      // Division: ensure clean whole integers
      b = Math.floor(Math.random() * 9) + 2;
      ans = Math.floor(Math.random() * 10) + 2;
      a = b * ans;
      qStr = `${a} ÷ ${b} = ?`;
    }

    // Generate 4 plausible distinct choice buttons
    const distractors = new Set<number>();
    distractors.add(ans);

    while (distractors.size < 4) {
      const delta = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 6) + 1);
      const fake = ans + delta;
      if (fake >= 0 && fake !== ans) {
        distractors.add(fake);
      }
    }

    const options = Array.from(distractors).sort(() => Math.random() - 0.5);

    return {
      question: qStr,
      answer: ans,
      options,
    };
  }, []);

  // Start new speed math round
  const startGame = () => {
    soundManager.playClick();
    triggerHaptic('medium', hapticEnabled);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(GAME_DURATION);
    setFeedback(null);
    setEarnedCoins(0);
    setCurrentQuestion(generateQuestion());
    setGameState('PLAYING');
  };

  // Timer loop
  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          if (prev <= 6) {
            soundManager.playTick(true);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Handle game finish when timeLeft hits 0
  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft === 0) {
      setGameState('FINISHED');
      soundManager.playLevelComplete();
      triggerHaptic('heavy', hapticEnabled);

      // Reward coins based on score & accuracy
      const totalAnswered = correctCount + wrongCount;
      const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      const coinsWon = Math.max(10, Math.floor(score / 8) + (accuracy > 80 ? 15 : 0));
      setEarnedCoins(coinsWon);

      // Update player high score & stats
      const prevStats = playerStats.speedAttackStats || {
        highScore: 0,
        bestAccuracy: 0,
        gamesPlayed: 0,
        totalSolved: 0,
      };

      const newStats: PlayerStats = {
        ...playerStats,
        coins: playerStats.coins + coinsWon,
        speedAttackStats: {
          highScore: Math.max(prevStats.highScore, score),
          bestAccuracy: Math.max(prevStats.bestAccuracy, accuracy),
          gamesPlayed: prevStats.gamesPlayed + 1,
          totalSolved: prevStats.totalSolved + correctCount,
        },
      };

      onUpdateStats(newStats);
    }
  }, [timeLeft, gameState, correctCount, wrongCount, score, playerStats, onUpdateStats, hapticEnabled]);

  // Answer handler
  const handleAnswer = (choice: number) => {
    if (gameState !== 'PLAYING' || !currentQuestion) return;

    if (choice === currentQuestion.answer) {
      // Correct!
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      setCorrectCount((prev) => prev + 1);

      // Multiplier bonus for combos: +10 pts base, +2 pts per combo
      const points = 10 + Math.min(newCombo * 2, 20);
      setScore((prev) => prev + points);

      setFeedback('correct');
      soundManager.playCombo(newCombo);
      triggerHaptic('light', hapticEnabled);
    } else {
      // Wrong answer
      setCombo(0);
      setWrongCount((prev) => prev + 1);
      setFeedback('wrong');
      soundManager.playWrong();
      triggerHaptic('warning', hapticEnabled);
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentQuestion(generateQuestion());
    }, 200);
  };

  const highScore = playerStats.speedAttackStats?.highScore || 0;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col min-h-[calc(100vh-60px)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white cursor-pointer transition"
          title="Back to Map"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 bg-rose-500/25 border border-rose-400/50 px-3.5 py-1 rounded-full text-rose-200 text-xs font-game font-extrabold shadow-sm">
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>SPEED ATTACK</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-amber-300 font-game bg-amber-950/60 border border-amber-600/40 px-2.5 py-1 rounded-full">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Best: {highScore}</span>
        </div>
      </div>

      {/* Mode Status & Instructions Card (When IDLE) */}
      {gameState === 'IDLE' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-indigo-900/60 to-purple-950/80 rounded-3xl border-2 border-rose-500/30 shadow-2xl my-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-yellow-300 p-1 shadow-lg shadow-rose-500/30 mb-4 animate-bounce">
            <div className="w-full h-full bg-indigo-950 rounded-full flex items-center justify-center">
              <Zap className="w-10 h-10 text-amber-300 fill-amber-300" />
            </div>
          </div>

          <h2 className="text-2xl font-game font-extrabold text-white mb-2 drop-shadow-md">
            60-Second Blitz
          </h2>
          <p className="text-sm text-indigo-200 max-w-xs mb-6 leading-relaxed">
            Solve as many rapid math operations as you can in 60 seconds! Build combo streaks to multiply your score and earn coin rewards.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mb-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
              <Flame className="w-5 h-5 text-orange-400 mb-1" />
              <span className="text-xs text-indigo-300">Combo Bonus</span>
              <span className="text-sm font-game font-bold text-amber-300">Up to 3× Pts</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
              <Sparkles className="w-5 h-5 text-yellow-300 mb-1" />
              <span className="text-xs text-indigo-300">Coin Payout</span>
              <span className="text-sm font-game font-bold text-amber-300">+Coins Every Round</span>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 active:scale-98 text-white font-game font-extrabold text-lg shadow-xl shadow-rose-600/40 border-2 border-white/40 cursor-pointer flex items-center justify-center gap-2 transition"
          >
            <Play className="w-6 h-6 fill-white stroke-none" />
            <span>START 60s BLITZ</span>
          </button>
        </div>
      )}

      {/* Active Game HUD & Puzzle Card */}
      {gameState === 'PLAYING' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Top HUD: Timer & Score Banner */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* Timer Pill */}
            <div
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                timeLeft <= 10
                  ? 'bg-rose-950/80 border-rose-500 animate-pulse text-rose-300'
                  : 'bg-white/10 border-white/15 text-indigo-200'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <Timer className="w-3.5 h-3.5" />
                <span>TIME</span>
              </div>
              <span className="text-xl font-game font-black tracking-wider text-white">
                {timeLeft}s
              </span>
            </div>

            {/* Score Pill */}
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-indigo-200">SCORE</span>
              <span className="text-xl font-game font-black text-amber-300">{score}</span>
            </div>

            {/* Combo Streak Pill */}
            <div
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                combo > 2
                  ? 'bg-amber-950/70 border-amber-400 text-amber-300 scale-105'
                  : 'bg-white/10 border-white/15 text-indigo-200'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <Flame className={`w-3.5 h-3.5 ${combo > 2 ? 'text-orange-400 animate-bounce' : ''}`} />
                <span>COMBO</span>
              </div>
              <span className="text-xl font-game font-black text-white">
                {combo > 0 ? `${combo}x` : '—'}
              </span>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full bg-slate-900/60 rounded-full h-2 mb-4 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 10
                  ? 'bg-gradient-to-r from-red-600 to-rose-500'
                  : 'bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500'
              }`}
              style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
            />
          </div>

          {/* Question Presentation Card */}
          <div
            className={`w-full py-10 px-6 rounded-3xl border-2 flex flex-col items-center justify-center shadow-xl transition-all ${
              feedback === 'correct'
                ? 'bg-emerald-950/80 border-emerald-400 scale-102 ring-4 ring-emerald-500/30'
                : feedback === 'wrong'
                ? 'bg-rose-950/80 border-rose-500 ring-4 ring-rose-500/30'
                : 'bg-indigo-900/40 border-indigo-400/30'
            }`}
          >
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-2">
              Solve Fast!
            </span>
            <span className="text-4xl md:text-5xl font-game font-black text-white tracking-wide drop-shadow-lg">
              {currentQuestion?.question}
            </span>
          </div>

          {/* Rapid Answer Grid (4 Large Tap Buttons) */}
          <div className="grid grid-cols-2 gap-3.5 my-6">
            {currentQuestion?.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(opt)}
                className="w-full py-5 rounded-2xl bg-gradient-to-b from-indigo-700 to-purple-800 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white font-game text-2xl font-black shadow-lg shadow-indigo-950/50 border-2 border-indigo-400/40 cursor-pointer transition flex items-center justify-center"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Finished Summary Results Screen */}
      {gameState === 'FINISHED' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-indigo-900/80 to-purple-950/90 rounded-3xl border-2 border-amber-400/50 shadow-2xl my-auto text-center relative overflow-hidden">
          {/* Explosive particle burst celebrating coins and high performance */}
          <ParticleExplosion
            active={true}
            type="ALL"
            count={32}
            origin={{ x: 50, y: 30 }}
          />

          <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-lg shadow-amber-400/30 mb-3 animate-bounce relative z-10">
            <div className="w-full h-full bg-indigo-950 rounded-full flex items-center justify-center">
              <Award className="w-9 h-9 text-amber-300" />
            </div>
          </div>

          <h3 className="text-2xl font-game font-extrabold text-white mb-1">Time's Up!</h3>
          <p className="text-xs text-indigo-200 mb-5">Outstanding quick-thinking performance!</p>

          {/* Results Grid */}
          <div className="grid grid-cols-2 gap-2.5 w-full mb-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[11px] text-indigo-300">Final Score</span>
              <span className="text-2xl font-game font-black text-amber-300">{score}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[11px] text-indigo-300">Max Combo</span>
              <span className="text-2xl font-game font-black text-orange-400">{maxCombo}x</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[11px] text-indigo-300">Solved / Accuracy</span>
              <span className="text-lg font-game font-black text-emerald-300">
                {correctCount} (
                {correctCount + wrongCount > 0
                  ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
                  : 0}
                %)
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[11px] text-indigo-300">Coins Rewarded</span>
              <span className="text-xl font-game font-black text-yellow-300">+{earnedCoins}¢</span>
            </div>
          </div>

          {score > highScore && score > 0 && (
            <div className="w-full mb-4 py-2 px-3 bg-amber-400/20 border border-amber-300/50 rounded-xl flex items-center justify-center gap-2 text-amber-200 text-xs font-game font-bold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>NEW PERSONAL HIGH SCORE!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                soundManager.playClick();
                onBack();
              }}
              className="flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-game font-bold text-sm border border-white/20 cursor-pointer transition"
            >
              Back to Map
            </button>
            <button
              onClick={startGame}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 active:scale-95 text-white font-game font-extrabold text-sm border border-white/40 shadow-lg shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
