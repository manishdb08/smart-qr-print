import React, { useState } from 'react';
import { EasyPrintWorkflow } from './MobileWorkflow/EasyPrintWorkflow';
import { MobileAppContainer } from './MobileWorkflow/MobileAppContainer';
import { KioskView } from './KioskTerminal/KioskView';
import { ArrowRight, Sparkles, Smartphone, Printer, Zap } from 'lucide-react';

export const SplitView: React.FC = () => {
  const [useEasyMode, setUseEasyMode] = useState<boolean>(true);
  const [showMobileKiosk, setShowMobileKiosk] = useState<boolean>(false);

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-4">
      {/* Live Sync Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-cyan-950/60 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold text-white">SMART QR PRINT TWIN:</span>
          <span>
            {useEasyMode
              ? 'Fast 3-Step Touchless Mode: 1. Connect QR → 2. Upload & AI Prompt → 3. Pay & Print!'
              : 'Interactive Mobile Phone View synced in real-time with Kiosk Terminal.'}
          </span>
        </div>

        {/* View Mode Pill Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUseEasyMode(!useEasyMode)}
            className="px-3 py-1 rounded-xl bg-[#070B18] border border-cyan-500/40 text-cyan-300 font-bold text-[11px] flex items-center gap-1.5 hover:bg-cyan-950/40 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
            <span>{useEasyMode ? 'Switch to Phone Chassis' : 'Switch to Easy 3-Step'}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: User Action Panel - Phone shows Easy Print Flow first! */}
        <div className="lg:col-span-5 flex justify-center w-full">
          {useEasyMode ? (
            <div className="w-full">
              <EasyPrintWorkflow />
            </div>
          ) : (
            <MobileAppContainer />
          )}
        </div>

        {/* Right: Smart Kiosk Hardware Screen */}
        <div className="lg:col-span-7 space-y-3">
          {/* Mobile Collapsible Kiosk Button (keeps phone screen clean for Easy Print Flow) */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setShowMobileKiosk(!showMobileKiosk)}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#090D26] border border-cyan-500/30 text-xs font-bold text-cyan-300 flex items-center justify-between hover:bg-cyan-950/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>{showMobileKiosk ? 'Hide Kiosk Terminal View' : 'Show Kiosk Station Terminal (Hardware Screen)'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {showMobileKiosk ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>
          </div>

          <div className={showMobileKiosk ? 'block' : 'hidden lg:block'}>
            <KioskView />
          </div>
        </div>
      </div>
    </div>
  );
};
