import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Lock, Check, Crown, Play, Sparkles, LocateFixed, Trophy, Zap } from 'lucide-react';
import { Level, PlayerStats, ActiveScreen } from '../../types';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { MathGeniusLogo } from '../common/MathGeniusLogo';

interface LevelMapProps {
  levels: Level[];
  playerStats: PlayerStats;
  onSelectLevel: (levelId: number) => void;
  onNavigateScreen: (screen: ActiveScreen) => void;
  hapticEnabled?: boolean;
}

export const LevelMap: React.FC<LevelMapProps> = ({
  levels,
  playerStats,
  onSelectLevel,
  onNavigateScreen,
  hapticEnabled = true,
}) => {
  const currentLevelRef = useRef<HTMLDivElement | null>(null);
  const [pulseActive, setPulseActive] = useState(true);

  // Smoothly center the map on the current active level node
  const scrollToCurrentLevel = useCallback((smooth = true, announceHaptic = false) => {
    if (!currentLevelRef.current) return;
    const element = currentLevelRef.current;

    // Search for nearest scrollable ancestor container (e.g. phone frame or document)
    let scrollContainer: HTMLElement | null = null;
    let parent = element.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      const isScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight;
      if (isScrollable) {
        scrollContainer = parent;
        break;
      }
      parent = parent.parentElement;
    }

    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const elemRect = element.getBoundingClientRect();
      const targetScrollTop =
        scrollContainer.scrollTop +
        (elemRect.top - containerRect.top) -
        (containerRect.height / 2) +
        (elemRect.height / 2);

      scrollContainer.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: smooth ? 'smooth' : 'auto',
      });
    } else {
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'center',
        inline: 'nearest',
      });
    }

    setPulseActive(true);
    if (announceHaptic) {
      setTimeout(() => {
        triggerHaptic('light', hapticEnabled);
      }, 350);
    }
  }, [hapticEnabled]);

  // Smooth 'map scroll' animation when a player enters the Level Map
  useEffect(() => {
    // 160ms delay ensures CSS layout, SVG curves, and fonts are ready before smooth scroll glide begins
    const scrollTimer = setTimeout(() => {
      scrollToCurrentLevel(true, true);
    }, 160);

    return () => clearTimeout(scrollTimer);
  }, [scrollToCurrentLevel, playerStats.currentLevel]);

  const handleNodeClick = (lvlId: number, isUnlocked: boolean) => {
    if (!isUnlocked) {
      soundManager.playWrong();
      triggerHaptic('warning', hapticEnabled);
      return;
    }
    soundManager.playClick();
    triggerHaptic('light', hapticEnabled);
    onSelectLevel(lvlId);
  };

  // Pre-calculate wavy horizontal offset (percentage 20% to 80%) for casual S-curve
  const getHorizontalOffset = (index: number) => {
    // S-curve wave using sine
    const phase = (index * 0.75) % (Math.PI * 2);
    // Sine gives -1 to 1; map to 22% to 78%
    const pct = 50 + Math.sin(phase) * 28;
    return pct;
  };

  const isMilestone = (lvlId: number) => [10, 20, 30, 40, 50].includes(lvlId);

  return (
    <div className="w-full flex flex-col items-center pb-24">
      {/* Hero Welcome & Logo Banner */}
      <div className="w-full max-w-md px-4 pt-3 pb-1">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/70 via-purple-900/70 to-pink-900/50 border border-white/15 p-4 shadow-xl backdrop-blur-md">
          {/* Subtle Ambient Shimmer */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <MathGeniusLogo size="md" showSubtitle={true} />
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-[11px] font-game font-bold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                <Trophy className="w-3 h-3 text-amber-300" />
                <span>Lvl {playerStats.currentLevel}/50</span>
              </div>
              <span className="text-[10px] text-white/50 mt-1 font-semibold">
                {Math.round((Object.keys(playerStats.levelsProgress).length / 50) * 100)}% Complete
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Endless Levels Banner */}
      <div className="w-full max-w-md px-4 pt-2 pb-1">
        <button
          onClick={() => {
            soundManager.playClick();
            triggerHaptic('medium', hapticEnabled);
            onNavigateScreen('ENDLESS');
          }}
          className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 p-[2px] shadow-lg group hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer text-left"
        >
          <div className="relative rounded-2xl bg-slate-950/75 p-3 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-white text-xl font-black shadow-md group-hover:scale-110 transition-transform">
                ∞
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-game font-extrabold text-sm text-white tracking-wide">
                    ENDLESS LEVELS
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-game font-bold bg-pink-500/30 text-pink-300 border border-pink-400/40">
                    INFINITE
                  </span>
                </div>
                <span className="text-[11px] text-white/60">
                  {playerStats.endlessStats?.highestLevel && playerStats.endlessStats.highestLevel > 1
                    ? `Record: Level #${playerStats.endlessStats.highestLevel} • Best Streak: ${playerStats.endlessStats.bestStreak || 0} 🔥`
                    : 'Procedural infinite puzzles • Unlimited streaks!'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/10 group-hover:bg-white/20 px-3 py-1.5 rounded-xl text-xs font-game font-bold text-white border border-white/15 transition">
              <span>Play</span>
              <span>→</span>
            </div>
          </div>
        </button>
      </div>

      {/* Quick Navigation Mode Cards */}
      <div className="w-full max-w-md px-4 pt-2 pb-2">
        <div className="grid grid-cols-4 gap-2">
          {/* Speed Attack Blitz Card */}
          <button
            onClick={() => {
              soundManager.playClick();
              triggerHaptic('medium', hapticEnabled);
              onNavigateScreen('SPEED_ATTACK');
            }}
            className="candy-btn flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 border-2 border-rose-300 text-white shadow-md cursor-pointer group hover:scale-102 transition"
          >
            <span className="text-xl group-hover:scale-115 transition">⚡</span>
            <span className="font-game font-extrabold text-[11px] mt-0.5 drop-shadow-xs">Speed 60s</span>
            <span className="text-[9px] text-rose-100 font-bold">Time Attack</span>
          </button>

          {/* Daily Challenge Card */}
          <button
            onClick={() => {
              soundManager.playClick();
              triggerHaptic('light', hapticEnabled);
              onNavigateScreen('DAILY');
            }}
            className="candy-btn flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-amber-200 text-white shadow-md cursor-pointer group hover:scale-102 transition"
          >
            <span className="text-xl group-hover:scale-115 transition">☀️</span>
            <span className="font-game font-bold text-[11px] mt-0.5 drop-shadow-xs">Daily 10</span>
            <span className="text-[9px] text-amber-100 font-medium">New Today</span>
          </button>

          {/* Math Cross Card */}
          <button
            onClick={() => {
              soundManager.playClick();
              triggerHaptic('light', hapticEnabled);
              onNavigateScreen('MATH_CROSS');
            }}
            className="candy-btn flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-purple-300 text-white shadow-md cursor-pointer group hover:scale-102 transition"
          >
            <span className="text-xl group-hover:scale-115 transition">➗</span>
            <span className="font-game font-bold text-[11px] mt-0.5 drop-shadow-xs">Crossword</span>
            <span className="text-[9px] text-purple-200 font-medium">Equation</span>
          </button>

          {/* Practice & Endless AI Generator Card */}
          <button
            onClick={() => {
              soundManager.playClick();
              triggerHaptic('light', hapticEnabled);
              onNavigateScreen('PRACTICE');
            }}
            className="candy-btn flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-emerald-300 text-white shadow-md cursor-pointer group hover:scale-102 transition"
          >
            <span className="text-xl group-hover:scale-115 transition">🧠</span>
            <span className="font-game font-bold text-[11px] mt-0.5 drop-shadow-xs">Practice</span>
            <span className="text-[9px] text-emerald-100 font-medium">AI & Arena</span>
          </button>
        </div>
      </div>

      {/* Level Journey Title Banner & Focus Button */}
      <div className="w-full max-w-md px-4 my-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-game font-bold text-sm text-indigo-200 uppercase tracking-wider">
            Adventure Path
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            scrollToCurrentLevel(true, true);
          }}
          title="Center on active level"
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/70 hover:bg-amber-900/90 active:scale-95 px-2.5 py-1 rounded-full border border-amber-500/50 shadow-xs transition-all cursor-pointer"
        >
          <LocateFixed className="w-3.5 h-3.5 text-amber-400" />
          <span>Focus Lvl {playerStats.currentLevel}</span>
        </button>
      </div>

      {/* Adventure Winding Map Container */}
      <div className="relative w-full max-w-md px-4 py-4 min-h-[3550px]">
        {/* SVG Curved Path Connector connecting all nodes */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#C084FC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F472B6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Draw connecting curve segments */}
          {levels.map((lvl, idx) => {
            if (idx === levels.length - 1) return null;
            const x1 = getHorizontalOffset(idx);
            const y1 = idx * 68 + 40;
            const x2 = getHorizontalOffset(idx + 1);
            const y2 = (idx + 1) * 68 + 40;
            const midY = (y1 + y2) / 2;

            return (
              <path
                key={idx}
                d={`M ${x1}% ${y1} C ${x1}% ${midY}, ${x2}% ${midY}, ${x2}% ${y2}`}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="6"
                strokeDasharray="8 6"
                strokeLinecap="round"
                className="opacity-60"
              />
            );
          })}
        </svg>

        {/* Level Nodes */}
        {levels.map((lvl, idx) => {
          const isUnlocked = lvl.id <= playerStats.highestUnlockedLevel;
          const isCompleted = playerStats.levelsProgress[lvl.id]?.completed || false;
          const isCurrent = lvl.id === playerStats.currentLevel;
          const stars = playerStats.levelsProgress[lvl.id]?.stars || 0;
          const milestone = isMilestone(lvl.id);
          const xOffset = getHorizontalOffset(idx);
          const yOffset = idx * 68 + 40;

          return (
            <div
              key={lvl.id}
              ref={isCurrent ? currentLevelRef : undefined}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
              style={{
                left: `${xOffset}%`,
                top: `${yOffset}px`,
              }}
            >
              {/* Gentle Pulse Effect - Radiant Spotlight Aura & Concentric Halo Waves */}
              {isCurrent && (
                <>
                  {/* Ambient Glow Spotlight */}
                  <div className="absolute w-28 h-28 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-gradient-to-r from-amber-400/35 via-yellow-400/25 to-orange-500/30 blur-xl pointer-events-none animate-ambient-glow-pulse -z-10" />

                  {/* Primary Radiating Pulse Ring */}
                  <div className="absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border-2 border-amber-300/80 pointer-events-none animate-pulse-halo -z-10" />

                  {/* Secondary Delayed Staggered Pulse Ring */}
                  <div className="absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border border-yellow-200/60 pointer-events-none animate-pulse-halo-delayed -z-10" />
                </>
              )}

              {/* Floating "PLAY" indicator above current level */}
              {isCurrent && (
                <div className="absolute -top-8 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 border border-white text-amber-950 font-game text-[11px] font-extrabold shadow-lg shadow-amber-950/40 animate-bounce flex items-center gap-1 whitespace-nowrap z-20">
                  <Play className="w-2.5 h-2.5 fill-amber-950 stroke-none" />
                  <span>PLAY</span>
                </div>
              )}

              {/* Node Button */}
              <button
                type="button"
                onClick={() => handleNodeClick(lvl.id, isUnlocked)}
                className={`candy-btn rounded-full flex flex-col items-center justify-center transition-all cursor-pointer select-none relative ${
                  milestone ? 'w-16 h-16' : 'w-13 h-13'
                } ${
                  isCurrent
                    ? 'ring-4 ring-amber-300 ring-offset-2 ring-offset-indigo-950 scale-110 bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 text-amber-950 border-2 border-white shadow-xl shadow-amber-500/50 animate-gentle-node-pulse'
                    : isCompleted
                    ? milestone
                      ? 'bg-gradient-to-tr from-yellow-400 via-amber-400 to-orange-500 text-white border-2 border-amber-200 shadow-amber-600/30'
                      : 'bg-gradient-to-tr from-emerald-400 to-teal-500 text-white border-2 border-emerald-200 shadow-emerald-700/30'
                    : isUnlocked
                    ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white border-2 border-indigo-300 shadow-indigo-800/30'
                    : 'bg-slate-800/90 text-slate-500 border-2 border-slate-700/70 shadow-none cursor-not-allowed opacity-75'
                }`}
                aria-label={`Level ${lvl.id} ${isCompleted ? 'Completed' : isUnlocked ? 'Unlocked' : 'Locked'}`}
              >
                {/* Node Content */}
                {isCompleted ? (
                  <div className="flex flex-col items-center">
                    {milestone ? (
                      <Crown className="w-5 h-5 text-amber-950 fill-amber-300" />
                    ) : (
                      <Check className="w-5 h-5 stroke-[3] text-white" />
                    )}
                    <span className="font-game text-[11px] font-extrabold leading-none mt-0.5">
                      {lvl.id}
                    </span>
                  </div>
                ) : isUnlocked ? (
                  <div className="flex flex-col items-center">
                    {milestone && <Crown className="w-4 h-4 text-amber-200" />}
                    <span className="font-game text-sm font-extrabold leading-none">
                      {lvl.id}
                    </span>
                  </div>
                ) : (
                  <Lock className="w-4 h-4 text-slate-500" />
                )}

                {/* Milestone Badge Ring */}
                {milestone && (
                  <span className="absolute -bottom-2 px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-bold uppercase tracking-wider border border-amber-200">
                    Tier
                  </span>
                )}
              </button>

              {/* Star Rating Under Completed Node */}
              {isCompleted && (
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3].map((starIdx) => (
                    <span
                      key={starIdx}
                      className={`text-[10px] ${
                        starIdx <= stars ? 'text-amber-300' : 'text-slate-600'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Grand Endless Portal Node at the summit of the adventure path */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: `${getHorizontalOffset(levels.length)}%`,
            top: `${levels.length * 68 + 48}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <button
            onClick={() => {
              soundManager.playMilestone();
              triggerHaptic('success', hapticEnabled);
              onNavigateScreen('ENDLESS');
            }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-400 border-4 border-amber-200 text-white flex flex-col items-center justify-center shadow-2xl shadow-purple-500/50 hover:scale-110 active:scale-95 transition cursor-pointer group"
            title="Infinity Portal: Endless Levels"
          >
            <span className="text-2xl font-black group-hover:rotate-180 transition-transform duration-500">∞</span>
            <span className="text-[8px] font-game font-extrabold uppercase tracking-tight text-amber-200">Endless</span>
          </button>
          <span className="text-[11px] font-game font-bold text-amber-300 mt-1 drop-shadow-md">
            Infinity Portal
          </span>
        </div>
      </div>

      {/* Floating Bottom Quick Play Button */}
      <div className="fixed bottom-3 z-30 max-w-md w-full px-4">
        <button
          onClick={() => {
            soundManager.playClick();
            triggerHaptic('medium', hapticEnabled);
            onSelectLevel(playerStats.currentLevel);
          }}
          className="candy-btn w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 hover:from-amber-300 hover:to-pink-400 border-2 border-white/80 text-white font-game text-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-amber-950/40 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-white stroke-none" />
          <span>CONTINUE LEVEL {playerStats.currentLevel}</span>
        </button>
      </div>
    </div>
  );
};
