import React, { useEffect } from 'react';
import { Delete, Check } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';

interface KeypadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  hapticEnabled?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export const Keypad: React.FC<KeypadProps> = ({
  value,
  onChange,
  onSubmit,
  hapticEnabled = true,
  disabled = false,
  maxLength = 6,
}) => {
  const handleDigit = (digit: string) => {
    if (disabled) return;
    if (value.length >= maxLength) {
      triggerHaptic('warning', hapticEnabled);
      return;
    }
    soundManager.playKeypadTap(digit);
    triggerHaptic('light', hapticEnabled);
    onChange(value + digit);
  };

  const handleBackspace = () => {
    if (disabled || value.length === 0) return;
    soundManager.playBackspace();
    triggerHaptic('medium', hapticEnabled);
    onChange(value.slice(0, -1));
  };

  const handleSubmit = () => {
    if (disabled || value.trim() === '') {
      triggerHaptic('warning', hapticEnabled);
      return;
    }
    soundManager.playClick();
    triggerHaptic('medium', hapticEnabled);
    onSubmit();
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, disabled, hapticEnabled]);

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <div className="w-full max-w-sm mx-auto px-3 pb-3">
      {/* 3x3 Digit Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-2.5">
        {keys.map((row) =>
          row.map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={disabled}
              onClick={() => handleDigit(digit)}
              className="candy-btn h-14 rounded-2xl bg-gradient-to-b from-white to-slate-100 hover:from-white hover:to-indigo-50 border-2 border-indigo-200/80 active:border-indigo-400 text-indigo-900 font-game text-2xl font-bold flex items-center justify-center cursor-pointer select-none transition disabled:opacity-50"
              aria-label={`Digit ${digit}`}
            >
              <span className="drop-shadow-xs">{digit}</span>
            </button>
          ))
        )}
      </div>

      {/* Bottom Row: Backspace, 0, Submit */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Backspace Button */}
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleBackspace}
          className="candy-btn h-14 rounded-2xl bg-gradient-to-b from-rose-400 to-rose-500 hover:from-rose-300 hover:to-rose-500 border-2 border-rose-300 text-white flex items-center justify-center cursor-pointer select-none transition disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Delete last digit"
        >
          <Delete className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* 0 Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleDigit('0')}
          className="candy-btn h-14 rounded-2xl bg-gradient-to-b from-white to-slate-100 hover:from-white hover:to-indigo-50 border-2 border-indigo-200/80 text-indigo-900 font-game text-2xl font-bold flex items-center justify-center cursor-pointer select-none transition disabled:opacity-50"
          aria-label="Digit 0"
        >
          <span className="drop-shadow-xs">0</span>
        </button>

        {/* Submit / Check Button */}
        <button
          type="button"
          disabled={disabled || value.trim() === ''}
          onClick={handleSubmit}
          className="candy-btn h-14 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 border-2 border-emerald-300 text-white flex items-center justify-center cursor-pointer select-none transition disabled:opacity-40 disabled:cursor-not-allowed shadow-emerald-700/30"
          aria-label="Submit Answer"
        >
          <Check className="w-7 h-7 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
