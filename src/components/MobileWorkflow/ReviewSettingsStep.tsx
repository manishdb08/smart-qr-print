import React, { useState, useEffect } from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { soundFX } from '../../utils/audio';
import QRCode from 'qrcode';
import { 
  Sliders, Plus, Minus, Check, ArrowRight, 
  Palette, Layers, FileSpreadsheet, Sparkles, 
  CreditCard, QrCode, Wallet, Server, Loader2, CheckCircle2 
} from 'lucide-react';

export const ReviewSettingsStep: React.FC = () => {
  const { 
    currentDocument, 
    printSettings, 
    updateSettings, 
    priceBreakdown, 
    selectedKiosk,
    processPayment,
    dispatchJobToPrinter,
    goToStep 
  } = usePrintSystem();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'wallet' | 'card'>('upi');
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    // Generate simulated UPI payment QR code
    const upiUri = `upi://pay?pa=visionx.debug@kioskbank&pn=SmartQRPrint&am=${priceBreakdown.netTotal}&cu=INR&tn=Job-${selectedKiosk.code}`;
    QRCode.toDataURL(upiUri, {
      width: 140,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(setUpiQrUrl).catch(() => {});
  }, [priceBreakdown.netTotal, selectedKiosk.code]);

  const handleCopiesChange = (delta: number) => {
    soundFX.playScanBeep();
    const nextCopies = Math.max(1, Math.min(50, printSettings.copies + delta));
    updateSettings({ copies: nextCopies });
  };

  const handleAuthorizePay = async () => {
    setIsPaying(true);
    soundFX.playScanBeep();

    const success = await processPayment(paymentMethod);
    setIsPaying(false);

    if (success) {
      dispatchJobToPrinter();
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-1">
          <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
          <span>Step 3: Review Settings & Authorize Payment</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Review & Pay</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Backend Authority verified page counts and computed exact pricing. Authorize payment to print.
        </p>
      </div>

      {/* Backend Authority Passed Banner */}
      <div className="p-2.5 rounded-xl bg-[#060A1D] border border-purple-500/30 flex items-center justify-between text-[11px] text-purple-200">
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Backend Step 3 (AI) & Step 4 (Validation) Verified</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
          Ready to Print
        </span>
      </div>

      {/* Settings Grid */}
      <div className="rounded-2xl bg-[#0F1738]/90 border border-purple-500/30 p-4 space-y-3.5">
        {/* Copies Stepper */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold text-white block">Number of Copies</span>
            <span className="text-[11px] text-slate-400">Total duplicates to print</span>
          </div>
          <div className="flex items-center gap-2 bg-[#070B18] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleCopiesChange(-1)}
              disabled={printSettings.copies <= 1}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center justify-center transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-mono font-bold text-cyan-300 text-sm">
              {printSettings.copies}
            </span>
            <button
              type="button"
              onClick={() => handleCopiesChange(1)}
              className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Page Range Selection */}
        <div className="space-y-1.5 border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white block">Page Selection</span>
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            {(['all', 'custom', 'odd', 'even'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  soundFX.playScanBeep();
                  updateSettings({ pageSelection: mode });
                }}
                className={`py-2 rounded-lg border font-medium transition-all capitalize ${
                  printSettings.pageSelection === mode
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-cyan-400 text-white shadow-md'
                    : 'bg-[#070B18] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'all' ? `All (${currentDocument.totalPages})` : mode}
              </button>
            ))}
          </div>

          {printSettings.pageSelection === 'custom' && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="e.g. 2-5 or 1,3,7-8"
                value={printSettings.customRange}
                onChange={(e) => updateSettings({ customRange: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#070B18] border border-cyan-500/40 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          )}
        </div>

        {/* Color Mode Selection */}
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Color Mode</span>
            <span className="text-[11px] text-cyan-400 font-mono">
              {printSettings.colorMode === 'bw' ? 'B&W (₹2/page)' : printSettings.colorMode === 'color' ? 'Full Color (₹8/page)' : 'Smart Mixed'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                soundFX.playScanBeep();
                updateSettings({ colorMode: 'bw' });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                printSettings.colorMode === 'bw'
                  ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-md'
                  : 'bg-[#070B18] border-slate-800 text-slate-400'
              }`}
            >
              <span className="font-bold block text-xs">Black & White</span>
              <span className="text-[10px] text-cyan-300">₹2.00 / page</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playScanBeep();
                updateSettings({ colorMode: 'color' });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                printSettings.colorMode === 'color'
                  ? 'bg-purple-950/50 border-purple-400 text-white shadow-md'
                  : 'bg-[#070B18] border-slate-800 text-slate-400'
              }`}
            >
              <span className="font-bold block text-xs">Full Color</span>
              <span className="text-[10px] text-purple-300">₹8.00 / page</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playScanBeep();
                updateSettings({ colorMode: 'smart_mixed' });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                printSettings.colorMode === 'smart_mixed'
                  ? 'bg-gradient-to-tr from-purple-900/60 to-cyan-900/60 border-cyan-400 text-white shadow-md'
                  : 'bg-[#070B18] border-slate-800 text-slate-400'
              }`}
            >
              <span className="font-bold block text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Smart Mixed
              </span>
              <span className="text-[10px] text-emerald-300">Auto Split</span>
            </button>
          </div>
        </div>

        {/* Duplex / 2-Sided */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold text-white block">Duplex (Double-Sided)</span>
            <span className="text-[11px] text-emerald-400">Save paper & earn 15% discount</span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFX.playScanBeep();
              updateSettings({ duplex: printSettings.duplex === 'duplex' ? 'simplex' : 'duplex' });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              printSettings.duplex === 'duplex' ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                printSettings.duplex === 'duplex' ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-white block">Select Payment Method</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'upi', label: 'UPI QR', icon: QrCode },
              { id: 'card', label: 'Card', icon: CreditCard },
              { id: 'wallet', label: 'Wallet', icon: Wallet }
            ].map(m => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as 'upi' | 'wallet' | 'card')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                    isSelected
                      ? 'bg-purple-950/60 border-cyan-400 text-white ring-1 ring-cyan-400/40'
                      : 'bg-[#070B18] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {paymentMethod === 'upi' && upiQrUrl && (
            <div className="p-2.5 rounded-xl bg-[#060A18] border border-cyan-500/20 flex items-center justify-center gap-3">
              <img src={upiQrUrl} alt="UPI QR" className="w-20 h-20 rounded-lg bg-white p-1" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Instant UPI QR</span>
                <span className="text-[10px] text-slate-400 block">Scan with GPay / PhonePe / Paytm</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {priceBreakdown.currency}{priceBreakdown.netTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => goToStep(2)}
          className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
        >
          Back
        </button>
        <button
          type="button"
          disabled={isPaying}
          onClick={handleAuthorizePay}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isPaying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Payment...</span>
            </>
          ) : (
            <>
              <span>Pay & Print {priceBreakdown.currency}{priceBreakdown.netTotal.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
