import React, { useState } from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { SAMPLE_DOCUMENTS } from '../../services/mockData';
import { DocumentMeta } from '../../types';
import { soundFX } from '../../utils/audio';
import { 
  FileUp, FileText, Check, Palette, Sparkles, 
  AlertCircle, ArrowRight, Eye, Server, Send, Loader2 
} from 'lucide-react';

export const DocumentUploadStep: React.FC = () => {
  const { 
    currentDocument, 
    setCurrentDocument, 
    goToStep, 
    prevStep,
    submitAiPrompt,
    isAiThinking,
    priceBreakdown 
  } = usePrintSystem();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreviewPage, setSelectedPreviewPage] = useState<number | null>(null);
  const [promptText, setPromptText] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSelectSample = (doc: DocumentMeta) => {
    setCurrentDocument(doc);
    soundFX.playScanBeep();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFX.playScanBeep();
      // Generate a mock DocumentMeta representing the uploaded file
      const estimatedPages = Math.max(2, Math.min(12, Math.round(file.size / (150 * 1024)) || 4));
      const customDoc: DocumentMeta = {
        id: `upload-${Date.now()}`,
        name: file.name,
        sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        totalPages: estimatedPages,
        colorPages: [2],
        bwPages: Array.from({ length: estimatedPages }, (_, i) => i + 1).filter(p => p !== 2),
        pages: Array.from({ length: estimatedPages }, (_, i) => ({
          pageNumber: i + 1,
          title: `Page ${i + 1} - ${file.name.replace(/\.[^/.]+$/, '')}`,
          hasColor: i === 1,
          type: i === 1 ? 'chart' : 'text',
          snippet: `Content segment for page ${i + 1} automatically ingested by PDF.js document layer.`
        }))
      };
      setCurrentDocument(customDoc);
    }
  };

  // Step 3 (AI Intent) and Step 4 (Validation & Pricing) are processed silently on the backend
  const handleProceed = async () => {
    setIsValidating(true);
    soundFX.playScanBeep();

    if (promptText.trim()) {
      await submitAiPrompt(promptText.trim());
    }

    setIsValidating(false);
    // Directly advance to Step 3: Review Settings & Payment (No Step 3 or 4 screens on frontend)
    goToStep(3);
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-1">
          <FileUp className="w-3.5 h-3.5 text-cyan-400" />
          <span>Step 2: Document & Smart Instructions</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Upload or Choose Document</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Select your file and add optional instructions. Step 3 (AI Intent) & Step 4 (Validation) are executed by the server authority.
        </p>
      </div>

      {/* Upload Zone */}
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
        className={`relative block rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 ring-4 ring-cyan-500/20'
            : 'border-purple-500/40 bg-[#0E1538]/70 hover:border-cyan-400/70 hover:bg-[#111A44]'
        }`}
      >
        <input
          type="file"
          accept=".pdf,.docx,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
          className="sr-only"
        />
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-3 group-hover:scale-110 transition-transform">
            <FileUp className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-white">Tap to upload file or drag & drop</span>
          <span className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, PNG, JPG (Max 50MB)</span>
        </div>
      </label>

      {/* Quick Pick Sample Documents */}
      <div>
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
          Or Quick Test with Built-in Sample Files:
        </label>
        <div className="space-y-2">
          {SAMPLE_DOCUMENTS.map((doc) => {
            const isSelected = currentDocument.id === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleSelectSample(doc)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-purple-950/40 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                    : 'bg-[#0B1028] border-slate-800 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-white block truncate">{doc.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {doc.totalPages} pages · {doc.sizeFormatted} ·{' '}
                      {doc.colorPages.length > 0 ? (
                        <span className="text-purple-300 font-medium">
                          {doc.colorPages.length} color {doc.colorPages.length === 1 ? 'page' : 'pages'}
                        </span>
                      ) : (
                        <span className="text-slate-400">Pure monochrome</span>
                      )}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-xs text-purple-400 font-medium hover:underline">Select</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Analysis Card */}
      <div className="rounded-xl bg-[#0F1738]/90 border border-purple-500/30 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            PDF.js Document Inspection Report
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 font-mono">
            {currentDocument.totalPages} Total Pages
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#070B18] p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Monochrome Text Pages</span>
            <span className="font-semibold text-slate-200">{currentDocument.bwPages.length} pages</span>
          </div>
          <div className="bg-[#070B18] p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Color Graphics Detected</span>
            <span className="font-semibold text-purple-300">
              {currentDocument.colorPages.length > 0
                ? `Pages [${currentDocument.colorPages.join(', ')}]`
                : 'None (100% B&W)'}
            </span>
          </div>
        </div>

        {/* Thumbnail Preview Horizontal Strip */}
        <div className="pt-1">
          <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
            Page Breakdown (Tap to inspect content):
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {currentDocument.pages.map((p) => (
              <button
                key={p.pageNumber}
                type="button"
                onClick={() => setSelectedPreviewPage(p.pageNumber)}
                className={`min-w-[70px] p-2 rounded-lg border text-center transition-all shrink-0 ${
                  p.hasColor
                    ? 'border-purple-500/60 bg-purple-950/30 text-purple-200'
                    : 'border-slate-800 bg-[#070B18] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono font-bold mb-0.5">P.{p.pageNumber}</div>
                <div className="text-[9px] truncate text-slate-400">{p.type}</div>
                {p.hasColor && (
                  <span className="inline-block mt-1 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Page Snippet Modal/Drawer */}
        {selectedPreviewPage !== null && (
          <div className="mt-2 p-2.5 rounded-lg bg-[#070B18] border border-cyan-500/30 text-xs">
            <div className="flex items-center justify-between text-cyan-300 font-semibold mb-1">
              <span>Page {selectedPreviewPage} Snippet</span>
              <button
                type="button"
                onClick={() => setSelectedPreviewPage(null)}
                className="text-slate-400 hover:text-white text-[10px]"
              >
                Close
              </button>
            </div>
            <p className="text-slate-300 text-[11px]">
              {currentDocument.pages.find(p => p.pageNumber === selectedPreviewPage)?.snippet}
            </p>
          </div>
        )}
      </div>

      {/* Optional Smart Natural Language Instructions */}
      <div className="p-3.5 rounded-2xl bg-[#090D24] border border-cyan-500/30 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Print Command (English or Hinglish)
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">Optional</span>
        </div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleProceed();
              }
            }}
            placeholder='e.g., "2 copies color double-sided" or "pehle 3 pages"'
            className="flex-1 px-3 py-2 rounded-xl bg-[#060A18] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1 pt-1">
          {[
            '2 copies double-sided',
            'Full color mode',
            'B&W save paper'
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setPromptText(chip)}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Backend Authority Execution Notice */}
      <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-[11px] text-purple-200">
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Backend validates PDF & computes authoritative pricing</span>
        </div>
        <span className="font-mono text-cyan-300 font-bold">
          {priceBreakdown.currency}{priceBreakdown.netTotal.toFixed(2)}
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
        >
          Back
        </button>
        <button
          type="button"
          disabled={isValidating || isAiThinking}
          onClick={handleProceed}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isValidating || isAiThinking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing on Backend...</span>
            </>
          ) : (
            <>
              <span>Proceed to Review & Pay</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
