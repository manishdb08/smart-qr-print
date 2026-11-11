import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Kiosk,
  DocumentMeta,
  PrintSettings,
  PriceBreakdown,
  PrintJob,
  AIMessage
} from '../types';
import { MOCK_KIOSKS, SAMPLE_DOCUMENTS } from '../services/mockData';
import { calculatePrintPricing } from '../services/pricingEngine';
import { callGeminiForPrintIntent } from '../services/geminiService';
import { apiInterpretPrompt, apiCreateJob, apiPayJob, apiExecuteJob } from '../services/apiClient';
import { soundFX } from '../utils/audio';
import confetti from 'canvas-confetti';

export type ViewMode = 'split' | 'mobile' | 'kiosk' | 'admin' | 'pitch';

interface PrintSystemContextType {
  kiosks: Kiosk[];
  selectedKiosk: Kiosk;
  setSelectedKioskId: (id: string) => void;
  currentDocument: DocumentMeta;
  setCurrentDocument: (doc: DocumentMeta) => void;
  printSettings: PrintSettings;
  updateSettings: (settings: Partial<PrintSettings>) => void;
  priceBreakdown: PriceBreakdown;
  currentStep: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  activeJob: PrintJob | null;
  jobHistory: PrintJob[];
  aiMessages: AIMessage[];
  isAiThinking: boolean;
  submitAiPrompt: (prompt: string) => Promise<void>;
  processPayment: (method: string) => Promise<boolean>;
  dispatchJobToPrinter: () => void;
  resetWorkflow: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  refillKioskSupplies: (kioskId: string) => void;
}

const DEFAULT_SETTINGS: PrintSettings = {
  pageSelection: 'all',
  customRange: '',
  copies: 1,
  colorMode: 'bw',
  duplex: 'duplex',
  paperSize: 'A4',
  orientation: 'portrait',
  quality: 'normal',
  staple: false
};

const PrintSystemContext = createContext<PrintSystemContextType | undefined>(undefined);

