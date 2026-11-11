import React, { useState } from 'react';
import { usePrintSystem, ViewMode } from '../context/PrintSystemContext';
import { SettingsModal } from './SettingsModal';
import { QrModal } from './SimplePrint/QrModal';
import { 
  Printer, FileText, QrCode, BarChart3, 
  Volume2, VolumeX, Key, Sparkles, LayoutDashboard 
} from 'lucide-react';

export const NavigationHeader: React.FC = () => {
  const { viewMode, setViewMode, soundEnabled, setSoundEnabled, selectedKiosk } = usePrintSystem();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#070B19]/95 border-b border-purple-500/20 backdrop-blur-xl px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Connected Kiosk */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold tracking-wide text-white">SMART PRINT</h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                Kiosk #{selectedKiosk.code} · Library Station
              </span>
            </div>
          </div>

          {/* Simple Navigation Menu */}
          <div className="flex items-center gap-1 bg-[#0B1028] p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('pitch')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'pitch'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'mobile' || viewMode === 'split'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('kiosk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kiosk'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kiosk Screen</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            <a
              href="/portal/"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-blue-300 hover:text-white hover:bg-blue-950/40 border border-blue-500/30 flex items-center gap-1.5 transition-all"
              title="Open Student Light & Blue Dashboard Portal"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Student Portal</span>
            </a>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white hover:bg-cyan-950/40 flex items-center gap-1 transition-all"
              title="Scan QR Code to open on Phone"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Scan QR</span>
            </button>
          </div>

          {/* Quick Sound & Key Tools */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-[#0B1028] border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-[#0B1028] border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="API Settings"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* QR Code Modal */}
      <QrModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
    </>
  );
};
