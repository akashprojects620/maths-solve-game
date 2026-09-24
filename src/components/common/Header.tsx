import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Settings, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { GameSettings } from '../../types';
import { MathGeniusLogo } from './MathGeniusLogo';

interface HeaderProps {
  title?: string;
  coins: number;
  totalStars: number;
  onBack?: () => void;
  onOpenSettings: () => void;
  onOpenDevDashboard?: () => void;
  settings: GameSettings;
  onToggleSound: () => void;
  onToggleFrameMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  coins,
  totalStars,
  onBack,
  onOpenSettings,
  onOpenDevDashboard,
  settings,
  onToggleSound,
  onToggleFrameMode,
}) => {
  const prevCoins = useRef(coins);
  const prevStars = useRef(totalStars);
  const [coinsPunch, setCoinsPunch] = useState(false);
  const [starsPunch, setStarsPunch] = useState(false);

  // Hidden secret dev gesture: tap logo or title 5 times within 3 seconds
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  const handleSecretDevTap = () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current > 2000) {
      tapCountRef.current = 1;
    } else {
      tapCountRef.current += 1;
    }
    lastTapTimeRef.current = now;

    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      soundManager.playLevelComplete();
      triggerHaptic('success', settings.hapticEnabled);
      if (onOpenDevDashboard) {
        onOpenDevDashboard();
      }
    } else {
      triggerHaptic('light', settings.hapticEnabled);
    }
  };

  useEffect(() => {
    if (coins > prevCoins.current) {
      setCoinsPunch(true);
      const timer = setTimeout(() => setCoinsPunch(false), 800);
      return () => clearTimeout(timer);
    }
    prevCoins.current = coins;
  }, [coins]);

  useEffect(() => {
    if (totalStars > prevStars.current) {
      setStarsPunch(true);
      const timer = setTimeout(() => setStarsPunch(false), 800);
      return () => clearTimeout(timer);
    }
    prevStars.current = totalStars;
  }, [totalStars]);

  const handleBack = () => {
    soundManager.playClick();
    triggerHaptic('light', settings.hapticEnabled);
    if (onBack) onBack();
  };

  const handleSettings = () => {
    soundManager.playClick();
    triggerHaptic('light', settings.hapticEnabled);
    onOpenSettings();
  };

  const handleSound = () => {
    soundManager.playClick();
    triggerHaptic('light', settings.hapticEnabled);
    onToggleSound();
  };

  const handleFrame = () => {
    soundManager.playClick();
    triggerHaptic('light', settings.hapticEnabled);
    onToggleFrameMode();
  };

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg px-4 py-2.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Left: Back button or Game Title */}
        <div className="flex items-center gap-2">
          {onBack ? (
            <button
              onClick={handleBack}
              className="p-2 bg-white/20 hover:bg-white/30 active:scale-95 rounded-full transition cursor-pointer shadow-sm flex items-center justify-center"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          ) : (
            <div
              onClick={handleSecretDevTap}
              className="cursor-pointer select-none active:scale-95 transition-transform"
              title="Math Genius (Tap 5x for Developer Dashboard)"
            >
              <MathGeniusLogo size="sm" animated={settings.animationsEnabled !== false} />
            </div>
          )}

          {title && (
            <span
              onClick={handleSecretDevTap}
              className="font-game font-semibold text-lg text-white/95 truncate max-w-[140px] cursor-pointer select-none"
              title="Tap 5x for Developer Dashboard"
            >
              {title}
            </span>
          )}
        </div>

        {/* Right: Counters & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Stars Pill */}
          <motion.div
            animate={starsPunch ? { scale: [1, 1.35, 0.95, 1.15, 1], rotate: [0, -8, 8, 0] } : {}}
            transition={{ duration: 0.55 }}
            className={`flex items-center gap-1 border rounded-full px-2.5 py-1 shadow-inner backdrop-blur-xs transition-colors ${
              starsPunch
                ? 'bg-amber-400 text-amber-950 border-amber-200 ring-2 ring-amber-300'
                : 'bg-amber-500/30 border-amber-300/40 text-amber-100'
            }`}
          >
            <motion.span
              animate={starsPunch ? { rotate: [0, 360] } : {}}
              transition={{ duration: 0.5 }}
              className="text-amber-300 text-sm"
            >
              ⭐
            </motion.span>
            <span className="font-game font-bold text-xs">{totalStars}</span>
          </motion.div>

          {/* Coins Pill */}
          <motion.div
            animate={coinsPunch ? { scale: [1, 1.35, 0.95, 1.15, 1], rotate: [0, 8, -8, 0] } : {}}
            transition={{ duration: 0.55 }}
            className={`flex items-center gap-1.5 border rounded-full px-2.5 py-1 shadow-inner backdrop-blur-xs transition-colors ${
              coinsPunch
                ? 'bg-yellow-300 text-yellow-950 border-white ring-2 ring-yellow-300'
                : 'bg-yellow-400/30 border-yellow-300/50 text-yellow-100'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-200 flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-bold text-yellow-900 leading-none">¢</span>
            </div>
            <span className="font-game font-bold text-xs">{coins}</span>
          </motion.div>

          {/* Desktop Frame Toggle */}
          <button
            onClick={handleFrame}
            className="hidden sm:flex p-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-full transition cursor-pointer"
            title={settings.phoneFrameMode ? 'Switch to Full Width' : 'Switch to Phone View'}
            aria-label="Toggle Phone Frame"
          >
            {settings.phoneFrameMode ? (
              <Monitor className="w-4 h-4 text-purple-100" />
            ) : (
              <Smartphone className="w-4 h-4 text-purple-100" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleSound}
            className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-full transition cursor-pointer"
            title={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            aria-label="Toggle Sound"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-purple-100" />
            ) : (
              <VolumeX className="w-4 h-4 text-red-200" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={handleSettings}
            className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-full transition cursor-pointer"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-purple-100" />
          </button>
        </div>
      </div>
    </header>
  );
};
