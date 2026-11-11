import React, { useState } from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { 
  Sparkles, QrCode, Cpu, ShieldCheck, Printer, 
  ChevronRight, ChevronLeft, ArrowRight, CheckCircle2, 
  Users, Layers, ExternalLink, Lightbulb, Play 
} from 'lucide-react';

export const PitchShowcaseView: React.FC = () => {
  const { setViewMode } = usePrintSystem();
  const [activeSlide, setActiveSlide] = useState<number>(1);

  const SLIDES = [
    { id: 1, title: 'Title & Team VisionX Debug', tag: 'Vision' },
    { id: 2, title: 'The Problem: Rethinking Printing', tag: 'Problem vs Solution' },
    { id: 3, title: 'The Intelligent AI Layer', tag: 'Gemini AI Flow' },
    { id: 4, title: 'The Experience: 9-Step Workflow', tag: 'User Journey' },
    { id: 5, title: 'Architecture: 5-Layer Stack', tag: 'Technical Specs' },
    { id: 6, title: 'Outcome & Future Roadmap', tag: 'Future Scope' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Slide Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0F26] p-3.5 rounded-2xl border border-purple-500/25">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-wide text-white uppercase">
              SMART QR PRINT · Pitch & Architecture Deck
            </h2>
            <span className="text-[10px] text-cyan-400 font-mono">Team VisionX Debug</span>
          </div>
        </div>

        {/* Slide Selector Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {SLIDES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSlide(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                activeSlide === s.id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'bg-[#070B18] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Slide {s.id}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setViewMode('split')}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Launch Live Simulator</span>
        </button>
      </div>

      {/* Slide Canvas */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0E163B] via-[#080C20] to-[#060917] border-2 border-purple-500/40 p-6 sm:p-10 shadow-[0_0_50px_rgba(139,92,246,0.15)] relative min-h-[520px] flex flex-col justify-between overflow-hidden">
        {/* Holographic corner ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* SLIDE 1: COVER */}
        {activeSlide === 1 && (
          <div className="space-y-8 animate-fade-in my-auto">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs uppercase tracking-widest font-semibold">
                HEALTHTECH · SOFTWARE / HARDWARE
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-300 tracking-tight">
                SMART QR PRINT
              </h1>
              <p className="text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                Intelligent self-service printing that combines QR access, AI assistance, and automated print-job management.
              </p>
            </div>

            {/* Team Credits Card */}
            <div className="p-5 rounded-2xl bg-[#080C22]/80 border border-purple-500/30 max-w-xl space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>Team Name: VisionX Debug</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {['Gufran', 'Kunal', 'Nirmiti', 'Mahek'].map((name) => (
                  <div key={name} className="p-2.5 rounded-xl bg-[#0F1738] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Member</span>
                    <span className="font-bold text-white">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: THE PROBLEM */}
        {activeSlide === 2 && (
          <div className="space-y-6 animate-fade-in my-auto">
            <div className="space-y-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                THE PROBLEM & OPPORTUNITY
              </span>
              <h2 className="text-3xl font-black text-white">Rethinking Traditional Printing</h2>
              <p className="text-sm text-slate-400">
                A simpler entry point turns a confusing task into a guided digital experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
              {/* Traditional Printing Bottlenecks */}
              <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-red-200">Traditional Printing</h3>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                  <li>Manual interaction makes setup difficult for inexperienced users.</li>
                  <li>Settings, page selection, and costs can be unclear before confirmation.</li>
                  <li>Prone to physical queues, missing driver installs, and paper waste.</li>
                </ul>
              </div>

              {/* SMART QR PRINT Solution */}
              <div className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 space-y-3 shadow-lg shadow-cyan-950/30">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-cyan-200">SMART QR PRINT</h3>
                <ul className="space-y-2 text-xs text-slate-200 leading-relaxed list-disc list-inside">
                  <li>QR-based access creates a convenient digital entry point.</li>
                  <li>AI assistance guides documents, settings, and print-job management.</li>
                  <li>Transparent live cost calculation before physical execution.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: THE INTELLIGENT LAYER */}
        {activeSlide === 3 && (
          <div className="space-y-6 animate-fade-in my-auto">
            <div className="space-y-1">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">
                THE INTELLIGENT LAYER
              </span>
              <h2 className="text-3xl font-black text-white">AI-Powered Printing Intelligence</h2>
              <p className="text-sm text-slate-400">
                AI interprets intent into structured settings. Backend services calculate actual costs and enforce validation.
              </p>
            </div>

            {/* Natural language example box */}
            <div className="p-4 rounded-2xl bg-[#090D26] border border-cyan-500/40 space-y-2">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                NATURAL LANGUAGE → SETTINGS
              </span>
              <p className="text-lg font-bold text-white italic">
                “Print pages 2 to 5, two copies, in black and white.”
              </p>
            </div>

            {/* Pipeline arrows */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3.5 rounded-xl bg-[#0F1738] border border-slate-800 text-slate-200 font-bold">
                1. User Request
              </div>
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 font-bold">
                2. AI Interpretation
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 font-bold">
                3. Document Analysis
              </div>
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-bold">
                4. Print Recommendations
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: THE 9-STEP WORKFLOW */}
        {activeSlide === 4 && (
          <div className="space-y-6 animate-fade-in my-auto">
            <div className="space-y-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                THE EXPERIENCE
              </span>
              <h2 className="text-3xl font-black text-white">From QR Scan to Smart Printing</h2>
              <p className="text-sm text-slate-400">
                A connected workflow separates AI interpretation, backend authority, payment verification, and physical execution.
              </p>
            </div>

            {/* 9 Step Roadmap Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-center text-xs">
              {[
                { step: 1, title: 'Scan QR', desc: 'Touchless entry' },
                { step: 2, title: 'Upload Doc', desc: 'PDF.js ingest' },
                { step: 3, title: 'AI Interprets', desc: 'Gemini NLP' },
                { step: 4, title: 'Validate Specs', desc: 'Bounds check' },
                { step: 5, title: 'Calc Cost', desc: 'Dynamic pricing' },
                { step: 6, title: 'Review Settings', desc: 'Confirm options' },
                { step: 7, title: 'Verify Pay', desc: 'UPI / Wallet' },
                { step: 8, title: 'Send to Printer', desc: 'Local spooler' },
                { step: 9, title: 'Display Status', desc: 'Live tracker' },
              ].map((s) => (
                <div
                  key={s.step}
                  className="p-2.5 rounded-xl bg-[#090D24] border border-slate-800 hover:border-cyan-400 transition-all space-y-1"
                >
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px] inline-flex items-center justify-center">
                    {s.step}
                  </span>
                  <span className="font-bold text-white block text-[11px] leading-tight">
                    {s.title}
                  </span>
                  <span className="text-[9px] text-slate-400 block">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 5: 5-LAYER ARCHITECTURE */}
        {activeSlide === 5 && (
          <div className="space-y-5 animate-fade-in my-auto">
            <div className="space-y-1">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">
                IMPLEMENTATION OPTIONS
              </span>
              <h2 className="text-3xl font-black text-white">Technology Behind the Innovation</h2>
              <p className="text-sm text-slate-400">
                AI acts as the intelligent interface. Backend services remain the authority for validation, pricing, payment verification, and actual printing.
              </p>
            </div>

            {/* 5 Stack Layers */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#0F1738] border border-cyan-500/30 flex items-center justify-between">
                <span className="font-bold text-cyan-300 w-36">1. Interface Layer</span>
                <span className="text-slate-300 flex-1">React / Next.js frontend, QR camera access, Responsive Mobile & Kiosk view</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0F1738] border border-purple-500/30 flex items-center justify-between">
                <span className="font-bold text-purple-300 w-36">2. Intelligence Layer</span>
                <span className="text-slate-300 flex-1">Gemini API, Natural-language interpretation, Assistance, Structured Function calling</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0F1738] border border-amber-500/30 flex items-center justify-between">
                <span className="font-bold text-amber-300 w-36">3. Document Layer</span>
                <span className="text-slate-300 flex-1">PDF.js, Canvas rendering, Color vs B&W region analysis, Page count inspection</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0F1738] border border-emerald-500/30 flex items-center justify-between">
                <span className="font-bold text-emerald-300 w-36">4. Authority Layer</span>
                <span className="text-slate-300 flex-1">Node.js backend, Validation rules, Pricing calculation, Payment verification, Firebase / SQLite</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0F1738] border border-blue-500/30 flex items-center justify-between">
                <span className="font-bold text-blue-300 w-36">5. Execution Layer</span>
                <span className="text-slate-300 flex-1">Local print service, Virtual spooler simulation, Supported printer integration</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: THE OUTCOME & FUTURE SCOPE */}
        {activeSlide === 6 && (
          <div className="space-y-6 animate-fade-in my-auto">
            <div className="space-y-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                THE OUTCOME & FUTURE ROADMAP
              </span>
              <h2 className="text-3xl font-black text-white">Making Printing Smarter and Simpler</h2>
              <p className="text-sm text-slate-400">
                “SMART QR PRINT transforms conventional printing into an intelligent, convenient, and user-friendly digital experience.”
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#0F1738] border border-purple-500/30 space-y-2">
                <span className="font-bold text-white text-sm block">Core Value Delivered</span>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>Simpler printing with zero manual assistance.</li>
                  <li>QR-based access and total upfront cost transparency.</li>
                  <li>Print-setting recommendations and automatic duplex paper savings.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F1738] border border-cyan-500/30 space-y-2">
                <span className="font-bold text-cyan-300 text-sm block">Future Scope Roadmap</span>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>Real-time voice instructions & multilingual accessibility.</li>
                  <li>HealthTech EHR clinical document printing integration.</li>
                  <li>Self-healing printer error recovery & fleet roaming pickup.</li>
                </ul>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-900/50 inline-flex items-center gap-2 transition-all"
              >
                <span>Experience Live Interactive System</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Slide Bottom Bar Navigation */}
        <div className="pt-6 border-t border-purple-500/20 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={() => setActiveSlide(prev => Math.max(1, prev - 1))}
            disabled={activeSlide === 1}
            className="flex items-center gap-1 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Slide</span>
          </button>

          <span className="font-mono text-cyan-300 font-bold">
            SLIDE {activeSlide} OF {SLIDES.length}
          </span>

          <button
            type="button"
            onClick={() => setActiveSlide(prev => Math.min(SLIDES.length, prev + 1))}
            disabled={activeSlide === SLIDES.length}
            className="flex items-center gap-1 hover:text-white disabled:opacity-30 transition-colors"
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
