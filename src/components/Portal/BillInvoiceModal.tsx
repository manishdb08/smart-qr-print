import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, X, CheckCircle2, Building, Receipt, FileText } from 'lucide-react';

export interface BillData {
  invoiceNo: string;
  orderId: string;
  dateStr: string;
  customerName?: string;
  customerPhone?: string;
  customerGstin?: string;
  fileName: string;
  fileSizeStr?: string;
  colorMode: 'bw' | 'color';
  sides: 'single' | 'double';
  paperSize: string;
  pagesCount: number;
  physicalSheets: number;
  copies: number;
  ratePerPage: number;
  totalAmount: number;
  paymentMethod: string;
  printerName?: string;
}

interface BillInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BillData;
}

export const BillInvoiceModal: React.FC<BillInvoiceModalProps> = ({ isOpen, onClose, data }) => {
  const [qrSrc, setQrSrc] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const verifyString = `INVOICE:${data.invoiceNo}|ORDER:${data.orderId}|AMT:INR_${data.totalAmount.toFixed(2)}|DATE:${data.dateStr}|STATUS:PAID`;
      QRCode.toDataURL(verifyString, { width: 120, margin: 1 })
        .then(url => setQrSrc(url))
        .catch(() => setQrSrc(''));
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  // Tax calculations (GST 18% inclusive)
  const taxableAmount = +(data.totalAmount / 1.18).toFixed(2);
  const totalGst = +(data.totalAmount - taxableAmount).toFixed(2);
  const cgst = +(totalGst / 2).toFixed(2);
  const sgst = +(totalGst / 2).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:m-0 print:max-w-none">
        
        {/* Screen-only top action bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#142440] text-white print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="text-cyan-400" size={18} />
            <span className="font-semibold text-sm">Tax Invoice & Cash Receipt</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              VERIFIED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
              title="Print or Save PDF"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-300 hover:text-white transition"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-6 sm:p-8 text-[#142440] bg-white print:p-4" id="printable-bill">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-[#2585ed] text-white flex items-center justify-center font-bold text-sm">
                  🖨️
                </div>
                <h1 className="text-xl font-bold tracking-tight text-[#142440]">
                  SMART QR <span className="text-[#2585ed]">PRINT</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-xs">
                Smart Cloud-to-Hardware Autonomous Printing Kiosk Network
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Kiosk Station: <strong>{data.printerName || 'Kiosk #01 - Central Library'}</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                GSTIN: <strong>27AAACV2026P1Z1</strong> · SAC: <strong>998912</strong>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-mono font-bold text-xs uppercase tracking-wider mb-2">
                ORIGINAL TAX INVOICE
              </span>
              <p className="text-xs text-slate-500">Invoice No:</p>
              <p className="text-sm font-mono font-bold text-slate-800">{data.invoiceNo}</p>
              <p className="text-xs text-slate-500 mt-1">Date & Time:</p>
              <p className="text-xs font-semibold text-slate-700">{data.dateStr}</p>
            </div>
          </div>

          {/* Billed To / Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 bg-slate-50/70 rounded-xl px-4 my-5 border border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To (Customer)
              </span>
              <p className="text-sm font-bold text-slate-800">
                {data.customerName ? data.customerName : 'Walk-in Customer / Student'}
              </p>
              {data.customerPhone && (
                <p className="text-xs text-slate-600 mt-0.5">Phone: {data.customerPhone}</p>
              )}
              <p className="text-xs text-slate-500 mt-0.5">
                GSTIN / ID: {data.customerGstin ? <strong className="text-slate-700">{data.customerGstin}</strong> : 'Unregistered (B2C)'}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Order & Payment Info
              </span>
              <p className="text-xs text-slate-600">
                Order ID: <strong className="font-mono text-slate-800">#{data.orderId}</strong>
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Payment Mode: <strong className="text-slate-800">UPI ({data.paymentMethod})</strong>
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1 sm:justify-end">
                <CheckCircle2 size={13} /> Payment Status: Paid & Confirmed
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto my-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Item Description</th>
                  <th className="py-2.5 px-2">Specs & Mode</th>
                  <th className="py-2.5 px-2 text-center">Pages / Qty</th>
                  <th className="py-2.5 px-2 text-right">Rate</th>
                  <th className="py-2.5 px-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-2 font-mono text-slate-400">1</td>
                  <td className="py-3 px-2">
                    <strong className="text-slate-800 block">{data.fileName}</strong>
                    <span className="text-[11px] text-slate-400">
                      {data.fileSizeStr ? `File size: ${data.fileSizeStr}` : 'PDF Document'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 mr-1">
                      {data.colorMode === 'bw' ? 'B&W' : 'Colour'}
                    </span>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 mr-1">
                      {data.sides === 'single' ? '1-Sided' : '2-Sided'}
                    </span>
                    <span className="text-[11px] text-slate-500">{data.paperSize}</span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div>{data.pagesCount} pages</div>
                    <div className="text-[10px] text-slate-400">({data.copies} copy)</div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    ₹{data.ratePerPage}
                    <span className="text-[10px] text-slate-400 block">
                      /{data.colorMode === 'bw' && data.sides === 'double' ? 'sheet' : 'page'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                    ₹{data.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Calculation Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t-2 border-slate-200 mt-4">
            {/* Left: Verification stamp & QR */}
            <div className="flex items-center gap-4">
              {qrSrc && (
                <div className="p-1 border border-slate-200 rounded-lg bg-white shadow-sm flex-shrink-0">
                  <img src={qrSrc} alt="Verification QR" className="w-20 h-20 object-contain" />
                  <p className="text-[9px] text-center text-slate-400 mt-0.5 font-mono">Scan to Verify</p>
                </div>
              )}

              <div className="border-2 border-dashed border-emerald-500/60 rounded-xl p-3 bg-emerald-50/50">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-0.5">
                  <CheckCircle2 size={15} /> PAID & VERIFIED
                </div>
                <p className="text-[11px] text-emerald-600 font-medium">
                  Instant Kiosk Spool Complete
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Txn Ref: TXN-{data.orderId}-OK
                </p>
              </div>
            </div>

            {/* Right: Tax Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Taxable Value (Base):</span>
                <span className="font-mono">₹{taxableAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CGST (9.0%):</span>
                <span className="font-mono">₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>SGST (9.0%):</span>
                <span className="font-mono">₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] pb-1.5 border-b border-slate-200">
                <span>Total GST (18% included):</span>
                <span className="font-mono">₹{totalGst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-sm text-[#142440]">Total Paid:</span>
                <span className="text-lg font-mono font-bold text-[#2585ed]">
                  ₹{data.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-1">
            <p>This is a computer-generated digital tax receipt and requires no physical signature.</p>
            <p>Thank you for using SMART QR PRINT. For queries, contact support at <strong>support@smartqrprint.in</strong></p>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
          >
            <Printer size={14} />
            <span>Print Bill</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillInvoiceModal;
