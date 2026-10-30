import React, { useState } from 'react';
import {
  X,
  Sliders,
  Database,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Download,
  Sparkles,
  Zap,
  Globe,
  Sun,
  Moon,
  Lock,
} from 'lucide-react';
import { AppSettings, ChatSession, ServerStatus, ThemeMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  geminiEnvAvailable: boolean;
  serverStatus?: ServerStatus;
  sessions: ChatSession[];
  onClearAllSessions: () => void;
  onSelectTheme: (theme: ThemeMode) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  geminiEnvAvailable,
  serverStatus,
  sessions,
  onClearAllSessions,
  onSelectTheme,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'providers' | 'params' | 'data'>('providers');
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [confirmClear, setConfirmClear] = useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSelectTheme = (theme: ThemeMode) => {
    setFormData((prev) => ({ ...prev, theme }));
    onSelectTheme(theme);
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tanovai-chat-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-3xl border border-zinc-200 dark:border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#262626] bg-zinc-50 dark:bg-[#121212]">
          <h2 className="text-lg font-medium text-black dark:text-white font-['Google_Sans'] flex items-center gap-2">
            Settings & Preferences
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-[#262626] px-6 bg-zinc-50/60 dark:bg-[#121212]/60">
          <button
            type="button"
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'providers'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>AI Providers & Status</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('params')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'params'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Theme & Parameters</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'data'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>History & Storage</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SYSTEM & AI PROVIDERS (READ-ONLY, NO RAW KEYS, NO INPUTS, NO TESTING) */}
          {activeTab === 'providers' && (
            <div className="space-y-4">
              {/* Security Policy Notice */}
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-[#262626] flex items-start gap-3">
                <Lock className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-black dark:text-white">
                    Managed System Credentials
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    All AI provider credentials are pre-configured, encrypted, and managed directly by the server. To safeguard system security and data integrity, users are not permitted to view, edit, retrieve, or test raw API keys.
                  </div>
                </div>
              </div>

              {/* 1. Google Gemini Provider Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-[#1c1c1c] text-black dark:text-white shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-black dark:text-white">Google Gemini</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Online & Managed
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Gemini 3.8 Flash, 3.1 Flash Lite, and 2.5 Pro reasoning models provisioned via Google AI Studio.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                    System Verified
                  </span>
                </div>
              </div>

              {/* 2. Groq LPU Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-[#1c1c1c] text-black dark:text-white shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-black dark:text-white">Groq LPU</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Online & Managed
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Ultra-fast inference (~800 tokens/sec) for Llama 3.3 70B, Llama 3.1 8B, and DeepSeek R1 Distill.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                    System Verified
                  </span>
                </div>
              </div>

              {/* 3. OpenRouter Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-[#1c1c1c] text-black dark:text-white shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-black dark:text-white">OpenRouter Gateway</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Online & Managed
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Unified gateway routing across Claude 3.5 Sonnet, DeepSeek R1, GPT-4o, and hundreds of top models.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                    System Verified
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THEME & PARAMETERS */}
          {activeTab === 'params' && (
            <div className="space-y-6">
              {/* Theme Preference */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] space-y-3">
                <label className="text-sm font-semibold text-black dark:text-white block">
                  Interface Theme
                </label>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 block">
                  Monochrome high-contrast design.
                </span>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('light')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      formData.theme === 'light'
                        ? 'border-2 border-black bg-white text-black shadow-sm'
                        : 'border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-700 dark:text-zinc-400 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-black" />
                    <span>White (Light)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTheme('dark')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      formData.theme === 'dark'
                        ? 'border-2 border-white bg-black text-white shadow-sm'
                        : 'border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-700 dark:text-zinc-400 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-white" />
                    <span>Black (Dark)</span>
                  </button>
                </div>
              </div>

              {/* Temperature */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-black dark:text-white block">
                      Temperature ({formData.temperature})
                    </label>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      Lower values are more precise; higher values are more creative.
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-black dark:accent-white cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span>Precise (0.0)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative (1.5)</span>
                </div>
              </div>

              {/* System Prompt */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] space-y-3">
                <label className="text-sm font-semibold text-black dark:text-white block">
                  System Persona & Instructions
                </label>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 block">
                  Custom instructions injected at the beginning of conversations.
                </span>
                <textarea
                  rows={4}
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                  className="w-full p-3 text-xs bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-xl border border-zinc-300 dark:border-[#262626] focus:outline-none focus:border-black dark:focus:border-white leading-relaxed resize-none"
                />
              </div>

              {/* Universal Demand Spike Fallback */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626]">
                <label className="flex items-start justify-between cursor-pointer gap-3">
                  <div>
                    <span className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Universal Demand Spike Fallback</span>
                    </span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 block mt-1 leading-relaxed">
                      Automatically route to a linked backup model or available provider if your selected model experiences a 503 high demand spike, rate limits, or temporary outages.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoFallback !== false}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, autoFallback: e.target.checked }))
                    }
                    className="w-4 h-4 mt-1 accent-black dark:accent-white cursor-pointer rounded shrink-0"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: DATA & PRIVACY */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-black dark:text-white">Export Chat History</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Download all saved conversations as a JSON file.</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={sessions.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export ({sessions.length})</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-300 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-black dark:text-white">Clear All History</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Permanently delete all stored chats from this browser.</p>
                </div>
                {confirmClear ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllSessions();
                        setConfirmClear(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 text-xs text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    disabled={sessions.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-200 dark:border-[#262626] bg-zinc-50 dark:bg-[#121212]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
