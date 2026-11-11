import React, { useEffect } from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { 
  Printer, Send, CheckCircle2, Clock, Sparkles, 
  RotateCcw, ShieldCheck, Download, AlertCircle, FileText 
} from 'lucide-react';

export const JobDispatchAndStatusStep: React.FC = () => {
  const { 
    activeJob, 
    selectedKiosk, 
    dispatchJobToPrinter, 
    resetWorkflow 
  } = usePrintSystem();

  // If active job is in 'paid' state, dispatch automatically
  useEffect(() => {
    if (activeJob && activeJob.status === 'paid') {
      dispatchJobToPrinter();
    }
  }, [activeJob, dispatchJobToPrinter]);

  if (!activeJob) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p>No active print job found.</p>
        <button
          type="button"
          onClick={resetWorkflow}
          className="mt-3 px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold"
        >
          Start from QR Scan
        </button>
      </div>
    );
  }

  const isCompleted = activeJob.status === 'completed';
  const isPrinting = activeJob.status === 'printing';
  const isSpooling = activeJob.status === 'spooling';

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-1">
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
          <span>Step 4: Live Print & Claim PIN</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {isCompleted ? 'Print Job Finished!' : 'Printing in Progress...'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Kiosk #{selectedKiosk.code} is processing your document through the physical print spooler.
        </p>
      </div>

      {/* Futuristic Holographic Status Card */}
      <div className="rounded-2xl bg-gradient-to-b from-[#111A3E] to-[#0A0F26] border border-cyan-500/40 p-5 space-y-4 shadow-2xl relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Claim PIN Display */}
        <div className="text-center py-2 bg-[#070B18]/80 rounded-xl border border-purple-500/30">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
            Self-Service Claim PIN
          </span>
          <span className="text-3xl font-black font-mono tracking-widest text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            {activeJob.claimPin}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Display this on Kiosk #{selectedKiosk.code} if picking up later
          </span>
        </div>

        {/* Progress HUD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Printer className="w-4 h-4 text-cyan-400 animate-pulse" />
              )}
              {isSpooling && 'Spooling PDF Document...'}
              {isPrinting && `Printing Page ${activeJob.currentPage} of ${activeJob.totalPages}`}
              {isCompleted && 'All Sheets Successfully Printed & Ejected!'}
            </span>
            <span className="font-mono text-cyan-300 font-bold">{activeJob.progress}%</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3 rounded-full bg-[#070B18] border border-slate-800 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                  : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 animate-pulse'
              }`}
              style={{ width: `${activeJob.progress}%` }}
            />
          </div>
        </div>

        {/* Detailed Job Telemetry */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
          <div className="bg-[#070B18] p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Job Reference</span>
            <span className="font-mono font-semibold text-white">{activeJob.id}</span>
          </div>
          <div className="bg-[#070B18] p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Target Kiosk</span>
            <span className="font-semibold text-cyan-300 truncate block">{selectedKiosk.name}</span>
          </div>
          <div className="bg-[#070B18] p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Document</span>
            <span className="font-semibold text-slate-200 truncate block">{activeJob.document.name}</span>
          </div>
          <div className="bg-[#070B18] p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Cost Paid</span>
            <span className="font-mono font-bold text-emerald-400">
              {activeJob.pricing.currency}{activeJob.pricing.netTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Completion & Next Actions */}
      {isCompleted ? (
        <div className="space-y-3 pt-2">
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold block">Document Ready at Kiosk Tray</span>
              <span>Please collect your printed sheets from the dispenser slot.</span>
            </div>
          </div>

          <button
            type="button"
            onClick={resetWorkflow}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Print Another Document</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 py-3">
          <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>Keep this window open or monitor Kiosk #{selectedKiosk.code}...</span>
        </div>
      )}
    </div>
  );
};
