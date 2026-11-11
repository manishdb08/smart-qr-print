import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { X, QrCode, Smartphone, Download, Check, ExternalLink } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose }) => {
  const { selectedKiosk } = usePrintSystem();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const phoneUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?kiosk=${selectedKiosk.code}`
    : `http://10.147.29.5:5173/?kiosk=${selectedKiosk.code}`;

  useEffect(() => {
    QRCode.toDataURL(phoneUrl, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(setQrDataUrl).catch(() => {});
  }, [phoneUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(phoneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `kiosk-${selectedKiosk.code}-qr.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-[#0B1028] border border-cyan-500/30 p-6 shadow-2xl text-center space-y-4 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-2">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Scan with Your Phone</h3>
          <p className="text-xs text-slate-400">
            Open camera (Google Lens or iPhone) to print directly from your mobile.
          </p>
        </div>

        {/* High-Contrast Scannable QR Matrix */}
        <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mx-auto">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Kiosk QR" className="w-56 h-56 mx-auto block" />
          ) : (
            <div className="w-56 h-56 bg-slate-200 animate-pulse rounded-lg" />
          )}
        </div>

        <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 p-2 rounded-xl border border-cyan-500/20 truncate">
          {phoneUrl}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save QR Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
