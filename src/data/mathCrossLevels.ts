import { Level } from '../types';

export const MATH_CROSS_LEVELS: Level[] = [
  {
    id: 201,
    type: 'MATH_CROSS',
    title: 'Cross Alpha',
    difficulty: 'EASY',
    categoryName: 'Math Crossword Pack',
    puzzleData: {
      mathCross: {
        grid: [
          [{ val: '8' }, { val: '+' }, { val: '?' }, { val: '=' }, { val: '15' }],
          [{ val: ' ' }, { val: ' ' }, { val: '×' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '3' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '=' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '21' }, { val: ' ' }, { val: ' ' }],
        ],
        targetRow: 0,
        targetCol: 2,
      },
      extraNote: 'Row: 8 + ? = 15 | Col: ? × 3 = 21',
    },
    answer: 7,
    hints: [
      'Solve either the row or column equation.',
      'Row: 8 + ? = 15 gives ? = 7.',
      'Column check: 7 × 3 = 21.',
    ],
    explanation: '8 + 7 = 15 and 7 × 3 = 21. Both equations yield 7.',
  },
  {
    id: 202,
    type: 'MATH_CROSS',
    title: 'Cross Beta',
    difficulty: 'EASY_PLUS',
    categoryName: 'Math Crossword Pack',
    puzzleData: {
      mathCross: {
        grid: [
          [{ val: '24' }, { val: '÷' }, { val: '?' }, { val: '=' }, { val: '6' }],
          [{ val: ' ' }, { val: ' ' }, { val: '+' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '9' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '=' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '13' }, { val: ' ' }, { val: ' ' }],
        ],
        targetRow: 0,
        targetCol: 2,
      },
      extraNote: 'Row: 24 ÷ ? = 6 | Col: ? + 9 = 13',
    },
    answer: 4,
    hints: [
      '24 ÷ ? = 6.',
      '? + 9 = 13.',
      '13 - 9 = 4.',
    ],
    explanation: '24 ÷ 4 = 6 and 4 + 9 = 13. The solution is 4.',
  },
  {
    id: 203,
    type: 'MATH_CROSS',
    title: 'Cross Gamma',
    difficulty: 'MEDIUM',
    categoryName: 'Math Crossword Pack',
    puzzleData: {
      mathCross: {
        grid: [
          [{ val: '9' }, { val: '×' }, { val: '?' }, { val: '=' }, { val: '54' }],
          [{ val: ' ' }, { val: ' ' }, { val: '-' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '2' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '=' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '4' }, { val: ' ' }, { val: ' ' }],
        ],
        targetRow: 0,
        targetCol: 2,
      },
      extraNote: 'Row: 9 × ? = 54 | Col: ? - 2 = 4',
    },
    answer: 6,
    hints: [
      '9 × ? = 54.',
      '54 / 9 = 6.',
      'Check: 6 - 2 = 4.',
    ],
    explanation: '9 × 6 = 54 and 6 - 2 = 4.',
  },
  {
    id: 204,
    type: 'MATH_CROSS',
    title: 'Cross Delta',
    difficulty: 'MEDIUM_PLUS',
    categoryName: 'Math Crossword Pack',
    puzzleData: {
      mathCross: {
        grid: [
          [{ val: '35' }, { val: '-' }, { val: '?' }, { val: '=' }, { val: '27' }],
          [{ val: ' ' }, { val: ' ' }, { val: '×' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '5' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '=' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '40' }, { val: ' ' }, { val: ' ' }],
        ],
        targetRow: 0,
        targetCol: 2,
      },
      extraNote: 'Row: 35 - ? = 27 | Col: ? × 5 = 40',
    },
    answer: 8,
    hints: [
      'Row: 35 - 27 = ?',
      'Column: ? × 5 = 40.',
      '40 / 5 = 8.',
    ],
    explanation: '35 - 8 = 27 and 8 × 5 = 40.',
  },
  {
    id: 205,
    type: 'MATH_CROSS',
    title: 'Cross Epsilon',
    difficulty: 'HARD',
    categoryName: 'Math Crossword Pack',
    puzzleData: {
      mathCross: {
        grid: [
          [{ val: '12' }, { val: '×' }, { val: '?' }, { val: '=' }, { val: '144' }],
          [{ val: ' ' }, { val: ' ' }, { val: '+' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '18' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '=' }, { val: ' ' }, { val: ' ' }],
          [{ val: ' ' }, { val: ' ' }, { val: '30' }, { val: ' ' }, { val: ' ' }],
        ],
        targetRow: 0,
        targetCol: 2,
      },
      extraNote: 'Row: 12 × ? = 144 | Col: ? + 18 = 30',
    },
    answer: 12,
    hints: [
      '144 / 12 = ?',
      '30 - 18 = ?',
      'Both give 12.',
    ],
    explanation: '12 × 12 = 144 and 12 + 18 = 30.',
  },
];
