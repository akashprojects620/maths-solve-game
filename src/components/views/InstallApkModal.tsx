import React, { useEffect, useState } from 'react';
import { X, Smartphone, Download, QrCode, Copy, Check, ExternalLink, Sparkles, ShieldCheck, WifiOff, Terminal, ArrowRight } from 'lucide-react';
import QRCode from 'qrcode';
import { soundManager } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallApkModalProps {
  onClose: () => void;
  hapticEnabled?: boolean;
}

export const InstallApkModal: React.FC<InstallApkModalProps> = ({ onClose, hapticEnabled = true }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'ANDROID' | 'APK_BUILDER' | 'IOS'>('ANDROID');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  // Determine current live URL
  const appUrl = typeof window !== 'undefined' 
    ? (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
        ? 'https://ais-pre-6qft3hxyprszfzbgfye6cf-509329297464.asia-southeast1.run.app'
        : window.location.origin)
    : 'https://ais-pre-6qft3hxyprszfzbgfye6cf-509329297464.asia-southeast1.run.app';

  const pwaBuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(appUrl)}`;

  useEffect(() => {
    QRCode.toDataURL(appUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating QR code:', err));
  }, [appUrl]);

  const handleCopyLink = async () => {
    soundManager.playClick();
    triggerHaptic('light', hapticEnabled);
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDirectInstall = async () => {
    soundManager.playClick();
    triggerHaptic('medium', hapticEnabled);
    setInstallStatus('Prompting...');
    const result = await install();
    if (result === 'accepted') {
      soundManager.playLevelComplete();
      triggerHaptic('success', hapticEnabled);
      setInstallStatus('Installed successfully!');
    } else if (result === 'dismissed') {
      setInstallStatus('Installation was cancelled.');
    } else {
      setInstallStatus('Use Chrome menu ⋮ > "Install app"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-violet-900/60 via-indigo-900/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-game font-extrabold text-white flex items-center gap-2">
                Install on Mobile / APK
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Android Ready
                </span>
              </h2>
              <p className="text-xs text-indigo-200">Play full-screen offline with home screen icon</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition text-white/80 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 bg-slate-950/40 px-3 pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('ANDROID');
            }}
            className={`flex-1 py-2.5 px-3 text-xs font-game font-bold rounded-t-xl transition cursor-pointer flex items-center justify-center gap-1.5 border-t border-x ${
              activeTab === 'ANDROID'
                ? 'bg-slate-900 border-indigo-500/40 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (WebAPK)</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('APK_BUILDER');
            }}
            className={`flex-1 py-2.5 px-3 text-xs font-game font-bold rounded-t-xl transition cursor-pointer flex items-center justify-center gap-1.5 border-t border-x ${
              activeTab === 'APK_BUILDER'
                ? 'bg-slate-900 border-indigo-500/40 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download .APK</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('IOS');
            }}
            className={`flex-1 py-2.5 px-3 text-xs font-game font-bold rounded-t-xl transition cursor-pointer flex items-center justify-center gap-1.5 border-t border-x ${
              activeTab === 'IOS'
                ? 'bg-slate-900 border-indigo-500/40 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>iPhone / iPad</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-300 text-xs">
          {/* TAB 1: ANDROID WEBAPK (INSTANT 1-TAP INSTALL) */}
          {activeTab === 'ANDROID' && (
            <div className="space-y-4">
              {/* Highlight Perks Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2 font-game font-bold text-emerald-300 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Native Android Integration (WebAPK)</span>
                </div>
                <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                  When installed on Android via Chrome, Android automatically packages and registers this app as an official system <strong className="text-white">WebAPK</strong>. It has its own dedicated app icon in your app drawer, runs in borderless full-screen, and works 100% offline!
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Full Offline Play
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> No Address Bar
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    ⚡ Fast Launch
                  </span>
                </div>
              </div>

              {/* Instant Browser Install Button (if browser triggered beforeinstallprompt) */}
              {isInstallable && !isInstalled && (
                <div className="p-3 bg-indigo-950/40 rounded-2xl border border-indigo-500/40 text-center">
                  <button
                    onClick={handleDirectInstall}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-game font-extrabold text-white text-sm shadow-lg shadow-emerald-500/30 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App on Device Now (1-Tap)</span>
                  </button>
                  {installStatus && (
                    <p className="text-[11px] text-amber-300 font-semibold mt-2">{installStatus}</p>
                  )}
                </div>
              )}

              {isInstalled && (
                <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-500/50 flex items-center gap-2.5 text-emerald-200">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-game font-bold text-xs block text-white">App is Installed!</span>
                    <span className="text-[10px]">You are currently enjoying the installed standalone version.</span>
                  </div>
                </div>
              )}

              {/* Scan or Open on Mobile Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-slate-950/60 p-3.5 rounded-2xl border border-white/10">
                <div className="flex flex-col items-center justify-center text-center">
                  {qrDataUrl ? (
                    <div className="p-2 bg-white rounded-xl shadow-md">
                      <img src={qrDataUrl} alt="Scan QR Code to open on mobile" className="w-32 h-32" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-slate-800 rounded-xl flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-slate-500" />
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">
                    Scan with your mobile camera
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="font-game font-bold text-xs text-white block">
                    Or open this link on your phone:
                  </span>
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-700 break-all text-[11px] text-indigo-300 font-mono select-all">
                    {appUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition font-game font-bold text-xs text-white flex items-center justify-center gap-1.5 cursor-pointer border border-white/15"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Mobile Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step-by-Step Android Chrome Instructions */}
              <div className="space-y-2">
                <h4 className="font-game font-bold text-xs text-indigo-300 uppercase tracking-wider">
                  How to Install via Chrome on Android:
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-game flex items-center justify-center text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-game font-semibold text-white text-xs">Open in Google Chrome</p>
                      <p className="text-[11px] text-slate-400">
                        Open the copied link above in your phone's Chrome browser.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-game flex items-center justify-center text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-game font-semibold text-white text-xs">Tap the Chrome Menu (⋮)</p>
                      <p className="text-[11px] text-slate-400">
                        Tap the three dots icon in the top-right corner of Chrome.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-game flex items-center justify-center text-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="font-game font-semibold text-white text-xs">
                        Tap "Install App" or "Add to Home screen"
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Confirm the prompt. Android immediately builds and adds the native app icon to your phone screen!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDALONE .APK BUILDER (PWABUILDER & BUBBLEWRAP) */}
          {activeTab === 'APK_BUILDER' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-1.5 font-game font-bold text-amber-300 text-sm">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Build Standalone .APK File</span>
                </div>
                <p className="text-[11px] text-amber-100/90 leading-relaxed">
                  Need a standalone <strong className="text-white">.apk file</strong> to sideload, install via file manager, or upload to Google Play? You can export this app directly into an APK using free official packaging tools.
                </p>
              </div>

              {/* PWABuilder 1-Click Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                      PWA
                    </div>
                    <div>
                      <span className="font-game font-bold text-xs text-white block">
                        Method 1: PWABuilder (Recommended)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Microsoft's free online PWA to APK generator
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    No Code
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  PWABuilder reads our configured web manifest and packages a complete, signed Android APK with splash screens, icons, and package configuration in under 30 seconds.
                </p>

                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    soundManager.playClick();
                    triggerHaptic('medium', hapticEnabled);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-game font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 active:scale-98 transition"
                >
                  <span>Open PWABuilder for this App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="text-[10px] text-slate-400 space-y-1 pl-1">
                  <div>1. Click the button above (your app URL is automatically prefilled).</div>
                  <div>2. Click <strong>"Package for Android"</strong>.</div>
                  <div>3. Download your signed <strong>.apk</strong> or <strong>.aab</strong> package!</div>
                </div>
              </div>

              {/* Bubblewrap CLI Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-game font-bold text-xs text-white">
                    Method 2: Google Bubblewrap CLI (Command Line)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  For developers who have Node.js and the Android SDK installed:
                </p>
                <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-300 overflow-x-auto space-y-1">
                  <code>{`# 1. Initialize Android project from manifest\nnpx @bubblewrap/cli init --manifest=${appUrl}/manifest.webmanifest\n\n# 2. Build the signed APK\nnpx @bubblewrap/cli build\n# Output: app-release-signed.apk`}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: IPHONE / IPAD (IOS SAFARI) */}
          {activeTab === 'IOS' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1.5 font-game font-bold text-blue-300 text-sm">
                  <span>Apple iOS Safari Installation</span>
                </div>
                <p className="text-[11px] text-blue-100/90 leading-relaxed">
                  On iPhone and iPad, Apple does not allow direct APK files, but supports full-screen Progressive Web App installation via Safari:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold font-game flex items-center justify-center text-xs shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-game font-semibold text-white text-xs">Open in Safari</p>
                    <p className="text-[11px] text-slate-400">
                      Open this game's URL in the Safari browser on your iPhone or iPad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold font-game flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-game font-semibold text-white text-xs">Tap the Share Button</p>
                    <p className="text-[11px] text-slate-400">
                      Tap the <strong>Share</strong> icon (the square with an arrow pointing up) in Safari's bottom toolbar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold font-game flex items-center justify-center text-xs shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-game font-semibold text-white text-xs">Tap "Add to Home Screen"</p>
                    <p className="text-[11px] text-slate-400">
                      Scroll down and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white font-game font-semibold cursor-pointer transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Share URL'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="py-2 px-5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-game font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
