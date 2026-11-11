import React, { useState, useEffect } from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { soundFX } from '../../utils/audio';
import QRCode from 'qrcode';
import { 
  CreditCard, QrCode, Wallet, CheckCircle2, 
  ShieldCheck, Lock, Sparkles, Loader2, ArrowRight 
} from 'lucide-react';

export const PaymentStep: React.FC = () => {
  const { 
    priceBreakdown, 
    selectedKiosk, 
    processPayment, 
    nextStep, 
    prevStep 
  } = usePrintSystem();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'wallet' | 'card'>('upi');
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Generate simulated UPI payment QR code
    const upiUri = `upi://pay?pa=visionx.debug@kioskbank&pn=SmartQRPrint&am=${priceBreakdown.netTotal}&cu=INR&tn=Job-${selectedKiosk.code}`;
    QRCode.toDataURL(upiUri, {
      width: 180,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(setUpiQrUrl).catch(() => {});
  }, [priceBreakdown.netTotal, selectedKiosk.code]);

  const handlePayNow = async () => {
    setIsProcessing(true);
    soundFX.playScanBeep();

    const success = await processPayment(paymentMethod);
    setIsProcessing(false);

    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        nextStep(); // Advance to Step 8
      }, 1200);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-1">
          <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
          <span>Step 7: Payment Verification</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Authorize Payment</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Backend authority verifies instantaneous payment before spooling physical print jobs.
        </p>
      </div>

      {/* Amount Due Card */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-950/60 to-cyan-950/60 border border-cyan-500/30 p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block">Total Amount Payable</span>
          <span className="text-2xl font-black text-white font-mono">
            {priceBreakdown.currency}{priceBreakdown.netTotal.toFixed(2)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 block mb-0.5">
            Verified Rate
          </span>
          <span className="text-[11px] text-slate-400">{priceBreakdown.totalPagesToPrint} Pages to print</span>
        </div>
      </div>

      {/* Payment Method Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <button
          type="button"
          onClick={() => { soundFX.playScanBeep(); setPaymentMethod('upi'); }}
          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
            paymentMethod === 'upi'
              ? 'bg-purple-950/60 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400/50'
              : 'bg-[#0B1028] border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span className="font-semibold text-[11px]">Instant UPI QR</span>
        </button>

        <button
          type="button"
          onClick={() => { soundFX.playScanBeep(); setPaymentMethod('wallet'); }}
          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
            paymentMethod === 'wallet'
              ? 'bg-purple-950/60 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400/50'
              : 'bg-[#0B1028] border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span className="font-semibold text-[11px]">Student Wallet</span>
        </button>

        <button
          type="button"
          onClick={() => { soundFX.playScanBeep(); setPaymentMethod('card'); }}
          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
            paymentMethod === 'card'
              ? 'bg-purple-950/60 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400/50'
              : 'bg-[#0B1028] border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="font-semibold text-[11px]">Debit / Credit</span>
        </button>
      </div>

      {/* Selected Payment Interface Details */}
      <div className="rounded-2xl bg-[#0F1738]/90 border border-purple-500/30 p-4 text-center">
        {paymentMethod === 'upi' && (
          <div className="flex flex-col items-center py-2 space-y-2">
            <span className="text-xs text-slate-300 font-medium">
              Scan with GPay, PhonePe, Paytm, or BHIM
            </span>
            <div className="p-2 rounded-xl bg-white shadow-xl">
              {upiQrUrl ? (
                <img src={upiQrUrl} alt="UPI Payment QR" className="w-36 h-36" />
              ) : (
                <div className="w-36 h-36 bg-slate-200 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              UPI ID: visionx.debug@kioskbank
            </span>
          </div>
        )}

        {paymentMethod === 'wallet' && (
          <div className="py-4 space-y-3 text-left">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#070B18] border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Campus Card ID</span>
                <span className="font-mono text-white font-semibold">VX-STUDENT-4921</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Available Balance</span>
                <span className="font-mono text-emerald-400 font-bold">₹420.50</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 block">
              Direct deduction authorized via student single sign-on.
            </span>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="py-2 space-y-2 text-left text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Card Number</label>
              <input
                type="text"
                defaultValue="•••• •••• •••• 4092"
                disabled
                className="w-full px-3 py-2 rounded-lg bg-[#070B18] border border-slate-800 text-slate-300 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Expiry</label>
                <input
                  type="text"
                  defaultValue="12/28"
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-[#070B18] border border-slate-800 text-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">CVV</label>
                <input
                  type="password"
                  defaultValue="•••"
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-[#070B18] border border-slate-800 text-slate-300 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-2">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>256-bit encrypted transaction guarantee</span>
        </div>
      </div>

      {/* Pay Now Button */}
      <button
        type="button"
        onClick={handlePayNow}
        disabled={isProcessing || isSuccess}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Verifying Payment with Bank...</span>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>Payment Verified! Routing to Printer...</span>
          </>
        ) : (
          <>
            <span>Pay {priceBreakdown.currency}{priceBreakdown.netTotal.toFixed(2)} & Send to Printer</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={prevStep}
          className="text-xs text-slate-400 hover:text-white"
        >
          ← Change settings
        </button>
      </div>
    </div>
  );
};
