import React, { useState, useEffect } from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { SAMPLE_DOCUMENTS } from '../../services/mockData';
import { DocumentMeta } from '../../types';
import { soundFX } from '../../utils/audio';
import { QrModal } from './QrModal';
import QRCode from 'qrcode';
import { 
  FileUp, FileText, Check, Plus, Minus, Sparkles, 
  CreditCard, Printer, QrCode, Smartphone, ArrowRight, 
  RotateCcw, Loader2, CheckCircle2, ShieldCheck, Zap 
} from 'lucide-react';

export const SimplePrintApp: React.FC = () => {
  const {
    selectedKiosk,
    currentDocument,
    setCurrentDocument,
    printSettings,
    updateSettings,
    priceBreakdown,
    submitAiPrompt,
    isAiThinking,
    processPayment,
    dispatchJobToPrinter,
    activeJob,
    resetWorkflow
  } = usePrintSystem();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Generate UPI QR code for fast demo payment
  useEffect(() => {
    const upiUri = `upi://pay?pa=visionx.debug@kioskbank&pn=SmartQRPrint&am=${priceBreakdown.netTotal}&cu=INR&tn=Job-${selectedKiosk.code}`;
    QRCode.toDataURL(upiUri, {
      width: 180,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    }).then(setUpiQrUrl).catch(() => {});
  }, [priceBreakdown.netTotal, selectedKiosk.code]);

  const handleCopiesChange = (delta: number) => {
    soundFX.playScanBeep();
    const next = Math.max(1, Math.min(50, printSettings.copies + delta));
    updateSettings({ copies: next });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFX.playScanBeep();
      const estimatedPages = Math.max(2, Math.min(10, Math.round(file.size / (150 * 1024)) || 4));
      const newDoc: DocumentMeta = {
        id: `upload-${Date.now()}`,
        name: file.name,
        sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        totalPages: estimatedPages,
        colorPages: [1],
        bwPages: Array.from({ length: estimatedPages }, (_, i) => i + 1).filter(p => p !== 1),
        pages: Array.from({ length: estimatedPages }, (_, i) => ({
          pageNumber: i + 1,
          title: `Page ${i + 1}`,
          hasColor: i === 0,
          type: i === 0 ? 'chart' : 'text',
          snippet: `Page ${i + 1} content`
        }))
      };
      setCurrentDocument(newDoc);
    }
  };

  const handleApplyAiPrompt = async (text: string) => {
    if (!text.trim()) return;
    soundFX.playScanBeep();
    await submitAiPrompt(text.trim());
    setAiPrompt('');
  };

  const handleConfirmPay = async () => {
    setIsPaying(true);
    soundFX.playScanBeep();
    const success = await processPayment('upi');
    setIsPaying(false);
    setPaymentModalOpen(false);
    if (success) {
      dispatchJobToPrinter();
    }
  };

  // If a job is actively printing or finished, show the simple live status card
  if (activeJob) {
    const isCompleted = activeJob.status === 'completed';
    return (
      <div className="w-full max-w-lg mx-auto p-4 sm:p-6 space-y-5 animate-fadeIn">
        <div className="rounded-3xl bg-[#0B1028] border border-cyan-500/30 p-6 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-[0_0_25px_rgba(6,182,212,0.5)]">
            {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : <Printer className="w-8 h-8 animate-bounce" />}
          </div>

          <div>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold tracking-widest uppercase">
              KIOSK #{selectedKiosk.code}
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              {isCompleted ? 'Printing Complete!' : 'Printing Your Document...'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isCompleted
                ? 'Your printed sheets are ready in the output tray.'
                : `Processing page ${activeJob.currentPage} of ${activeJob.totalPages}...`}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${activeJob.progress}%` }}
            />
          </div>

          {/* Claim PIN */}
          <div className="p-4 rounded-2xl bg-[#060A1A] border border-slate-800 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] text-slate-400 block">Your Claim PIN</span>
              <span className="text-2xl font-mono font-bold text-cyan-300 tracking-wider">
                {activeJob.claimPin}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Paid</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                ₹{activeJob.pricing.netTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Reset / Print Another */}
          <button
            type="button"
            onClick={resetWorkflow}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Print Another Document</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-5 space-y-4">
      {/* 1. Header Bar: Clean & Minimal */}
      <div className="p-3.5 rounded-2xl bg-[#090D24] border border-purple-500/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Smart Print Kiosk</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                #{selectedKiosk.code}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Library Station · Online</span>
          </div>
        </div>

        {/* Scan with Mobile Button */}
        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <QrCode className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scan with Phone</span>
        </button>
      </div>

      {/* 2. Upload / Choose File Card */}
      <div className="p-4 rounded-3xl bg-[#0B1028] border border-purple-500/30 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileUp className="w-4 h-4 text-cyan-400" />
            1. Select Document
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {currentDocument.totalPages} pages ({currentDocument.sizeFormatted})
          </span>
        </div>

        {/* Drag & Drop File Upload Input */}
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              const file = e.dataTransfer.files[0];
              const eventMock = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
              handleFileUpload(eventMock);
            }
          }}
          className={`block p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20'
              : 'border-slate-800 bg-[#070B1A] hover:border-cyan-500/50'
          }`}
        >
          <input
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="sr-only"
          />
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-cyan-400">
              <FileUp className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-white block">
                Tap to upload your document
              </span>
              <span className="text-[11px] text-slate-400">
                PDF, Word, or Image (Fast auto-analysis)
              </span>
            </div>
          </div>
        </label>

        {/* Quick Sample Files for 1-Click Testing */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-medium">Or test with 1-click sample files:</span>
          <div className="grid grid-cols-3 gap-1.5">
            {SAMPLE_DOCUMENTS.map((doc) => {
              const isSelected = currentDocument.id === doc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    soundFX.playScanBeep();
                    setCurrentDocument(doc);
                  }}
                  className={`p-2 rounded-xl text-left border transition-all text-xs truncate ${
                    isSelected
                      ? 'bg-purple-950/80 border-cyan-400 text-white shadow-md'
                      : 'bg-[#070B1A] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold block truncate text-[11px]">{doc.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{doc.totalPages} pages</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Easy Print Options Card */}
      <div className="p-4 rounded-3xl bg-[#0B1028] border border-purple-500/30 space-y-3.5 shadow-xl">
        <span className="text-xs font-bold text-white uppercase tracking-wider block">
          2. Print Options
        </span>

        {/* Copies Stepper */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div>
            <span className="text-xs font-bold text-white block">Copies</span>
            <span className="text-[10px] text-slate-400">Total duplicates</span>
          </div>
          <div className="flex items-center gap-2 bg-[#060A18] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleCopiesChange(-1)}
              disabled={printSettings.copies <= 1}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center justify-center"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center font-mono font-bold text-cyan-300 text-sm">
              {printSettings.copies}
            </span>
            <button
              type="button"
              onClick={() => handleCopiesChange(1)}
              className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Color Mode: Black & White vs Color */}
        <div className="border-b border-slate-800 pb-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-white">Color Mode</span>
            <span className="text-[11px] text-cyan-400 font-mono">
              {printSettings.colorMode === 'bw' ? '₹2/page' : '₹8/page'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                soundFX.playScanBeep();
                updateSettings({ colorMode: 'bw' });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                printSettings.colorMode === 'bw'
                  ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md'
                  : 'bg-[#060A18] border-slate-800 text-slate-400'
              }`}
            >
              <span className="font-bold text-xs block">Black & White</span>
              <span className="text-[10px] text-cyan-300">Standard print · ₹2.00</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playScanBeep();
                updateSettings({ colorMode: 'color' });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                printSettings.colorMode === 'color'
                  ? 'bg-purple-950/60 border-purple-400 text-white shadow-md'
                  : 'bg-[#060A18] border-slate-800 text-slate-400'
              }`}
            >
              <span className="font-bold text-xs block">Full Color</span>
              <span className="text-[10px] text-purple-300">High-DPI graphics · ₹8.00</span>
            </button>
          </div>
        </div>

        {/* Duplex (Double-Sided) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div>
            <span className="text-xs font-bold text-white block">Double-Sided (Duplex)</span>
            <span className="text-[10px] text-emerald-400">Save paper & get 15% discount</span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFX.playScanBeep();
              updateSettings({ duplex: printSettings.duplex === 'duplex' ? 'simplex' : 'duplex' });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              printSettings.duplex === 'duplex' ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                printSettings.duplex === 'duplex' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* AI Natural Language Assistant (Simple 1-line command) */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Smart Command (Optional)
            </span>
            <span className="text-[10px] text-slate-400">English & Hinglish</span>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyAiPrompt(aiPrompt);
                }
              }}
              placeholder='e.g., "2 copies color double-sided"'
              className="flex-1 px-3 py-2 rounded-xl bg-[#060A18] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              disabled={isAiThinking || !aiPrompt.trim()}
              onClick={() => handleApplyAiPrompt(aiPrompt)}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold transition-colors"
            >
              {isAiThinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Price & Instant Pay Button */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-cyan-950/70 border border-cyan-500/40 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Total Cost:</span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {priceBreakdown.totalPagesToPrint} pages · Auto-discounts applied
            </span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-cyan-300 font-mono tracking-tight">
              ₹{priceBreakdown.netTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPaymentModalOpen(true)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay ₹{priceBreakdown.netTotal.toFixed(2)} & Print Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Payment Modal with Instant UPI QR */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#0B1028] border border-cyan-500/30 p-5 space-y-4 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white">Authorize & Print</h3>
            <p className="text-xs text-slate-400">
              Scan with any UPI app (GPay / PhonePe / Paytm) or click Instant Pay.
            </p>

            {upiQrUrl && (
              <div className="p-2.5 bg-white rounded-2xl inline-block shadow-lg mx-auto">
                <img src={upiQrUrl} alt="UPI QR" className="w-44 h-44 mx-auto block" />
              </div>
            )}

            <div className="text-lg font-mono font-bold text-emerald-400">
              Amount: ₹{priceBreakdown.netTotal.toFixed(2)}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPaying}
                onClick={handleConfirmPay}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
              >
                {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Print'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal for Phone Camera */}
      <QrModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
    </div>
  );
};
