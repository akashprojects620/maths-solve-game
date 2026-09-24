import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, Vibrate, RotateCcw, Info, Shield, FileText, Smartphone, Palette, Sparkles, Activity } from 'lucide-react';
import { GameSettings, BackgroundTheme } from '../../types';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
  onOpenHowToPlay: () => void;
  onOpenDevDashboard?: () => void;
  onOpenInstallModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
  onOpenHowToPlay,
  onOpenDevDashboard,
  onOpenInstallModal,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<'ABOUT' | 'PRIVACY' | 'TERMS' | null>(null);

  const toggleSound = () => {
    const updated = !settings.soundEnabled;
    soundManager.setSoundEnabled(updated);
    if (updated) soundManager.playClick();
    onUpdateSettings({ ...settings, soundEnabled: updated });
  };

  const toggleMusic = () => {
    const updated = !settings.musicEnabled;
    soundManager.setMusicEnabled(updated);
    onUpdateSettings({ ...settings, musicEnabled: updated });
  };

  const toggleHaptic = () => {
    const updated = !settings.hapticEnabled;
    triggerHaptic('medium', updated);
    onUpdateSettings({ ...settings, hapticEnabled: updated });
  };

  const togglePhoneFrame = () => {
    soundManager.playClick();
    onUpdateSettings({ ...settings, phoneFrameMode: !settings.phoneFrameMode });
  };

  const toggleAnimations = () => {
    const updated = settings.animationsEnabled === false;
    soundManager.playClick();
    triggerHaptic('light', settings.hapticEnabled);
    onUpdateSettings({ ...settings, animationsEnabled: updated });
  };

  const selectTheme = (theme: BackgroundTheme) => {
    soundManager.playClick();
    triggerHaptic('light', settings.hapticEnabled);
    onUpdateSettings({ ...settings, backgroundTheme: theme });
  };

  const handleConfirmReset = () => {
    soundManager.playClick();
    triggerHaptic('heavy', settings.hapticEnabled);
    onResetProgress();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 border-2 border-indigo-400/50 rounded-3xl p-5 shadow-2xl text-white relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition cursor-pointer"
          aria-label="Close settings"
        >
          <X className="w-5 h-5 text-white/80" />
        </button>

        {/* Title */}
        <h2 className="font-game text-2xl font-bold text-white mb-4">Settings</h2>

        {/* Main Toggles */}
        <div className="flex flex-col gap-2.5 mb-5">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/40 flex items-center justify-center">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-purple-200" /> : <VolumeX className="w-4 h-4 text-white/40" />}
              </div>
              <span className="font-game text-sm font-semibold">Sound Effects</span>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/40 flex items-center justify-center">
                <Music className="w-4 h-4 text-pink-200" />
              </div>
              <span className="font-game text-sm font-semibold">Ambient Music</span>
            </div>
            <button
              onClick={toggleMusic}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.musicEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  settings.musicEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Haptic Feedback Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/40 flex items-center justify-center">
                <Vibrate className="w-4 h-4 text-indigo-200" />
              </div>
              <span className="font-game text-sm font-semibold">Haptic Vibration</span>
            </div>
            <button
              onClick={toggleHaptic}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.hapticEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  settings.hapticEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Animations Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <span className="font-game text-sm font-semibold block leading-tight">Visual Animations</span>
                <span className="text-[10px] text-white/50">Floating runes & glowing particles</span>
              </div>
            </div>
            <button
              onClick={toggleAnimations}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.animationsEnabled !== false ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  settings.animationsEnabled !== false ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Background Theme Selector */}
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-pink-500/40 flex items-center justify-center">
                <Palette className="w-3.5 h-3.5 text-pink-200" />
              </div>
              <span className="font-game text-sm font-semibold">Background Ambiance</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'NEBULA', label: 'Indigo Nebula', colors: 'from-indigo-900 to-purple-900' },
                  { id: 'CANDY_ROYAL', label: 'Candy Royal', colors: 'from-violet-900 to-pink-900' },
                  { id: 'CYBER_EMERALD', label: 'Cyber Emerald', colors: 'from-teal-900 to-emerald-900' },
                  { id: 'GOLDEN_DUSK', label: 'Golden Dusk', colors: 'from-amber-900 to-slate-900' },
                ] as const
              ).map((t) => {
                const isSelected = (settings.backgroundTheme || 'NEBULA') === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTheme(t.id)}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition flex items-center gap-2 ${
                      isSelected
                        ? 'border-amber-400 bg-white/20 shadow-md ring-2 ring-amber-400/50'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${t.colors} shrink-0 border border-white/30`} />
                    <span className="text-[11px] font-game font-bold truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone Frame Mode (Desktop simulation) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/40 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <span className="font-game text-sm font-semibold block leading-tight">Phone Frame Mode</span>
                <span className="text-[10px] text-white/50">Simulates Android device shell</span>
              </div>
            </div>
            <button
              onClick={togglePhoneFrame}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.phoneFrameMode ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  settings.phoneFrameMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Install Mobile App / APK Button */}
        {onOpenInstallModal && (
          <button
            onClick={() => {
              onClose();
              onOpenInstallModal();
            }}
            className="w-full candy-btn mb-2.5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-teal-500 border border-emerald-300 text-white font-game text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Smartphone className="w-4 h-4 text-emerald-200" />
            <span>Install on Mobile / Download APK</span>
          </button>
        )}

        {/* How to Play Guide Button */}
        <button
          onClick={() => {
            onClose();
            onOpenHowToPlay();
          }}
          className="w-full candy-btn mb-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border border-indigo-300 text-white font-game text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Info className="w-4 h-4" />
          <span>How to Play & Puzzle Guide</span>
        </button>

        {/* Legal & Info Links */}
        <div className="flex items-center justify-around py-2 border-t border-b border-white/10 mb-4 text-xs text-indigo-300">
          <button
            onClick={() => setActiveInfoTab('ABOUT')}
            className="hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
          <button
            onClick={() => setActiveInfoTab('PRIVACY')}
            className="hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy</span>
          </button>
          <button
            onClick={() => setActiveInfoTab('TERMS')}
            className="hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms</span>
          </button>
          {onOpenDevDashboard && (
            <button
              onClick={() => {
                onClose();
                onOpenDevDashboard();
              }}
              className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer font-bold"
              title="Open Developer Progression & Telemetry Dashboard"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dev Stats</span>
            </button>
          )}
        </div>

        {/* Dynamic Info Panel */}
        {activeInfoTab && (
          <div className="mb-4 p-3 bg-white/10 rounded-2xl border border-white/15 text-xs text-white/90 leading-relaxed animate-in fade-in">
            {activeInfoTab === 'ABOUT' && (
              <div>
                <h4 className="font-game font-bold text-amber-300 mb-1">About Math Genius</h4>
                <p>
                  Math Genius is an original casual mathematical brain puzzle game crafted with 50 progressive
                  playable levels, daily 10-step challenges, and crossword-style math puzzles. Designed for all ages
                  to build pattern recognition, algebraic reasoning, and problem-solving skills!
                </p>
              </div>
            )}
            {activeInfoTab === 'PRIVACY' && (
              <div>
                <h4 className="font-game font-bold text-amber-300 mb-1">Privacy Policy</h4>
                <p>
                  We respect your privacy. All game progress, stars, settings, and coins are stored 100% locally on
                  your device via secure browser storage. No personal data or cookies are transmitted to third-party
                  servers.
                </p>
              </div>
            )}
            {activeInfoTab === 'TERMS' && (
              <div>
                <h4 className="font-game font-bold text-amber-300 mb-1">Terms of Service</h4>
                <p>
                  Math Genius is provided for brain training and entertainment. All puzzles are mathematically
                  verified and free to play.
                </p>
              </div>
            )}
            <button
              onClick={() => setActiveInfoTab(null)}
              className="mt-2 text-[10px] text-amber-300 underline font-semibold cursor-pointer"
            >
              Close info
            </button>
          </div>
        )}

        {/* Reset Progress Section */}
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Game Progress</span>
          </button>
        ) : (
          <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-2xl text-center animate-in fade-in">
            <p className="text-xs font-semibold text-rose-200 mb-2">
              Are you sure? This resets all stars, coins, and levels back to Level 1.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleConfirmReset}
                className="candy-btn px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold border border-rose-300 cursor-pointer"
              >
                Yes, Reset All
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
