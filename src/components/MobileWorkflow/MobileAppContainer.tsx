import React from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { StepIndicator } from './StepIndicator';
import { QrScanStep } from './QrScanStep';
import { DocumentUploadStep } from './DocumentUploadStep';
import { ReviewSettingsStep } from './ReviewSettingsStep';
import { JobDispatchAndStatusStep } from './JobDispatchAndStatusStep';
import { Wifi, Battery, Sparkles } from 'lucide-react';

export const MobileAppContainer: React.FC = () => {
  const { currentStep } = usePrintSystem();

  // Step 3 (AI Intent) & Step 4 (Validation & Pricing) are processed strictly by the Backend Authority.
  // Frontend displays only user-facing actions: Connect -> Document & Prompt -> Review & Pay -> Print Status.
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <QrScanStep />;
      case 2:
        return <DocumentUploadStep />;
      case 3:
        return <ReviewSettingsStep />;
      case 4:
      default:
        return <JobDispatchAndStatusStep />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Phone Mockup Frame */}
      <div className="w-full max-w-[440px] rounded-[36px] bg-[#050814] border-[6px] border-slate-800 shadow-[0_0_50px_rgba(139,92,246,0.25)] overflow-hidden flex flex-col h-[780px] max-h-[92vh] relative">
        {/* Dynamic Island / Notch */}
        <div className="bg-[#050814] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] text-slate-400 select-none border-b border-slate-900 shrink-0">
          <span className="font-mono font-semibold text-slate-300">9:41</span>
          <div className="w-20 h-4 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-500/80 animate-ping mr-1" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        {/* Mobile App Header */}
        <div className="bg-[#0A0F26] px-4 py-2.5 flex items-center justify-between border-b border-purple-500/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-wider text-white">SMART QR PRINT</h1>
              <span className="text-[9px] text-cyan-400 block -mt-0.5 font-mono">VisionX Mobile v2.0</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
            Self-Service App
          </span>
        </div>

        {/* 9-Step Progress Bar Indicator */}
        <div className="shrink-0">
          <StepIndicator />
        </div>

        {/* Scrollable Step Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900/50 scrollbar-track-transparent">
          {renderStepContent()}
        </div>

        {/* Phone Bottom Home Bar */}
        <div className="py-2 flex justify-center bg-[#050814] border-t border-slate-900 shrink-0">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
