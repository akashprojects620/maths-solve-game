import { Level } from '../types';

export const DAILY_PUZZLES: Level[] = [
  {
    id: 101,
    type: 'PATTERN',
    title: 'Daily #1: Quick Double',
    difficulty: 'EASY',
    categoryName: 'Daily Warm-up',
    puzzleData: {
      sequence: [5, 10, 20, 40, '?'],
      patternDescription: 'Daily 1 of 10',
    },
    answer: 80,
    hints: [
      'Each number doubles.',
      'Multiply by 2.',
      '40 × 2 = ?',
    ],
    explanation: 'Geometric sequence multiplying by 2: 40 × 2 = 80.',
  },
  {
    id: 102,
    type: 'RELATIONSHIP',
    title: 'Daily #2: Sum Split',
    difficulty: 'EASY',
    categoryName: 'Daily Warm-up',
    puzzleData: {
      equations: [
        'X + Y = 20',
        'X - Y = 8',
        'X = ?',
      ],
    },
    answer: 14,
    hints: [
      'Add both equations to cancel Y.',
      '2X = 28.',
      '28 / 2 = ?',
    ],
    explanation: '2X = 28 => X = 14.',
  },
  {
    id: 103,
    type: 'GEOMETRIC',
    title: 'Daily #3: Triangle Apex',
    difficulty: 'EASY',
    categoryName: 'Daily Geometry',
    puzzleData: {
      shapes: [
        {
          id: 'd-tri-1',
          type: 'triangle',
          numbers: [
            { position: 'top', value: 8 },
            { position: 'bottom-left', value: 4 },
            { position: 'bottom-right', value: 6 },
            { position: 'center', value: 18 },
          ],
        },
        {
          id: 'd-tri-2',
          type: 'triangle',
          numbers: [
            { position: 'top', value: 7 },
            { position: 'bottom-left', value: 9 },
            { position: 'bottom-right', value: 5 },
            { position: 'center', value: '?', isTarget: true },
          ],
        },
      ],
    },
    answer: 21,
    hints: [
      'Sum the three corners.',
      '7 + 9 + 5 = ?',
      'Center is 21.',
    ],
    explanation: 'Center is sum of vertices: 7 + 9 + 5 = 21.',
  },
  {
    id: 104,
    type: 'GRID',
    title: 'Daily #4: Product Cross',
    difficulty: 'MEDIUM',
    categoryName: 'Daily Matrix',
    puzzleData: {
      grid: {
        rows: 2,
        cols: 2,
        cells: [3, 8, 4, '?'],
        highlightRule: 'Row 1 product = Row 2 product',
      },
    },
    answer: 6,
    hints: [
      'Top row: 3 × 8 = 24.',
      'Bottom row must equal 24: 4 × ? = 24.',
      '24 / 4 = ?',
    ],
    explanation: '3 × 8 = 24, so 4 × 6 = 24.',
  },
  {
    id: 105,
    type: 'PATTERN',
    title: 'Daily #5: Triple Step',
    difficulty: 'MEDIUM',
    categoryName: 'Daily Sequences',
    puzzleData: {
      sequence: [4, 9, 19, 39, '?'],
      patternDescription: 'Multiply by 2 and add 1',
    },
    answer: 79,
    hints: [
      'Look at ×2 + 1.',
      '39 × 2 + 1 = 78 + 1.',
      '78 + 1 = ?',
    ],
    explanation: '(39 × 2) + 1 = 79.',
  },
  {
    id: 106,
    type: 'RELATIONSHIP',
    title: 'Daily #6: Three Variables',
    difficulty: 'MEDIUM',
    categoryName: 'Daily Algebra',
    puzzleData: {
      equations: [
        'A + B = 16',
        'B + C = 18',
        'A + C = 14',
        'A + B + C = ?',
      ],
    },
    answer: 24,
    hints: [
      'Sum all three equations: 2(A + B + C) = 48.',
      'Divide by 2.',
      '48 / 2 = ?',
    ],
    explanation: '2(A + B + C) = 48 => A + B + C = 24.',
  },
  {
    id: 107,
    type: 'SHAPE_REL',
    title: 'Daily #7: Four Winds',
    difficulty: 'MEDIUM',
    categoryName: 'Daily Shapes',
    puzzleData: {
      shapes: [
        {
          id: 'd-circ-1',
          type: 'circle',
          numbers: [
            { position: 'top', value: 5 },
            { position: 'bottom', value: 7 },
            { position: 'left', value: 8 },
            { position: 'right', value: 4 },
            { position: 'center', value: 24 },
          ],
        },
        {
          id: 'd-circ-2',
          type: 'circle',
          numbers: [
            { position: 'top', value: 6 },
            { position: 'bottom', value: 9 },
            { position: 'left', value: 7 },
            { position: 'right', value: 8 },
            { position: 'center', value: '?', isTarget: true },
          ],
        },
      ],
    },
    answer: 30,
    hints: [
      'Sum all 4 outer positions.',
      '6 + 9 + 7 + 8 = ?',
      'Total is 30.',
    ],
    explanation: '6 + 9 + 7 + 8 = 30.',
  },
  {
    id: 108,
    type: 'PATTERN',
    title: 'Daily #8: Square Minus One',
    difficulty: 'HARD',
    categoryName: 'Daily Sequences',
    puzzleData: {
      sequence: [3, 8, 15, 24, 35, '?'],
      patternDescription: 'n² - 1 sequence',
    },
    answer: 48,
    hints: [
      'Notice: 2² - 1 = 3, 3² - 1 = 8, 4² - 1 = 15...',
      'Next is 7² - 1.',
      '49 - 1 = ?',
    ],
    explanation: 'Formula is (n+1)² - 1 for n = 1, 2, 3, 4, 5, 6: 7² - 1 = 49 - 1 = 48.',
  },
  {
    id: 109,
    type: 'GRID',
    title: 'Daily #9: Product and Sum',
    difficulty: 'HARD',
    categoryName: 'Daily Matrix',
    puzzleData: {
      grid: {
        rows: 3,
        cols: 3,
        cells: [
          4, 6, 26,
          5, 5, 27,
          6, 7, '?',
        ],
      },
    },
    answer: 44,
    hints: [
      'Row rule: (Col 1 × Col 2) + 2.',
      '4 × 6 = 24 (+2 = 26). 5 × 5 = 25 (+2 = 27).',
      '6 × 7 = 42. 42 + 2 = ?',
    ],
    explanation: '(6 × 7) + 2 = 42 + 2 = 44.',
  },
  {
    id: 110,
    type: 'MIXED_LOGIC',
    title: 'Daily #10: Grand Teaser',
    difficulty: 'EXPERT',
    categoryName: 'Daily Champion',
    puzzleData: {
      equations: [
        'A × B = 36',
        'A + B = 13',
        'B > A',
        'B² - A² = ?',
      ],
    },
    answer: 65,
    hints: [
      'Factors of 36 that sum to 13 are 4 and 9.',
      'Since B > A: B = 9 and A = 4.',
      '9² - 4² = 81 - 16 = ?',
    ],
    explanation: 'A = 4, B = 9. 9² - 4² = 81 - 16 = 65.',
  },
];
