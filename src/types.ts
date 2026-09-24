export type PuzzleType =
  | 'RELATIONSHIP' // Type A: Systems of equations / algebra
  | 'GEOMETRIC'    // Type B: Shapes (Circle, Triangle, Square, Hexagon)
  | 'PATTERN'      // Type C: Number sequence / pattern
  | 'GRID'         // Type D: 2x2, 3x3, 4x4 matrix puzzle
  | 'MATH_CROSS'   // Type E: Crossword-style math grid
  | 'SHAPE_REL'    // Type F: Multiple shapes with derived numbers
  | 'MIXED_LOGIC'; // Type G: Multi-step combined logic

export type Difficulty = 'EASY' | 'EASY_PLUS' | 'MEDIUM' | 'MEDIUM_PLUS' | 'HARD' | 'EXPERT';

export interface ShapeElement {
  id: string;
  type: 'circle' | 'triangle' | 'square' | 'hexagon' | 'diamond' | 'cross' | 'star';
  label?: string;
  numbers: {
    position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    value: number | string; // '?' for target
    isTarget?: boolean;
    accentColor?: string;
  }[];
}

export interface GridPuzzleData {
  rows: number;
  cols: number;
  cells: (number | string | null)[]; // '?' is target
  highlightRule?: string;
}

export interface MathCrossData {
  // Crossword grid of equations: e.g.
  // Row 1: [A, '+', B, '=', C]
  // Col 1: [A, 'x', D, '=', G]
  grid: {
    val: string;
    isInput?: boolean;
    isTarget?: boolean;
    highlight?: boolean;
  }[][];
  targetRow: number;
  targetCol: number;
}

export interface PuzzleData {
  // Representation suited for the type:
  equations?: string[]; // for RELATIONSHIP and MIXED_LOGIC
  shapes?: ShapeElement[]; // for GEOMETRIC and SHAPE_REL
  sequence?: (number | string)[]; // for PATTERN e.g. [2, 6, 18, '?']
  patternDescription?: string;
  grid?: GridPuzzleData; // for GRID
  mathCross?: MathCrossData; // for MATH_CROSS
  customDiagramType?: string;
  extraNote?: string;
}

export interface Level {
  id: number;
  type: PuzzleType;
  title: string;
  difficulty: Difficulty;
  puzzleData: PuzzleData;
  answer: number;
  hints: [string, string, string]; // Hint 1: concept, Hint 2: relation, Hint 3: partial calculation
  explanation: string;
  categoryName: string;
}

export interface LevelProgress {
  completed: boolean;
  stars: number; // 1 to 3
  bestAttempts?: number;
  attempts?: number; // Total submissions for this level
  hintsUsed?: number;
  solveTimeSeconds?: number; // Fastest or latest successful solve duration
  totalTimeSpentSeconds?: number; // Cumulative time spent on this level
  completedAt?: string;
}

export interface DeveloperTelemetry {
  totalPuzzlesAttempted: number;
  totalSubmissions: number;
  totalFailedSubmissions: number;
  totalHintsRequested: number;
  totalTimePlayedSeconds: number;
  sessionStartTime: string;
}

export type BackgroundTheme = 'NEBULA' | 'CANDY_ROYAL' | 'CYBER_EMERALD' | 'GOLDEN_DUSK';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticEnabled: boolean;
  soundVolume: number; // 0.0 - 1.0
  musicVolume: number; // 0.0 - 1.0
  phoneFrameMode: boolean; // toggle portrait mobile frame container
  backgroundTheme?: BackgroundTheme;
  animationsEnabled?: boolean;
}

export interface EndlessStats {
  currentLevel: number;
  highestLevel: number;
  currentStreak: number;
  bestStreak: number;
  totalSolved: number;
  totalCoinsEarned: number;
}

export interface PlayerStats {
  coins: number;
  totalStars: number;
  currentLevel: number;
  highestUnlockedLevel: number;
  levelsProgress: Record<number, LevelProgress>;
  dailyProgress: {
    date: string;
    completedIndices: number[];
    isFinished: boolean;
  };
  crosswordCompleted: number[];
  speedAttackStats?: {
    highScore: number;
    bestAccuracy: number;
    gamesPlayed: number;
    totalSolved: number;
  };
  endlessStats?: EndlessStats;
  developerTelemetry?: DeveloperTelemetry;
}

export type ActiveScreen = 'HOME_MAP' | 'MAP' | 'PUZZLE' | 'DAILY' | 'MATH_CROSS' | 'PRACTICE' | 'SPEED_ATTACK' | 'ENDLESS';
