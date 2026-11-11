import React, { useState, useEffect } from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { soundFX } from '../../utils/audio';
import { SAMPLE_DOCUMENTS } from '../../services/mockData';
import QRCode from 'qrcode';
import { 
  QrCode, FileUp, Sparkles, Send, Mic, 
  CreditCard, CheckCircle2, Printer, MapPin, 
  Check, ArrowRight, RotateCcw, Leaf, Layers, Upload, Download, ExternalLink, Image as ImageIcon 
} from 'lucide-react';

export const EasyPrintWorkflow: React.FC = () => {
  const { 
    selectedKiosk, 
    setSelectedKioskId, 
    kiosks,
    currentDocument, 
    setCurrentDocument,
    printSettings, 
    updateSettings, 
    priceBreakdown, 
    submitAiPrompt, 
    isAiThinking, 
    activeJob, 
    processPayment, 
    dispatchJobToPrinter, 
    resetWorkflow 
  } = usePrintSystem();

  // If user scanned the QR code from the kiosk (URL has ?kiosk=...), start at Step 2 (Upload & AI)
  const [easyStep, setEasyStep] = useState<1 | 2 | 3>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('kiosk')) {
        return 2;
      }
    }
    return 1;
  });
  const [promptInput, setPromptInput] = useState<string>('');
  const [isProcessingPay, setIsProcessingPay] = useState<boolean>(false);
  const [qrUploadSuccess, setQrUploadSuccess] = useState<boolean>(false);
  const [uploadedQrPreview, setUploadedQrPreview] = useState<string | null>(null);
  const [qrDisplayMode, setQrDisplayMode] = useState<'original' | 'sculpture' | 'uploaded'>('original');
  const [originalQrDataUrl, setOriginalQrDataUrl] = useState<string>('');
  const [customQrUrl, setCustomQrUrl] = useState<string>(() => {
    return typeof window !== 'undefined'
      ? `${window.location.origin}/?kiosk=${selectedKiosk.code}`
      : `http://10.147.29.5:5173/?kiosk=${selectedKiosk.code}`;
  });

  // Generate original high-contrast scannable QR code with Level H error correction
  useEffect(() => {
    const payload = customQrUrl || `http://10.147.29.5:5173/?kiosk=${selectedKiosk.code}`;
    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000', // Pure high-contrast black
        light: '#FFFFFF'  // Pure crisp white
      }
    })
      .then(setOriginalQrDataUrl)
      .catch(() => {});
  }, [selectedKiosk.code, customQrUrl]);

  // Handle uploading a QR code image
  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFX.playScanBeep();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedQrPreview(event.target.result as string);
          setQrDisplayMode('uploaded');
          setQrUploadSuccess(true);
          setTimeout(() => {
            setQrUploadSuccess(false);
          }, 1500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || isAiThinking) return;
    soundFX.playScanBeep();
    const txt = promptInput;
    setPromptInput('');
    await submitAiPrompt(txt);
  };

  const handleQuickPrompt = async (txt: string) => {
    soundFX.playScanBeep();
    await submitAiPrompt(txt);
  };

  const handlePayAndPrint = async () => {
    setIsProcessingPay(true);
    soundFX.playScanBeep();
    const success = await processPayment('upi');
    setIsProcessingPay(false);
    if (success) {
      dispatchJobToPrinter();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-5 space-y-4">
      {/* 3 Simple Steps Progress Bar */}
      <div className="rounded-2xl bg-[#090D24] border border-purple-500/30 p-2.5 flex items-center justify-between text-xs">
        {[
          { num: 1, label: '1. Connect QR', active: easyStep === 1, done: easyStep > 1 },
          { num: 2, label: '2. Upload & AI', active: easyStep === 2, done: easyStep > 2 },
          { num: 3, label: '3. Pay & Print', active: easyStep === 3, done: activeJob?.status === 'completed' }
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setEasyStep(s.num as 1 | 2 | 3)}
            className={`flex-1 py-2 px-1 text-center rounded-xl font-bold transition-all ${
              s.active
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                : s.done
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STEP 1: PROPER & ORIGINAL QR CODE */}
      {easyStep === 1 && (
        <div className="rounded-3xl bg-[#0E1538]/90 border border-purple-500/30 p-5 space-y-4 shadow-2xl">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              STEP 1: SCAN OR UPLOAD QR
            </span>
            <h2 className="text-xl font-black text-white">Original Kiosk QR Code</h2>
            <p className="text-xs text-slate-400">
              Point your smartphone camera (Google Lens / iPhone) at this QR to connect instantly.
            </p>
          </div>

          {/* QR Display Mode Selector Pills */}
          <div className="flex justify-center gap-1.5 p-1 bg-[#070B18] rounded-xl border border-purple-500/30 text-xs">
            <button
              type="button"
              onClick={() => setQrDisplayMode('original')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                qrDisplayMode === 'original'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Original Standard QR (Scannable)</span>
            </button>

            <button
              type="button"
              onClick={() => setQrDisplayMode('sculpture')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                qrDisplayMode === 'sculpture'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>3D Sculpture Art</span>
            </button>

            {uploadedQrPreview && (
              <button
                type="button"
                onClick={() => setQrDisplayMode('uploaded')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  qrDisplayMode === 'uploaded'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-emerald-400 hover:text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>My Uploaded QR</span>
              </button>
            )}
          </div>

          {/* Active QR Box Display */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative group p-3 rounded-3xl bg-white shadow-[0_0_35px_rgba(6,182,212,0.4)] border-4 border-cyan-400/60">
              {qrDisplayMode === 'original' && (
                originalQrDataUrl ? (
                  <img
                    src={originalQrDataUrl}
                    alt="Original Scannable QR Code"
                    className="w-56 h-56 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-56 h-56 bg-slate-100 animate-pulse rounded-xl" />
                )
              )}

              {qrDisplayMode === 'sculpture' && (
                <div className="w-56 h-56 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src="/proper_qr.jpeg"
                    alt="SMART QR PRINT Sculpture"
                    className="w-full h-full object-cover filter drop-shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/image1.jpeg';
                    }}
                  />
                </div>
              )}

              {qrDisplayMode === 'uploaded' && uploadedQrPreview && (
                <img
                  src={uploadedQrPreview}
                  alt="Custom Uploaded QR"
                  className="w-56 h-56 object-contain rounded-xl"
                />
              )}

              {/* Floating Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0A0F26] text-white px-3 py-1 rounded-full border border-cyan-400 shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold text-cyan-300">
                  {selectedKiosk.name.split('(')[0]} · {selectedKiosk.code}
                </span>
              </div>
            </div>

            {/* Encoded URL label */}
            <span className="text-[11px] text-slate-400 font-mono mt-4 text-center block max-w-sm truncate">
              Payload: <b className="text-cyan-300">{customQrUrl}</b>
            </span>
          </div>

          {/* Quick Actions Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* 1. Upload QR Image Button */}
            <label className="p-2.5 rounded-xl bg-[#070B18] border border-cyan-500/40 hover:border-cyan-400 hover:bg-[#111A44] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-cyan-300 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleQrImageUpload}
                className="sr-only"
              />
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>{qrUploadSuccess ? 'Uploaded!' : 'Upload QR Image'}</span>
            </label>

            {/* 2. Download Original QR Button */}
            {originalQrDataUrl && (
              <a
                href={originalQrDataUrl}
                download={`smart-qr-${selectedKiosk.code}.png`}
                className="p-2.5 rounded-xl bg-[#070B18] border border-purple-500/40 hover:border-purple-400 hover:bg-[#151D4D] transition-all flex items-center justify-center gap-1.5 font-bold text-purple-300 text-center"
              >
                <Download className="w-4 h-4 text-purple-400" />
                <span>Save QR Image</span>
              </a>
            )}

            {/* 3. Direct Link Button */}
            <a
              href={customQrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#070B18] border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-1.5 font-bold text-slate-300 text-center"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Link</span>
            </a>
          </div>

          {/* Proceed to Step 2 Button */}
          <button
            type="button"
            onClick={() => {
              soundFX.playScanBeep();
              setEasyStep(2);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-cyan-200" />
            <span>Connect & Continue to Document Setup</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: UPLOAD DOCUMENT & NATURAL LANGUAGE AI INTENT */}
      {easyStep === 2 && (
        <div className="rounded-3xl bg-[#0E1538]/90 border border-purple-500/30 p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                STEP 2: DOCUMENT & AI
              </span>
              <h2 className="text-xl font-black text-white">Upload & Smart Instructions</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#070B18] text-cyan-300 border border-slate-800">
              Connected: {selectedKiosk.code}
            </span>
          </div>

          {/* Quick Connection Banner */}
          <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Mobile Paired with Kiosk #{selectedKiosk.code}</span>
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Session Live
            </span>
          </div>

          {/* Document Picker Strip */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300">Active Document:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_DOCUMENTS.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    setCurrentDocument(doc);
                    soundFX.playScanBeep();
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    currentDocument.id === doc.id
                      ? 'bg-purple-950/60 border-cyan-400 ring-1 ring-cyan-400/50 text-white'
                      : 'bg-[#070B18] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs block truncate">{doc.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {doc.totalPages} pages · {doc.colorPages.length > 0 ? `${doc.colorPages.length} color` : 'B&W'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Natural Language Command Box */}
          <div className="p-3.5 rounded-2xl bg-[#080C22] border border-cyan-500/40 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Assistant (English & Hinglish)
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Auto Settings Engine</span>
            </div>

            {/* Quick Prompt Pills */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                "pages 2 to 5, two copies in black and white",
                "3 copy nikal do double sided",
                "pura document b&w me chahiye"
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPrompt(p)}
                  className="px-2.5 py-1 rounded-lg bg-[#0E1538] hover:bg-purple-950/60 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                >
                  "{p}"
                </button>
              ))}
            </div>

            {/* Prompt input */}
            <form onSubmit={handleAiSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder='e.g. "Print pages 2 to 5, two copies in B&W"'
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#0F1738] border border-purple-500/30 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!promptInput.trim() || isAiThinking}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </form>
          </div>

          {/* Current Settings & Price Card */}
          <div className="p-3.5 rounded-2xl bg-[#070B18] border border-slate-800 space-y-3">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-[#0E1538] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Pages</span>
                <span className="font-bold text-white">
                  {printSettings.pageSelection === 'all'
                    ? `1-${currentDocument.totalPages}`
                    : printSettings.customRange || printSettings.pageSelection}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#0E1538] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Copies</span>
                <span className="font-bold text-cyan-300">{printSettings.copies}x</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0E1538] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Color</span>
                <span className="font-bold text-purple-300 uppercase">
                  {printSettings.colorMode}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#0E1538] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Duplex</span>
                <span className="font-bold text-emerald-400">
                  {printSettings.duplex === 'duplex' ? '2-Sided' : '1-Sided'}
                </span>
              </div>
            </div>

            {/* Live Pricing Summary */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">Total Calculated Cost</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {priceBreakdown.totalPagesToPrint} pages · Includes discounts
                </span>
              </div>
              <span className="text-2xl font-black text-cyan-300 font-mono">
                {priceBreakdown.currency}{priceBreakdown.netTotal.toFixed(2)}
              </span>
            </div>

            {/* Server-Side Pipeline Notice */}
            <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[10px] text-slate-400 flex items-center justify-between font-mono">
              <span className="text-cyan-300">⚙️ Backend Authority:</span>
              <span className="text-purple-300">Step 3 (AI Intent) & Step 4 (Validation) executed on Server</span>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEasyStep(1)}
              className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playScanBeep();
                setEasyStep(3);
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all"
            >
              <span>Proceed to Pay & Print ({priceBreakdown.currency}{priceBreakdown.netTotal.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 1-CLICK PAY & LIVE PRINT EXECUTION */}
      {easyStep === 3 && (
        <div className="rounded-3xl bg-[#0E1538]/90 border border-purple-500/30 p-5 space-y-4 shadow-2xl">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              STEP 3: 1-CLICK PAYMENT & DISPATCH
            </span>
            <h2 className="text-xl font-black text-white">Authorize & Collect Sheets</h2>
            <p className="text-xs text-slate-400">
              Instant UPI checkout triggers the physical dispenser motor at Kiosk #{selectedKiosk.code}.
            </p>
          </div>

          {/* Active Job Tracker / Completed Box */}
          {activeJob ? (
            <div className="p-4 rounded-2xl bg-[#070B18] border border-cyan-500/40 space-y-3">
              <div className="text-center py-2 bg-[#0B1028] rounded-xl border border-purple-500/30">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">
                  Self-Service Claim PIN
                </span>
                <span className="text-3xl font-black font-mono tracking-widest text-cyan-300">
                  {activeJob.claimPin}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    {activeJob.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Printer className="w-4 h-4 text-cyan-400 animate-pulse" />
                    )}
                    {activeJob.status === 'completed'
                      ? 'Print Completed! Ready in Tray'
                      : `Printing Page ${activeJob.currentPage} of ${activeJob.totalPages}...`}
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">{activeJob.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      activeJob.status === 'completed' ? 'bg-emerald-400' : 'bg-gradient-to-r from-purple-500 to-cyan-400'
                    }`}
                    style={{ width: `${activeJob.progress}%` }}
                  />
                </div>
              </div>

              {activeJob.status === 'completed' && (
                <button
                  type="button"
                  onClick={resetWorkflow}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Print Next Document</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Pay Button */}
              <button
                type="button"
                onClick={handlePayAndPrint}
                disabled={isProcessingPay}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5 text-white" />
                <span>
                  {isProcessingPay
                    ? 'Verifying Payment...'
                    : `Pay ${priceBreakdown.currency}${priceBreakdown.netTotal.toFixed(2)} & Print Now`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEasyStep(2)}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                ← Back to Settings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
