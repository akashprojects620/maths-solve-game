import { Level, PuzzleType } from '../types';

export interface GeneratorConfig {
  type: PuzzleType;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

/**
 * Procedural Endless Puzzle Generator
 * Generates clean, mathematically consistent, non-ambiguous puzzles dynamically
 * across Patterns, Equations, Geometrics, Grids, and Logic.
 */
export function generateProceduralLevel(seedIndex: number, preferredType?: PuzzleType, preferredDifficulty?: 'EASY' | 'MEDIUM' | 'HARD'): Level {
  const types: PuzzleType[] = ['PATTERN', 'RELATIONSHIP', 'GEOMETRIC', 'GRID', 'SHAPE_REL'];
  const type = preferredType || types[Math.floor(Math.random() * types.length)];
  const difficulty = preferredDifficulty || (['EASY', 'MEDIUM', 'HARD'] as const)[Math.floor(Math.random() * 3)];

  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  switch (type) {
    case 'PATTERN': {
      // 1. Arithmetic progression, alternating addition, geometric or squared pattern
      const subtype = randomInt(0, 3);
      if (subtype === 0) {
        // Step arithmetic
        const start = randomInt(2, 20);
        const step = randomInt(2, 9);
        const seq = [start, start + step, start + step * 2, start + step * 3, '?'];
        const ans = start + step * 4;
        return {
          id: 1000 + seedIndex,
          type: 'PATTERN',
          title: `Step Sequence #${seedIndex}`,
          difficulty: difficulty === 'EASY' ? 'EASY' : difficulty === 'MEDIUM' ? 'MEDIUM' : 'HARD',
          categoryName: 'Endless Patterns',
          puzzleData: {
            sequence: seq,
            patternDescription: `Each number increases by a steady step. Find the missing value.`,
          },
          answer: ans,
          hints: [
            'Look at the difference between consecutive numbers.',
            `The constant step difference is +${step}.`,
            `${start + step * 3} + ${step} = ?`,
          ],
          explanation: `The sequence follows a regular step of +${step}: ${seq.slice(0, 4).join(', ')}, ${ans}.`,
        };
      } else if (subtype === 1) {
        // Multiplicative or power pattern
        const factor = randomInt(2, 4);
        const start = randomInt(1, 4);
        const seq = [start, start * factor, start * factor * factor, start * Math.pow(factor, 3), '?'];
        const ans = start * Math.pow(factor, 4);
        return {
          id: 1000 + seedIndex,
          type: 'PATTERN',
          title: `Multiplicative Growth #${seedIndex}`,
          difficulty: 'MEDIUM',
          categoryName: 'Endless Patterns',
          puzzleData: {
            sequence: seq,
            patternDescription: `Each consecutive number is multiplied by the same multiplier.`,
          },
          answer: ans,
          hints: [
            'Divide adjacent terms to test the ratio.',
            `Each number is multiplied by ${factor}.`,
            `${start * Math.pow(factor, 3)} × ${factor} = ?`,
          ],
          explanation: `Each number is multiplied by ${factor}: ${seq.slice(0, 4).join(', ')}, ${ans}.`,
        };
      } else if (subtype === 2) {
        // Squares with offset
        const offset = randomInt(1, 5);
        const base = [1, 2, 3, 4, 5];
        const seq = base.slice(0, 4).map((n) => n * n + offset);
        const ans = 5 * 5 + offset;
        return {
          id: 1000 + seedIndex,
          type: 'PATTERN',
          title: `Square Offsets #${seedIndex}`,
          difficulty: 'HARD',
          categoryName: 'Endless Patterns',
          puzzleData: {
            sequence: [...seq, '?'],
            patternDescription: `Observe how consecutive numbers relate to squares (n² + c).`,
          },
          answer: ans,
          hints: [
            'Check differences: are they expanding by 2 each time?',
            `Notice each number is a perfect square plus ${offset} (n² + ${offset}).`,
            `5² + ${offset} = 25 + ${offset} = ?`,
          ],
          explanation: `Formula is n² + ${offset}: 1² + ${offset} = ${seq[0]}, up to 5² + ${offset} = ${ans}.`,
        };
      } else {
        // Alternating steps (+a, -b)
        const a = randomInt(4, 8);
        const b = randomInt(1, 3);
        let cur = randomInt(10, 20);
        const seq: (number | string)[] = [];
        seq.push(cur);
        for (let i = 0; i < 4; i++) {
          cur = i % 2 === 0 ? cur + a : cur - b;
          seq.push(cur);
        }
        const ans = cur + a;
        seq.push('?');
        return {
          id: 1000 + seedIndex,
          type: 'PATTERN',
          title: `Alternating Steps #${seedIndex}`,
          difficulty: 'MEDIUM',
          categoryName: 'Endless Patterns',
          puzzleData: {
            sequence: seq,
            patternDescription: `Two alternating operations are applied sequentially.`,
          },
          answer: ans,
          hints: [
            'Compare step 1 to step 2, and step 2 to step 3.',
            `The pattern alternates between +${a} and -${b}.`,
            `The final step is +${a}: ${cur} + ${a} = ?`,
          ],
          explanation: `The operations cycle +${a} then -${b}. Applying +${a} gives ${ans}.`,
        };
      }
    }

    case 'RELATIONSHIP': {
      // Algebraic system: A + B = X, A * C = Y or similar
      const valA = randomInt(3, 9);
      const valB = randomInt(2, 8);
      const valC = randomInt(2, 6);

      const eq1 = `${valA} + A = ${valA * 2}`;
      const eq2 = `A + B = ${valA + valB}`;
      const eq3 = `B × C = ${valB * valC}`;
      const targetFormula = randomInt(0, 1) === 0 ? 'A + (B × C) = ?' : '(A × B) + C = ?';
      const ans = targetFormula.startsWith('A +') ? valA + valB * valC : valA * valB + valC;

      return {
        id: 1000 + seedIndex,
        type: 'RELATIONSHIP',
        title: `Variable Balance #${seedIndex}`,
        difficulty: difficulty === 'EASY' ? 'EASY' : 'MEDIUM',
        categoryName: 'Endless Equations',
        puzzleData: {
          equations: [
            'A + A = ' + valA * 2,
            `A + B = ${valA + valB}`,
            `B × C = ${valB * valC}`,
            targetFormula,
          ],
        },
        answer: ans,
        hints: [
          'Solve for A first using the top equation.',
          `A = ${valA}, so B = ${valA + valB} - ${valA} = ${valB}.`,
          `Calculate: ${targetFormula.replace('A', String(valA)).replace('B', String(valB)).replace('C', String(valC))}`,
        ],
        explanation: `A = ${valA}, B = ${valB}, C = ${valC}. Evaluating the equation gives ${ans}.`,
      };
    }

    case 'GEOMETRIC': {
      // Triangle apex puzzle: apex = (left + right) * bottom or left * right + bottom
      const left = randomInt(2, 7);
      const right = randomInt(2, 6);
      const bottom = randomInt(2, 5);

      const rule = randomInt(0, 1);
      // Rule 0: (left + right) * bottom
      // Rule 1: left * right + bottom
      const center1 = rule === 0 ? (left + right) * bottom : left * right + bottom;

      const l2 = left + 1;
      const r2 = right + 2;
      const b2 = bottom;
      const center2 = rule === 0 ? (l2 + r2) * b2 : l2 * r2 + b2;

      const l3 = left + 2;
      const r3 = right + 1;
      const b3 = bottom + 1;
      const ans = rule === 0 ? (l3 + r3) * b3 : l3 * r3 + b3;

      return {
        id: 1000 + seedIndex,
        type: 'GEOMETRIC',
        title: `Triangle Geometry #${seedIndex}`,
        difficulty: 'MEDIUM',
        categoryName: 'Endless Geometry',
        puzzleData: {
          shapes: [
            {
              id: 't1',
              type: 'triangle',
              numbers: [
                { position: 'top', value: center1, accentColor: '#fbbf24' },
                { position: 'left', value: left },
                { position: 'right', value: right },
                { position: 'bottom', value: bottom },
              ],
            },
            {
              id: 't2',
              type: 'triangle',
              numbers: [
                { position: 'top', value: center2, accentColor: '#fbbf24' },
                { position: 'left', value: l2 },
                { position: 'right', value: r2 },
                { position: 'bottom', value: b2 },
              ],
            },
            {
              id: 't3',
              type: 'triangle',
              numbers: [
                { position: 'top', value: '?', isTarget: true, accentColor: '#f43f5e' },
                { position: 'left', value: l3 },
                { position: 'right', value: r3 },
                { position: 'bottom', value: b3 },
              ],
            },
          ],
        },
        answer: ans,
        hints: [
          'Examine how the corner numbers produce the top apex value.',
          rule === 0
            ? 'The top number is (Left + Right) × Bottom.'
            : 'The top number is (Left × Right) + Bottom.',
          `Calculate for the 3rd triangle: (${l3} ${rule === 0 ? '+' : '×'} ${r3}) ${rule === 0 ? '×' : '+'} ${b3} = ?`,
        ],
        explanation: `Each triangle follows ${rule === 0 ? '(Left + Right) × Bottom' : '(Left × Right) + Bottom'}. For the final triangle: ${ans}.`,
      };
    }

    case 'GRID': {
      // 3x3 Matrix grid
      const r1 = [randomInt(2, 6), randomInt(3, 7)];
      const mult = randomInt(2, 4);
      const row1 = [r1[0], r1[1], (r1[0] + r1[1]) * mult];

      const r2 = [r1[0] + 1, r1[1] + 1];
      const row2 = [r2[0], r2[1], (r2[0] + r2[1]) * mult];

      const r3 = [r1[0] + 2, r1[1] + 2];
      const ans = (r3[0] + r3[1]) * mult;
      const row3: (number | string)[] = [r3[0], r3[1], '?'];

      return {
        id: 1000 + seedIndex,
        type: 'GRID',
        title: `Matrix Logic #${seedIndex}`,
        difficulty: 'MEDIUM',
        categoryName: 'Endless Grids',
        puzzleData: {
          grid: {
            rows: 3,
            cols: 3,
            cells: [...row1, ...row2, ...row3],
          },
        },
        answer: ans,
        hints: [
          'Compare the columns in each horizontal row.',
          `Notice (Col 1 + Col 2) × ${mult} = Col 3.`,
          `Calculate (${r3[0]} + ${r3[1]}) × ${mult} = ?`,
        ],
        explanation: `Each row satisfies (Col 1 + Col 2) × ${mult} = Col 3. Row 3: (${r3[0]} + ${r3[1]}) × ${mult} = ${ans}.`,
      };
    }

    default: {
      // Fallback: Number sequence
      const step = randomInt(3, 8);
      const start = randomInt(5, 25);
      const seq = [start, start + step, start + step * 2, start + step * 3, '?'];
      const ans = start + step * 4;
      return {
        id: 1000 + seedIndex,
        type: 'PATTERN',
        title: `Arithmetic Pulse #${seedIndex}`,
        difficulty: 'EASY',
        categoryName: 'Endless Patterns',
        puzzleData: {
          sequence: seq,
        },
        answer: ans,
        hints: [
          'Check the difference between successive terms.',
          `The step difference is +${step}.`,
          `${start + step * 3} + ${step} = ?`,
        ],
        explanation: `The sequence increases by ${step} each time: ${ans}.`,
      };
    }
  }
}

/**
 * Procedural Endless Level Generator with deterministic seed based on level number.
 * Scales dynamically from Level 1 all the way to Level 1000+!
 */
export function generateEndlessLevel(levelNumber: number): Level {
  // LCG pseudo-random generator seeded by levelNumber
  let seed = Math.abs(Math.sin(levelNumber * 9973 + 12345) * 1000000);
  const nextRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const randInt = (min: number, max: number) => Math.floor(nextRand() * (max - min + 1)) + min;

  // Determine difficulty tier based on endless level
  let diff: 'EASY' | 'EASY_PLUS' | 'MEDIUM' | 'MEDIUM_PLUS' | 'HARD' | 'EXPERT' = 'EASY';
  if (levelNumber <= 10) diff = 'EASY';
  else if (levelNumber <= 25) diff = 'EASY_PLUS';
  else if (levelNumber <= 45) diff = 'MEDIUM';
  else if (levelNumber <= 70) diff = 'MEDIUM_PLUS';
  else if (levelNumber <= 100) diff = 'HARD';
  else diff = 'EXPERT';

  // Available puzzle archetypes
  const archetypes: PuzzleType[] = ['PATTERN', 'RELATIONSHIP', 'GEOMETRIC', 'GRID', 'SHAPE_REL'];
  // Rotate types deterministically with levelNumber
  const typeIndex = (levelNumber - 1) % archetypes.length;
  const puzzleType = archetypes[typeIndex];

  // 1. PATTERN
  if (puzzleType === 'PATTERN') {
    const patternSubtype = randInt(0, 3);
    if (patternSubtype === 0 || levelNumber <= 8) {
      // Linear Arithmetic
      const start = randInt(2 + Math.min(20, Math.floor(levelNumber / 4)), 10 + Math.min(50, levelNumber * 2));
      const step = randInt(2 + Math.floor(levelNumber / 20), 5 + Math.min(15, Math.floor(levelNumber / 5)));
      const seq = [start, start + step, start + step * 2, start + step * 3, '?'];
      const ans = start + step * 4;
      return {
        id: 10000 + levelNumber,
        type: 'PATTERN',
        title: `Endless Level #${levelNumber}: Arithmetic Step`,
        difficulty: diff,
        categoryName: 'Endless Series',
        puzzleData: {
          sequence: seq,
          patternDescription: `Find the constant progression step: +${step}`,
        },
        answer: ans,
        hints: [
          'Examine the difference between successive terms.',
          `Every number increases by exactly +${step}.`,
          `Calculate: ${start + step * 3} + ${step} = ?`,
        ],
        explanation: `The sequence follows a regular step of +${step}: ${seq.slice(0, 4).join(', ')}, ${ans}.`,
      };
    } else if (patternSubtype === 1) {
      // Geometric / Multiplier
      const factor = randInt(2, levelNumber > 50 ? 4 : 3);
      const start = randInt(1, Math.max(2, 6 - factor));
      const seq = [start, start * factor, start * factor * factor, start * Math.pow(factor, 3), '?'];
      const ans = start * Math.pow(factor, 4);
      return {
        id: 10000 + levelNumber,
        type: 'PATTERN',
        title: `Endless Level #${levelNumber}: Multiplier Wave`,
        difficulty: diff,
        categoryName: 'Endless Growth',
        puzzleData: {
          sequence: seq,
          patternDescription: `Each successive number is multiplied by ${factor}`,
        },
        answer: ans,
        hints: [
          'Notice how rapidly the numbers grow — test ratios between terms.',
          `Each term is multiplied by ${factor}.`,
          `Calculate: ${start * Math.pow(factor, 3)} × ${factor} = ?`,
        ],
        explanation: `Each number is multiplied by ${factor}: ${seq.slice(0, 4).join(', ')}, ${ans}.`,
      };
    } else if (patternSubtype === 2) {
      // Fibonacci-like sum
      const a = randInt(1, 4 + Math.min(10, Math.floor(levelNumber / 10)));
      const b = randInt(2, 5 + Math.min(10, Math.floor(levelNumber / 10)));
      const c = a + b;
      const d = b + c;
      const e = c + d;
      const ans = d + e;
      return {
        id: 10000 + levelNumber,
        type: 'PATTERN',
        title: `Endless Level #${levelNumber}: Additive Sequence`,
        difficulty: diff,
        categoryName: 'Endless Fibonacci',
        puzzleData: {
          sequence: [a, b, c, d, e, '?'],
          patternDescription: 'Each term is the sum of the previous two terms',
        },
        answer: ans,
        hints: [
          'Check if the 3rd term is related to terms 1 and 2.',
          `Notice ${a} + ${b} = ${c}, and ${b} + ${c} = ${d}.`,
          `Calculate the final sum: ${d} + ${e} = ?`,
        ],
        explanation: `Each number is the sum of the preceding two numbers: ${d} + ${e} = ${ans}.`,
      };
    } else {
      // Alternating operations (+A, -B)
      const inc = randInt(4, 8 + Math.min(10, Math.floor(levelNumber / 10)));
      const dec = randInt(1, 3);
      let cur = randInt(10, 20 + Math.min(40, levelNumber));
      const seq: (number | string)[] = [cur];
      for (let i = 0; i < 4; i++) {
        cur = i % 2 === 0 ? cur + inc : cur - dec;
        seq.push(cur);
      }
      const ans = cur + inc;
      seq.push('?');
      return {
        id: 10000 + levelNumber,
        type: 'PATTERN',
        title: `Endless Level #${levelNumber}: Alternating Pulse`,
        difficulty: diff,
        categoryName: 'Endless Cycles',
        puzzleData: {
          sequence: seq,
          patternDescription: `Alternates between adding and subtracting`,
        },
        answer: ans,
        hints: [
          'Look at the sequence differences from term to term.',
          `The sequence alternates between +${inc} and -${dec}.`,
          `The next step adds ${inc}: ${cur} + ${inc} = ?`,
        ],
        explanation: `Alternating pattern: +${inc}, -${dec}, +${inc}, -${dec}, +${inc}. Answer is ${ans}.`,
      };
    }
  }

  // 2. RELATIONSHIP (Equations)
  if (puzzleType === 'RELATIONSHIP') {
    const valA = randInt(3, 8 + Math.min(12, Math.floor(levelNumber / 8)));
    const valB = randInt(2, 7 + Math.min(10, Math.floor(levelNumber / 8)));
    const valC = randInt(2, 6 + Math.min(8, Math.floor(levelNumber / 10)));

    const isComplex = levelNumber > 35;
    const targetEq = isComplex ? `(A + B) × C = ?` : `A + (B × C) = ?`;
    const ans = isComplex ? (valA + valB) * valC : valA + valB * valC;

    return {
      id: 10000 + levelNumber,
      type: 'RELATIONSHIP',
      title: `Endless Level #${levelNumber}: Variable System`,
      difficulty: diff,
      categoryName: 'Endless Algebra',
      puzzleData: {
        equations: [
          `A + A = ${valA * 2}`,
          `A + B = ${valA + valB}`,
          `B × C = ${valB * valC}`,
          targetEq,
        ],
      },
      answer: ans,
      hints: [
        `Find A first: A + A = ${valA * 2} means A = ${valA}.`,
        `Substitute A into equation 2 to find B: ${valA} + B = ${valA + valB} (B = ${valB}). Then C = ${(valB * valC) / valB}.`,
        `Compute the final formula with A=${valA}, B=${valB}, C=${valC}: ${ans}.`,
      ],
      explanation: `A = ${valA}, B = ${valB}, C = ${valC}. Substituting into ${targetEq} gives ${ans}.`,
    };
  }

  // 3. GEOMETRIC (Triangles with apex relationships)
  if (puzzleType === 'GEOMETRIC') {
    const left = randInt(2, 6 + Math.min(6, Math.floor(levelNumber / 12)));
    const right = randInt(2, 5 + Math.min(6, Math.floor(levelNumber / 12)));
    const bottom = randInt(2, 4 + Math.min(4, Math.floor(levelNumber / 15)));

    // Rule: (Left + Right) * Bottom
    const center1 = (left + right) * bottom;
    const l2 = left + 1;
    const r2 = right + 2;
    const b2 = bottom;
    const center2 = (l2 + r2) * b2;

    const l3 = left + 2;
    const r3 = right + 1;
    const b3 = bottom + 1;
    const ans = (l3 + r3) * b3;

    return {
      id: 10000 + levelNumber,
      type: 'GEOMETRIC',
      title: `Endless Level #${levelNumber}: Triangle Apex`,
      difficulty: diff,
      categoryName: 'Endless Geometry',
      puzzleData: {
        shapes: [
          {
            id: 't1',
            type: 'triangle',
            numbers: [
              { position: 'top', value: center1, accentColor: '#fbbf24' },
              { position: 'left', value: left },
              { position: 'right', value: right },
              { position: 'bottom', value: bottom },
            ],
          },
          {
            id: 't2',
            type: 'triangle',
            numbers: [
              { position: 'top', value: center2, accentColor: '#fbbf24' },
              { position: 'left', value: l2 },
              { position: 'right', value: r2 },
              { position: 'bottom', value: b2 },
            ],
          },
          {
            id: 't3',
            type: 'triangle',
            numbers: [
              { position: 'top', value: '?', isTarget: true, accentColor: '#f43f5e' },
              { position: 'left', value: l3 },
              { position: 'right', value: r3 },
              { position: 'bottom', value: b3 },
            ],
          },
        ],
      },
      answer: ans,
      hints: [
        'Notice how the top apex relates to the bottom corners.',
        'Formula: Apex = (Left + Right) × Bottom.',
        `For the final triangle: (${l3} + ${r3}) × ${b3} = ?`,
      ],
      explanation: `Each triangle apex is (Left + Right) × Bottom. For triangle 3: (${l3} + ${r3}) × ${b3} = ${ans}.`,
    };
  }

  // 4. GRID (3x3 Matrix Logic)
  if (puzzleType === 'GRID') {
    const mult = randInt(2, 4);
    const r1a = randInt(2, 6);
    const r1b = randInt(3, 7);
    const row1 = [r1a, r1b, (r1a + r1b) * mult];

    const r2a = r1a + 1;
    const r2b = r1b + 2;
    const row2 = [r2a, r2b, (r2a + r2b) * mult];

    const r3a = r1a + 2;
    const r3b = r1b + 1;
    const ans = (r3a + r3b) * mult;
    const row3: (number | string)[] = [r3a, r3b, '?'];

    return {
      id: 10000 + levelNumber,
      type: 'GRID',
      title: `Endless Level #${levelNumber}: Matrix Rule`,
      difficulty: diff,
      categoryName: 'Endless Grids',
      puzzleData: {
        grid: {
          rows: 3,
          cols: 3,
          cells: [...row1, ...row2, ...row3],
        },
      },
      answer: ans,
      hints: [
        'Compare columns within each horizontal row.',
        `The rule across each row is: (Col 1 + Col 2) × ${mult} = Col 3.`,
        `Calculate for row 3: (${r3a} + ${r3b}) × ${mult} = ?`,
      ],
      explanation: `Each row satisfies (Col 1 + Col 2) × ${mult} = Col 3. Third row: (${r3a} + ${r3b}) × ${mult} = ${ans}.`,
    };
  }

  // 5. SHAPE_REL (Shape sides counts algebra)
  const triangleSides = 3;
  const squareSides = 4;
  const pentagonSides = 5;
  const multiplier = randInt(2, 3);

  const eq1 = `Triangle + Triangle = ${triangleSides + triangleSides}`;
  const eq2 = `Triangle + Square = ${triangleSides + squareSides}`;
  const eq3 = `Square × Pentagon = ${squareSides * pentagonSides}`;
  const targetEquation = `Triangle + (Square × Pentagon) = ?`;
  const ans = triangleSides + squareSides * pentagonSides;

  return {
    id: 10000 + levelNumber,
    type: 'RELATIONSHIP',
    title: `Endless Level #${levelNumber}: Shape Value Logic`,
    difficulty: diff,
    categoryName: 'Endless Shape Math',
    puzzleData: {
      equations: [eq1, eq2, eq3, targetEquation],
    },
    answer: ans,
    hints: [
      'Each shape value corresponds to its number of sides: Triangle=3, Square=4, Pentagon=5.',
      `Verify: Triangle (3) + Triangle (3) = 6. Square × Pentagon = 4 × 5 = 20.`,
      `Evaluate: 3 + (4 × 5) = 3 + 20 = ?`,
    ],
    explanation: `Triangle = 3, Square = 4, Pentagon = 5. Therefore, 3 + (4 × 5) = 23.`,
  };
}
