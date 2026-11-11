import React, { useState } from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { 
  Printer, DollarSign, Leaf, Layers, Search, 
  CheckCircle2, AlertTriangle, RefreshCw, BarChart3, Wifi, Clock 
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { kiosks, jobHistory, refillKioskSupplies } = usePrintSystem();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const totalPrintsToday = jobHistory.reduce((acc, j) => acc + j.totalPages, 48);
  const totalRevenueToday = jobHistory.reduce((acc, j) => acc + j.pricing.netTotal, 142.50);
  const paperSavedDuplex = jobHistory.reduce((acc, j) => acc + (j.settings.duplex === 'duplex' ? Math.floor(j.totalPages / 2) : 0), 28);

  const filteredJobs = jobHistory.filter(
    (j) =>
      j.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.kioskName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Authority & Operator Console</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Kiosk Fleet & Audit Log</h2>
          <p className="text-xs text-slate-400">
            Real-time management for multi-location self-service kiosks, paper stocks, and payment receipts.
          </p>
        </div>

        <span className="font-mono text-xs px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300">
          Team VisionX Debug · Fleet v2.0
        </span>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#0F1738]/90 border border-purple-500/25 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Prints Completed</span>
            <Printer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalPrintsToday}</div>
          <span className="text-[10px] text-emerald-400 font-mono">+18% vs yesterday</span>
        </div>

        <div className="rounded-2xl bg-[#0F1738]/90 border border-purple-500/25 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Revenue Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ₹{totalRevenueToday.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">Instant UPI & Student Wallet</span>
        </div>

        <div className="rounded-2xl bg-[#0F1738]/90 border border-purple-500/25 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Paper Saved (Duplex)</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {paperSavedDuplex} sheets
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">15% discount applied</span>
        </div>

        <div className="rounded-2xl bg-[#0F1738]/90 border border-purple-500/25 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Fleet Nodes</span>
            <Wifi className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">
            {kiosks.filter(k => k.status === 'online').length}/{kiosks.length} Online
          </div>
          <span className="text-[10px] text-slate-400">Low latency edge print</span>
        </div>
      </div>

      {/* Kiosks Fleet Status Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Multi-Location Kiosks Telemetry
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kiosks.map((k) => (
            <div
              key={k.id}
              className="rounded-2xl bg-[#0D1435] border border-purple-500/20 p-4 space-y-3 hover:border-cyan-400/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{k.name}</h4>
                  <span className="text-[10px] text-slate-400 block truncate">{k.location}</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#070B18] text-cyan-400 border border-cyan-500/30">
                  {k.code}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Paper Tray</span>
                  <span className="font-mono text-slate-200">{k.paperCount}/{k.maxPaper}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${(k.paperCount / k.maxPaper) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                  <span>Toner Black: <b className="text-slate-200">{Math.round(k.tonerBlack)}%</b></span>
                  <span>Color: <b className="text-purple-300">{Math.round(k.tonerColor)}%</b></span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {k.status.toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => refillKioskSupplies(k.id)}
                  className="text-[10px] text-purple-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refill
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl bg-[#0F1738]/90 border border-purple-500/30 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Recent Print Transactions & Audit Records
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Job ID, file, or kiosk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#070B18] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Job ID & PIN</th>
                <th className="py-2.5 px-3">Document</th>
                <th className="py-2.5 px-3">Kiosk</th>
                <th className="py-2.5 px-3">Settings</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-[#121A44] transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{j.id}</span>
                      <span className="text-[10px] text-cyan-400">PIN: {j.claimPin}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="font-medium text-slate-200 block truncate max-w-[160px]">
                        {j.document.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {j.totalPages} pages
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300">
                      {j.kioskName}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-300">
                      {j.settings.copies}x · {j.settings.colorMode.toUpperCase()} · {j.settings.duplex}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-400">
                      ₹{j.pricing.netTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-sans text-[11px] text-slate-400 capitalize">
                      {j.paymentMethod || 'UPI QR'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-2.5 h-2.5" /> COMPLETED
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 font-sans">
                    No transactions recorded yet in this session. Dispatch a print job from the mobile app to see audit logs!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
