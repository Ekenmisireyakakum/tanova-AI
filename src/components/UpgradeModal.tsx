import React from 'react';
import { X, Sparkles, Zap, Globe, ArrowRight } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function UpgradeModal({ isOpen, onClose, onOpenSettings }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0a0a0a] rounded-3xl border border-zinc-200 dark:border-[#262626] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-zinc-50 dark:bg-[#121212] border-b border-zinc-200 dark:border-[#262626]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Model Powerhouse</span>
          </div>

          <h2 className="text-2xl font-semibold text-black dark:text-white font-['Google_Sans']">
            Experience Multi-LLM Intelligence
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5">
            Switch effortlessly between Google Gemini, Groq LPUs, and OpenRouter with a single interface.
          </p>
        </div>

        {/* Features comparison (Pure monochrome) */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white">Google Gemini 3.8 Flash & Lite</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Google's state-of-the-art multimodal models with 1M+ token context windows and exceptional reasoning.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white">Groq LPU Inference Engine</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Instantaneous ~800 tokens/sec streaming throughput for ultra-low latency real-time interactions.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white">OpenRouter Model Gateway</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Access DeepSeek R1, Claude 3.5 Sonnet, GPT-4o Mini, and 200+ specialized models with a single key.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-3 border-t border-zinc-200 dark:border-[#262626] bg-zinc-50 dark:bg-[#121212] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white font-semibold"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold shadow-2xs transition-all"
          >
            <span>Configure Provider Keys</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
