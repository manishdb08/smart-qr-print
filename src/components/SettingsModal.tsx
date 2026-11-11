import React, { useRef, useEffect } from 'react';
import { usePrintSystem } from '../context/PrintSystemContext';
import { Key, Sparkles, X, Check, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { geminiApiKey, setGeminiApiKey } = usePrintSystem();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [keyInput, setKeyInput] = React.useState<string>(geminiApiKey);
  const [savedSuccess, setSavedSuccess] = React.useState<boolean>(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="settings-dialog-title"
      className="p-0 rounded-3xl bg-[#0B1028] text-white border-2 border-purple-500/40 shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm max-w-md w-full m-auto"
      style={{
        overscrollBehavior: 'contain'
      }}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 id="settings-dialog-title" className="text-sm font-bold text-white">
                Gemini API Configuration
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono">
                Intelligence Layer Settings
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            SMART QR PRINT is equipped with an integrated high-precision natural language parser that runs offline. To use live Google Gemini 2.5 Flash for advanced multi-turn intent interpretation and function calling, enter your API key below:
          </p>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B18] border border-purple-500/30 text-white placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200 space-y-1">
            <span className="font-semibold block flex items-center gap-1 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Free Gemini API Key
            </span>
            <p className="text-slate-300">
              Get an instant key from Google AI Studio. Your key is stored solely in local browser memory and never sent to external servers.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-900/40 flex items-center justify-center gap-1.5 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Key Saved!</span>
                </>
              ) : (
                <span>Save Key & Enable Gemini</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
