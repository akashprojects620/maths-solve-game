import React, { useState } from 'react';
import { ArrowLeft, Play, CheckCircle, Sparkles, RefreshCw, Wand2, Layers } from 'lucide-react';
import { MAIN_LEVELS } from '../../data/levels';
import { PuzzleType, PlayerStats, Level } from '../../types';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { generateProceduralLevel } from '../../utils/proceduralGenerator';

interface PracticeViewProps {
  playerStats: PlayerStats;
  onSelectLevel: (lvlId: number) => void;
  onStartCustomPuzzle?: (puzzle: Level) => void;
  onOpenEndlessMode?: () => void;
  onBack: () => void;
  hapticEnabled?: boolean;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  playerStats,
  onSelectLevel,
  onStartCustomPuzzle,
  onOpenEndlessMode,
  onBack,
  hapticEnabled = true,
}) => {
  const [activeTab, setActiveTab] = useState<'COLLECTION' | 'GENERATOR'>('COLLECTION');
  const [selectedCategory, setSelectedCategory] = useState<PuzzleType | 'ALL'>('ALL');

  // Generator interactive state
  const [genType, setGenType] = useState<PuzzleType>('PATTERN');
  const [genDifficulty, setGenDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [genSeed, setGenSeed] = useState<number>(1);
  const [generatedPreview, setGeneratedPreview] = useState<Level>(() =>
    generateProceduralLevel(1, 'PATTERN', 'MEDIUM')
  );

  const categories: { type: PuzzleType | 'ALL'; label: string; icon: string }[] = [
    { type: 'ALL', label: 'All', icon: '✨' },
    { type: 'PATTERN', label: 'Patterns', icon: '🔢' },
    { type: 'RELATIONSHIP', label: 'Equations', icon: '📐' },
    { type: 'GEOMETRIC', label: 'Geometry', icon: '🔺' },
    { type: 'GRID', label: 'Grids', icon: '⊞' },
    { type: 'SHAPE_REL', label: 'Shapes', icon: '⚪' },
    { type: 'MIXED_LOGIC', label: 'Logic', icon: '🧩' },
  ];

  const filteredLevels = MAIN_LEVELS.filter((lvl) => {
    if (selectedCategory === 'ALL') return true;
    return lvl.type === selectedCategory;
  });

  const handleRegenerate = (nextType = genType, nextDiff = genDifficulty) => {
    soundManager.playClick();
    triggerHaptic('light', hapticEnabled);
    const newSeed = genSeed + 1;
    setGenSeed(newSeed);
    const puzzle = generateProceduralLevel(newSeed, nextType, nextDiff);
    setGeneratedPreview(puzzle);
  };

  const handlePlayGenerated = () => {
    soundManager.playClick();
    triggerHaptic('medium', hapticEnabled);
    if (onStartCustomPuzzle) {
      onStartCustomPuzzle(generatedPreview);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col min-h-[calc(100vh-60px)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* View Mode Toggle: Collection vs Endless Generator */}
        <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/15">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('COLLECTION');
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-game font-bold transition cursor-pointer ${
              activeTab === 'COLLECTION'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>50 Levels</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('GENERATOR');
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-game font-bold transition cursor-pointer ${
              activeTab === 'GENERATOR'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Generator</span>
          </button>
        </div>

        <span className="text-xs text-emerald-300 font-game font-semibold">Arena</span>
      </div>

      {/* Endless Mode Quick Portal */}
      {onOpenEndlessMode && (
        <button
          onClick={() => {
            soundManager.playClick();
            triggerHaptic('medium', hapticEnabled);
            onOpenEndlessMode();
          }}
          className="w-full mb-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 p-[2px] shadow-md group hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer text-left"
        >
          <div className="rounded-2xl bg-slate-950/80 p-2.5 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-white font-black text-lg shadow-sm">
                ∞
              </div>
              <div className="flex flex-col">
                <span className="font-game font-extrabold text-xs text-white">PLAY ENDLESS LEVELS</span>
                <span className="text-[10px] text-pink-200">Infinite streak run • Lives & scaling difficulty</span>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-300 pr-1 group-hover:translate-x-1 transition-transform">
              Launch →
            </span>
          </div>
        </button>
      )}

      {/* TAB 1: 50 LEVELS COLLECTION */}
      {activeTab === 'COLLECTION' && (
        <>
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-3">
            {categories.map((cat) => (
              <button
                key={cat.type}
                onClick={() => {
                  soundManager.playClick();
                  triggerHaptic('light', hapticEnabled);
                  setSelectedCategory(cat.type);
                }}
                className={`px-3 py-1.5 shrink-0 rounded-xl font-game text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                  selectedCategory === cat.type
                    ? 'bg-emerald-500 text-white shadow-md border-2 border-emerald-300'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Levels Grid List */}
          <div className="grid grid-cols-2 gap-2.5 overflow-y-auto pb-6 flex-1">
            {filteredLevels.map((lvl) => {
              const isCompleted = playerStats.levelsProgress[lvl.id]?.completed || false;
              const stars = playerStats.levelsProgress[lvl.id]?.stars || 0;

              return (
                <div
                  key={lvl.id}
                  onClick={() => {
                    soundManager.playClick();
                    triggerHaptic('light', hapticEnabled);
                    onSelectLevel(lvl.id);
                  }}
                  className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-emerald-400/50 rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer group shadow-sm active:scale-98"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-game font-extrabold text-amber-300">
                      Level {lvl.id}
                    </span>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition" />
                    )}
                  </div>

                  <span className="font-game font-bold text-sm text-white truncate mb-1">
                    {lvl.title}
                  </span>

                  <div className="flex items-center justify-between text-[10px] text-indigo-200">
                    <span className="bg-white/10 px-2 py-0.5 rounded-full">{lvl.difficulty}</span>
                    {isCompleted && <span>{'⭐'.repeat(stars)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* TAB 2: PROCEDURAL ENDLESS PUZZLE GENERATOR */}
      {activeTab === 'GENERATOR' && (
        <div className="flex-1 flex flex-col justify-between pb-6">
          <div className="space-y-4">
            {/* Customizer Controls */}
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-game font-extrabold text-pink-200">PUZZLE CRAFTER</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRegenerate()}
                  className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 bg-amber-950/60 border border-amber-600/40 px-2.5 py-1 rounded-full cursor-pointer active:scale-95 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reroll</span>
                </button>
              </div>

              {/* Puzzle Family Selector */}
              <div className="mb-3">
                <label className="text-[11px] font-bold text-indigo-200 block mb-1.5">
                  PUZZLE ARCHETYPE
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'PATTERN', label: 'Pattern', icon: '🔢' },
                      { id: 'RELATIONSHIP', label: 'Algebra', icon: '📐' },
                      { id: 'GEOMETRIC', label: 'Geometry', icon: '🔺' },
                      { id: 'GRID', label: 'Matrix', icon: '⊞' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setGenType(item.id);
                        handleRegenerate(item.id, genDifficulty);
                      }}
                      className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition cursor-pointer border ${
                        genType === item.id
                          ? 'bg-purple-600 text-white border-purple-300 shadow-md scale-102'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="text-[10px] font-game font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selector */}
              <div>
                <label className="text-[11px] font-bold text-indigo-200 block mb-1.5">
                  DIFFICULTY TIER
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        setGenDifficulty(diff);
                        handleRegenerate(genType, diff);
                      }}
                      className={`py-1.5 rounded-xl font-game text-xs font-bold transition cursor-pointer border ${
                        genDifficulty === diff
                          ? 'bg-pink-600 text-white border-pink-300 shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated Puzzle Live Preview Card */}
            <div className="bg-gradient-to-b from-indigo-900/50 to-purple-950/70 border-2 border-pink-500/40 rounded-3xl p-5 shadow-xl text-center">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-game font-bold text-pink-300 uppercase tracking-wider">
                  Generated Preview #{genSeed}
                </span>
                <span className="text-[10px] font-game bg-pink-500/30 text-pink-200 px-2 py-0.5 rounded-full border border-pink-400/40">
                  {generatedPreview.difficulty}
                </span>
              </div>

              <h4 className="text-lg font-game font-bold text-white mb-3">
                {generatedPreview.title}
              </h4>

              {/* Preview Content snippet */}
              {generatedPreview.puzzleData.sequence && (
                <div className="flex items-center justify-center gap-2 my-4">
                  {generatedPreview.puzzleData.sequence.map((num, i) => (
                    <div
                      key={i}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-game font-black text-lg border-2 shadow-md ${
                        num === '?'
                          ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                          : 'bg-indigo-800 text-amber-300 border-indigo-400/40'
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              )}

              {generatedPreview.puzzleData.equations && (
                <div className="space-y-1.5 my-3">
                  {generatedPreview.puzzleData.equations.map((eq, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 bg-black/30 border border-white/10 rounded-xl font-game text-sm font-bold text-indigo-100"
                    >
                      {eq}
                    </div>
                  ))}
                </div>
              )}

              {generatedPreview.puzzleData.grid && (
                <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto my-3">
                  {generatedPreview.puzzleData.grid.cells.map((cell, i) => (
                    <div
                      key={i}
                      className={`h-11 rounded-xl flex items-center justify-center font-game font-bold text-base border ${
                        cell === '?'
                          ? 'bg-rose-500 text-white border-rose-300 font-black'
                          : 'bg-indigo-800/80 text-amber-300 border-indigo-400/30'
                      }`}
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-indigo-200 mt-2 italic">
                Mathematically balanced with hints and verified unique solution.
              </p>
            </div>
          </div>

          {/* Play Generated Puzzle CTA */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handlePlayGenerated}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:from-purple-400 hover:to-amber-300 active:scale-98 text-white font-game font-extrabold text-base shadow-xl shadow-pink-600/30 border-2 border-white/40 cursor-pointer flex items-center justify-center gap-2 transition"
            >
              <Play className="w-5 h-5 fill-white stroke-none" />
              <span>PLAY THIS PUZZLE NOW</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
