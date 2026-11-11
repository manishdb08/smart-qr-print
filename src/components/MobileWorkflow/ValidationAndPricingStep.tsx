import React from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { soundFX } from '../../utils/audio';
import { 
  CheckCircle2, ShieldCheck, Calculator, ArrowRight, 
  Sparkles, AlertCircle, FileCheck, DollarSign, Leaf 
} from 'lucide-react';

export const ValidationAndPricingStep: React.FC = () => {
  const { 
    currentDocument, 
    selectedKiosk, 
    printSettings, 
    priceBreakdown, 
    updateSettings, 
    nextStep, 
    prevStep 
  } = usePrintSystem();

  const handleToggleDuplex = () => {
    soundFX.playScanBeep();
    updateSettings({ duplex: printSettings.duplex === 'duplex' ? 'simplex' : 'duplex' });
  };

  const handleToggleSmartColor = () => {
    soundFX.playScanBeep();
    updateSettings({
      colorMode: printSettings.colorMode === 'smart_mixed' ? 'bw' : 'smart_mixed'
    });
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Step 4 & 5: Authority Layer</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Validation & Cost Calculation</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Backend authority verifies hardware constraints and calculates authoritative transparent pricing.
        </p>
      </div>

      {/* Step 4: System Validation Checklist */}
      <div className="rounded-xl bg-[#0F1738]/90 border border-purple-500/30 p-3.5 space-y-2.5">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          Pre-Flight Validation Matrix
        </span>

        <div className="space-y-1.5 text-xs">
          <div className="p-2 rounded-lg bg-[#070B18] border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Document Boundary Check</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Validated ({currentDocument.totalPages} Pages)
            </span>
          </div>

          <div className="p-2 rounded-lg bg-[#070B18] border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Kiosk Hardware & Paper Supply</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {selectedKiosk.paperCount} Sheets Ready
            </span>
          </div>

          <div className="p-2 rounded-lg bg-[#070B18] border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Toner Capacity for Job</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sufficient ({selectedKiosk.tonerBlack}%)
            </span>
          </div>
        </div>
      </div>

      {/* Step 5: Backend Pricing Card */}
      <div className="rounded-2xl bg-gradient-to-b from-[#121A3D] to-[#0A0F26] border border-cyan-500/40 p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-cyan-400" />
            Authority Pricing Engine
          </span>
          <span className="text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
            Rule-Based Engine v2.4
          </span>
        </div>

        {/* Pricing Rows */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>
              B&W Pages ({priceBreakdown.bwPagesCount} × {priceBreakdown.currency}{priceBreakdown.bwUnitPrice.toFixed(2)})
            </span>
            <span className="font-mono text-slate-200">
              {priceBreakdown.currency}{priceBreakdown.bwSubtotal.toFixed(2)}
            </span>
          </div>

          {priceBreakdown.colorPagesCount > 0 && (
            <div className="flex items-center justify-between text-purple-300">
              <span>
                Color Pages ({priceBreakdown.colorPagesCount} × {priceBreakdown.currency}{priceBreakdown.colorUnitPrice.toFixed(2)})
              </span>
              <span className="font-mono text-purple-200">
                {priceBreakdown.currency}{priceBreakdown.colorSubtotal.toFixed(2)}
              </span>
            </div>
          )}

          {priceBreakdown.duplexDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1">
                <Leaf className="w-3 h-3" /> Duplex Eco Discount (15%)
              </span>
              <span className="font-mono">
                -{priceBreakdown.currency}{priceBreakdown.duplexDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {priceBreakdown.bulkDiscount > 0 && (
            <div className="flex items-center justify-between text-cyan-400">
              <span>Bulk Quantity Discount (10%)</span>
              <span className="font-mono">
                -{priceBreakdown.currency}{priceBreakdown.bulkDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Net Total Display */}
          <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Total Authoritative Price</span>
              <span className="text-[10px] text-slate-400">
                Includes all taxes & automated print queue routing
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-cyan-300 font-mono">
                {priceBreakdown.currency}{priceBreakdown.netTotal.toFixed(2)}
              </span>
              {priceBreakdown.grossTotal > priceBreakdown.netTotal && (
                <span className="text-xs text-slate-400 line-through block font-mono">
                  {priceBreakdown.currency}{priceBreakdown.grossTotal.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Optimization Toggles */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 text-[11px]">
          <button
            type="button"
            onClick={handleToggleDuplex}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              printSettings.duplex === 'duplex'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
          >
            <Leaf className="w-3 h-3 text-emerald-400" />
            {printSettings.duplex === 'duplex' ? 'Duplex Enabled (-15%)' : 'Enable Duplex (-15%)'}
          </button>

          {currentDocument.colorPages.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSmartColor}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                printSettings.colorMode === 'smart_mixed'
                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              {printSettings.colorMode === 'smart_mixed' ? 'Smart Mixed Mode Active' : 'Switch to Smart Mixed Color'}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => {
            soundFX.playScanBeep();
            nextStep();
          }}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all"
        >
          <span>Step 6: Review & Adjust Settings</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
