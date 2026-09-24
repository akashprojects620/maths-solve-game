import React from 'react';
import { Smartphone, Download } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenModal: () => void;
  hapticEnabled?: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onOpenModal,
  hapticEnabled = true,
}) => {
  const { isInstalled, isInstallable } = usePWAInstall();

  // If already running inside installed standalone app, suppress banner
  if (isInstalled) {
    return null;
  }

  return (
    <div className="w-full max-w-md px-4 pt-2 pb-1">
      <button
        onClick={() => {
          soundManager.playClick();
          triggerHaptic('medium', hapticEnabled);
          onOpenModal();
        }}
        className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 p-[2px] shadow-lg group hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer text-left"
        title="Install Math Genius on your Android or Mobile Device"
      >
        <div className="relative rounded-2xl bg-slate-950/80 p-3 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg shadow-md group-hover:scale-110 transition-transform">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-game font-extrabold text-sm text-white tracking-wide">
                  INSTALL ON MOBILE / APK
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-game font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  FREE
                </span>
              </div>
              <span className="text-[11px] text-emerald-100/70">
                1-tap WebAPK or download standalone .apk • Fullscreen & Offline
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white/10 group-hover:bg-white/20 px-3 py-1.5 rounded-xl text-xs font-game font-bold text-white border border-white/15 transition shrink-0">
            <Download className="w-3.5 h-3.5 text-emerald-300" />
            <span>Install</span>
          </div>
        </div>
      </button>
    </div>
  );
};
