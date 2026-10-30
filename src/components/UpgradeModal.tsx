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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-slate-50 border-b border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-Model Powerhouse</span>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Experience Multi-LLM Intelligence
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Switch effortlessly between Google Gemini, Groq LPUs, and OpenRouter with a single interface.
          </p>
        </div>

        {/* Features comparison */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-slate-200 text-slate-800 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Google Gemini 3.8 Flash & Lite</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Google's state-of-the-art multimodal models with 1M+ token context windows and exceptional reasoning.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-slate-200 text-slate-800 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Groq LPU Inference Engine</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Instantaneous ~800 tokens/sec streaming throughput for ultra-low latency real-time interactions.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-slate-200 text-slate-800 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">OpenRouter Model Gateway</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Access DeepSeek R1, Claude 3.5 Sonnet, GPT-4o Mini, and 200+ specialized models with a single key.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-700 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <span>Customize Preferences</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
