import React, { useState, useEffect } from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { soundFX } from '../../utils/audio';
import QRCode from 'qrcode';
import { 
  Printer, QrCode, Wifi, RefreshCw, AlertTriangle, 
  Layers, CheckCircle2, Volume2, VolumeX, Sparkles, SlidersHorizontal 
} from 'lucide-react';

export const KioskView: React.FC = () => {
  const { 
    selectedKiosk, 
    activeJob, 
    soundEnabled, 
    setSoundEnabled, 
    refillKioskSupplies 
  } = usePrintSystem();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isTestPrinting, setIsTestPrinting] = useState<boolean>(false);
  const [show3dSculpture, setShow3dSculpture] = useState<boolean>(false); // Default to Original Scannable QR

  useEffect(() => {
    // Generate original high-contrast scannable QR matching the local network or browser origin
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://10.147.29.5:5173';
    const kioskUrl = `${origin}/?kiosk=${selectedKiosk.code}`;
    QRCode.toDataURL(kioskUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000', // Pure high-contrast black
        light: '#FFFFFF'  // Pure crisp white
      }
    }).then(setQrDataUrl).catch(() => {});
  }, [selectedKiosk.code]);

  const handleTestPrint = () => {
    soundFX.playScanBeep();
    setIsTestPrinting(true);
    setTimeout(() => {
      soundFX.playPrintFeed();
      setTimeout(() => {
        soundFX.playSuccessChime();
        setIsTestPrinting(false);
      }, 2000);
    }, 1000);
  };

  const isPrintingActive = (activeJob && (activeJob.status === 'spooling' || activeJob.status === 'printing')) || isTestPrinting;
  const isCompleted = activeJob && activeJob.status === 'completed';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Kiosk Terminal Bezel Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C1438] via-[#151D4D] to-[#0C1438] border border-purple-500/30 p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.6)]">
              <Printer className="w-6 h-6 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0C1438] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-wide">{selectedKiosk.name}</h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                {selectedKiosk.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>{selectedKiosk.location}</span>
              <span>·</span>
              <span className="font-mono text-slate-400">IP: {selectedKiosk.ipAddress}</span>
            </p>
          </div>
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-[#070B18] border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute Audio Chimes' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={() => refillKioskSupplies(selectedKiosk.id)}
            className="px-3 py-2 rounded-xl bg-[#070B18] hover:bg-slate-800 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refill Paper & Toner</span>
          </button>

          <button
            type="button"
            onClick={handleTestPrint}
            disabled={isPrintingActive}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-purple-900/40 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Test Print Page</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Glowing QR Terminal Pillar (Matching Slide 1 & 6) */}
        <div className="md:col-span-5 rounded-3xl bg-gradient-to-b from-[#10173D] to-[#070B1B] border-2 border-purple-500/40 p-6 flex flex-col items-center justify-between text-center shadow-[0_0_40px_rgba(139,92,246,0.15)] relative overflow-hidden">
          {/* Holographic background rays */}
          <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="space-y-1 z-10">
            <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
              TOUCHLESS QR ACCESS
            </span>
            <h3 className="text-base font-bold text-white">Scan to Start Print Session</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              No printer drivers, cables, or queues required. Scan with any smartphone.
            </p>
          </div>

          {/* View Mode Toggle: 3D Metallic Sculpture vs Live Scannable QR */}
          <div className="z-10 flex gap-1 p-1 bg-[#070B18] rounded-xl border border-purple-500/30 my-2 text-[11px]">
            <button
              type="button"
              onClick={() => setShow3dSculpture(true)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                show3dSculpture
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3D Metallic QR
            </button>
            <button
              type="button"
              onClick={() => setShow3dSculpture(false)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                !show3dSculpture
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Scannable Matrix
            </button>
          </div>

          {/* 3D-styled Metallic QR Display */}
          <div className="relative my-3 group z-10">
            {/* Holographic neon ring */}
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-purple-600 via-cyan-500 to-indigo-600 opacity-60 blur-lg group-hover:opacity-90 transition-opacity animate-pulse-glow" />

            <div className="relative rounded-2xl bg-[#070B18] border-2 border-purple-400/60 p-3 shadow-2xl flex flex-col items-center">
              {show3dSculpture ? (
                <div className="w-52 h-52 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-purple-500/40">
                  <img
                    src="/proper_qr.jpeg"
                    alt="SMART QR PRINT Metallic Sculpture"
                    className="w-full h-full object-cover filter drop-shadow-[0_0_15px_rgba(168,85,247,0.7)]"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/image1.jpeg';
                    }}
                  />
                </div>
              ) : qrDataUrl ? (
                <div className="w-52 h-52 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg border-2 border-cyan-400">
                  <img
                    src={qrDataUrl}
                    alt="Original Scannable QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-52 h-52 bg-slate-900 animate-pulse rounded-xl" />
              )}

              <div className="mt-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
                  TERMINAL #{selectedKiosk.code}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom NFC / Pairing indicator */}
          <div className="z-10 w-full pt-3 border-t border-purple-500/20 flex items-center justify-around text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Fast Sync
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Guided
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Encrypted
            </span>
          </div>
        </div>

        {/* Right Column: Physical Printer Hardware Simulation & Output Tray */}
        <div className="md:col-span-7 space-y-5">
          {/* Hardware Telemetry Gauges Card */}
          <div className="rounded-3xl bg-[#0F1738]/90 border border-purple-500/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Hardware Supplies & Telemetry
              </span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                System Ready
              </span>
            </div>

            {/* Gauges */}
            <div className="grid grid-cols-3 gap-3">
              {/* Paper Tray */}
              <div className="bg-[#070B18] p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Paper Level</span>
                  <span className="font-mono font-bold text-white">
                    {selectedKiosk.paperCount}/{selectedKiosk.maxPaper}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${(selectedKiosk.paperCount / selectedKiosk.maxPaper) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">A4 / Letter Trays</span>
              </div>

              {/* Black Toner */}
              <div className="bg-[#070B18] p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">B&W Toner</span>
                  <span className="font-mono font-bold text-slate-200">{Math.round(selectedKiosk.tonerBlack)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-300 transition-all duration-300"
                    style={{ width: `${selectedKiosk.tonerBlack}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">OEM Black Laser</span>
              </div>

              {/* Color Toner */}
              <div className="bg-[#070B18] p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Color Toner</span>
                  <span className="font-mono font-bold text-purple-300">{Math.round(selectedKiosk.tonerColor)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${selectedKiosk.tonerColor}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">Cyan/Mag/Yel</span>
              </div>
            </div>
          </div>

          {/* Physical Printer Ejection Slot Simulation */}
          <div className="rounded-3xl bg-gradient-to-b from-[#131B45] to-[#0A0F26] border-2 border-purple-500/40 p-5 shadow-2xl relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-purple-400" />
                Physical Paper Dispenser Slot
              </span>
              <span className="text-[11px] font-mono text-cyan-300">
                {isPrintingActive ? 'MECHANICAL MOTOR ACTIVE' : 'IDLE / READY'}
              </span>
            </div>

            {/* Simulated Paper Dispenser Mechanical Slot */}
            <div className="relative w-full h-44 rounded-2xl bg-[#060914] border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center shadow-inner">
              {/* Paper slit line */}
              <div className="w-3/4 h-2 bg-black rounded-full border border-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] relative z-20" />

              {/* Ejecting Sheet Animation */}
              {isPrintingActive ? (
                <div className="relative z-10 w-52 bg-white text-black p-3 rounded-b-lg shadow-2xl animate-feed-paper transition-all">
                  <div className="h-2 w-16 bg-purple-600 rounded mb-1.5" />
                  <div className="h-1.5 w-36 bg-slate-300 rounded mb-1" />
                  <div className="h-1.5 w-44 bg-slate-300 rounded mb-1" />
                  <div className="h-1.5 w-28 bg-slate-300 rounded mb-2" />
                  <div className="h-6 w-full bg-gradient-to-r from-purple-200 to-cyan-200 rounded flex items-center justify-center text-[8px] font-mono font-bold text-purple-900">
                    PRINTING: {activeJob?.document.name || 'Test_Diagnostic.pdf'}
                  </div>
                </div>
              ) : isCompleted ? (
                <div className="relative z-10 w-52 bg-white text-black p-3 rounded-lg shadow-2xl transform translate-y-3 border-t-2 border-emerald-400">
                  <div className="flex items-center justify-between mb-1 text-[9px] font-bold text-emerald-700">
                    <span>JOB COMPLETED</span>
                    <span>PIN: {activeJob?.claimPin}</span>
                  </div>
                  <div className="h-1.5 w-40 bg-slate-300 rounded mb-1" />
                  <div className="h-1.5 w-32 bg-slate-300 rounded mb-1" />
                  <div className="text-[8px] text-slate-500 font-mono mt-1">
                    Ready for pickup in dispenser tray
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 z-10">
                  <Printer className="w-8 h-8 text-slate-700 mx-auto mb-1 stroke-1" />
                  <span>No active print job printing. Awaiting mobile dispatch.</span>
                </div>
              )}
            </div>

            {/* Live Queue Status Strip */}
            <div className="mt-3 p-3 rounded-xl bg-[#070B18] border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-slate-300 font-medium">Active Spooler Queue:</span>
                <span className="text-slate-400">
                  {activeJob ? `1 Active (${activeJob.document.name})` : '0 Pending Jobs'}
                </span>
              </div>
              {activeJob && (
                <span className="font-mono text-cyan-300 font-bold">
                  PIN: {activeJob.claimPin}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
