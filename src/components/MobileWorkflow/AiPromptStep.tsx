import React, { useState } from 'react';
import { usePrintSystem } from '../../context/PrintSystemContext';
import { soundFX } from '../../utils/audio';
import { 
  Sparkles, Send, Mic, Bot, User, Check, 
  Lightbulb, ArrowRight, CornerDownLeft, Sliders, ShieldCheck 
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Print pages 2 to 5, two copies, in black and white.",
  "Make 3 copies of only even pages, double sided in color.",
  "Print the entire document in eco draft mode to save paper and money.",
  "Only print the first 3 pages on A4, high quality, single sided."
];

export const AiPromptStep: React.FC = () => {
  const { 
    currentDocument, 
    printSettings, 
    aiMessages, 
    isAiThinking, 
    submitAiPrompt, 
    nextStep, 
    prevStep 
  } = usePrintSystem();

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isAiThinking) return;

    soundFX.playScanBeep();
    const text = inputPrompt;
    setInputPrompt('');
    await submitAiPrompt(text);
  };

  const handleQuickPrompt = async (text: string) => {
    setInputPrompt('');
    soundFX.playScanBeep();
    await submitAiPrompt(text);
  };

  const handleVoiceInput = () => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        setIsListening(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition = new (SpeechRecognition as any)();
        recognition.lang = 'en-US';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputPrompt(transcript);
          setIsListening(false);
          submitAiPrompt(transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch {
        setIsListening(false);
      }
    } else {
      // Mock voice input fallback
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const demoVoice = "Print pages 2 to 5, two copies, in black and white.";
        setInputPrompt(demoVoice);
        submitAiPrompt(demoVoice);
      }, 1200);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium mb-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Step 3: Intelligence Layer</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">AI Intent Interpretation</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tell AI what you want in plain words. It translates your intent into validated printer parameters.
        </p>
      </div>

      {/* Slide 3 Visualization Pill */}
      <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-950/60 to-cyan-950/60 border border-purple-500/30 flex items-center justify-between text-xs">
        <span className="text-purple-300 font-semibold flex items-center gap-1">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          Gemini Function Calling Flow:
        </span>
        <span className="text-[11px] font-mono text-cyan-300">
          User Request → AI Parser → Recs
        </span>
      </div>

      {/* Quick Prompt Chips */}
      <div>
        <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
          Try Natural Language Examples:
        </span>
        <div className="space-y-1.5">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPrompt(prompt)}
              className="w-full text-left text-xs p-2 rounded-lg bg-[#0B1028] hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 text-slate-300 transition-all flex items-center justify-between group"
            >
              <span className="truncate pr-2">"{prompt}"</span>
              <Sparkles className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="rounded-2xl bg-[#090D22] border border-purple-500/25 p-3.5 max-h-56 overflow-y-auto space-y-3 shadow-inner">
        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 text-xs ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                  : 'bg-[#121A3D] text-slate-200 border border-purple-500/20 rounded-tl-none'
              }`}
            >
              <p>{msg.content}</p>

              {/* Display smart recommendation chip if present */}
              {msg.recommendation && (
                <div className="mt-2 p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{msg.recommendation}</span>
                </div>
              )}

              <span className="text-[9px] text-slate-400 block mt-1 text-right">
                {msg.timestamp}
              </span>
            </div>
            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isAiThinking && (
          <div className="flex items-center gap-2 text-xs text-cyan-300 py-1">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center animate-spin">
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>
            <span className="font-mono text-[11px] animate-pulse">
              Gemini interpreting natural language parameters...
            </span>
          </div>
        )}
      </div>

      {/* Input Box with Voice & Send */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder='e.g. "Print pages 2 to 5, two copies in B&W"'
            disabled={isAiThinking}
            className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-[#0F1738] border border-purple-500/30 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-md"
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            title="Speech to text"
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-cyan-400'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputPrompt.trim() || isAiThinking}
          className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-md disabled:opacity-40 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Current Structured Settings Extracted HUD */}
      <div className="rounded-xl bg-[#0F1738]/80 border border-purple-500/30 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Active Extracted Settings
          </span>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Validated by AI
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-[#070B18] p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Pages</span>
            <span className="font-semibold text-white">
              {printSettings.pageSelection === 'all'
                ? `All (1-${currentDocument.totalPages})`
                : printSettings.pageSelection === 'custom'
                ? printSettings.customRange || 'Custom'
                : printSettings.pageSelection}
            </span>
          </div>
          <div className="bg-[#070B18] p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Copies</span>
            <span className="font-semibold text-cyan-300">{printSettings.copies}x</span>
          </div>
          <div className="bg-[#070B18] p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Color</span>
            <span className="font-semibold text-purple-300 uppercase">
              {printSettings.colorMode === 'bw' ? 'B&W' : printSettings.colorMode}
            </span>
          </div>
          <div className="bg-[#070B18] p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Duplex</span>
            <span className="font-semibold text-emerald-300 uppercase">
              {printSettings.duplex === 'duplex' ? '2-Sided' : '1-Sided'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => {
            soundFX.playScanBeep();
            nextStep();
          }}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all"
        >
          <span>Confirm Intent & Validate</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
