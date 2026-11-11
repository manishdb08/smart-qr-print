import React, { useState } from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { soundFX } from '../../utils/audio';
import { QrCode, ScanLine, MapPin, Printer, Check, Wifi, Sparkles, AlertCircle } from 'lucide-react';

export const QrScanStep: React.FC = () => {
  const { kiosks, selectedKiosk, setSelectedKioskId, nextStep } = usePrintSystem();
  const [isSimulatingCamera, setIsSimulatingCamera] = useState<boolean>(false);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);

  const handleSimulateScan = () => {
    setIsSimulatingCamera(true);
    setTimeout(() => {
      soundFX.playScanBeep();
      setScanSuccess(true);
      setTimeout(() => {
        setIsSimulatingCamera(false);
        setScanSuccess(false);
        nextStep();
      }, 900);
    }, 1500);
  };

  const handleSelectKiosk = (id: string) => {
    setSelectedKioskId(id);
    soundFX.playScanBeep();
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Step Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium mb-1">
            <QrCode className="w-3.5 h-3.5 text-purple-400" />
            <span>Step 1: QR Access</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Scan Printer QR Code</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Point your camera at the glowing QR terminal on the kiosk to instantly pair.
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-300">
          <ScanLine className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
      </div>

      {/* Holographic Scanner Card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#111A3E] to-[#0A0F26] border border-cyan-500/30 p-5 overflow-hidden shadow-2xl">
        {/* Animated Laser scanning line */}
        {isSimulatingCamera && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-laser-scan" />
            <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px]" />
          </div>
        )}

        <div className="flex flex-col items-center justify-center text-center py-4">
          <div className="relative w-36 h-36 rounded-2xl bg-[#070B18] border-2 border-dashed border-cyan-400/50 flex items-center justify-center p-3 shadow-inner group">
            {/* Corner crosshairs */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

            {scanSuccess ? (
              <div className="flex flex-col items-center text-emerald-400 animate-scale-up">
                <Check className="w-12 h-12 stroke-[3]" />
                <span className="text-xs font-bold mt-1">PAIRED!</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <QrCode className="w-20 h-20 text-purple-400/80 group-hover:text-cyan-400 transition-colors" />
                <span className="text-[10px] text-slate-400 mt-1 font-mono tracking-wider">
                  {selectedKiosk.code}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={isSimulatingCamera}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <ScanLine className="w-4 h-4 text-cyan-200" />
            {isSimulatingCamera ? 'Reading QR Payload...' : 'Simulate Camera QR Scan'}
          </button>
        </div>
      </div>

      {/* Currently Connected Kiosk Card */}
      <div className="rounded-xl bg-[#0F1738]/80 border border-purple-500/20 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            Active Target Kiosk
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Wifi className="w-2.5 h-2.5 animate-pulse" /> Online
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">{selectedKiosk.name}</h4>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-purple-400" />
              {selectedKiosk.location}
            </p>
          </div>
          <span className="font-mono text-xs px-2 py-1 rounded bg-[#070B18] text-cyan-400 border border-cyan-500/20">
            {selectedKiosk.code}
          </span>
        </div>

        {/* Telemetry quick indicators */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-[11px]">
          <div className="bg-[#070B18]/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Paper Tray</span>
            <span className="font-semibold text-slate-200">
              {selectedKiosk.paperCount}/{selectedKiosk.maxPaper} sheets
            </span>
          </div>
          <div className="bg-[#070B18]/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">B&W Toner</span>
            <span className="font-semibold text-cyan-300">{selectedKiosk.tonerBlack}%</span>
          </div>
          <div className="bg-[#070B18]/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Color Toner</span>
            <span className="font-semibold text-purple-300">{selectedKiosk.tonerColor}%</span>
          </div>
        </div>
      </div>

      {/* Select another nearby kiosk */}
      <div>
        <label className="text-xs font-medium text-slate-300 block mb-1.5">
          Or Select Any Nearby Kiosk in Campus Network:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {kiosks.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => handleSelectKiosk(k.id)}
              className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                selectedKiosk.id === k.id
                  ? 'bg-purple-950/40 border-cyan-400/80 ring-1 ring-cyan-400/50'
                  : 'bg-[#0B1028] border-slate-800 hover:border-purple-500/40'
              }`}
            >
              <div className="truncate pr-2">
                <span className="text-xs font-semibold text-slate-200 block truncate">{k.name}</span>
                <span className="text-[10px] text-slate-400 block truncate">{k.location}</span>
              </div>
              {selectedKiosk.id === k.id ? (
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">{k.code}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Next Step Action */}
      <button
        type="button"
        onClick={() => {
          soundFX.playScanBeep();
          nextStep();
        }}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all"
      >
        <span>Proceed to Step 2: Upload Document</span>
        <Sparkles className="w-4 h-4 text-cyan-200" />
      </button>
    </div>
  );
};
