import React, { useState } from 'react';
import {
  X,
  Key,
  Sliders,
  Database,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Download,
  Loader2,
  Sparkles,
  Zap,
  Globe,
  Info,
  Sun,
  Moon,
} from 'lucide-react';
import { ApiKeys, AppSettings, ChatSession, ProviderId, ThemeMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  geminiEnvAvailable: boolean;
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
  sessions,
  onClearAllSessions,
  onSelectTheme,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'keys' | 'params' | 'data'>('keys');
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [confirmClear, setConfirmClear] = useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!isOpen) return null;

  const toggleShowKey = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleKeyChange = (provider: keyof ApiKeys, value: string) => {
    setFormData((prev) => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: value,
      },
    }));
    setTestResults((prev) => {
      const copy = { ...prev };
      delete copy[provider];
      return copy;
    });
  };

  const handleTestKey = async (provider: ProviderId) => {
    setTestingKey(provider);
    setTestResults((prev) => {
      const copy = { ...prev };
      delete copy[provider];
      return copy;
    });

    try {
      const key = formData.apiKeys[provider];
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: key }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setTestResults((prev) => ({
          ...prev,
          [provider]: { success: true, message: data.message || 'Key connected successfully!' },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [provider]: { success: false, message: data.error || 'Invalid API key or network error' },
        }));
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { success: false, message: err?.message || 'Connection error' },
      }));
    } finally {
      setTestingKey(null);
    }
  };

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
    downloadAnchor.setAttribute('download', `gemini-chat-export-${new Date().toISOString().slice(0, 10)}.json`);
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs (Strict monochrome) */}
        <div className="flex border-b border-zinc-200 dark:border-[#262626] px-6 bg-zinc-50/60 dark:bg-[#121212]/60">
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'keys'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>API Keys</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('params')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
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
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
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
          {/* TAB 1: API KEYS */}
          {activeTab === 'keys' && (
            <div className="space-y-6">
              <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-[#262626] flex items-start gap-3">
                <Info className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Keys are stored exclusively in your browser’s <span className="font-semibold text-black dark:text-white">localStorage</span>. Requests are proxied securely with zero logging.
                </div>
              </div>

              {/* 1. Google Gemini Key */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-black dark:text-white">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold">Google Gemini</span>
                    {geminiEnvAvailable && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 font-semibold">
                        Active via AI Studio
                      </span>
                    )}
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-black dark:text-white underline hover:opacity-80 flex items-center gap-1 font-semibold"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {geminiEnvAvailable ? (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    A default Gemini API key is already active on the server. You can immediately chat with Gemini models, or enter your own key below to override it.
                  </p>
                ) : (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Enter your Google AI Studio API key (starts with <code className="font-mono text-black dark:text-white">AIzaSy...</code> or <code className="font-mono text-black dark:text-white">AQ....</code>).
                  </p>
                )}

                <div className="relative">
                  <input
                    type={showKeys['gemini'] ? 'text' : 'password'}
                    placeholder={geminiEnvAvailable ? 'Active via server (enter custom key to override)' : 'AIzaSy... or AQ....'}
                    value={formData.apiKeys.gemini}
                    onChange={(e) => handleKeyChange('gemini', e.target.value)}
                    className="w-full pl-3.5 pr-20 py-2 text-xs bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-xl border border-zinc-300 dark:border-[#262626] focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleShowKey('gemini')}
                      className="p-1 text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white"
                      title={showKeys['gemini'] ? 'Hide' : 'Show'}
                    >
                      {showKeys['gemini'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      disabled={testingKey === 'gemini'}
                      onClick={() => handleTestKey('gemini')}
                      className="px-2 py-1 text-[11px] bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white rounded-lg transition-colors font-medium"
                    >
                      {testingKey === 'gemini' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Test'}
                    </button>
                  </div>
                </div>

                {testResults['gemini'] && (
                  <div className="flex items-center gap-2 text-xs text-black dark:text-white font-medium">
                    {testResults['gemini'].success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{testResults['gemini'].message}</span>
                  </div>
                )}
              </div>

              {/* 2. Groq Key */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-black dark:text-white">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-semibold">Groq</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 font-semibold">
                      Ultra-Fast LPU
                    </span>
                  </div>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-black dark:text-white underline hover:opacity-80 flex items-center gap-1 font-semibold"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Allows instant access to Llama 3.3 70B, Llama 3.1 8B, and DeepSeek R1 Distill at ~800 tokens/sec.
                </p>

                <div className="relative">
                  <input
                    type={showKeys['groq'] ? 'text' : 'password'}
                    placeholder="gsk_..."
                    value={formData.apiKeys.groq}
                    onChange={(e) => handleKeyChange('groq', e.target.value)}
                    className="w-full pl-3.5 pr-20 py-2 text-xs bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-xl border border-zinc-300 dark:border-[#262626] focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleShowKey('groq')}
                      className="p-1 text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white"
                      title={showKeys['groq'] ? 'Hide' : 'Show'}
                    >
                      {showKeys['groq'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      disabled={testingKey === 'groq' || !formData.apiKeys.groq}
                      onClick={() => handleTestKey('groq')}
                      className="px-2 py-1 text-[11px] bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white rounded-lg transition-colors disabled:opacity-40 font-medium"
                    >
                      {testingKey === 'groq' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Test'}
                    </button>
                  </div>
                </div>

                {testResults['groq'] && (
                  <div className="flex items-center gap-2 text-xs text-black dark:text-white font-medium">
                    {testResults['groq'].success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{testResults['groq'].message}</span>
                  </div>
                )}
              </div>

              {/* 3. OpenRouter Key */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-black dark:text-white">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-semibold">OpenRouter</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 font-semibold">
                      200+ Models
                    </span>
                  </div>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-black dark:text-white underline hover:opacity-80 flex items-center gap-1 font-semibold"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Connect to Claude 3.5 Sonnet, DeepSeek R1, GPT-4o Mini, and hundreds of open/proprietary LLMs.
                </p>

                <div className="relative">
                  <input
                    type={showKeys['openrouter'] ? 'text' : 'password'}
                    placeholder="sk-or-v1-..."
                    value={formData.apiKeys.openrouter}
                    onChange={(e) => handleKeyChange('openrouter', e.target.value)}
                    className="w-full pl-3.5 pr-20 py-2 text-xs bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-xl border border-zinc-300 dark:border-[#262626] focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleShowKey('openrouter')}
                      className="p-1 text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white"
                      title={showKeys['openrouter'] ? 'Hide' : 'Show'}
                    >
                      {showKeys['openrouter'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      disabled={testingKey === 'openrouter' || !formData.apiKeys.openrouter}
                      onClick={() => handleTestKey('openrouter')}
                      className="px-2 py-1 text-[11px] bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white rounded-lg transition-colors disabled:opacity-40 font-medium"
                    >
                      {testingKey === 'openrouter' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Test'}
                    </button>
                  </div>
                </div>

                {testResults['openrouter'] && (
                  <div className="flex items-center gap-2 text-xs text-black dark:text-white font-medium">
                    {testResults['openrouter'].success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{testResults['openrouter'].message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: THEME & PARAMETERS */}
          {activeTab === 'params' && (
            <div className="space-y-6">
              {/* Theme Preference (Pure Monochrome White & Black) */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] space-y-3">
                <label className="text-sm font-semibold text-black dark:text-white block">
                  Interface Theme
                </label>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 block">
                  Strictly white and black monochrome palette.
                </span>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('light')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
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
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white text-xs font-semibold transition-colors disabled:opacity-40"
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
                      className="px-3 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 text-xs text-zinc-500 hover:text-black dark:hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    disabled={sessions.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white text-xs font-semibold transition-colors disabled:opacity-40"
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
            className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-xl transition-colors shadow-2xs"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
