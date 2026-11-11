import React, { useState } from 'react';
import {
  Printer,
  ShieldCheck,
  BarChart3,
  ListOrdered,
  DollarSign,
  Sliders,
  Package,
  RefreshCw,
  Power,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  User,
  LogOut,
  Settings,
  Search,
  Receipt,
  FileText
} from 'lucide-react';
import { BillInvoiceModal, BillData } from '../Portal/BillInvoiceModal';

export interface AdminDesktopProps {
  onSwitchToUser: () => void;
}

interface KioskNode {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'busy' | 'standby';
  paperLevel: number;
  tonerLevel: number;
  activeJobsCount: number;
  type: 'Mono Laser' | 'Color Multifunction';
}

interface QueueJob {
  id: string;
  documentName: string;
  customerName: string;
  pages: number;
  copies: number;
  colorMode: 'bw' | 'color';
  sides: 'single' | 'double';
  amount: number;
  status: 'printing' | 'queued' | 'completed' | 'failed';
  kioskId: string;
  timeStr: string;
}

export const AdminDesktop: React.FC<AdminDesktopProps> = ({ onSwitchToUser }) => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'queue' | 'revenue' | 'pricing' | 'supplies'>('fleet');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample Hardware Fleet State
  const [kiosks, setKiosks] = useState<KioskNode[]>([
    { id: 'kiosk-01', name: 'Kiosk #01 - Lab Station', location: 'Computer Lab Wing A', status: 'online', paperLevel: 85, tonerLevel: 92, activeJobsCount: 2, type: 'Mono Laser' },
    { id: 'kiosk-02', name: 'Kiosk #02 - Library Hub', location: 'Central Library 1st Floor', status: 'online', paperLevel: 42, tonerLevel: 68, activeJobsCount: 1, type: 'Color Multifunction' },
    { id: 'kiosk-03', name: 'Kiosk #03 - Student Center', location: 'Cafeteria & Common Room', status: 'online', paperLevel: 65, tonerLevel: 80, activeJobsCount: 0, type: 'Mono Laser' },
    { id: 'kiosk-04', name: 'Kiosk #04 - Admin Block', location: 'Registrar Office Hall', status: 'standby', paperLevel: 95, tonerLevel: 90, activeJobsCount: 0, type: 'Color Multifunction' },
  ]);

  // Sample Queue Jobs
  const [queue, setQueue] = useState<QueueJob[]>([
    { id: 'PRN-9024', documentName: 'CS_Project_Report.pdf', customerName: 'Manish B.', pages: 24, copies: 1, colorMode: 'bw', sides: 'double', amount: 36.00, status: 'printing', kioskId: 'Kiosk #01', timeStr: '2 mins ago' },
    { id: 'PRN-9023', documentName: 'Semester_Admit_Card.pdf', customerName: 'Pooja K.', pages: 1, copies: 1, colorMode: 'color', sides: 'single', amount: 10.00, status: 'queued', kioskId: 'Kiosk #02', timeStr: '5 mins ago' },
    { id: 'PRN-9022', documentName: 'Physics_Lab_Manual.pdf', customerName: 'Rohan S.', pages: 18, copies: 2, colorMode: 'bw', sides: 'single', amount: 72.00, status: 'completed', kioskId: 'Kiosk #01', timeStr: '12 mins ago' },
    { id: 'PRN-9021', documentName: 'Resume_Formal.pdf', customerName: 'Ananya D.', pages: 2, copies: 3, colorMode: 'bw', sides: 'single', amount: 12.00, status: 'completed', kioskId: 'Kiosk #03', timeStr: '25 mins ago' },
    { id: 'PRN-9020', documentName: 'Art_Portfolio_Photos.pdf', customerName: 'Vikas M.', pages: 8, copies: 1, colorMode: 'color', sides: 'single', amount: 80.00, status: 'completed', kioskId: 'Kiosk #02', timeStr: '42 mins ago' },
  ]);

  // Pricing State
  const [pricing, setPricing] = useState({
    bwSingle: 2.0,
    bwDouble: 3.0,
    colorSingle: 10.0,
    colorDouble: 18.0,
    duplexDiscountPercent: 15,
    minOrderAmount: 2.0
  });

  const [pricingSavedMsg, setPricingSavedMsg] = useState(false);

  // Selected bill modal
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null);

  // Quick Hardware actions
  const handleRefillPaper = (id: string) => {
    setKiosks(prev => prev.map(k => k.id === id ? { ...k, paperLevel: 100 } : k));
  };

  const handleRefillToner = (id: string) => {
    setKiosks(prev => prev.map(k => k.id === id ? { ...k, tonerLevel: 100 } : k));
  };

  const handleToggleStatus = (id: string) => {
    setKiosks(prev => prev.map(k => {
      if (k.id !== id) return k;
      const next = k.status === 'online' ? 'offline' : 'online';
      return { ...k, status: next };
    }));
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    setPricingSavedMsg(true);
    setTimeout(() => setPricingSavedMsg(false), 2500);
  };

  const openJobBill = (job: QueueJob) => {
    setSelectedBill({
      invoiceNo: `INV-2026-${job.id}`,
      orderId: job.id,
      dateStr: `Today, ${job.timeStr}`,
      customerName: job.customerName,
      customerPhone: '+91 98765 00000',
      fileName: job.documentName,
      colorMode: job.colorMode,
      sides: job.sides,
      paperSize: 'A4',
      pagesCount: job.pages,
      physicalSheets: job.sides === 'double' ? Math.ceil(job.pages / 2) : job.pages,
      copies: job.copies,
      ratePerPage: job.colorMode === 'bw' ? (job.sides === 'double' ? 3 : 2) : 10,
      totalAmount: job.amount,
      paymentMethod: 'UPI (Confirmed)',
      printerName: job.kioskId
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-[#142440]">
      {/* Admin Navy Sidebar */}
      <aside className="w-64 bg-[#0d172a] text-white flex flex-col flex-shrink-0 min-h-screen p-5 border-r border-slate-800">
        {/* Header Logo */}
        <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white leading-tight">SMART QR</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">ADMIN CONSOLE</span>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="flex flex-col gap-1.5 mt-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-1">
            FLEET & STORE MANAGEMENT
          </p>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'fleet' ? 'bg-[#2585ed] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
          >
            <Printer size={18} />
            <span>Kiosk Hardware Fleet</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'queue' ? 'bg-[#2585ed] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
          >
            <ListOrdered size={18} />
            <span>Live Spool Queue</span>
            {queue.filter(q => q.status === 'printing' || q.status === 'queued').length > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                {queue.filter(q => q.status === 'printing' || q.status === 'queued').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('revenue')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'revenue' ? 'bg-[#2585ed] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
          >
            <BarChart3 size={18} />
            <span>Revenue & Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'pricing' ? 'bg-[#2585ed] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
          >
            <Sliders size={18} />
            <span>Pricing & Rate Config</span>
          </button>

          <button
            onClick={() => setActiveTab('supplies')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'supplies' ? 'bg-[#2585ed] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
          >
            <Package size={18} />
            <span>Paper & Toner Stock</span>
          </button>
        </div>

        {/* Bottom Switcher: Go Back to User Desktop */}
        <div className="mt-auto pt-4 border-t border-slate-800 flex flex-col gap-2">
          <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 text-xs text-slate-400">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Operator Logged In</span>
            <strong className="text-white text-xs">Admin Station #01</strong>
          </div>

          <button
            onClick={onSwitchToUser}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition hover:scale-[1.02]"
            title="Switch to User Customer Portal"
          >
            <User size={16} />
            <span>Switch to User Desktop</span>
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {/* Top Header Banner */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#2585ed] text-[11px] font-bold">
                OPERATOR DESKTOP
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                ● Fleet Online (Supabase Cloud Sync)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142440] tracking-tight">
              {activeTab === 'fleet' && 'Hardware Fleet & Telemetry'}
              {activeTab === 'queue' && 'Real-Time Spool Queue'}
              {activeTab === 'revenue' && 'Revenue & GST Transaction Audit'}
              {activeTab === 'pricing' && 'Pricing & Printing Rates'}
              {activeTab === 'supplies' && 'Station Paper & Toner Inventory'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToUser}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition"
            >
              <User size={15} />
              <span>Customer Portal</span>
            </button>
          </div>
        </header>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ₹
              </div>
            </div>
            <div className="text-2xl font-black text-[#142440]">₹1,480.00</div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
              <TrendingUp size={12} /> +24% vs yesterday
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prints Today</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Printer size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-[#142440]">342 pages</div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              28 customer orders processed
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Kiosks</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-[#142440]">3 / 4 Online</div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              1 standby (Registrar office)
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Queue Status</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-[#142440]">
              {queue.filter(q => q.status === 'printing' || q.status === 'queued').length} Active
            </div>
            <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
              0 printer paper jams
            </span>
          </div>
        </div>

        {/* TAB 1: FLEET MANAGEMENT */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#142440]">Printer Hardware Telemetry & Remote Controls</h2>
              <span className="text-xs text-slate-500">Auto-refresh every 5 seconds</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {kiosks.map((k) => (
                <div key={k.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#142440]">{k.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${k.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {k.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{k.location} · {k.type}</p>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(k.id)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                      title="Toggle Power"
                    >
                      <Power size={14} color={k.status === 'online' ? '#16a34a' : '#94a3b8'} />
                    </button>
                  </div>

                  {/* Level Bars */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">A4 Paper Tray:</span>
                        <span className={k.paperLevel < 50 ? 'text-amber-600 font-bold' : 'text-slate-700 font-bold'}>
                          {k.paperLevel}% ({Math.round(k.paperLevel * 5)} sheets)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${k.paperLevel < 30 ? 'bg-red-500' : k.paperLevel < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${k.paperLevel}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">Toner / Ink Level:</span>
                        <span className="text-slate-700 font-bold">{k.tonerLevel}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${k.tonerLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Operator Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => handleRefillPaper(k.id)}
                      className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold transition"
                    >
                      Refill Paper
                    </button>
                    <button
                      onClick={() => handleRefillToner(k.id)}
                      className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold transition"
                    >
                      Refill Toner
                    </button>
                    <button
                      onClick={() => alert(`Test page sent to ${k.name}!`)}
                      className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg transition"
                    >
                      Test Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE SPOOL QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#142440]">Current & Recent Print Jobs</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by job ID or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs w-60 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Job ID</th>
                    <th className="py-3 px-4">Customer & Document</th>
                    <th className="py-3 px-4">Specs</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Kiosk</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {queue
                    .filter(j => j.id.toLowerCase().includes(searchTerm.toLowerCase()) || j.documentName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#2585ed]">#{j.id}</td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block">{j.documentName}</strong>
                          <span className="text-[11px] text-slate-400">{j.customerName} · {j.timeStr}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 mr-1">
                            {j.colorMode === 'bw' ? 'B&W' : 'Colour'}
                          </span>
                          <span className="text-[11px] text-slate-500">{j.pages}p ({j.copies}c)</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">₹{j.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{j.kioskId}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              j.status === 'printing' ? 'bg-amber-100 text-amber-800' :
                              j.status === 'queued' ? 'bg-blue-100 text-blue-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {j.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openJobBill(j)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                            title="View Official Tax Bill"
                          >
                            <Receipt size={12} color="#2585ed" />
                            Bill
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REVENUE & AUDIT */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#142440]">Revenue & GST Collection Ledger</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase">Base Printing Sales (Net)</span>
                <div className="text-2xl font-black text-[#142440]">₹1,254.24</div>
                <p className="text-xs text-slate-400">Excluding 18% GST component</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase">Total GST Output (18%)</span>
                <div className="text-2xl font-black text-blue-600">₹225.76</div>
                <p className="text-xs text-slate-400">CGST (9%): ₹112.88 | SGST (9%): ₹112.88</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase">Total UPI Settlements</span>
                <div className="text-2xl font-black text-emerald-600">₹1,480.00</div>
                <p className="text-xs text-emerald-600 font-semibold">100% direct bank settlement</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-[#142440] mb-3">UPI Payment Apps Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Google Pay (GPay)</span>
                    <span className="text-slate-800">55% (₹814.00)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>PhonePe</span>
                    <span className="text-slate-800">30% (₹444.00)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Paytm & Other UPI</span>
                    <span className="text-slate-800">15% (₹222.00)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRICING CONFIGURATION */}
        {activeTab === 'pricing' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-bold text-[#142440]">Printing Rate Matrix Configuration</h2>
            <p className="text-xs text-slate-500">
              Changes updated here immediately sync across all student kiosks and calculate quotes.
            </p>

            <form onSubmit={handleSavePricing} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Black & White (Single Side)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      value={pricing.bwSingle}
                      onChange={(e) => setPricing({ ...pricing, bwSingle: Number(e.target.value) })}
                      className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Current: ₹2.00 per page</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Black & White (Double Sided)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      value={pricing.bwDouble}
                      onChange={(e) => setPricing({ ...pricing, bwDouble: Number(e.target.value) })}
                      className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Current: ₹3.00 per physical sheet</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Colour (Single Side)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="1"
                      value={pricing.colorSingle}
                      onChange={(e) => setPricing({ ...pricing, colorSingle: Number(e.target.value) })}
                      className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Current: ₹10.00 per page</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Colour (Double Sided)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="1"
                      value={pricing.colorDouble}
                      onChange={(e) => setPricing({ ...pricing, colorDouble: Number(e.target.value) })}
                      className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Current: ₹18.00 per physical sheet</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {pricingSavedMsg && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> New pricing saved & applied to cloud!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition"
                >
                  Save New Rates
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: SUPPLIES & INVENTORY */}
        {activeTab === 'supplies' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#142440]">Paper & Consumables Inventory</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase">A4 Paper Reams</span>
                <div className="text-2xl font-black text-[#142440]">42 Reams in Stock</div>
                <p className="text-xs text-emerald-600 font-semibold">Healthy inventory (Approx 21,000 sheets)</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase">HP Black Toner Cartridges</span>
                <div className="text-2xl font-black text-[#142440]">6 units</div>
                <p className="text-xs text-slate-500">Good for ~15,000 pages</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase">Canon Color Ink Sets</span>
                <div className="text-2xl font-black text-blue-600">4 sets</div>
                <p className="text-xs text-slate-500">Cyan, Magenta, Yellow, Black</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <strong className="text-sm text-[#142440] block">Automated Paper Low Alerts</strong>
                <p className="text-xs text-slate-500">Sends WhatsApp notification when any kiosk paper tray drops below 20%.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                Enabled
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Bill preview modal */}
      {selectedBill && (
        <BillInvoiceModal
          isOpen={true}
          onClose={() => setSelectedBill(null)}
          data={selectedBill}
        />
      )}
    </div>
  );
};

export default AdminDesktop;
