import { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { AnimatedBackground } from './components/common/AnimatedBackground';
import { LevelMap } from './components/map/LevelMap';
import { PuzzleScreen } from './components/puzzle/PuzzleScreen';
import { DailyChallengeView } from './components/views/DailyChallengeView';
import { MathCrossView } from './components/views/MathCrossView';
import { PracticeView } from './components/views/PracticeView';
import { SpeedAttackView } from './components/views/SpeedAttackView';
import { EndlessModeView } from './components/views/EndlessModeView';
import { SettingsModal } from './components/views/SettingsModal';
import { HowToPlayModal } from './components/views/HowToPlayModal';
import { DeveloperDashboardModal } from './components/views/DeveloperDashboardModal';
import { InstallApkModal } from './components/views/InstallApkModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { MAIN_LEVELS } from './data/levels';
import {
  ActiveScreen,
  PlayerStats,
  GameSettings,
  Level,
} from './types';
import {
  loadPlayerStats,
  savePlayerStats,
  loadGameSettings,
  saveGameSettings,
  resetPlayerStats,
} from './utils/storage';
import { soundManager } from './utils/audio';

export default function App() {
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => loadPlayerStats());
  const [settings, setSettings] = useState<GameSettings>(() => loadGameSettings());
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('MAP');
  const [activeLevelId, setActiveLevelId] = useState<number>(playerStats.currentLevel);
  const [customLevel, setCustomLevel] = useState<Level | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showDevDashboard, setShowDevDashboard] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Sync audio manager settings
  useEffect(() => {
    soundManager.setSoundEnabled(settings.soundEnabled);
    soundManager.setMusicEnabled(settings.musicEnabled);
  }, [settings.soundEnabled, settings.musicEnabled]);

  // Persist player stats on change
  useEffect(() => {
    savePlayerStats(playerStats);
  }, [playerStats]);

  // Persist settings on change
  useEffect(() => {
    saveGameSettings(settings);
  }, [settings]);

  // Navigate to puzzle
  const handleSelectLevel = (levelId: number) => {
    setCustomLevel(null);
    setActiveLevelId(levelId);
    setActiveScreen('PUZZLE');
  };

  // Launch procedural endless puzzle
  const handleStartCustomPuzzle = (puzzle: Level) => {
    setCustomLevel(puzzle);
    setActiveLevelId(puzzle.id);
    setActiveScreen('PUZZLE');
  };

  // Move to next level in adventure mode
  const handleNextLevel = () => {
    if (customLevel) {
      setActiveScreen('PRACTICE');
      return;
    }
    const nextId = activeLevelId + 1;
    if (nextId <= MAIN_LEVELS.length) {
      setActiveLevelId(nextId);
    } else {
      setActiveScreen('MAP');
    }
  };

  // Reset progress
  const handleResetProgress = () => {
    const fresh = resetPlayerStats();
    setPlayerStats(fresh);
    setActiveLevelId(1);
    setActiveScreen('MAP');
  };

  // Toggle sound from header
  const handleToggleSound = () => {
    setSettings((prev) => {
      const updated = { ...prev, soundEnabled: !prev.soundEnabled };
      soundManager.setSoundEnabled(updated.soundEnabled);
      return updated;
    });
  };

  // Toggle phone frame mode
  const handleToggleFrameMode = () => {
    setSettings((prev) => ({
      ...prev,
      phoneFrameMode: !prev.phoneFrameMode,
    }));
  };

  const currentLevel = customLevel || MAIN_LEVELS.find((lvl) => lvl.id === activeLevelId) || MAIN_LEVELS[0];

  // Screen Title for Header
  const getHeaderTitle = () => {
    switch (activeScreen) {
      case 'PUZZLE':
        return customLevel ? customLevel.title : `Level ${activeLevelId}`;
      case 'DAILY':
        return 'Daily 10';
      case 'MATH_CROSS':
        return 'Math Cross';
      case 'PRACTICE':
        return 'Practice Arena';
      case 'SPEED_ATTACK':
        return 'Speed 60s Blitz';
      case 'ENDLESS':
        return 'Endless Levels ∞';
      default:
        return undefined;
    }
  };

  const content = (
    <div className="w-full flex flex-col min-h-screen relative text-slate-100 selection:bg-pink-500 selection:text-white">
      {/* Dynamic Animated Nebula / Ambiance Background */}
      <AnimatedBackground
        theme={settings.backgroundTheme || 'NEBULA'}
        animationsEnabled={settings.animationsEnabled !== false}
      />

      {/* Header */}
      <Header
        title={getHeaderTitle()}
        coins={playerStats.coins}
        totalStars={playerStats.totalStars}
        onBack={activeScreen !== 'MAP' ? () => setActiveScreen('MAP') : undefined}
        onOpenSettings={() => setShowSettings(true)}
        onOpenDevDashboard={() => setShowDevDashboard(true)}
        onOpenInstallModal={() => setShowInstallModal(true)}
        settings={settings}
        onToggleSound={handleToggleSound}
        onToggleFrameMode={handleToggleFrameMode}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full flex flex-col items-center relative z-10">
        {activeScreen === 'MAP' && (
          <LevelMap
            levels={MAIN_LEVELS}
            playerStats={playerStats}
            onSelectLevel={handleSelectLevel}
            onNavigateScreen={(screen) => setActiveScreen(screen)}
            onOpenInstallModal={() => setShowInstallModal(true)}
            hapticEnabled={settings.hapticEnabled}
          />
        )}

        {activeScreen === 'PUZZLE' && (
          <PuzzleScreen
            level={currentLevel}
            playerStats={playerStats}
            settings={settings}
            onUpdateStats={setPlayerStats}
            onNextLevel={handleNextLevel}
            onGoToMap={() => setActiveScreen('MAP')}
            hasNextLevel={activeLevelId < MAIN_LEVELS.length}
          />
        )}

        {activeScreen === 'DAILY' && (
          <DailyChallengeView
            playerStats={playerStats}
            onUpdateStats={setPlayerStats}
            onBack={() => setActiveScreen('MAP')}
            hapticEnabled={settings.hapticEnabled}
          />
        )}

        {activeScreen === 'MATH_CROSS' && (
          <MathCrossView
            playerStats={playerStats}
            onUpdateStats={setPlayerStats}
            onBack={() => setActiveScreen('MAP')}
            hapticEnabled={settings.hapticEnabled}
          />
        )}

        {activeScreen === 'PRACTICE' && (
          <PracticeView
            playerStats={playerStats}
            onSelectLevel={handleSelectLevel}
            onStartCustomPuzzle={handleStartCustomPuzzle}
            onOpenEndlessMode={() => setActiveScreen('ENDLESS')}
            onBack={() => setActiveScreen('MAP')}
            hapticEnabled={settings.hapticEnabled}
          />
        )}

        {activeScreen === 'SPEED_ATTACK' && (
          <SpeedAttackView
            playerStats={playerStats}
            onUpdateStats={setPlayerStats}
            onBack={() => setActiveScreen('MAP')}
            hapticEnabled={settings.hapticEnabled}
          />
        )}

        {activeScreen === 'ENDLESS' && (
          <EndlessModeView
            playerStats={playerStats}
            onUpdateStats={setPlayerStats}
            onBack={() => setActiveScreen('MAP')}
            hapticEnabled={settings.hapticEnabled}
          />
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenDevDashboard={() => setShowDevDashboard(true)}
          onOpenInstallModal={() => setShowInstallModal(true)}
        />
      )}

      {/* How to Play Guide Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Install Mobile App / APK Modal */}
      {showInstallModal && (
        <InstallApkModal
          onClose={() => setShowInstallModal(false)}
          hapticEnabled={settings.hapticEnabled}
        />
      )}

      {/* Offline Mode Alert */}
      <OfflineIndicator />

      {/* Developer Telemetry & Performance Dashboard Modal */}
      {showDevDashboard && (
        <DeveloperDashboardModal
          playerStats={playerStats}
          onClose={() => setShowDevDashboard(false)}
        />
      )}
    </div>
  );

  // If Phone Frame Mode is active on desktop screens, wrap in phone mockup shell!
  if (settings.phoneFrameMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-6 sm:py-8">
        {/* Device Shell */}
        <div className="w-full sm:max-w-[430px] sm:h-[880px] bg-slate-900 sm:rounded-[44px] shadow-2xl sm:ring-12 sm:ring-slate-800 sm:border-4 sm:border-slate-700/80 flex flex-col overflow-hidden relative">
          {/* Top Notch / Camera Island on Desktop */}
          <div className="hidden sm:flex items-center justify-center h-6 bg-slate-950/80 w-full z-40 relative">
            <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950/60" />
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col">
            {content}
          </div>

          {/* Android Bottom Navigation Pill */}
          <div className="hidden sm:flex items-center justify-center h-4 bg-slate-950 w-full z-40">
            <div className="w-28 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return content;
}
