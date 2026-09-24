import { GameSettings, PlayerStats } from '../types';

const STORAGE_KEY_PROGRESS = 'math_genius_progress_v1';
const STORAGE_KEY_SETTINGS = 'math_genius_settings_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: false,
  hapticEnabled: true,
  soundVolume: 0.8,
  musicVolume: 0.4,
  phoneFrameMode: false,
  backgroundTheme: 'NEBULA',
  animationsEnabled: true,
};

export const DEFAULT_STATS: PlayerStats = {
  coins: 50, // Welcome bonus so player can try hints if stuck
  totalStars: 0,
  currentLevel: 1,
  highestUnlockedLevel: 1,
  levelsProgress: {},
  dailyProgress: {
    date: new Date().toISOString().slice(0, 10),
    completedIndices: [],
    isFinished: false,
  },
  crosswordCompleted: [],
  endlessStats: {
    currentLevel: 1,
    highestLevel: 1,
    currentStreak: 0,
    bestStreak: 0,
    totalSolved: 0,
    totalCoinsEarned: 0,
  },
  developerTelemetry: {
    totalPuzzlesAttempted: 0,
    totalSubmissions: 0,
    totalFailedSubmissions: 0,
    totalHintsRequested: 0,
    totalTimePlayedSeconds: 0,
    sessionStartTime: new Date().toISOString(),
  },
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw) as PlayerStats;
    
    // Check if daily challenge date changed
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.dailyProgress?.date !== today) {
      parsed.dailyProgress = {
        date: today,
        completedIndices: [],
        isFinished: false,
      };
    }
    
    return {
      ...DEFAULT_STATS,
      ...parsed,
      levelsProgress: parsed.levelsProgress || {},
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function resetGameProgress(): PlayerStats {
  const fresh: PlayerStats = {
    ...DEFAULT_STATS,
    coins: 50,
  };
  savePlayerStats(fresh);
  return fresh;
}

export const loadGameSettings = loadSettings;
export const saveGameSettings = saveSettings;
export const resetPlayerStats = resetGameProgress;
