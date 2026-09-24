import React from 'react';
import { PuzzleData, PuzzleType, ShapeElement } from '../../types';

interface PuzzleVisualizerProps {
  type: PuzzleType;
  data: PuzzleData;
}

export const PuzzleVisualizer: React.FC<PuzzleVisualizerProps> = ({ type, data }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-2 min-h-[220px]">
      {/* 1. RELATIONSHIPS / EQUATIONS */}
      {type === 'RELATIONSHIP' && data.equations && (
        <div className="flex flex-col gap-3.5 w-full max-w-xs items-center">
          {data.equations.map((eq, idx) => {
            const isTargetLine = eq.includes('?');
            return (
              <div
                key={idx}
                className={`w-full py-3 px-5 rounded-2xl text-center font-math text-2xl font-bold tracking-wider shadow-sm transition-transform ${
                  isTargetLine
                    ? 'bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 border-2 border-amber-400 text-amber-950 scale-105 shadow-amber-200'
                    : 'bg-white/90 border border-indigo-100 text-indigo-950'
                }`}
              >
                {eq.split('?').map((part, pIdx, arr) => (
                  <React.Fragment key={pIdx}>
                    {part}
                    {pIdx < arr.length - 1 && (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white font-game text-xl shadow-md animate-pulse">
                        ?
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. NUMBER PATTERNS / SEQUENCES */}
      {type === 'PATTERN' && data.sequence && (
        <div className="flex flex-col items-center gap-4 w-full">
          {data.patternDescription && (
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
              {data.patternDescription}
            </span>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-sm">
            {data.sequence.map((item, idx) => {
              const isTarget = item === '?';
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center font-math text-xl font-bold transition-all shadow-md ${
                      isTarget
                        ? 'bg-gradient-to-tr from-pink-500 via-rose-500 to-orange-400 border-2 border-pink-200 text-white animate-bounce scale-110 shadow-pink-300'
                        : 'bg-white border-2 border-indigo-100 text-indigo-900 shadow-indigo-100'
                    }`}
                  >
                    {item}
                  </div>
                  {idx < (data.sequence?.length ?? 0) - 1 && (
                    <span className="text-indigo-300 text-lg font-bold">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. NUMBER GRIDS */}
      {type === 'GRID' && data.grid && (
        <div className="flex flex-col items-center gap-3">
          {data.grid.highlightRule && (
            <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
              {data.grid.highlightRule}
            </span>
          )}
          <div
            className="grid gap-2.5 p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 shadow-inner"
            style={{
              gridTemplateColumns: `repeat(${data.grid.cols}, minmax(0, 1fr))`,
            }}
          >
            {data.grid.cells.map((cell, idx) => {
              const isTarget = cell === '?';
              return (
                <div
                  key={idx}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-math text-2xl font-bold shadow-sm transition-all ${
                    isTarget
                      ? 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 border-2 border-pink-300 text-white scale-105 animate-pulse shadow-pink-200'
                      : 'bg-white border border-indigo-100 text-indigo-950'
                  }`}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MATH CROSS */}
      {type === 'MATH_CROSS' && data.mathCross && (
        <div className="flex flex-col items-center gap-2">
          <div className="grid gap-1.5 p-3 rounded-2xl bg-purple-50/90 border border-purple-100 shadow-inner">
            {data.mathCross.grid.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-1.5 justify-center">
                {row.map((cell, cIdx) => {
                  const isTarget = cell.val === '?';
                  const isBlank = cell.val.trim() === '';
                  if (isBlank) {
                    return <div key={cIdx} className="w-10 h-10" />;
                  }
                  return (
                    <div
                      key={cIdx}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-math text-lg sm:text-xl font-bold shadow-xs ${
                        isTarget
                          ? 'bg-gradient-to-tr from-pink-500 to-rose-400 border-2 border-pink-200 text-white animate-pulse'
                          : '+-×÷='.includes(cell.val)
                          ? 'bg-purple-100/90 text-purple-700 font-black'
                          : 'bg-white border border-purple-100 text-purple-950'
                      }`}
                    >
                      {cell.val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {data.extraNote && (
            <div className="text-xs text-purple-700 font-medium bg-purple-100/80 px-3 py-1 rounded-full mt-1">
              {data.extraNote}
            </div>
          )}
        </div>
      )}

      {/* 5. GEOMETRIC & SHAPE RELATIONSHIPS */}
      {(type === 'GEOMETRIC' || type === 'SHAPE_REL') && data.shapes && (
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          {data.shapes.map((shape) => (
            <ShapeCard key={shape.id} shape={shape} />
          ))}
        </div>
      )}

      {/* 6. MIXED LOGIC */}
      {type === 'MIXED_LOGIC' && (
        <div className="flex flex-col items-center gap-3 w-full">
          {data.shapes && (
            <div className="flex flex-wrap items-center justify-center gap-4 w-full">
              {data.shapes.map((shape) => (
                <ShapeCard key={shape.id} shape={shape} />
              ))}
            </div>
          )}
          {data.equations && (
            <div className="flex flex-col gap-2 w-full max-w-xs items-center">
              {data.equations.map((eq, idx) => (
                <div
                  key={idx}
                  className={`w-full py-2 px-4 rounded-xl text-center font-math text-lg font-bold shadow-xs ${
                    eq.includes('?')
                      ? 'bg-gradient-to-r from-amber-100 to-yellow-200 border border-amber-300 text-amber-950 scale-105'
                      : 'bg-white/90 border border-indigo-100 text-indigo-950'
                  }`}
                >
                  {eq}
                </div>
              ))}
            </div>
          )}
          {data.extraNote && (
            <p className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-medium">
              {data.extraNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Subcomponent: SVG Shape Renderer with number badges
const ShapeCard: React.FC<{ shape: ShapeElement }> = ({ shape }) => {
  const getBadgeClass = (isTarget?: boolean) => {
    return isTarget
      ? 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 border-2 border-pink-200 text-white font-game text-lg font-bold shadow-md animate-pulse'
      : 'bg-white border-2 border-indigo-200 text-indigo-950 font-math text-base font-bold shadow-sm';
  };

  // 1. TRIANGLE
  if (shape.type === 'triangle') {
    const topNum = shape.numbers.find((n) => n.position === 'top');
    const bLeft = shape.numbers.find((n) => n.position === 'bottom-left' || n.position === 'left');
    const bRight = shape.numbers.find((n) => n.position === 'bottom-right' || n.position === 'right');
    const center = shape.numbers.find((n) => n.position === 'center' || n.position === 'bottom');

    return (
      <div className="relative w-44 h-40 flex items-center justify-center p-2">
        {/* SVG Triangle */}
        <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-sm">
          <polygon
            points="80,18 18,126 142,126"
            fill="#EEF2FF"
            stroke="#818CF8"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>

        {/* Top Node */}
        {topNum && (
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center ${getBadgeClass(
              topNum.isTarget
            )}`}
          >
            {topNum.value}
          </div>
        )}

        {/* Bottom Left Node */}
        {bLeft && (
          <div
            className={`absolute bottom-0 left-1 w-9 h-9 rounded-full flex items-center justify-center ${getBadgeClass(
              bLeft.isTarget
            )}`}
          >
            {bLeft.value}
          </div>
        )}

        {/* Bottom Right Node */}
        {bRight && (
          <div
            className={`absolute bottom-0 right-1 w-9 h-9 rounded-full flex items-center justify-center ${getBadgeClass(
              bRight.isTarget
            )}`}
          >
            {bRight.value}
          </div>
        )}

        {/* Center Node */}
        {center && (
          <div
            className={`absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center ${getBadgeClass(
              center.isTarget
            )}`}
          >
            {center.value}
          </div>
        )}
      </div>
    );
  }

  // 2. CIRCLE
  if (shape.type === 'circle') {
    const center = shape.numbers.find((n) => n.position === 'center');
    const top = shape.numbers.find((n) => n.position === 'top');
    const bottom = shape.numbers.find((n) => n.position === 'bottom');
    const left = shape.numbers.find((n) => n.position === 'left');
    const right = shape.numbers.find((n) => n.position === 'right');
    const topLeft = shape.numbers.find((n) => n.position === 'top-left');
    const topRight = shape.numbers.find((n) => n.position === 'top-right');
    const bLeft = shape.numbers.find((n) => n.position === 'bottom-left');
    const bRight = shape.numbers.find((n) => n.position === 'bottom-right');

    return (
      <div className="relative w-44 h-44 flex items-center justify-center p-2">
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-sm">
          <circle cx="80" cy="80" r="66" fill="#F5F3FF" stroke="#A78BFA" strokeWidth="4" />
          <line x1="80" y1="14" x2="80" y2="146" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="14" y1="80" x2="146" y2="80" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {center && (
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center ${getBadgeClass(
              center.isTarget
            )}`}
          >
            {center.value}
          </div>
        )}
        {top && (
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center ${getBadgeClass(
              top.isTarget
            )}`}
          >
            {top.value}
          </div>
        )}
        {bottom && (
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center ${getBadgeClass(
              bottom.isTarget
            )}`}
          >
            {bottom.value}
          </div>
        )}
        {left && (
          <div
            className={`absolute top-1/2 left-0 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center ${getBadgeClass(
              left.isTarget
            )}`}
          >
            {left.value}
          </div>
        )}
        {right && (
          <div
            className={`absolute top-1/2 right-0 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center ${getBadgeClass(
              right.isTarget
            )}`}
          >
            {right.value}
          </div>
        )}
        {topLeft && (
          <div
            className={`absolute top-2.5 left-2.5 w-8 h-8 rounded-full flex items-center justify-center ${getBadgeClass(
              topLeft.isTarget
            )}`}
          >
            {topLeft.value}
          </div>
        )}
        {topRight && (
          <div
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center ${getBadgeClass(
              topRight.isTarget
            )}`}
          >
            {topRight.value}
          </div>
        )}
        {bLeft && (
          <div
            className={`absolute bottom-2.5 left-2.5 w-8 h-8 rounded-full flex items-center justify-center ${getBadgeClass(
              bLeft.isTarget
            )}`}
          >
            {bLeft.value}
          </div>
        )}
        {bRight && (
          <div
            className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center ${getBadgeClass(
              bRight.isTarget
            )}`}
          >
            {bRight.value}
          </div>
        )}
      </div>
    );
  }

  // 3. HEXAGON
  if (shape.type === 'hexagon') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center p-2">
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-sm">
          <polygon
            points="80,14 138,47 138,113 80,146 22,113 22,47"
            fill="#EFF6FF"
            stroke="#60A5FA"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>

        {shape.numbers.map((item, idx) => {
          let posClass = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
          if (item.position === 'top') posClass = 'top-0 left-1/2 -translate-x-1/2';
          else if (item.position === 'bottom') posClass = 'bottom-0 left-1/2 -translate-x-1/2';
          else if (item.position === 'top-left') posClass = 'top-8 left-0';
          else if (item.position === 'top-right') posClass = 'top-8 right-0';
          else if (item.position === 'bottom-left') posClass = 'bottom-8 left-0';
          else if (item.position === 'bottom-right') posClass = 'bottom-8 right-0';

          return (
            <div
              key={idx}
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center ${posClass} ${getBadgeClass(
                item.isTarget
              )}`}
            >
              {item.value}
            </div>
          );
        })}
      </div>
    );
  }

  // 4. DIAMOND / SQUARE
  return (
    <div className="relative w-44 h-44 flex items-center justify-center p-2">
      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-sm">
        <rect
          x="30"
          y="30"
          width="100"
          height="100"
          rx="16"
          transform={shape.type === 'diamond' ? 'rotate(45 80 80)' : undefined}
          fill="#ECFDF5"
          stroke="#34D399"
          strokeWidth="4"
        />
      </svg>
      {shape.numbers.map((item, idx) => {
        let posClass = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
        if (item.position === 'top') posClass = 'top-1 left-1/2 -translate-x-1/2';
        else if (item.position === 'bottom') posClass = 'bottom-1 left-1/2 -translate-x-1/2';
        else if (item.position === 'left') posClass = 'top-1/2 left-1 -translate-y-1/2';
        else if (item.position === 'right') posClass = 'top-1/2 right-1 -translate-y-1/2';

        return (
          <div
            key={idx}
            className={`absolute w-9 h-9 rounded-full flex items-center justify-center ${posClass} ${getBadgeClass(
              item.isTarget
            )}`}
          >
            {item.value}
          </div>
        );
      })}
    </div>
  );
};