export const PrintSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kiosks, setKiosks] = useState<Kiosk[]>(MOCK_KIOSKS);

  // Automatically parse kiosk code from URL parameter if phone scanned a kiosk QR code
  const [selectedKioskId, setSelectedKioskId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const kioskParam = params.get('kiosk');
      if (kioskParam) {
        const matched = MOCK_KIOSKS.find(
          k => k.code.toLowerCase() === kioskParam.toLowerCase() || k.id.toLowerCase() === kioskParam.toLowerCase()
        );
        if (matched) return matched.id;
      }
    }
    return MOCK_KIOSKS[0].id;
  });

  const [currentDocument, setCurrentDocument] = useState<DocumentMeta>(SAMPLE_DOCUMENTS[0]);
  const [printSettings, setPrintSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeJob, setActiveJob] = useState<PrintJob | null>(null);
  const [jobHistory, setJobHistory] = useState<PrintJob[]>([]);

  // On mobile phone or when kiosk QR is scanned, default to 'mobile' (Easy Print Flow) first!
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const hasKioskParam = new URLSearchParams(window.location.search).has('kiosk');
      if (isMobile || hasKioskParam) {
        return 'mobile'; // Phone shows Easy Print Flow first
      }
    }
    return 'mobile'; // Default to mobile Easy Print Flow first for best phone experience
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(() => {
    return localStorage.getItem('smart_qr_gemini_key') || '';
  });

  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      content: 'Hello! I am your VisionX AI Print Assistant. You can speak or type what you need (e.g., "Print pages 2 to 5, two copies in black and white"), and I will configure optimal settings and calculate the lowest price for you.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const selectedKiosk = kiosks.find(k => k.id === selectedKioskId) || kiosks[0];

  const priceBreakdown = calculatePrintPricing(currentDocument, printSettings);

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    localStorage.setItem('smart_qr_gemini_key', key);
  };

  const updateSettings = useCallback((newSettings: Partial<PrintSettings>) => {
    setPrintSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitAiPrompt = async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    setIsAiThinking(true);

    try {
      // 1. Try calling the live backend NLP assistant API first
      const backendResult = await apiInterpretPrompt(prompt, currentDocument?.id, printSettings);

      let result;
      if (backendResult && backendResult.extractedSettings) {
        result = {
          thoughtProcess: backendResult.thoughts || 'Processed via VisionX Backend NLP Engine',
          extractedSettings: backendResult.extractedSettings,
          naturalReply: backendResult.naturalReply,
          recommendations: backendResult.recommendations || [],
          confidence: backendResult.confidence || 0.95
        };
      } else {
        // Fallback to client Gemini / local parser
        result = await callGeminiForPrintIntent(
          geminiApiKey,
          prompt,
          currentDocument,
          printSettings
        );
      }

      // Apply the parsed settings
      if (Object.keys(result.extractedSettings).length > 0) {
        updateSettings(result.extractedSettings);
      }

      const assistantMsg: AIMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: result.naturalReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedSettings: result.extractedSettings,
        recommendation: result.recommendations.length > 0 ? result.recommendations[0] : undefined
      };

      setAiMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const processPayment = async (method: string): Promise<boolean> => {
    if (!currentDocument) return false;

    // Transition to step 7 (payment verification) and create job record
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    const newJob: PrintJob = {
      id: `JOB-${Date.now().toString().slice(-6)}`,
      claimPin: randomPin,
      kioskId: selectedKiosk.id,
      kioskName: selectedKiosk.name,
      document: currentDocument,
      settings: printSettings,
      pricing: priceBreakdown,
      status: 'pending_payment',
      progress: 0,
      currentPage: 0,
      totalPages: priceBreakdown.totalPagesToPrint,
      createdAt: new Date().toLocaleTimeString(),
      paymentMethod: method
    };

    setActiveJob(newJob);

    // Synchronize with live backend API in background
    apiCreateJob(`ses_${selectedKiosk.code}`, currentDocument.id, printSettings)
      .then(created => {
        if (created?.id) {
          apiPayJob(created.id, method, priceBreakdown.netTotal);
        }
      })
      .catch(() => {});

    // Simulate verification latency
    return new Promise((resolve) => {
      setTimeout(() => {
        newJob.status = 'paid';
        newJob.paidAt = new Date().toLocaleTimeString();
        setActiveJob({ ...newJob });
        soundFX.playSuccessChime();
        resolve(true);
      }, 1400);
    });
  };

  // Dispatch job to connected printer and simulate hardware execution (Step 4 Live Status)
  const dispatchJobToPrinter = () => {
    if (!activeJob) return;

    soundFX.playScanBeep();
    setCurrentStep(4); // Step 4: Dispatch job to printer

    const totalPages = activeJob.totalPages;
    let pageCount = 0;

    // Update active job status to spooling
    setActiveJob(prev => prev ? { ...prev, status: 'spooling', progress: 10 } : null);

    // Update kiosk status
    setKiosks(prev =>
      prev.map(k => (k.id === selectedKiosk.id ? { ...k, status: 'busy', currentJob: activeJob } : k))
    );

    setTimeout(() => {
      setCurrentStep(4); // Step 4: Display actual live job status
      setActiveJob(prev => prev ? { ...prev, status: 'printing', progress: 25 } : null);

      const interval = setInterval(() => {
        pageCount += 1;
        soundFX.playPrintFeed();

        const progressPercent = Math.min(100, Math.round(25 + (pageCount / totalPages) * 75));

        setActiveJob(prev => {
          if (!prev) return null;
          return {
            ...prev,
            currentPage: pageCount,
            progress: progressPercent,
            status: pageCount >= totalPages ? 'completed' : 'printing'
          };
        });

        // Reduce paper count in kiosk
        setKiosks(prev =>
          prev.map(k => {
            if (k.id === selectedKiosk.id) {
              return {
                ...k,
                paperCount: Math.max(0, k.paperCount - 1),
                tonerBlack: Math.max(0, k.tonerBlack - 0.2),
                tonerColor: activeJob.settings.colorMode !== 'bw' ? Math.max(0, k.tonerColor - 0.5) : k.tonerColor
              };
            }
            return k;
          })
        );

        if (pageCount >= totalPages) {
          clearInterval(interval);
          soundFX.playSuccessChime();
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch {
            // Safe fallback
          }

          setActiveJob(prev => {
            if (!prev) return null;
            const completed = {
              ...prev,
              status: 'completed' as const,
              progress: 100,
              completedAt: new Date().toLocaleTimeString()
            };
            setJobHistory(h => [completed, ...h]);
            return completed;
          });

          // Reset kiosk state back to online
          setTimeout(() => {
            setKiosks(prev =>
              prev.map(k => (k.id === selectedKiosk.id ? { ...k, status: 'online', currentJob: undefined } : k))
            );
          }, 3000);
        }
      }, 1200);
    }, 1800);
  };

  const refillKioskSupplies = (kioskId: string) => {
    setKiosks(prev =>
      prev.map(k => (k.id === kioskId ? { ...k, paperCount: 500, tonerBlack: 100, tonerColor: 100, status: 'online' } : k))
    );
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setActiveJob(null);
    setPrintSettings(DEFAULT_SETTINGS);
  };

  useEffect(() => {
    soundFX.setMuted(!soundEnabled);
  }, [soundEnabled]);

  return (
    <PrintSystemContext.Provider
      value={{
        kiosks,
        selectedKiosk,
        setSelectedKioskId,
        currentDocument,
        setCurrentDocument,
        printSettings,
        updateSettings,
        priceBreakdown,
        currentStep,
        goToStep,
        nextStep,
        prevStep,
        activeJob,
        jobHistory,
        aiMessages,
        isAiThinking,
        submitAiPrompt,
        processPayment,
        dispatchJobToPrinter,
        resetWorkflow,
        viewMode,
        setViewMode,
        geminiApiKey,
        setGeminiApiKey,
        soundEnabled,
        setSoundEnabled,
        refillKioskSupplies
      }}
    >
      {children}
    </PrintSystemContext.Provider>
  );
};

export const usePrintSystem = () => {
  const context = useContext(PrintSystemContext);
  if (!context) {
    throw new Error('usePrintSystem must be used within a PrintSystemProvider');
  }
  return context;
};
