import React from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { 
  QrCode, FileUp, CreditCard, Printer, Server 
} from 'lucide-react';

const FRONTEND_STEPS = [
  { num: 1, label: 'QR Scan', icon: QrCode, description: 'Connect Kiosk' },
  { num: 2, label: 'Upload Doc', icon: FileUp, description: 'Select & Instruct' },
  { num: 3, label: 'Review & Pay', icon: CreditCard, description: 'Confirm & Authorize' },
  { num: 4, label: 'Print Status', icon: Printer, description: 'Live Output & PIN' },
];

export const StepIndicator: React.FC = () => {
  const { currentStep, goToStep } = usePrintSystem();

  return (
    <div className="w-full bg-[#0A0F26]/95 border-b border-purple-500/20 px-3 py-2.5 backdrop-blur-md space-y-2">
      <div className="flex items-center justify-between text-xs text-purple-300/80 font-medium">
        <span className="font-mono text-[11px] text-slate-400">SMART UI WORKFLOW</span>
        <span className="text-cyan-400 font-mono font-semibold">
          STEP {currentStep} OF 4: {FRONTEND_STEPS[Math.min(currentStep - 1, 3)].label.toUpperCase()}
        </span>
      </div>

      {/* 4-Step Progress Track */}
      <div className="grid grid-cols-4 gap-1.5">
        {FRONTEND_STEPS.map((step) => {
          const Icon = step.icon;
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <button
              key={step.num}
              onClick={() => goToStep(step.num)}
              type="button"
              className={`flex flex-col items-center p-1.5 rounded-xl transition-all duration-200 group focus:outline-none ${
                isCurrent 
                  ? 'bg-purple-950/60 border border-cyan-400/60 ring-1 ring-cyan-400/30' 
                  : 'hover:bg-slate-900/60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                  isCurrent
                    ? 'bg-gradient-to-tr from-purple-600 to-cyan-500 text-white ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:border-purple-500/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-[10px] mt-1 font-medium truncate text-center ${
                  isCurrent
                    ? 'text-cyan-300 font-semibold'
                    : isDone
                    ? 'text-emerald-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {step.num}. {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Backend Authority Badge (explaining Step 3 & 4 execution) */}
      <div className="flex items-center justify-between text-[10px] bg-[#060A1D] px-2.5 py-1 rounded-lg border border-purple-500/20 font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
          <Server className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Backend Authority:</span>
        </span>
        <span className="text-[9.5px] text-purple-300">
          Step 3 (AI Intent) & Step 4 (Validation) processed on Server
        </span>
      </div>
    </div>
  );
};
