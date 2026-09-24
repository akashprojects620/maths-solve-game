import React, { useState, useMemo } from 'react';
import {
  X,
  Activity,
  Clock,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Download,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Flame,
  ShieldAlert,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PlayerStats, Level } from '../../types';
import { MAIN_LEVELS } from '../../data/levels';
import { soundManager } from '../../utils/audio';

interface DeveloperDashboardModalProps {
  playerStats: PlayerStats;
  onClose: () => void;
  onClearTelemetry?: () => void;
}

export const DeveloperDashboardModal: React.FC<DeveloperDashboardModalProps> = ({
  playerStats,
  onClose,
  onClearTelemetry,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEVELS_BREAKDOWN' | 'DIFFICULTY_CURVE'>('OVERVIEW');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'id' | 'attempts' | 'time' | 'hints'>('id');
  const [sortAsc, setSortAsc] = useState(true);

  // Compute aggregate telemetry metrics across the 50 main levels
  const statsSummary = useMemo(() => {
    const progressMap = playerStats.levelsProgress || {};
    const telemetry = playerStats.developerTelemetry || {
      totalPuzzlesAttempted: 0,
      totalSubmissions: 0,
      totalFailedSubmissions: 0,
      totalHintsRequested: 0,
      totalTimePlayedSeconds: 0,
      sessionStartTime: new Date().toISOString(),
    };

    let totalLevelsCompleted = 0;
    let totalSolveSeconds = 0;
    let solvedLevelsCount = 0;
    let totalHintsRecorded = 0;
    let totalAttemptsRecorded = 0;

    // Difficulty bucket analysis
    const difficultyBuckets: Record<
      string,
      { count: number; completed: number; totalSeconds: number; hints: number; attempts: number }
    > = {};

    MAIN_LEVELS.forEach((lvl) => {
      const prog = progressMap[lvl.id];
      const diff = lvl.difficulty;

      if (!difficultyBuckets[diff]) {
        difficultyBuckets[diff] = { count: 0, completed: 0, totalSeconds: 0, hints: 0, attempts: 0 };
      }
      difficultyBuckets[diff].count += 1;

      if (prog) {
        if (prog.completed) {
          totalLevelsCompleted += 1;
          difficultyBuckets[diff].completed += 1;
        }
        if (prog.solveTimeSeconds && prog.solveTimeSeconds > 0) {
          totalSolveSeconds += prog.solveTimeSeconds;
          solvedLevelsCount += 1;
          difficultyBuckets[diff].totalSeconds += prog.solveTimeSeconds;
        }
        const hints = prog.hintsUsed || 0;
        totalHintsRecorded += hints;
        difficultyBuckets[diff].hints += hints;

        const attempts = prog.attempts || (prog.completed ? 1 : 0);
        totalAttemptsRecorded += attempts;
        difficultyBuckets[diff].attempts += attempts;
      }
    });

    const avgSolveTimeSeconds = solvedLevelsCount > 0 ? Math.round(totalSolveSeconds / solvedLevelsCount) : 0;
    const avgHintsPerCompletedLevel =
      totalLevelsCompleted > 0 ? (totalHintsRecorded / totalLevelsCompleted).toFixed(1) : '0.0';
    const accuracyPct =
      telemetry.totalSubmissions > 0
        ? Math.round(
            ((telemetry.totalSubmissions - telemetry.totalFailedSubmissions) / telemetry.totalSubmissions) * 100
          )
        : 100;

    return {
      totalLevelsCompleted,
      totalSolveSeconds,
      avgSolveTimeSeconds,
      avgHintsPerCompletedLevel,
      totalHintsRecorded,
      totalAttemptsRecorded,
      accuracyPct,
      difficultyBuckets,
      telemetry,
    };
  }, [playerStats]);

  // Table data with enriched difficulty & telemetry indicators
  const levelsTableData = useMemo(() => {
    return MAIN_LEVELS.map((lvl) => {
      const prog = playerStats.levelsProgress[lvl.id];
      const isCompleted = prog?.completed || false;
      const attempts = prog?.attempts || (isCompleted ? 1 : 0);
      const solveTime = prog?.solveTimeSeconds || 0;
      const hints = prog?.hintsUsed || 0;
      const stars = prog?.stars || 0;

      // Difficulty Friction Score (0 - 100):
      // Higher score indicates bottleneck level where users struggle or over-rely on hints
      let frictionScore = 0;
      if (attempts > 1) frictionScore += (attempts - 1) * 20;
      if (hints > 0) frictionScore += hints * 25;
      if (solveTime > 60) frictionScore += Math.min(30, Math.round((solveTime - 60) / 5));
      if (!isCompleted && attempts > 0) frictionScore += 40;
      frictionScore = Math.min(100, frictionScore);

      return {
        level: lvl,
        isCompleted,
        attempts,
        solveTime,
        hints,
        stars,
        frictionScore,
      };
    })
      .filter((item) => {
        if (filterDifficulty !== 'ALL' && item.level.difficulty !== filterDifficulty) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            item.level.id.toString() === q ||
            item.level.title.toLowerCase().includes(q) ||
            item.level.categoryName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'id') diff = a.level.id - b.level.id;
        else if (sortField === 'attempts') diff = a.attempts - b.attempts;
        else if (sortField === 'time') diff = a.solveTime - b.solveTime;
        else if (sortField === 'hints') diff = a.hints - b.hints;
        return sortAsc ? diff : -diff;
      });
  }, [playerStats, filterDifficulty, searchQuery, sortField, sortAsc]);

  // Export JSON Report for level design balancing
  const handleExportJson = () => {
    soundManager.playClick();
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            app: 'Math Genius: Number Brain Puzzle',
            statsSummary,
            endlessStats: playerStats.endlessStats,
            levelsProgress: playerStats.levelsProgress,
            developerTelemetry: playerStats.developerTelemetry,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `math_genius_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleToggleSort = (field: 'id' | 'attempts' | 'time' | 'hints') => {
    soundManager.playClick();
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending when sorting metrics
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden relative">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-game font-bold text-lg text-white">Developer Telemetry & Analytics</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Dev Mode Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Difficulty progression tuning, attempts tracking & hint friction for 50 main levels
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            aria-label="Close Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1 rounded-lg text-xs font-game font-bold transition cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview Metrics
            </button>
            <button
              onClick={() => setActiveTab('LEVELS_BREAKDOWN')}
              className={`px-3 py-1 rounded-lg text-xs font-game font-bold transition cursor-pointer ${
                activeTab === 'LEVELS_BREAKDOWN'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              50 Levels Breakdown
            </button>
            <button
              onClick={() => setActiveTab('DIFFICULTY_CURVE')}
              className={`px-3 py-1 rounded-lg text-xs font-game font-bold transition cursor-pointer ${
                activeTab === 'DIFFICULTY_CURVE'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Progression Curve
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Export complete telemetry payload as JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              {/* Primary Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400 font-medium">Attempted</span>
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-game font-black text-2xl text-white">
                    {statsSummary.telemetry.totalPuzzlesAttempted}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {statsSummary.totalLevelsCompleted} / 50 Completed ({Math.round((statsSummary.totalLevelsCompleted / 50) * 100)}%)
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400 font-medium">Avg Solve Time</span>
                    <Clock className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="font-game font-black text-2xl text-sky-300">
                    {statsSummary.avgSolveTimeSeconds}s
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Total: {Math.round(statsSummary.totalSolveSeconds / 60)} min played
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400 font-medium">Hints Used</span>
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="font-game font-black text-2xl text-amber-300">
                    {statsSummary.telemetry.totalHintsRequested || statsSummary.totalHintsRecorded}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Avg {statsSummary.avgHintsPerCompletedLevel} per solved puzzle
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400 font-medium">Accuracy</span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="font-game font-black text-2xl text-purple-300">
                    {statsSummary.accuracyPct}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {statsSummary.telemetry.totalSubmissions - statsSummary.telemetry.totalFailedSubmissions} / {statsSummary.telemetry.totalSubmissions || 1} hits
                  </div>
                </div>
              </div>

              {/* Developer Insights & Friction Diagnostics */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="font-game font-bold text-sm text-white">Difficulty Tuning Insights</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-amber-300 block">Identified High-Friction Levels</span>
                    {levelsTableData
                      .filter((l) => l.frictionScore >= 40)
                      .slice(0, 3)
                      .map((l) => (
                        <div key={l.level.id} className="flex items-center justify-between text-slate-400">
                          <span>Level {l.level.id}: {l.level.title}</span>
                          <span className="font-bold text-rose-400">Friction {l.frictionScore}%</span>
                        </div>
                      ))}
                    {levelsTableData.filter((l) => l.frictionScore >= 40).length === 0 && (
                      <p className="text-slate-500 italic">No high-friction bottlenecks detected yet.</p>
                    )}
                  </div>

                  <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-sky-300 block">Optimal Progression Pacing</span>
                    <p className="text-slate-400 leading-relaxed">
                      Levels 1–10: Ideal solve time 10-25s. Current avg:{' '}
                      <span className="text-white font-bold">
                        {statsSummary.difficultyBuckets['EASY']?.completed
                          ? Math.round(
                              statsSummary.difficultyBuckets['EASY'].totalSeconds /
                                statsSummary.difficultyBuckets['EASY'].completed
                            )
                          : 0}
                        s
                      </span>.
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      Levels 21–40: Ideal solve time 30-65s. Current avg:{' '}
                      <span className="text-white font-bold">
                        {statsSummary.difficultyBuckets['MEDIUM']?.completed
                          ? Math.round(
                              statsSummary.difficultyBuckets['MEDIUM'].totalSeconds /
                                statsSummary.difficultyBuckets['MEDIUM'].completed
                            )
                          : 0}
                        s
                      </span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Endless Levels Telemetry Card */}
              {playerStats.endlessStats && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">∞</span>
                      <h3 className="font-game font-bold text-sm text-white">Endless Levels Telemetry</h3>
                    </div>
                    <span className="text-xs text-pink-300 font-bold bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-500/30">
                      Infinite Engine Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block">Highest Level Reached</span>
                      <span className="font-game font-bold text-base text-pink-400">
                        #{playerStats.endlessStats.highestLevel || 1}
                      </span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block">Best Streak Record</span>
                      <span className="font-game font-bold text-base text-amber-400">
                        {playerStats.endlessStats.bestStreak || 0} 🔥
                      </span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block">Total Solved</span>
                      <span className="font-game font-bold text-base text-emerald-400">
                        {playerStats.endlessStats.totalSolved || 0}
                      </span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block">Coins Earned</span>
                      <span className="font-game font-bold text-base text-amber-300">
                        +{playerStats.endlessStats.totalCoinsEarned || 0} 🪙
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 50 LEVELS BREAKDOWN TABLE */}
          {activeTab === 'LEVELS_BREAKDOWN' && (
            <div className="space-y-3">
              {/* Search & Filter Controls */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Search level #, title, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 w-60"
                />

                <div className="flex items-center gap-1 overflow-x-auto py-1">
                  {['ALL', 'EASY', 'EASY_PLUS', 'MEDIUM', 'MEDIUM_PLUS', 'HARD', 'EXPERT'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setFilterDifficulty(diff)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-game font-bold transition cursor-pointer whitespace-nowrap ${
                        filterDifficulty === diff
                          ? 'bg-slate-700 text-white border border-slate-500'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-transparent'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                <div className="max-h-[50vh] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold z-10">
                      <tr>
                        <th
                          onClick={() => handleToggleSort('id')}
                          className="py-2.5 px-3 cursor-pointer hover:text-white"
                        >
                          <div className="flex items-center gap-1">
                            <span>Level</span>
                            {sortField === 'id' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                          </div>
                        </th>
                        <th className="py-2.5 px-3">Title & Category</th>
                        <th className="py-2.5 px-3">Difficulty</th>
                        <th
                          onClick={() => handleToggleSort('attempts')}
                          className="py-2.5 px-3 cursor-pointer hover:text-white"
                        >
                          <div className="flex items-center gap-1">
                            <span>Attempts</span>
                            {sortField === 'attempts' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                          </div>
                        </th>
                        <th
                          onClick={() => handleToggleSort('time')}
                          className="py-2.5 px-3 cursor-pointer hover:text-white"
                        >
                          <div className="flex items-center gap-1">
                            <span>Solve Time</span>
                            {sortField === 'time' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                          </div>
                        </th>
                        <th
                          onClick={() => handleToggleSort('hints')}
                          className="py-2.5 px-3 cursor-pointer hover:text-white"
                        >
                          <div className="flex items-center gap-1">
                            <span>Hints Used</span>
                            {sortField === 'hints' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                          </div>
                        </th>
                        <th className="py-2.5 px-3 text-right">Friction Index</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {levelsTableData.map((item) => (
                        <tr
                          key={item.level.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-game font-bold text-white">
                            <div className="flex items-center gap-1.5">
                              {item.isCompleted ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                              )}
                              <span>#{item.level.id}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-200">{item.level.title}</div>
                            <div className="text-[10px] text-slate-400">{item.level.categoryName}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                              {item.level.difficulty}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-300">
                            {item.attempts > 0 ? item.attempts : '—'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-300">
                            {item.solveTime > 0 ? `${item.solveTime}s` : '—'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-amber-300">
                            {item.hints > 0 ? `${item.hints}/3` : '0'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.frictionScore >= 50
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : item.frictionScore >= 25
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              {item.frictionScore}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIFFICULTY PROGRESSION CURVE */}
          {activeTab === 'DIFFICULTY_CURVE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="font-game font-bold text-sm text-white mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Difficulty Tier Aggregate Performance</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'EASY', label: 'Levels 1–10: Easy Foundations', color: 'emerald' },
                    { key: 'EASY_PLUS', label: 'Levels 11–20: Logic Intro', color: 'teal' },
                    { key: 'MEDIUM', label: 'Levels 21–30: Core Patterns', color: 'amber' },
                    { key: 'MEDIUM_PLUS', label: 'Levels 31–40: Multi-Step Algebra', color: 'orange' },
                    { key: 'HARD', label: 'Levels 41–48: Advanced Logic & Clocks', color: 'rose' },
                    { key: 'EXPERT', label: 'Levels 49–50: Master Fibonacci & 24', color: 'purple' },
                  ].map((tier) => {
                    const bucket = statsSummary.difficultyBuckets[tier.key] || {
                      count: 0,
                      completed: 0,
                      totalSeconds: 0,
                      hints: 0,
                      attempts: 0,
                    };
                    const completionPct = bucket.count > 0 ? Math.round((bucket.completed / bucket.count) * 100) : 0;
                    const avgSec = bucket.completed > 0 ? Math.round(bucket.totalSeconds / bucket.completed) : 0;

                    return (
                      <div key={tier.key} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-game font-bold text-xs text-white">{tier.label}</span>
                          <span className="text-xs font-semibold text-slate-300">
                            {bucket.completed} / {bucket.count} Solved ({completionPct}%)
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                          <div
                            className={`h-full bg-${tier.color}-500 transition-all`}
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Avg Solve: <strong className="text-slate-200">{avgSec}s</strong></span>
                          <span>Total Hints: <strong className="text-amber-300">{bucket.hints}</strong></span>
                          <span>Submissions: <strong className="text-slate-200">{bucket.attempts}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="pt-3 border-t border-slate-800 mt-2 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Developer analytics are stored locally on device and never sent to external servers.</span>
          </div>
          <span className="text-[11px] font-mono">Secret Combo: 5x tap on Title or Dev toggle</span>
        </div>
      </div>
    </div>
  );
};
