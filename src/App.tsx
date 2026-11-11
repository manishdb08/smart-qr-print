import React, { useState, useEffect } from 'react';
import { SmartPrintPortal } from './components/Portal/SmartPrintPortal';
import { AdminDesktop } from './components/AdminDashboard/AdminDesktop';
import { KioskView } from './components/KioskTerminal/KioskView';
import { PitchShowcaseView } from './components/PitchShowcase/PitchShowcaseView';
import { Layers, Monitor, ShieldCheck, Sparkles, User, X } from 'lucide-react';

export const App: React.FC = () => {
  // Desktop Modes: 'user' (Customer/Student Desktop) vs 'admin' (Store Owner/Fleet Desktop)
  const [desktopMode, setDesktopMode] = useState<'user' | 'admin' | 'kiosk' | 'pitch'>(() => {
    if (typeof window !== 'undefined' && window.location.hash.toLowerCase() === '#admin') return 'admin';
    if (typeof window !== 'undefined' && window.location.hash.toLowerCase() === '#kiosk') return 'kiosk';
    return 'user';
  });

  const [showSwitcher, setShowSwitcher] = useState(false);

  // Sync hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin') setDesktopMode('admin');
      else if (hash === '#kiosk') setDesktopMode('kiosk');
      else if (hash === '#user' || hash === '') setDesktopMode('user');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const switchMode = (mode: 'user' | 'admin' | 'kiosk' | 'pitch') => {
    setDesktopMode(mode);
    if (mode === 'admin') window.location.hash = '#admin';
    else if (mode === 'kiosk') window.location.hash = '#kiosk';
    else if (mode === 'user') window.location.hash = '#user';
  };

  return (
    <div className="relative min-h-screen bg-[#f4f7fb]">
      {/* 1. USER DESKTOP (Default Customer Portal) */}
      {desktopMode === 'user' && (
        <SmartPrintPortal onSwitchToAdmin={() => switchMode('admin')} />
      )}

      {/* 2. ADMIN DESKTOP (Store Owner / Fleet Control Console) */}
      {desktopMode === 'admin' && (
        <AdminDesktop onSwitchToUser={() => switchMode('user')} />
      )}

      {/* 3. Hardware Kiosk Terminal Mode */}
      {desktopMode === 'kiosk' && (
        <div className="min-h-screen bg-[#070B19] p-4 text-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/30 mb-6">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Monitor className="text-cyan-400" /> Kiosk Physical Touch Terminal
              </h1>
              <button
                onClick={() => switchMode('user')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
              >
                Back to User Desktop
              </button>
            </div>
            <KioskView />
          </div>
        </div>
      )}

      {/* 4. Pitch & Architecture Showcase */}
      {desktopMode === 'pitch' && (
        <div className="min-h-screen bg-[#070B19] p-4 text-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/30 mb-6">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-amber-400" /> System Architecture
              </h1>
              <button
                onClick={() => switchMode('user')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
              >
                Back to User Desktop
              </button>
            </div>
            <PitchShowcaseView />
          </div>
        </div>
      )}

      {/* Quick Mode Toggle Pill */}
      <div className="fixed bottom-4 right-4 z-50 print:hidden">
        {showSwitcher ? (
          <div className="bg-[#142440] text-white p-3 rounded-xl shadow-2xl border border-blue-500/30 flex flex-col gap-2 min-w-[210px] animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 text-xs font-bold text-slate-300">
              <span>SELECT DESKTOP</span>
              <button onClick={() => setShowSwitcher(false)} className="text-slate-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <button
              onClick={() => { switchMode('user'); setShowSwitcher(false); }}
              className={`flex items-center gap-2 text-left px-2.5 py-2 rounded-lg text-xs font-bold transition ${desktopMode === 'user' ? 'bg-[#2585ed] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <User size={14} />
              <span>User Desktop (Customer)</span>
            </button>
            <button
              onClick={() => { switchMode('admin'); setShowSwitcher(false); }}
              className={`flex items-center gap-2 text-left px-2.5 py-2 rounded-lg text-xs font-bold transition ${desktopMode === 'admin' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <ShieldCheck size={14} />
              <span>Admin Desktop (Store Owner)</span>
            </button>
            <button
              onClick={() => { switchMode('kiosk'); setShowSwitcher(false); }}
              className={`flex items-center gap-2 text-left px-2.5 py-2 rounded-lg text-xs font-medium transition ${desktopMode === 'kiosk' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <Monitor size={14} />
              <span>Kiosk Terminal Mode</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSwitcher(true)}
            className="flex items-center gap-2 bg-[#142440] hover:bg-[#1e345b] text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-xl border border-blue-500/40 transition hover:scale-105"
            title="Switch Desktop (User vs Admin)"
          >
            {desktopMode === 'user' ? (
              <>
                <User size={14} className="text-blue-400" />
                <span>User Desktop</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/60 text-white ml-0.5">Active</span>
              </>
            ) : desktopMode === 'admin' ? (
              <>
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Admin Desktop</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/60 text-white ml-0.5">Active</span>
              </>
            ) : (
              <>
                <Layers size={14} />
                <span>Switch Desktop</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
